import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card';
import { Users, FileText, Calendar, CreditCard, Activity } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAdminStats, adminRecentActivity } from '@assets/adminMockData';
import { getDashboardContentStats } from '@assets/mockData';

const iconMap: Record<string, LucideIcon> = {
    Users,
    CreditCard,
    Calendar,
    FileText
};

export function AdminDashboard() {
    const userStats = getAdminStats();
    const contentStats = getDashboardContentStats();

    const stats = [
        ...userStats,
        { title: 'Upcoming Events', value: contentStats.upcomingEvents.toString(), iconName: 'Calendar', change: 'Next 30 days', positive: true },
        { title: 'Pending Content', value: contentStats.pendingContent.toString(), iconName: 'FileText', change: 'Needs review', positive: false },
    ];

    const handleGenerateReport = () => {
        const statsData = [
            ['Metric', 'Value', 'Timeline'],
            ...stats.map(s => `"${s.title}","${s.value}","${s.change}"`)
        ];
        const csvString = statsData.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `admin_dashboard_report_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500">Welcome to the Alumni Admin Panel. Here is what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => {
                    const Icon = iconMap[stat.iconName] || Activity;
                    return (
                        <Card key={i} className="border-none shadow-md hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 h-auto">
                                <CardTitle className="text-sm font-medium text-gray-500">{stat.title}</CardTitle>
                                <Icon className="w-5 h-5 text-gray-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                                <p className={`text-xs mt-1 font-medium ${stat.positive ? 'text-green-600' : 'text-amber-600'}`}>
                                    {stat.change}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <Card className="col-span-1 shadow-md border-none">
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common administrative tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Link to="/admin/users?tab=Regular" className="block w-full text-left px-4 py-3 border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium rounded-md transition-colors">
                            Manage Users
                        </Link>
                        <Link to="/admin/bulletins?tab=Pending" className="block w-full text-left px-4 py-3 border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium rounded-md transition-colors">
                            Approve Bulletins
                        </Link>
                        <Link to="/admin/events?tab=Pending" className="block w-full text-left px-4 py-3 border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium rounded-md transition-colors">
                            Approve Events
                        </Link>
                        <button onClick={handleGenerateReport} className="w-full text-left px-4 py-3 border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium rounded-md transition-colors">
                            Generate Report
                        </button>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="col-span-1 lg:col-span-2 shadow-md border-none">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-[#1a5f3f]" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {adminRecentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-4">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5
                    ${activity.type === 'user' ? 'bg-green-100 text-green-600' :
                                            activity.type === 'content' ? 'bg-blue-100 text-blue-600' :
                                                activity.type === 'donation' ? 'bg-amber-100 text-amber-600' :
                                                    'bg-purple-100 text-purple-600'}`}
                                    >
                                        {activity.type === 'user' && <Users size={14} />}
                                        {activity.type === 'content' && <FileText size={14} />}
                                        {activity.type === 'donation' && <CreditCard size={14} />}
                                        {activity.type === 'event' && <Calendar size={14} />}
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            <span className="font-semibold text-gray-900">{activity.user}</span> {activity.action}
                                        </p>
                                        <p className="text-sm text-gray-500">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
