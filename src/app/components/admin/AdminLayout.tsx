import { useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Users, FileText, ChevronLeft, CreditCard, Calendar } from 'lucide-react';
import alumniLogo from "@assets/alumni-logo.jpg";
import ScrollToTop from '../ScrollToTop';

export function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
        }
    }, [navigate, location.pathname]);

    const scrollToTop = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToTop();
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

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
                        src={alumniLogo}
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
                <header className="h-16 bg-white shadow-sm flex items-center justify-end px-8 z-0">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-brand-primary font-bold">
                                A
                            </div>
                            <span className="text-sm font-medium text-gray-700">Administrator</span>
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
