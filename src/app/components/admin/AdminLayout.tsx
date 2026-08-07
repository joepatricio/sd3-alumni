import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Users, FileText, ChevronLeft, CreditCard, Calendar, Clock, Loader2 } from 'lucide-react';
import ScrollToTop from '../ScrollToTop';
import { api } from '@/app/views/api';
import { adminLoaders, prefetchAdminRoutes } from '@/app/AppRoutes';


import { formatDate } from '@/app/views/formatters';

export function AdminLayout() {
    const location = useLocation();
    const scrollRef = useRef<HTMLDivElement>(null);

    const [token, setToken] = useState(sessionStorage.getItem('adminToken'));
    const [isCheckingToken, setIsCheckingToken] = useState(!sessionStorage.getItem('adminToken'));

    useEffect(() => {
        let timeoutId: any;
        const handleStorageEvent = (e: StorageEvent) => {
            if (e.key === 'logoutAdminEvent') {
                sessionStorage.removeItem('adminToken');
                setToken(null);
            } else if (e.key === 'requestAdminSession' && sessionStorage.getItem('adminToken')) {
                localStorage.setItem('shareAdminSession', sessionStorage.getItem('adminToken')!);
                localStorage.removeItem('shareAdminSession');
            } else if (e.key === 'shareAdminSession' && e.newValue && !sessionStorage.getItem('adminToken')) {
                sessionStorage.setItem('adminToken', e.newValue);
                setToken(e.newValue);
                setIsCheckingToken(false);
            }
        };

        window.addEventListener('storage', handleStorageEvent);

        if (!sessionStorage.getItem('adminToken')) {
            localStorage.setItem('requestAdminSession', Date.now().toString());
            localStorage.removeItem('requestAdminSession');
            timeoutId = setTimeout(() => {
                setIsCheckingToken(false);
            }, 500); // Wait for potential broadcast
        } else {
            setIsCheckingToken(false);
        }

        return () => {
            window.removeEventListener('storage', handleStorageEvent);
            clearTimeout(timeoutId);
        };
    }, []);

    let username = 'Administrator';
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload && payload.username) {
                username = payload.username;
            }
        } catch (e) {
            console.error('Failed to parse token payload', e);
        }
    }
    const avatarLetter = username.charAt(0).toUpperCase();

    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const [timeSource, setTimeSource] = useState<string>('System Time');

    useEffect(() => {
        let timer: any;
        let syncTimer: any;

        const syncTime = async () => {
            try {
                const res = await api.get('/server-time');
                const serverTime = new Date(res.data.currentTime);
                const receivedAt = Date.now();
                setTimeSource(res.data.source || 'Database Time');

                if (timer) clearInterval(timer);

                const update = () => {
                    const elapsed = Date.now() - receivedAt;
                    setCurrentTime(new Date(serverTime.getTime() + elapsed));
                };

                update();
                timer = setInterval(update, 1000);
            } catch (err) {
                console.error("Failed to sync server time, falling back to System Time", err);
                setTimeSource('System Time');
                if (timer) clearInterval(timer);

                const update = () => {
                    setCurrentTime(new Date());
                };
                update();
                timer = setInterval(update, 1000);
            }
        };

        syncTime();
        syncTimer = setInterval(syncTime, 10 * 60 * 1000);

        return () => {
            if (timer) clearInterval(timer);
            if (syncTimer) clearInterval(syncTimer);
        };
    }, []);

    const formatTime = (date: Date | null) => {
        if (!date) return 'Loading...';
        return formatDate(date, 'full') + ' ' + date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const scrollToTop = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToTop();
    }, [location.pathname]);

    // Idle-prefetch all admin page chunks after layout mounts to eliminate transition delays
    useEffect(() => {
        if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(() => {
                prefetchAdminRoutes();
            });
        } else {
            const timer = setTimeout(prefetchAdminRoutes, 1500);
            return () => clearTimeout(timer);
        }
    }, []);


    const handleLogout = () => {
        sessionStorage.removeItem('adminToken');
        localStorage.setItem('logoutAdminEvent', Date.now().toString());
        localStorage.removeItem('logoutAdminEvent');
        window.location.href = '/admin/login'; // Hard redirect to clear session completely
    };

    if (isCheckingToken) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-brand-primary h-8 w-8" /></div>;
    }

    if (!token) {
        return <Navigate to="/admin/login" replace />;
    }

    const navItems = [
        { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/users', label: 'User Management', icon: Users },
        { path: '/admin/bulletins', label: 'Bulletin Management', icon: FileText },
        { path: '/admin/events', label: 'Event Management', icon: Calendar },
        { path: '/admin/donations', label: 'Donations Tracking', icon: CreditCard },
    ];

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-brand-primary text-white flex flex-col shadow-xl z-10 transition-all duration-300">
                <div className="h-16 flex items-center flex justify-left gap-2 px-6 border-b border-white/20">
                    <img
                        src="http://localhost:3000/alumni-logo.jpg"
                        alt="Alumni"
                        className="h-8 w-8 object-contain rounded"
                    />
                    <span className="text-xl font-bold tracking-tight">Alumni Admin</span>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-white/20 font-medium'
                                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                                    }`}
                                onMouseEnter={() => {
                                    if (adminLoaders[item.path]) {
                                        adminLoaders[item.path]().catch(() => {});
                                    }
                                }}
                                onFocus={() => {
                                    if (adminLoaders[item.path]) {
                                        adminLoaders[item.path]().catch(() => {});
                                    }
                                }}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/20 space-y-2">
                    <Link
                        to="/"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                    >
                        <ChevronLeft size={20} />
                        <span>Return to Site</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:bg-red-500/80 hover:text-white transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 z-0">
                    <div className="flex items-center gap-2 text-sm text-gray-700 font-medium bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 shadow-xs">
                        <Clock size={16} />
                        <span>Time: {formatTime(currentTime)}</span>
                        <span className="text-xs text-brand-primary/80 bg-brand-primary/10 px-2 py-0.5 rounded-md ml-1 font-semibold">{timeSource}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-brand-primary font-bold">
                                {avatarLetter}
                            </div>
                            <span className="text-sm font-medium text-gray-700">{username}</span>
                        </div>
                    </div>
                </header>

                {/* Scrollable Content */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-auto bg-gray-50/50 p-8 relative scroll-smooth"
                >
                    <div className="mx-auto max-w-7xl">
                        <Outlet />
                    </div>

                    {/* Scroll to Top Component (handles routing scroll + button for this ref) */}
                    <ScrollToTop scrollContainerRef={scrollRef} />
                </div>
            </main>
        </div>
    );
}
