import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle,  } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { formatCurrency, getBankColor, formatDate } from '@/app/views/formatters';
import { Printer, Info, Mail, MapPin, GraduationCap, Briefcase } from 'lucide-react';
import { api, type Donation } from '@/app/views/api';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { toPng } from 'html-to-image';
import { LazyImage } from '@/app/components/user/LazyImage';

const STATUS_COLORS: Record<string, string> = {
    Completed: '#1a5f3f', // Green
    Processing: '#d97706', // Ochre
    Failed: '#dc2626', // Red
    Other: '#9ca3af' // Gray
};

export function DonationDashboard() {
    const printRef = useRef<HTMLDivElement>(null);

    const [isStatsLoading, setIsStatsLoading] = useState(true);
    const [summaryTimeDate, setSummaryTimeDate] = useState<Date | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    const [stats, setStats] = useState({
        totalRaised: 0,
        pendingClearances: 0,
        pendingCount: 0,
        uniqueDonors: 0,
        averageLifetimeValue: 0,
        averageDonationValue: 0,
        donationFrequency: 0,
        repeatDonationRate: 0,
        yoyRetention: 0,
        engagementRate: 0
    });

    // Chart Data
    const [statusData, setStatusData] = useState<{ name: string; value: number }[]>([]);
    const [bankData, setBankData] = useState<{ name: string; value: number }[]>([]);

    // Enhanced Top Donors Data
    const [leaderboards, setLeaderboards] = useState<{
        topLTV: any[];
        topAvgDonation: any[];
        topFrequency: any[];
    }>({ topLTV: [], topAvgDonation: [], topFrequency: [] });
    const [activeLeaderboardTab, setActiveLeaderboardTab] = useState('Top LTV');



    // Interactive Legend states
    const [activeStatus, setActiveStatus] = useState<string | null>(null);
    const [activeBank, setActiveBank] = useState<string | null>(null);

    const fetchStats = async () => {
        setIsStatsLoading(true);
        try {
            const res = await api.get('/donations/summary');
            setSummaryTimeDate(new Date(res.data.stats.updatedAt));
            const data = res.data;

            setStats({
                totalRaised: data.stats.totalRaised,
                pendingClearances: data.stats.pendingClearances,
                pendingCount: data.stats.pendingCount,
                uniqueDonors: data.stats.uniqueDonors,
                averageLifetimeValue: data.stats.averageLifetimeValue,
                averageDonationValue: data.stats.averageDonationValue,
                donationFrequency: data.stats.donationFrequency,
                repeatDonationRate: data.stats.repeatDonationRate,
                yoyRetention: data.stats.yoyRetention,
                engagementRate: data.stats.engagementRate
            });

            setStatusData(data.charts.statusData);
            setBankData(data.charts.bankData);
            setUniqueBanks(data.uniqueBanks || []);
            setLeaderboards(data.leaderboards);

            try {
                const statusesRes = await api.get('/donationStatuses');
                if (statusesRes.data && Array.isArray(statusesRes.data)) {
                    setDbStatuses(statusesRes.data.map((s: any) => s.statusName));
                }
            } catch (err) {
                console.error("Failed to fetch donation statuses", err);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsStatsLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    // Filter State

    // Filter State

    // Explicit filter applied state







    useEffect(() => {
    



    const handleStatusLegendClick = (e: any) => {
        setActiveStatus(prev => prev === e.value ? null : e.value);
    };

    const handleBankLegendClick = (e: any) => {
        setActiveBank(prev => prev === e.value ? null : e.value);
    };

    const renderCustomTooltip = ({ active, payload }: any, totalKey: string) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            let sum = 0;
            if (totalKey === 'status') sum = statusData.reduce((acc, curr) => acc + curr.value, 0);
            else sum = bankData.reduce((acc, curr) => acc + curr.value, 0);

            const percent = sum > 0 ? ((data.value / sum) * 100).toFixed(1) : '0.0';

            return (
                <div className="bg-white border border-gray-200 shadow-sm rounded-md p-2 text-xs">
                    <span className="font-semibold">{data.name}</span>: {data.value} ({percent}%)
                </div>
            );
        }
        return null;
    };

    const handlePrintReport = async () => {
        if (!printRef.current || isExporting) return;
        setIsExporting(true);
        try {
            const dataUrl = await toPng(printRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: '#f9fafb'
            });
            const link = document.createElement('a');
            link.download = `Donations_Report_${formatDate(new Date(), 'iso')}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Failed to generate report image", error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <style type="text/css">
                {`
                @media print {
                    nav, aside, header, .sidebar { display: none !important; }
                    main { margin: 0 !important; padding: 0 !important; width: 100% !important; }
                    .print\\:hidden { display: none !important; }
                }
                `}
            </style>
            <div className="flex flex-col gap-2 print:hidden">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Donations Tracking</h1>
                <p className="text-gray-500">View recent contributions and generate financial reports.</p>
            </div>

            {isStatsLoading ? (
                <div className="flex justify-center py-10 w-full">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" ref={printRef}>
                    {/* LEFT COLUMN: Summary & Charts */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        {/* Summary Card Row */}
                        <div className="bg-white border border-gray-100 p-3 rounded-md text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-brand-gold shadow-sm">
                            <div className="flex items-start gap-2">
                                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium">Summary generated</p>
                                    <p className="text-xs text-gray-600">
                                        {summaryTimeDate
                                            ? `Last updated: ${summaryTimeDate.toLocaleString()}`
                                            : "Summary has not been generated yet."}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="gap-2 shrink-0" onClick={fetchStats}>
                                    Generate Summary
                                </Button>
                                <Button variant="outline" className="gap-2 shrink-0" onClick={handlePrintReport} disabled={isExporting}>
                                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer size={16} />}
                                    {isExporting ? 'Exporting...' : 'Print Report'}
                                </Button>
                            </div>
                        </div>
                        <Card className="border-none shadow-md overflow-hidden">
                            <CardContent className="p-0 grid grid-cols-2 sm:grid-cols-3 divide-y sm:divide-x divide-gray-100">
                                <div className="p-4 bg-green-50/50 flex flex-col justify-center col-span-2 sm:col-span-1 border-b sm:border-b-0">
                                    <div className="text-xs font-medium text-green-800">Total Raised (YTD)</div>
                                    <div className="text-xl font-bold text-green-900 leading-tight mt-1">{formatCurrency(stats.totalRaised)}</div>
                                </div>
                                <div className="p-4 flex flex-col justify-center">
                                    <div className="text-xs font-medium text-gray-500">Pending Clearances</div>
                                    <div className="text-xl font-bold text-gray-900 leading-tight mt-1">{formatCurrency(stats.pendingClearances)}</div>
                                </div>
                                <div className="p-4 flex flex-col justify-center">
                                    <div className="text-xs font-medium text-gray-500">Unique Donors (YTD)</div>
                                    <div className="text-xl font-bold text-gray-900 leading-tight mt-1">{stats.uniqueDonors}</div>
                                </div>
                                <div className="p-4 flex flex-col justify-center border-t sm:border-t-0">
                                    <div className="text-xs font-medium text-gray-500">Avg. Lifetime Value</div>
                                    <div className="text-xl font-bold text-gray-900 leading-tight mt-1">{formatCurrency(stats.averageLifetimeValue)}</div>
                                </div>
                                <div className="p-4 flex flex-col justify-center border-t sm:border-t-0">
                                    <div className="text-xs font-medium text-gray-500">Avg. Donation Value</div>
                                    <div className="text-xl font-bold text-gray-900 leading-tight mt-1">{formatCurrency(stats.averageDonationValue)}</div>
                                </div>
                                <div className="p-4 flex flex-col justify-center border-t sm:border-t-0">
                                    <div className="text-xs font-medium text-gray-500">Avg. Donation Frequency</div>
                                    <div className="text-xl font-bold text-gray-900 leading-tight mt-1">{stats.donationFrequency.toFixed(2)}x</div>
                                </div>
                                <div className="p-4 flex flex-col justify-center border-t sm:border-t-0">
                                    <div className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                        YoY Retention
                                        <div
                                            className="w-4 h-4 rounded-full border border-gray-400 text-gray-500 flex items-center justify-center text-[10px] font-bold cursor-help"
                                            title="Formula: (Donors this Year who also donated Last Year) / (Total Unique Donors this Year) * 100"
                                        >
                                            ?
                                        </div>
                                    </div>
                                    <div className="text-xl font-bold text-gray-900 leading-tight mt-1">{(stats.yoyRetention * 100).toFixed(1)}%</div>
                                </div>
                                <div className="p-4 flex flex-col justify-center border-t sm:border-t-0">
                                    <div className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                        Repeat Donation Rate
                                        <div
                                            className="w-4 h-4 rounded-full border border-gray-400 text-gray-500 flex items-center justify-center text-[10px] font-bold cursor-help"
                                            title="Formula: (Donors with > 1 Donation) / (Total Unique Donors) * 100"
                                        >
                                            ?
                                        </div>
                                    </div>
                                    <div className="text-xl font-bold text-gray-900 leading-tight mt-1">{(stats.repeatDonationRate * 100).toFixed(1)}%</div>
                                </div>
                                <div className="p-4 flex flex-col justify-center border-t sm:border-t-0">
                                    <div className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                        Engagement Rate
                                        <div
                                            className="w-4 h-4 rounded-full border border-gray-400 text-gray-500 flex items-center justify-center text-[10px] font-bold cursor-help"
                                            title="Formula: (Total Unique Donors) / (Total Registered Users) * 100"
                                        >
                                            ?
                                        </div>
                                    </div>
                                    <div className="text-xl font-bold text-gray-900 leading-tight mt-1">{(stats.engagementRate * 100).toFixed(1)}%</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Charts */}
                        <div className="grid grid-cols-1 gap-6">
                            <Card className="border-none shadow-md overflow-hidden">
                                <CardContent className="p-0 flex flex-col sm:flex-row h-72">
                                    <div className="w-full sm:w-1/3 p-6 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-gray-100 bg-gray-50/50">
                                        <h3 className="text-base font-semibold text-gray-900">Status Share</h3>
                                        <p className="text-xs text-gray-500 mt-1 mb-4">Click legend items to isolate</p>
                                        <div className="flex flex-col gap-2 overflow-y-auto pr-2">
                                            {statusData.map((entry, index) => (
                                                <div
                                                    key={index}
                                                    className={`flex items-center gap-2 text-xs cursor-pointer select-none transition-opacity ${activeStatus && activeStatus !== entry.name ? 'opacity-40' : 'opacity-100'}`}
                                                    onClick={() => handleStatusLegendClick({ value: entry.name })}
                                                >
                                                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[entry.name] || STATUS_COLORS.Other }} />
                                                    <span className="text-gray-700 truncate">{entry.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="w-full sm:w-2/3 h-full p-4 relative transform-gpu will-change-transform" style={{ contain: 'paint' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie isAnimationActive={false} data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={115} startAngle={90} endAngle={-270}>
                                                    {statusData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={STATUS_COLORS[entry.name] || STATUS_COLORS.Other}
                                                            opacity={activeStatus && activeStatus !== entry.name ? 0.3 : 1}
                                                            stroke="#ffffff"
                                                            strokeWidth={1.5}
                                                        />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip content={(props) => renderCustomTooltip(props, 'status')} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        {activeStatus && (
                                            (() => {
                                                const entry = statusData.find(d => d.name === activeStatus);
                                                if (!entry) return null;
                                                const sum = statusData.reduce((acc, curr) => acc + curr.value, 0);
                                                const percent = sum > 0 ? ((entry.value / sum) * 100).toFixed(1) : '0.0';
                                                return (
                                                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-md rounded-md p-2.5 text-xs pointer-events-none z-10 animate-in fade-in duration-200">
                                                        <div className="font-semibold flex items-center gap-1.5">
                                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[entry.name] || STATUS_COLORS.Other }} />
                                                            {entry.name}
                                                        </div>
                                                        <div className="mt-1 text-gray-600">
                                                            Transactions: <span className="font-medium text-gray-900">{entry.value}</span>
                                                        </div>
                                                        <div className="text-gray-600">
                                                            Percentage: <span className="font-medium text-gray-900">{percent}%</span>
                                                        </div>
                                                    </div>
                                                );
                                            })()
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-none shadow-md overflow-hidden">
                                <CardContent className="p-0 flex flex-col sm:flex-row h-90">
                                    <div className="w-full sm:w-1/3 p-6 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-gray-100 bg-gray-50/50">
                                        <h3 className="text-base font-semibold text-gray-900">Bank Share</h3>
                                        <p className="text-xs text-gray-500 mt-1 mb-4">Click legend items to isolate</p>
                                        <div className="flex flex-col gap-2 overflow-y-auto pr-2" style={{ maxHeight: '180px' }}>
                                            {bankData.map((entry, index) => (
                                                <div
                                                    key={index}
                                                    className={`flex items-center gap-2 text-xs cursor-pointer select-none transition-opacity ${activeBank && activeBank !== entry.name ? 'opacity-40' : 'opacity-100'}`}
                                                    onClick={() => handleBankLegendClick({ value: entry.name })}
                                                >
                                                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: getBankColor(entry.name) }} />
                                                    <span className="text-gray-700 truncate" title={entry.name}>{entry.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="w-full sm:w-2/3 h-full p-4 relative transform-gpu will-change-transform" style={{ contain: 'paint' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie isAnimationActive={false} data={bankData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={115} startAngle={90} endAngle={-270}>
                                                    {bankData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={getBankColor(entry.name)}
                                                            opacity={activeBank && activeBank !== entry.name ? 0.3 : 1}
                                                            stroke="#ffffff"
                                                            strokeWidth={1.5}
                                                        />
                                                    ))}
                                                </Pie>
                                                <RechartsTooltip content={(props) => renderCustomTooltip(props, 'bank')} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        {activeBank && (
                                            (() => {
                                                const entry = bankData.find(d => d.name === activeBank);
                                                if (!entry) return null;
                                                const sum = bankData.reduce((acc, curr) => acc + curr.value, 0);
                                                const percent = sum > 0 ? ((entry.value / sum) * 100).toFixed(1) : '0.0';
                                                return (
                                                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-md rounded-md p-2.5 text-xs pointer-events-none z-10 animate-in fade-in duration-200">
                                                        <div className="font-semibold flex items-center gap-1.5">
                                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getBankColor(entry.name) }} />
                                                            {entry.name}
                                                        </div>
                                                        <div className="mt-1 text-gray-600">
                                                            Transactions: <span className="font-medium text-gray-900">{entry.value}</span>
                                                        </div>
                                                        <div className="text-gray-600">
                                                            Percentage: <span className="font-medium text-gray-900">{percent}%</span>
                                                        </div>
                                                    </div>
                                                );
                                            })()
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Top Donors */}
                    <div className="lg:col-span-1 flex flex-col h-full">
                        <Card className="border-none shadow-md h-full flex flex-col gap-0">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-4">
                                <div className="flex flex-col gap-2">
                                    <CardTitle className="text-sm font-semibold text-gray-900">Top Donors</CardTitle>
                                    <Tabs value={activeLeaderboardTab} onValueChange={setActiveLeaderboardTab} className="w-full mt-2">
                                        <TabsList className="grid w-full grid-cols-3 h-8">
                                            <TabsTrigger value="Top LTV" className="text-xs">Top LTV</TabsTrigger>
                                            <TabsTrigger value="Top Avg Donation" className="text-xs">Top Avg</TabsTrigger>
                                            <TabsTrigger value="Top Frequency" className="text-xs">Top Freq</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 p-0">
                                <div className="flex flex-col divide-y divide-gray-100">
                                    {(activeLeaderboardTab === 'Top LTV' ? leaderboards.topLTV : activeLeaderboardTab === 'Top Avg Donation' ? leaderboards.topAvgDonation : leaderboards.topFrequency).map((d: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between gap-4 p-4 hover:bg-gray-50/30 transition-colors"
                                        >
                                            <Link
                                                to={`/profile/${d.userId}`}
                                                className="relative shrink-0 group flex items-center" // Added 'flex items-center'
                                            >
                                                <div className="w-26 h-26 rounded-md overflow-hidden border border-gray-200 shadow-sm transition group-hover:ring-2 group-hover:ring-brand-primary/30">
                                                    {d.profileImage ? (
                                                        <LazyImage
                                                            src={d.profileImage}
                                                            alt={d.donor}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-brand-primary/10 text-brand-primary font-bold text-lg">
                                                            {d.donor.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* This badge remains locked to the top-left corner of the link container */}
                                                <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-brand-primary text-white flex items-center justify-center text-[11px] font-bold border-2 border-white">
                                                    {idx + 1}
                                                </div>
                                            </Link>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-3 text-lg mb-1">
                                                    <h4 className="font-semibold text-gray-900 truncate">
                                                        {d.donor}
                                                    </h4>
                                                </div>

                                                <div className="mt-2 space-y-1.5">
                                                    {d.career !== 'N/A' && (
                                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                                            <Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                            <span className="truncate">{d.career}</span>
                                                        </div>
                                                    )}

                                                    {d.location !== 'N/A' && (
                                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                            <span className="truncate">{d.location}</span>
                                                        </div>
                                                    )}

                                                    {d.batch !== 'N/A' && (
                                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                                            <GraduationCap className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                            <span>Batch {d.batch}</span>
                                                        </div>
                                                    )}

                                                    {d.email !== 'N/A' && (
                                                        <div className="flex items-center gap-2 text-xs text-gray-600">
                                                            <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                            <span className="truncate">{d.email}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-4 text-sm mb-2">
                                                <div className={`flex flex-col ${activeLeaderboardTab === 'Top LTV' ? 'text-brand-primary font-bold' : 'text-gray-400 font-medium opacity-50'}`}>
                                                    <span className="text-[10px] uppercase tracking-wider">LTV</span>
                                                    <span>{formatCurrency(d.amount)}</span>
                                                </div>
                                                <div className={`flex flex-col ${activeLeaderboardTab === 'Top Avg Donation' ? 'text-brand-primary font-bold' : 'text-gray-400 font-medium opacity-50'}`}>
                                                    <span className="text-[10px] uppercase tracking-wider">Avg</span>
                                                    <span>{formatCurrency(d.avgDonation)}</span>
                                                </div>
                                                <div className={`flex flex-col ${activeLeaderboardTab === 'Top Frequency' ? 'text-brand-primary font-bold' : 'text-gray-400 font-medium opacity-50'}`}>
                                                    <span className="text-[10px] uppercase tracking-wider">Freq</span>
                                                    <span>{d.frequency}x</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

                    </div>
    );
}
