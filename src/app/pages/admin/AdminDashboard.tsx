import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card';
import {
    Users, FileText, Calendar as CalendarIcon, CreditCard, Activity, AlertTriangle,
    ArrowRight, ShieldAlert, CheckCircle2, RefreshCw, Download, Loader2,
    PieChart as PieChartIcon, MessageSquare, ChevronLeft, ChevronRight, Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '@/app/views/api';
import { toPng } from 'html-to-image';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatDate, getCategoryColor } from '@/app/views/formatters';

interface DashboardStats {
    pendingUsers: number;
    officialUsers: number;
    regularUsers: number;
    suspendedUsers: number;
    bannedUsers: number;
    disabledUsers?: number;
    totalUsers: number;
    demographics?: {
        babyBoomers: number;
        genX: number;
        millennials: number;
        genZ: number;
        profileStatus?: {
            public: number;
            connections: number;
            private: number;
        };
    };
    pendingBulletins: number;
    approvedBulletins: number;
    pendingEvents: number;
    approvedEvents: number;
    donationsTotal: number;
    activeDonorsCount: number;
    recentActivity: Array<{
        id: string;
        action: string;
        user: string;
        time: string;
        type: 'user' | 'content' | 'event' | 'donation';
    }>;
}

interface EventItem {
    id: string;
    title: string;
    description: string;
    eventDate: string;
    startTime?: string;
    endTime?: string;
    modality: string;
    locationId?: string | null;
    eventCategory?: { eventCategoryName: string };
    category?: { eventCategoryName: string };
    status?: { statusName: string };
    location?: {
        landmark?: string;
        street?: string;
        cityMunicipality?: string;
        province?: string;
        lat?: number;
        lng?: number;
    } | null;
}

interface BulletinItem {
    id: string;
    title: string;
    bulletinDate: string;
    bulletinCategory?: { bulletinCategoryName: string };
    category?: { bulletinCategoryName: string };
    status?: { statusName: string };
}

interface UserStatisticItem {
    userConnections: number;
    eventsAttended: number;
    eventsCreated: number;
    bulletinsCreated: number;
    commentsWritten: number;
    donatedAmount: number;
}

const BULLETIN_CATEGORY_COLORS: Record<string, string> = {
    'News & Announcements': '#059669',
    'Career & Jobs': '#2563eb',
    'Alumni Stories': '#d97706',
    'Events & Projects': '#7c3aed',
    'General': '#6b7280',
    'Other': '#4b5563'
};

const EVENT_CATEGORY_COLORS: Record<string, string> = {
    'Social & Networking': '#8b5cf6',
    'Career & Workshop': '#2563eb',
    'Academic & Seminar': '#059669',
    'Sports & Recreation': '#d97706',
    'General': '#6b7280',
    'Other': '#4b5563'
};

const USER_STATUS_COLORS: Record<string, string> = {
    'Official': '#059669',
    'Regular': '#2563eb',
    'Pending': '#d97706',
    'Restricted': '#dc2626',
    'Disabled': '#64748b'
};

const DEMOGRAPHIC_COLORS: Record<string, string> = {
    'Baby Boomers (Pre-1964)': '#b45309',
    'Gen X (1965-1980)': '#0369a1',
    'Millennials (1981-1996)': '#7c3aed',
    'Gen Z (1997 Beyond)': '#059669'
};

const CHART_PALETTE = ['#059669', '#2563eb', '#d97706', '#7c3aed', '#ec4899', '#06b6d4', '#8b5cf6'];

