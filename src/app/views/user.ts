import { api } from '@/app/views/api';

export const handleConnection = async (
    action: 'add' | 'remove' | 'accept' | 'unblock' | 'block' | 'reject',
    currentUserId: string,
    profileId: string,
    reverseLookup: (val: string) => string | null
) => {
    const [conn1Res, conn2Res] = await Promise.all([
        api.get(`/userConnections`, { params: { userId: currentUserId, friendId: profileId } }),
        api.get(`/userConnections`, { params: { userId: profileId, friendId: currentUserId } })
    ]);

    const c1 = conn1Res.data[0];
    const c2 = conn2Res.data[0];

    const acceptedCode = reverseLookup('Accepted');
    const wasAccepted = c1?.connectionStatusId === acceptedCode;

    if (action === 'add') {
        const requestingCode = reverseLookup('Requesting');
        const requestedCode = reverseLookup('Requested');
        await Promise.all([
            api.post('/userConnections', { userId: currentUserId, friendId: profileId, connectionStatusId: requestingCode, dateUpdated: new Date().toISOString() }),
            api.post('/userConnections', { userId: profileId, friendId: currentUserId, connectionStatusId: requestedCode, dateUpdated: new Date().toISOString() })
        ]);
        return { newStatusCode: requestingCode, statsUpdated: false };
    }
    else if (action === 'accept') {
        const patches = [];
        if (c1) patches.push(api.patch(`/userConnections/${c1.id}`, { connectionStatusId: acceptedCode, dateUpdated: new Date().toISOString() }));
        if (c2) patches.push(api.patch(`/userConnections/${c2.id}`, { connectionStatusId: acceptedCode, dateUpdated: new Date().toISOString() }));

        // Update userStatistics userConnections count for both users
        const [stats1Res, stats2Res] = await Promise.all([
            api.get(`/userStatistics`, { params: { userId: currentUserId } }),
            api.get(`/userStatistics`, { params: { userId: profileId } })
        ]);
        const s1 = stats1Res.data[0];
        const s2 = stats2Res.data[0];

        let newCount = undefined;
        if (s1) {
            newCount = (s1.userConnections || 0) + 1;
            patches.push(api.patch(`/userStatistics/${s1.id}`, { userConnections: newCount }));
        }
        if (s2) patches.push(api.patch(`/userStatistics/${s2.id}`, { userConnections: (s2.userConnections || 0) + 1 }));

        await Promise.all(patches);
        return { newStatusCode: acceptedCode, statsUpdated: true, newConnectionsCount: newCount };
    }
    else if (action === 'reject' || action === 'remove' || action === 'unblock') {
        const ops = [];
        if (c1) ops.push(api.delete(`/userConnections/${c1.id}`));
        if (c2) ops.push(api.delete(`/userConnections/${c2.id}`));

        let newCount = undefined;
        if (action === 'remove' && wasAccepted) {
            const [stats1Res, stats2Res] = await Promise.all([
                api.get(`/userStatistics`, { params: { userId: currentUserId } }),
                api.get(`/userStatistics`, { params: { userId: profileId } })
            ]);
            const s1 = stats1Res.data[0];
            const s2 = stats2Res.data[0];

            if (s1 && s1.userConnections > 0) {
                newCount = s1.userConnections - 1;
                ops.push(api.patch(`/userStatistics/${s1.id}`, { userConnections: newCount }));
            }
            if (s2 && s2.userConnections > 0) ops.push(api.patch(`/userStatistics/${s2.id}`, { userConnections: s2.userConnections - 1 }));
        }
        await Promise.all(ops);
        return { newStatusCode: null, statsUpdated: action === 'remove' && wasAccepted, newConnectionsCount: newCount };
    }
    else if (action === 'block') {
        const blockingCode = reverseLookup('Blocking');
        const blockedCode = reverseLookup('Blocked');
        const ops = [];
        if (c1) ops.push(api.patch(`/userConnections/${c1.id}`, { connectionStatusId: blockingCode, dateUpdated: new Date().toISOString() }));
        else ops.push(api.post('/userConnections', { userId: currentUserId, friendId: profileId, connectionStatusId: blockingCode, dateUpdated: new Date().toISOString() }));

        if (c2) ops.push(api.patch(`/userConnections/${c2.id}`, { connectionStatusId: blockedCode, dateUpdated: new Date().toISOString() }));
        else ops.push(api.post('/userConnections', { userId: profileId, friendId: currentUserId, connectionStatusId: blockedCode, dateUpdated: new Date().toISOString() }));

        let newCount = undefined;
        if (wasAccepted) {
            const [stats1Res, stats2Res] = await Promise.all([
                api.get(`/userStatistics`, { params: { userId: currentUserId } }),
                api.get(`/userStatistics`, { params: { userId: profileId } })
            ]);
            const s1 = stats1Res.data[0];
            const s2 = stats2Res.data[0];

            if (s1 && s1.userConnections > 0) {
                newCount = s1.userConnections - 1;
                ops.push(api.patch(`/userStatistics/${s1.id}`, { userConnections: newCount }));
            }
            if (s2 && s2.userConnections > 0) ops.push(api.patch(`/userStatistics/${s2.id}`, { userConnections: s2.userConnections - 1 }));
        }

        await Promise.all(ops);
        return { newStatusCode: blockingCode, statsUpdated: wasAccepted, newConnectionsCount: newCount };
    }
};
