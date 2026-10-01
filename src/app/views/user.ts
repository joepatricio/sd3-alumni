import { api } from '@/app/views/api';

export const handleConnection = async (
    action: 'add' | 'remove' | 'accept' | 'unblock' | 'block' | 'reject',
    currentUserId: string,
    profileId: string
) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const res = await api.post('/connections/action', {
        action,
        currentUserId,
        profileId
    }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    
    return {
        newStatusName: res.data.newStatusName,
        statsUpdated: res.data.statsUpdated,
        newConnectionsCount: res.data.newConnectionsCount
    };
};
