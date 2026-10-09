import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, Info } from 'lucide-react';
import { api } from '@/app/views/api';
import { useAuth } from '@/app/views/auth';
import { formatDate } from '@/app/views/formatters';

export function Notifications() {
    const { session } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!session?.userId) return;
            try {
                const res = await api.get('/notifications', {
                    params: {
                        userId: session.userId,
                        _sort: '-notificationDate'
                    }
                });
                const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                setNotifications(data);
            } catch (err) {
                console.error("Failed to load notifications", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, [session?.userId]);

    const markAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}`, { isRead: true });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
            window.dispatchEvent(new Event('notificationsUpdated'));
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const unread = notifications.filter(n => !n.isRead);
            await Promise.all(unread.map(n => api.patch(`/notifications/${n.id}`, { isRead: true })));
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            window.dispatchEvent(new Event('notificationsUpdated'));
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-24 px-4 pb-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-24 px-4 pb-12">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Bell className="w-6 h-6 text-brand-primary" />
                        Notifications
                    </h1>
                    {notifications.some(n => !n.isRead) && (
                        <button
                            onClick={markAllAsRead}
                            className="text-sm text-brand-primary hover:text-brand-primary-hover flex items-center gap-1"
                        >
                            <Check className="w-4 h-4" />
                            Mark all as read
                        </button>
                    )}
                </div>

                {notifications.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-12 text-center text-gray-500">
                        <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <p>No notifications yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map(n => {
                            let parsedMessage = { text: n.notificationMessage, link: null };
                            try {
                                parsedMessage = JSON.parse(n.notificationMessage);
                            } catch (e) {
                                // Ignore
                            }

                            return (
                                <div
                                    key={n.id}
                                    className={`bg-white rounded-lg shadow-sm border p-4 flex gap-4 transition-colors ${!n.isRead ? 'border-brand-primary/30 bg-brand-primary/5' : 'border-gray-100'
                                        }`}
                                >
                                    <div className="shrink-0 pt-1">
                                        <Info className={`w-5 h-5 ${!n.isRead ? 'text-brand-primary' : 'text-gray-400'}`} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-800 text-sm md:text-base">
                                            {parsedMessage.text}
                                        </p>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-xs text-gray-500">
                                                {formatDate(n.notificationDate, 'datetime')}
                                            </span>
                                            <div className="flex items-center gap-3">
                                                {parsedMessage.link && (
                                                    <Link
                                                        to={parsedMessage.link}
                                                        className="text-sm text-brand-primary hover:underline"
                                                    >
                                                        View details
                                                    </Link>
                                                )}
                                                {!n.isRead && (
                                                    <button
                                                        onClick={() => markAsRead(n.id)}
                                                        className="text-xs text-gray-500 hover:text-gray-700 underline"
                                                    >
                                                        Mark as read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
