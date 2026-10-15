import { api } from '@/app/views/api';

export const handleConnection = async (
    action: 'add' | 'remove' | 'accept' | 'unblock' | 'block' | 'reject',
    currentUserId: string,
    profileId: string
) => {
    const res = await api.post('/connections/action', {
        action,
        currentUserId,
        profileId
    });
    
    return {
        newStatusName: res.data.newStatusName,
        statsUpdated: res.data.statsUpdated,
        newConnectionsCount: res.data.newConnectionsCount
    };
};