export function AdminDashboard() {
    const dashboardRef = useRef<HTMLDivElement>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    // Data states
    const [events, setEvents] = useState<EventItem[]>([]);
    const [bulletinCategoryData, setBulletinCategoryData] = useState<{ name: string; value: number }[]>([]);
    const [eventCategoryData, setEventCategoryData] = useState<{ name: string; value: number }[]>([]);

    // Chart Highlight states
    const [activeBulletinCategory, setActiveBulletinCategory] = useState<string | null>(null);
    const [activeEventCategory, setActiveEventCategory] = useState<string | null>(null);
    const [activeUserStatus, setActiveUserStatus] = useState<string | null>(null);
    const [activeDemographic, setActiveDemographic] = useState<string | null>(null);
    const [activeProfileStatus, setActiveProfileStatus] = useState<string | null>(null);
    const [eventTimeRange, setEventTimeRange] = useState<'Upcoming' | '7 days' | '30 days'>('Upcoming');

    const [platformHealth, setPlatformHealth] = useState({
        totalConnections: 0,
        totalBulletinsCreated: 0,
        totalComments: 0,
        totalRsvps: 0
    });

    // Calendar state
    const [calendarDate, setCalendarDate] = useState(new Date());
    const [selectedDateEvents, setSelectedDateEvents] = useState<EventItem[] | null>(null);
    const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = sessionStorage.getItem('adminToken');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};

            // Would be better to just query the whole category or status table instead of _include
            // This is easier in the smaller scale, but would be better to just query the whole tables in the long run
            const [dashRes, bulletinsRes, eventsRes, userStatsRes] = await Promise.allSettled([
                api.get('/admin/dashboard-stats', { headers }),
                api.get('/bulletins?_include=category,status'),
                api.get('/events?_include=location,category,status'),
                api.get('/userStatistics')
            ]);

            if (dashRes.status === 'fulfilled' && dashRes.value.data) {
                setStats(dashRes.value.data);
            } else {
                throw new Error('Failed to fetch admin dashboard statistics');
            }

            // Process Bulletins for Category Distribution Graph (checks both bulletinCategory & category)
            if (bulletinsRes.status === 'fulfilled') {
                const bData = bulletinsRes.value.data.data || bulletinsRes.value.data || [];
                const catCounts: Record<string, number> = {};
                bData.forEach((b: BulletinItem) => {
                    const catName = b.bulletinCategory?.bulletinCategoryName || b.category?.bulletinCategoryName || 'General';
                    catCounts[catName] = (catCounts[catName] || 0) + 1;
                });
                const chartData = Object.entries(catCounts).map(([name, value]) => ({ name, value }));
                setBulletinCategoryData(chartData);
            }

            // Process Events for Map, Calendar & Category Distribution
            if (eventsRes.status === 'fulfilled') {
                const eData = eventsRes.value.data.data || eventsRes.value.data || [];
                setEvents(eData);

                const eCatCounts: Record<string, number> = {};
                eData.forEach((e: EventItem) => {
                    const catName = e.eventCategory?.eventCategoryName || e.category?.eventCategoryName || 'General';
                    eCatCounts[catName] = (eCatCounts[catName] || 0) + 1;
                });
                const eChartData = Object.entries(eCatCounts).map(([name, value]) => ({ name, value }));
                setEventCategoryData(eChartData);
            }

            // Process Platform Health from userStatistics
            if (userStatsRes.status === 'fulfilled') {
                const uStats = userStatsRes.value.data.data || userStatsRes.value.data || [];
                let conns = 0, buls = 0, comms = 0;
                uStats.forEach((s: UserStatisticItem) => {
                    conns += s.userConnections || 0;
                    buls += s.bulletinsCreated || 0;
                    comms += s.commentsWritten || 0;
                });
                setPlatformHealth({
                    totalConnections: conns,
                    totalBulletinsCreated: buls,
                    totalComments: comms,
                    totalRsvps: uStats.length
                });
            }
        } catch (err: any) {
            console.error('Failed to load dashboard stats from backend API:', err);
            const statusMsg = err.response?.status ? ` (HTTP ${err.response.status})` : '';
            setError(`Failed to fetch real-time dashboard data from database${statusMsg}. Please check your connection or session.`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const userStatusChartData = React.useMemo(() => {
        return [
            { name: 'Official', value: stats?.officialUsers || 0 },
            { name: 'Regular', value: stats?.regularUsers || 0 },
            { name: 'Pending', value: stats?.pendingUsers || 0 },
            { name: 'Restricted', value: (stats?.suspendedUsers || 0) + (stats?.bannedUsers || 0) },
            { name: 'Disabled', value: stats?.disabledUsers || 0 },
        ].filter(d => d.value > 0);
    }, [stats]);

    const demographicsChartData = React.useMemo(() => {
        const { babyBoomers = 0, genX = 0, millennials = 0, genZ = 0 } = stats?.demographics || {};
        return [
            { name: 'Baby Boomers (Pre-1964)', value: babyBoomers },
            { name: 'Gen X (1965-1980)', value: genX },
            { name: 'Millennials (1981-1996)', value: millennials },
            { name: 'Gen Z (1997 Beyond)', value: genZ },
        ].filter(d => d.value > 0);
    }, [stats]);

    const profileStatusChartData = React.useMemo(() => {
        const { public: pub = 0, connections = 0, private: priv = 0 } = stats?.demographics?.profileStatus || {};
        return [
            { name: 'Public', value: pub },
            { name: 'Connections Only', value: connections },
            { name: 'Private', value: priv },
        ].filter(d => d.value > 0);
    }, [stats]);

    const filteredUpcomingEvents = React.useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        return events.filter(evt => {
            if (!evt.eventDate) return false;
            const evtDate = new Date(evt.eventDate);
            if (isNaN(evtDate.getTime())) return false;

            if (eventTimeRange === 'Upcoming') {
                return evtDate >= now;
            } else if (eventTimeRange === '7 days') {
                const end = new Date(now);
                end.setDate(end.getDate() + 7);
                return evtDate >= now && evtDate <= end;
            } else if (eventTimeRange === '30 days') {
                const end = new Date(now);
                end.setDate(end.getDate() + 30);
                return evtDate >= now && evtDate <= end;
            }
            return true;
        }).sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
    }, [events, eventTimeRange]);

    // Generate visual report card
    const handleGenerateReport = async () => {
        if (!dashboardRef.current || isExporting) return;
        setIsExporting(true);
        try {
            const dataUrl = await toPng(dashboardRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: '#f8fafc'
            });
            const link = document.createElement('a');
            link.download = `admin_dashboard_report_${new Date().toISOString().split('T')[0]}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error('Failed to generate report image:', err);
        } finally {
            setIsExporting(false);
        }
    };

    // Calendar Helper calculations
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const getEventsForDay = (dayNum: number) => {
        const targetDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
        return events.filter(e => {
            if (!e.eventDate) return false;
            const eDate = new Date(e.eventDate).toISOString().split('T')[0];
            return eDate === targetDateStr;
        });
    };

    const handleDayClick = (dayNum: number) => {
        const dayEvents = getEventsForDay(dayNum);
        const targetDateStr = `${monthName} ${dayNum}, ${year}`;
        setSelectedDateEvents(dayEvents);
        setSelectedDateStr(targetDateStr);
    };

    // Sort category data in descending order for clockwise arrangement from 12 o'clock
    const sortedBulletinCategoryData = [...bulletinCategoryData].sort((a, b) => b.value - a.value);
    const sortedEventCategoryData = [...eventCategoryData].sort((a, b) => b.value - a.value);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <RefreshCw className="w-8 h-8 text-brand-primary animate-spin" />
                <p className="text-gray-500 font-medium">Fetching database statistics & platform analytics...</p>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-8 flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto my-12 text-center shadow-xs">
                <AlertTriangle className="w-10 h-10 text-red-500" />
                <div>
                    <h3 className="font-bold text-lg text-red-900">Database Fetch Error</h3>
                    <p className="text-sm mt-1 text-red-700">{error || 'An error occurred while loading metrics from database.'}</p>
                </div>
                <button
                    onClick={fetchStats}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2 shadow-xs"
                >
                    <RefreshCw size={16} /> Retry Connection
                </button>
            </div>
        );
    }

    const totalPendingActions = stats.pendingUsers + stats.pendingBulletins + stats.pendingEvents;

    return (
        <div ref={dashboardRef} className="space-y-8 animate-in fade-in duration-500 p-1">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">USJ-R SEA Alumni Association Admin Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Real-time system telemetry, moderation queues, and operational metrics.</p>
                </div>
                <div className="flex gap-2.5">
                    <button
                        onClick={fetchStats}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-xs transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> {loading ? 'Syncing...' : 'Refresh Stats'}
                    </button>
                    <button
                        onClick={handleGenerateReport}
                        disabled={isExporting}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-brand-primary text-sm font-medium rounded-lg text-white bg-brand-primary hover:bg-brand-primary/90 shadow-xs transition-colors disabled:opacity-50"
                    >
                        {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                        {isExporting ? 'Generating Report...' : 'Export Visual Report'}
                    </button>
                </div>
            </div>

            {/* Action-Required Moderation Alert Banner */}
            {totalPendingActions > 0 ? (
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-5 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/20 rounded-lg shrink-0">
                            <ShieldAlert className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg leading-snug">
                                {totalPendingActions} Item{totalPendingActions > 1 ? 's' : ''} Requiring Moderation
                            </h2>
                            <p className="text-amber-100 text-sm">
                                {stats.pendingUsers > 0 && `${stats.pendingUsers} pending user approval${stats.pendingUsers > 1 ? 's' : ''}. `}
                                {stats.pendingBulletins > 0 && `${stats.pendingBulletins} bulletin${stats.pendingBulletins > 1 ? 's' : ''} awaiting moderation. `}
                                {stats.pendingEvents > 0 && `${stats.pendingEvents} event proposal${stats.pendingEvents > 1 ? 's' : ''} pending review.`}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 shrink-0">
                        {stats.pendingUsers > 0 && (
                            <Link
                                to="/admin/users?tab=Pending"
                                className="px-3.5 py-1.5 bg-white text-amber-800 hover:bg-amber-50 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                            >
                                Users ({stats.pendingUsers}) <ArrowRight size={12} />
                            </Link>
                        )}
                        {stats.pendingBulletins > 0 && (
                            <Link
                                to="/admin/bulletins?tab=Pending"
                                className="px-3.5 py-1.5 bg-white text-amber-800 hover:bg-amber-50 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                            >
                                Bulletins ({stats.pendingBulletins}) <ArrowRight size={12} />
                            </Link>
                        )}
                        {stats.pendingEvents > 0 && (
                            <Link
                                to="/admin/events?tab=Pending"
                                className="px-3.5 py-1.5 bg-white text-amber-800 hover:bg-amber-50 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                            >
                                Events ({stats.pendingEvents}) <ArrowRight size={12} />
                            </Link>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <p className="text-sm font-medium">No pending bulletins, or events to review.</p>
                </div>
            )}
            <div className="p-6 bg-gradient-to-br from-[#1b4332] via-[#0f2e22] to-[#081c15] rounded-xl border border-emerald-800/40 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group shadow-lg text-white mb-8 mt-4">
                <div className="absolute -top-24 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-600/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider text-[11px] mb-2">
                        <CreditCard className="w-3.5 h-3.5" />
                        Total Platform Contributions
                    </div>
                    <div className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-sm">
                        {formatCurrency(stats.donationsTotal)}
                    </div>
                    <div className="text-sm text-emerald-100/80 font-medium mt-3 flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        {stats.activeDonorsCount} unique donor{stats.activeDonorsCount !== 1 ? 's' : ''} driving community growth
                    </div>
                </div>

                <div className="relative z-10 shrink-0">
                    <Link
                        to="/admin/donations"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold rounded-lg transition-all duration-200 shadow-[0_4px_0_0_#065f46] hover:shadow-[0_2px_0_0_#065f46] hover:translate-y-[2px] active:translate-y-[4px] active:shadow-none"
                    >
                        Open Donation Dashboard <ArrowRight size={18} />
                    </Link>
                </div>
            </div>

            {/* User Analytics Card */}
            <Card className="w-full shadow-md border-none flex flex-col justify-between mb-8">
                <CardHeader className="pb-3 border-b border-gray-100">
                    <CardTitle className="flex items-center gap-2 text-gray-900 text-lg">
                        <PieChartIcon className="w-5 h-5 text-brand-primary" />
                        User Status, Demographics & Profile Status Analytics
                    </CardTitle>
                    <CardDescription>Visual distribution of account verification status, generational cohort proportions, and profile privacy preferences across all users.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 flex-1 flex flex-col justify-center">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                        {/* User Status Pie Chart */}
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-brand-primary" />
                                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                                    User Status ({userStatusChartData.reduce((acc, c) => acc + c.value, 0)})
                                </h4>
                            </div>
                            {userStatusChartData.length > 0 ? (
                                <div className="flex flex-col items-center w-full">
                                    <div className="h-56 w-full relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={userStatusChartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={48}
                                                    outerRadius={80}
                                                    startAngle={90}
                                                    endAngle={-270}
                                                    paddingAngle={4}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    onClick={(entry) => setActiveUserStatus(prev => prev === entry.name ? null : entry.name)}
                                                >
                                                    {userStatusChartData.map((entry, index) => (
                                                        <Cell
                                                            key={`us-cell-${index}`}
                                                            fill={USER_STATUS_COLORS[entry.name] || CHART_PALETTE[index % CHART_PALETTE.length]}
                                                            opacity={activeUserStatus && activeUserStatus !== entry.name ? 0.3 : 1}
                                                            stroke="#ffffff"
                                                            strokeWidth={2}
                                                            className="cursor-pointer transition-all duration-300"
                                                        />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip
                                                    formatter={(val: any) => [`${val} users`, 'Count']}
                                                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', borderColor: '#e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                                        {userStatusChartData.map((entry, index) => (
                                            <button
                                                key={`us-leg-${entry.name}`}
                                                onClick={() => setActiveUserStatus(prev => prev === entry.name ? null : entry.name)}
                                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all border
                                                        ${activeUserStatus === entry.name ? 'bg-gray-900 text-white border-gray-900 shadow-2xs scale-105' :
                                                        activeUserStatus && activeUserStatus !== entry.name ? 'bg-gray-50 text-gray-400 border-gray-100 opacity-50' :
                                                            'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                                            >
                                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: USER_STATUS_COLORS[entry.name] || CHART_PALETTE[index % CHART_PALETTE.length] }} />
                                                <span>{entry.name}</span>
                                                <span className="font-bold text-[10px] opacity-75">({entry.value})</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-64 text-gray-400 text-xs">
                                    No status distribution logged.
                                </div>
                            )}
                        </div>

                        {/* User Demographics Pie Chart */}
                        <div className="flex flex-col items-center pt-4 md:pt-0 md:pl-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                                    Generational Demographics ({demographicsChartData.reduce((acc, c) => acc + c.value, 0)})
                                </h4>
                            </div>
                            {demographicsChartData.length > 0 ? (
                                <div className="flex flex-col items-center w-full">
                                    <div className="h-56 w-full relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={demographicsChartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={48}
                                                    outerRadius={80}
                                                    startAngle={90}
                                                    endAngle={-270}
                                                    paddingAngle={4}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    onClick={(entry) => setActiveDemographic(prev => prev === entry.name ? null : entry.name)}
                                                >
                                                    {demographicsChartData.map((entry, index) => (
                                                        <Cell
                                                            key={`demo-cell-${index}`}
                                                            fill={DEMOGRAPHIC_COLORS[entry.name] || CHART_PALETTE[(index + 2) % CHART_PALETTE.length]}
                                                            opacity={activeDemographic && activeDemographic !== entry.name ? 0.3 : 1}
                                                            stroke="#ffffff"
                                                            strokeWidth={2}
                                                            className="cursor-pointer transition-all duration-300"
                                                        />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip
                                                    formatter={(val: any) => [`${val} members`, 'Count']}
                                                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', borderColor: '#e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                                        {demographicsChartData.map((entry, index) => (
                                            <button
                                                key={`demo-leg-${entry.name}`}
                                                onClick={() => setActiveDemographic(prev => prev === entry.name ? null : entry.name)}
                                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all border
                                                        ${activeDemographic === entry.name ? 'bg-gray-900 text-white border-gray-900 shadow-2xs scale-105' :
                                                        activeDemographic && activeDemographic !== entry.name ? 'bg-gray-50 text-gray-400 border-gray-100 opacity-50' :
                                                            'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                                            >
                                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: DEMOGRAPHIC_COLORS[entry.name] || CHART_PALETTE[(index + 2) % CHART_PALETTE.length] }} />
                                                <span>{entry.name}</span>
                                                <span className="font-bold text-[10px] opacity-75">({entry.value})</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-64 text-gray-400 text-xs">
                                    No demographic records logged.
                                </div>
                            )}
                        </div>
                        {/* Profile Status Pie Chart */}
                        <div className="flex flex-col items-center pt-4 md:pt-0 md:pl-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                                    Profile Privacy ({profileStatusChartData.reduce((acc, c) => acc + c.value, 0)})
                                </h4>
                            </div>
                            {profileStatusChartData.length > 0 ? (
                                <div className="flex flex-col items-center w-full">
                                    <div className="h-56 w-full relative">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={profileStatusChartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={48}
                                                    outerRadius={80}
                                                    startAngle={90}
                                                    endAngle={-270}
                                                    paddingAngle={4}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    onClick={(entry) => setActiveProfileStatus(prev => prev === entry.name ? null : entry.name)}
                                                >
                                                    {profileStatusChartData.map((entry, index) => (
                                                        <Cell
                                                            key={`ps-cell-${index}`}
                                                            fill={CHART_PALETTE[(index + 4) % CHART_PALETTE.length]}
                                                            opacity={activeProfileStatus && activeProfileStatus !== entry.name ? 0.3 : 1}
                                                            stroke="#ffffff"
                                                            strokeWidth={2}
                                                            className="cursor-pointer transition-all duration-300"
                                                        />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip
                                                    formatter={(val: any) => [`${val} profiles`, 'Count']}
                                                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', borderColor: '#e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                                        {profileStatusChartData.map((entry, index) => (
                                            <button
                                                key={`ps-leg-${entry.name}`}
                                                onClick={() => setActiveProfileStatus(prev => prev === entry.name ? null : entry.name)}
                                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all border
                                                        ${activeProfileStatus === entry.name ? 'bg-gray-900 text-white border-gray-900 shadow-2xs scale-105' :
                                                        activeProfileStatus && activeProfileStatus !== entry.name ? 'bg-gray-50 text-gray-400 border-gray-100 opacity-50' :
                                                            'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                                            >
                                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_PALETTE[(index + 4) % CHART_PALETTE.length] }} />
                                                <span>{entry.name}</span>
                                                <span className="font-bold text-[10px] opacity-75">({entry.value})</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-64 text-gray-400 text-xs">
                                    No profile status records logged.
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Platform Health Metrics & Category Share Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Platform Health Metrics Card */}
                <Card className="col-span-1 shadow-md border-none">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-900">
                            <Activity className="w-5 h-5 text-brand-primary" />
                            Platform System Telemetry
                        </CardTitle>
                        <CardDescription>Metrics regarding community engagement</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-700 rounded-md">
                                    <Users size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Total Network Connections</p>
                                    <p className="text-base font-bold text-gray-900">{platformHealth.totalConnections} Established</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-md">
                                    <FileText size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Total Bulletins Published</p>
                                    <p className="text-base font-bold text-gray-900">{stats.approvedBulletins} Active / {platformHealth.totalBulletinsCreated || stats.approvedBulletins + stats.pendingBulletins} Total</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 text-purple-700 rounded-md">
                                    <CalendarIcon size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Total Events Published</p>
                                    <p className="text-base font-bold text-gray-900">{stats.approvedEvents} Active</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-100 text-amber-700 rounded-md">
                                    <MessageSquare size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Community Comments</p>
                                    <p className="text-base font-bold text-gray-900">{platformHealth.totalComments} Total Comments</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Content & Event Category Share Breakdown Chart Card */}
                <Card className="col-span-1 lg:col-span-2 shadow-md border-none flex flex-col justify-between">
                    <CardHeader className="pb-3 border-b border-gray-100">
                        <CardTitle className="flex items-center gap-2 text-gray-900 text-lg">
                            <PieChartIcon className="w-5 h-5 text-brand-primary" />
                            Category Share Analytics
                        </CardTitle>
                        <CardDescription>Proportional breakdown of published bulletins and event proposals by category</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 flex-1 flex flex-col justify-center">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                            {/* Bulletin Category Donut Chart */}
                            <div className="flex flex-col items-center">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-brand-primary" />
                                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                                        Bulletin Categories ({sortedBulletinCategoryData.reduce((acc, c) => acc + c.value, 0)})
                                    </h4>
                                </div>
                                {sortedBulletinCategoryData.length > 0 ? (
                                    <div className="flex flex-col items-center w-full">
                                        <div className="h-56 w-full relative">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={sortedBulletinCategoryData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={48}
                                                        outerRadius={80}
                                                        startAngle={90}
                                                        endAngle={-270}
                                                        paddingAngle={4}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        onClick={(entry) => setActiveBulletinCategory(prev => prev === entry.name ? null : entry.name)}
                                                    >
                                                        {sortedBulletinCategoryData.map((entry, index) => (
                                                            <Cell
                                                                key={`b-cell-${index}`}
                                                                fill={BULLETIN_CATEGORY_COLORS[entry.name] || CHART_PALETTE[index % CHART_PALETTE.length]}
                                                                opacity={activeBulletinCategory && activeBulletinCategory !== entry.name ? 0.3 : 1}
                                                                stroke="#ffffff"
                                                                strokeWidth={2}
                                                                className="cursor-pointer transition-all duration-300"
                                                            />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip
                                                        formatter={(val: any) => [`${val} bulletins`, 'Count']}
                                                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', borderColor: '#e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        {/* Interactive Category Highlight Buttons (Similar to AdminDonations) */}
                                        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                                            {sortedBulletinCategoryData.map((entry, index) => (
                                                <button
                                                    key={`b-leg-${entry.name}`}
                                                    onClick={() => setActiveBulletinCategory(prev => prev === entry.name ? null : entry.name)}
                                                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all border
                                                        ${activeBulletinCategory === entry.name ? 'bg-gray-900 text-white border-gray-900 shadow-2xs scale-105' :
                                                            activeBulletinCategory && activeBulletinCategory !== entry.name ? 'bg-gray-50 text-gray-400 border-gray-100 opacity-50' :
                                                                'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                                                >
                                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BULLETIN_CATEGORY_COLORS[entry.name] || CHART_PALETTE[index % CHART_PALETTE.length] }} />
                                                    <span>{entry.name}</span>
                                                    <span className="font-bold text-[10px] opacity-75">({entry.value})</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-64 text-gray-400 text-xs">
                                        No bulletin categories logged yet.
                                    </div>
                                )}
                            </div>

                            {/* Event Category Donut Chart */}
                            <div className="flex flex-col items-center pt-4 md:pt-0 md:pl-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                                        Event Categories ({sortedEventCategoryData.reduce((acc, c) => acc + c.value, 0)})
                                    </h4>
                                </div>
                                {sortedEventCategoryData.length > 0 ? (
                                    <div className="flex flex-col items-center w-full">
                                        <div className="h-56 w-full relative">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={sortedEventCategoryData}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={48}
                                                        outerRadius={80}
                                                        startAngle={90}
                                                        endAngle={-270}
                                                        paddingAngle={4}
                                                        dataKey="value"
                                                        nameKey="name"
                                                        onClick={(entry) => setActiveEventCategory(prev => prev === entry.name ? null : entry.name)}
                                                    >
                                                        {sortedEventCategoryData.map((entry, index) => (
                                                            <Cell
                                                                key={`e-cell-${index}`}
                                                                fill={EVENT_CATEGORY_COLORS[entry.name] || CHART_PALETTE[(index + 3) % CHART_PALETTE.length]}
                                                                opacity={activeEventCategory && activeEventCategory !== entry.name ? 0.3 : 1}
                                                                stroke="#ffffff"
                                                                strokeWidth={2}
                                                                className="cursor-pointer transition-all duration-300"
                                                            />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip
                                                        formatter={(val: any) => [`${val} events`, 'Count']}
                                                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', borderColor: '#e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        {/* Interactive Category Highlight Buttons (Similar to AdminDonations) */}
                                        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
                                            {sortedEventCategoryData.map((entry, index) => (
                                                <button
                                                    key={`e-leg-${entry.name}`}
                                                    onClick={() => setActiveEventCategory(prev => prev === entry.name ? null : entry.name)}
                                                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all border
                                                        ${activeEventCategory === entry.name ? 'bg-gray-900 text-white border-gray-900 shadow-2xs scale-105' :
                                                            activeEventCategory && activeEventCategory !== entry.name ? 'bg-gray-50 text-gray-400 border-gray-100 opacity-50' :
                                                                'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                                                >
                                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: EVENT_CATEGORY_COLORS[entry.name] || CHART_PALETTE[(index + 3) % CHART_PALETTE.length] }} />
                                                    <span>{entry.name}</span>
                                                    <span className="font-bold text-[10px] opacity-75">({entry.value})</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center h-64 text-gray-400 text-xs">
                                        No event categories logged yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Spatial & Temporal Interactive Widgets (Map & Calendar) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Switchable Upcoming Events List Widget */}
                <Card className="shadow-md border-none flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-gray-900 text-lg pb-0">
                                <CalendarIcon className="w-5 h-5 text-brand-primary" />
                                Upcoming Alumni Events
                            </CardTitle>
                            <CardDescription>Filter scheduled events by time window</CardDescription>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                            {(['Upcoming', '7 days', '30 days'] as const).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setEventTimeRange(range)}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${eventTimeRange === range
                                        ? 'bg-white text-brand-primary shadow-xs font-bold'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 px-4 pb-4 pt-0 overflow-y-auto max-h-[420px]">
                        {filteredUpcomingEvents.length > 0 ? (
                            <div className="space-y-3">
                                {filteredUpcomingEvents.map((evt) => {
                                    const catName = evt.eventCategory?.eventCategoryName || evt.category?.eventCategoryName || 'General';
                                    const locStr = evt.location?.landmark || evt.location?.cityMunicipality || evt.modality || 'Virtual';
                                    return (
                                        <div
                                            key={evt.id}
                                            className="p-3.5 bg-white border border-gray-100 hover:border-brand-primary/30 rounded-xl shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <h4 className="font-bold text-gray-900 text-sm">{evt.title}</h4>
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getCategoryColor(catName)}`}>
                                                        {catName}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                                                    <span className="flex items-center gap-1 font-medium text-brand-primary">
                                                        <CalendarIcon className="w-3.5 h-3.5" />
                                                        {evt.eventDate ? formatDate(evt.eventDate, 'short') : 'TBD'} {evt.startTime ? `@ ${evt.startTime}` : ''}
                                                    </span>
                                                    <span>•</span>
                                                    <span>📍 {locStr}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    to={`/admin/preview/event/${evt.id}`}
                                                    className="p-1.5 text-gray-400 hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                                                    title="Preview Event"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400 text-xs">
                                <CalendarIcon className="w-8 h-8 mb-2 opacity-50" />
                                <p>No events scheduled for the selected timeframe ({eventTimeRange}).</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Monthly Event Calendar View Widget */}
                <Card className="shadow-md border-none flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-gray-900">
                                <CalendarIcon className="w-5 h-5 text-brand-primary" />
                                Event Monthly Calendar
                            </CardTitle>
                            <CardDescription>Browse scheduled alumni activities by date</CardDescription>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCalendarDate(new Date(year, month - 1, 1))}
                                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors text-gray-600"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs font-bold text-gray-800 px-2 min-w-[110px] text-center">
                                {monthName}
                            </span>
                            <button
                                onClick={() => setCalendarDate(new Date(year, month + 1, 1))}
                                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors text-gray-600"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                        <div>
                            {/* Calendar Days Header */}
                            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                    <span key={d} className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{d}</span>
                                ))}
                            </div>

                            {/* Calendar Days Grid */}
                            <div className="grid grid-cols-7 gap-1.5 text-center">
                                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                    <div key={`empty-${i}`} className="h-9 rounded-lg bg-gray-50/30" />
                                ))}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const dayNum = i + 1;
                                    const dayEvents = getEventsForDay(dayNum);
                                    const hasEvents = dayEvents.length > 0;
                                    const isSelected = selectedDateStr === `${monthName} ${dayNum}, ${year}`;

                                    return (
                                        <button
                                            key={`day-${dayNum}`}
                                            onClick={() => handleDayClick(dayNum)}
                                            className={`h-9 rounded-lg text-xs font-semibold flex flex-col items-center justify-center relative transition-all shadow-2xs
                                                ${isSelected ? 'bg-brand-primary text-white ring-2 ring-brand-primary/40' :
                                                    hasEvents ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200' :
                                                        'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                                        >
                                            <span>{dayNum}</span>
                                            {hasEvents && (
                                                <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1 ${isSelected ? 'bg-amber-300' : 'bg-emerald-600'}`} />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Selected Day Event Inspection Details */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            {selectedDateStr && selectedDateEvents ? (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        Events on {selectedDateStr}:
                                    </h4>
                                    {(selectedDateEvents && selectedDateEvents.length > 0) ? (
                                        <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                                            {selectedDateEvents.map(evt => (
                                                <div key={evt.id} className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between text-xs">
                                                    <div>
                                                        <p className="font-bold text-emerald-950">{evt.title}</p>
                                                        <p className="text-[11px] text-emerald-700">
                                                            {evt.startTime || '09:00'} - {evt.endTime || '17:00'} • {evt.location?.landmark || evt.location?.cityMunicipality || evt.modality || 'Virtual'}
                                                        </p>
                                                    </div>
                                                    <Link to="/admin/events" className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold">
                                                        Manage
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 italic">No events scheduled for this day.</p>
                                    )}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 text-center py-2">Click any highlighted calendar date to view scheduled event proposals.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Feed */}
            <Card className="shadow-md border-none">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                        <Activity className="w-5 h-5 text-brand-primary" />
                        Activity Feed
                    </CardTitle>
                    <CardDescription>Real-time feed of user registrations, bulletins, event proposals, and donations</CardDescription>
                </CardHeader>
                <CardContent>
                    {stats.recentActivity && stats.recentActivity.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {stats.recentActivity.map((activity) => (
                                <div key={activity.id} className="p-4 bg-gray-50/70 rounded-xl border border-gray-100 flex items-start gap-3.5 hover:bg-gray-50 transition-colors">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-xs
                                      ${activity.type === 'user' ? 'bg-emerald-100 text-emerald-700' :
                                            activity.type === 'content' ? 'bg-blue-100 text-blue-700' :
                                                activity.type === 'donation' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-purple-100 text-purple-700'}`}
                                    >
                                        {activity.type === 'user' && <Users size={16} />}
                                        {activity.type === 'content' && <FileText size={16} />}
                                        {activity.type === 'donation' && <CreditCard size={16} />}
                                        {activity.type === 'event' && <CalendarIcon size={16} />}
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="flex-1 text-sm font-semibold text-gray-900 truncate">
                                                {activity.user}
                                            </p>
                                            <span className="shrink-0 text-[11px] text-gray-400">
                                                {activity.time}
                                            </span>
                                        </div>

                                        <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                            {activity.action}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm py-4">No recent activity logged yet.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
