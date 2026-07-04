import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Input } from '@components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { formatCurrency, getBankColor } from '@/app/views/formatters';
import { Printer, Download, Search, ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight, Loader2, Info, Mail, MapPin, GraduationCap, Briefcase } from 'lucide-react';
import { api, type Donation } from '@/app/views/api';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { toPng } from 'html-to-image';

const STATUS_COLORS: Record<string, string> = {
    Completed: '#1a5f3f', // Green
    Processing: '#d97706', // Ochre
    Failed: '#dc2626', // Red
    Other: '#9ca3af' // Gray
};

export function AdminDonations() {
    const ITEMS_PER_PAGE = 20;
    const printRef = useRef<HTMLDivElement>(null);

    const [donations, setDonations] = useState<Donation[]>([]);
    const [totalDonations, setTotalDonations] = useState(0);
    const [isTableLoading, setIsTableLoading] = useState(true);
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

    const [uniqueBanks, setUniqueBanks] = useState<string[]>([]);

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
    const [activeTab, setActiveTab] = useState('All');

    // Filter State
    const [searchDonor, setSearchDonor] = useState('');
    const [searchRef, setSearchRef] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchBankName, setSearchBankName] = useState('All');

    // Explicit filter applied state
    const [appliedSearchDonor, setAppliedSearchDonor] = useState('');
    const [appliedSearchRef, setAppliedSearchRef] = useState('');
    const [appliedMinAmount, setAppliedMinAmount] = useState('');
    const [appliedMaxAmount, setAppliedMaxAmount] = useState('');
    const [appliedStartDate, setAppliedStartDate] = useState('');
    const [appliedEndDate, setAppliedEndDate] = useState('');
    const [appliedSearchBankName, setAppliedSearchBankName] = useState('All');

    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const renderSortIcon = (key: keyof Donation) => {
        if (sortConfig?.key !== key) return <ArrowUpDown size={14} className="text-gray-400" />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-gray-700" /> : <ArrowDown size={14} className="text-gray-700" />;
    };

    const handleExportCSV = async () => {
        try {
            const whereClause: any = {};
            if (activeTab !== 'All') {
                whereClause.donationStatus = { statusName: activeTab };
            }
            if (appliedSearchDonor) {
                whereClause.user = { profile: { userName: { contains: appliedSearchDonor } } };
            }
            if (appliedSearchRef) {
                whereClause.donationReference = { contains: appliedSearchRef };
            }
            if (appliedMinAmount || appliedMaxAmount) {
                whereClause.donationAmount = {};
                if (appliedMinAmount) whereClause.donationAmount.gte = parseFloat(appliedMinAmount);
                if (appliedMaxAmount) whereClause.donationAmount.lte = parseFloat(appliedMaxAmount);
            }
            if (appliedStartDate || appliedEndDate) {
                whereClause.donationDate = {};
                if (appliedStartDate) whereClause.donationDate.gte = new Date(appliedStartDate).toISOString();
                if (appliedEndDate) {
                    const end = new Date(appliedEndDate);
                    end.setDate(end.getDate() + 1);
                    whereClause.donationDate.lt = end.toISOString();
                }
            }
            if (appliedSearchBankName && appliedSearchBankName !== 'All') {
                if (appliedSearchBankName === 'N/A') {
                    whereClause.bankName = null;
                } else {
                    whereClause.bankName = appliedSearchBankName;
                }
            }

            let sortStr = undefined;
            if (sortConfig) {
                let sortKey: string = sortConfig.key;
                if (sortKey === 'amount') sortKey = 'donationAmount';
                else if (sortKey === 'date') sortKey = 'donationDate';
                else if (sortKey === 'donor') sortKey = 'user.profile.userName';
                else if (sortKey === 'status') sortKey = 'donationStatus.statusName';

                sortStr = sortConfig.direction === 'desc' ? `-${sortKey}` : sortKey;
            }

            const res = await api.get('/donations', {
                params: {
                    _sort: sortStr,
                    _where: Object.keys(whereClause).length > 0 ? JSON.stringify(whereClause) : undefined
                }
            });

            const data = res.data.data || res.data;

            const headers = ['Date', 'Donor', 'Amount', 'Status', 'Bank Name', 'Reference'];
            const csvContent = data.map((d: any) => {
                const date = format(new Date(d.donationDate), 'MMM dd, yyyy');
                const donor = !d.user?.profile?.userName ? 'Anonymous' : d.user.profile.userName;
                const status = d.donationStatus?.statusName || 'Unknown';
                return `"${date}","${donor}","${d.donationAmount}","${status}","${d.bankName || 'N/A'}","${d.donationReference || ''}"`;
            });

            const csvString = [headers.join(','), ...csvContent].join('\n');
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', 'donations_export.csv');
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error("Failed to export CSV", error);
        }
    };

    useEffect(() => {
        const fetchDonations = async () => {
            setIsTableLoading(true);
            try {
                const whereClause: any = {};
                if (activeTab !== 'All') {
                    whereClause.donationStatus = { statusName: activeTab };
                }
                if (appliedSearchDonor) {
                    whereClause.user = { profile: { userName: { contains: appliedSearchDonor } } };
                }
                if (appliedSearchRef) {
                    whereClause.donationReference = { contains: appliedSearchRef };
                }
                if (appliedMinAmount || appliedMaxAmount) {
                    whereClause.donationAmount = {};
                    if (appliedMinAmount) whereClause.donationAmount.gte = parseFloat(appliedMinAmount);
                    if (appliedMaxAmount) whereClause.donationAmount.lte = parseFloat(appliedMaxAmount);
                }
                if (appliedStartDate || appliedEndDate) {
                    whereClause.donationDate = {};
                    if (appliedStartDate) whereClause.donationDate.gte = new Date(appliedStartDate).toISOString();
                    if (appliedEndDate) {
                        const end = new Date(appliedEndDate);
                        end.setDate(end.getDate() + 1);
                        whereClause.donationDate.lt = end.toISOString();
                    }
                }
                if (appliedSearchBankName && appliedSearchBankName !== 'All') {
                    if (appliedSearchBankName === 'N/A') {
                        // Attempt to filter records with no bank name (assuming json server custom where handler supports null)
                        whereClause.bankName = null;
                    } else {
                        whereClause.bankName = appliedSearchBankName;
                    }
                }

                let sortStr = undefined;
                if (sortConfig) {
                    let sortKey: string = sortConfig.key;
                    if (sortKey === 'amount') sortKey = 'donationAmount';
                    else if (sortKey === 'date') sortKey = 'donationDate';
                    else if (sortKey === 'donor') sortKey = 'user.profile.userName';
                    else if (sortKey === 'status') sortKey = 'donationStatus.statusName';

                    sortStr = sortConfig.direction === 'desc' ? `-${sortKey}` : sortKey;
                }

                const res = await api.get('/donations', {
                    params: {
                        _page: currentPage,
                        _per_page: ITEMS_PER_PAGE,
                        _sort: sortStr,
                        _where: Object.keys(whereClause).length > 0 ? JSON.stringify(whereClause) : undefined
                    }
                });

                const data = res.data.data || res.data;
                const total = res.data.items || data.length;

                const mapped = data.map((d: any) => ({
                    id: d.id,
                    date: format(new Date(d.donationDate), 'MMM dd, yyyy'),
                    donor: d.donationAnonymous || !d.user?.profile?.userName ? 'Anonymous' : d.user.profile.userName,
                    amount: formatCurrency(d.donationAmount),
                    status: d.donationStatus?.statusName || 'Unknown',
                    rawAmount: d.donationAmount,
                    bankName: d.bankName,
                    donationReference: d.donationReference,
                    rawDate: new Date(d.donationDate).getTime(),
                    userId: d.userId
                }));
                setDonations(mapped);
                setTotalDonations(total);
            } catch (error) {
                console.error("Failed to fetch donations", error);
            } finally {
                setIsTableLoading(false);
            }
        };
        fetchDonations();
    }, [activeTab, appliedSearchDonor, appliedSearchRef, appliedMinAmount, appliedMaxAmount, appliedStartDate, appliedEndDate, appliedSearchBankName, sortConfig, currentPage]);

    const handleApplyFilters = () => {
        setAppliedSearchDonor(searchDonor);
        setAppliedSearchRef(searchRef);
        setAppliedMinAmount(minAmount);
        setAppliedMaxAmount(maxAmount);
        setAppliedStartDate(startDate);
        setAppliedEndDate(endDate);
        setAppliedSearchBankName(searchBankName);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setSearchDonor('');
        setSearchRef('');
        setMinAmount('');
        setMaxAmount('');
        setStartDate('');
        setEndDate('');
        setSearchBankName('All');

        setAppliedSearchDonor('');
        setAppliedSearchRef('');
        setAppliedMinAmount('');
        setAppliedMaxAmount('');
        setAppliedStartDate('');
        setAppliedEndDate('');
        setAppliedSearchBankName('All');

        setCurrentPage(1);
    };

    const totalPages = Math.ceil(totalDonations / ITEMS_PER_PAGE);
    const paginatedDonations = donations;

    const onTabChange = (val: string) => {
        setActiveTab(val);
        setCurrentPage(1);
    };

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
            link.download = `Donations_Report_${format(new Date(), 'yyyy-MM-dd')}.png`;
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
                        <div className="bg-yellow-100 text-gray-800 p-3 rounded-md text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-brand-gold shadow-sm">
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
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-white border-brand-gold text-brand-gold hover:bg-yellow-50"
                                    onClick={fetchStats}
                                >
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
                                                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={115} startAngle={90} endAngle={-270}>
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
                                                <Pie data={bankData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={115} startAngle={90} endAngle={-270}>
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
                                                        <img
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

            <Card className="border-none shadow-md print:hidden">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-lg">All Donations</CardTitle>
                        <CardDescription>Detailed log of all monetary contributions from alumni</CardDescription>
                    </div>
                    <div>
                        <Button variant="default" className="gap-2 shrink-0 bg-brand-primary text-white hover:bg-brand-primary-hover" onClick={handleExportCSV}>
                            <Download size={16} /> Export CSV
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
                        <TabsList className="mb-2">
                            <TabsTrigger value="All" className="min-w-[100px]">All</TabsTrigger>
                            <TabsTrigger value="Completed" className="min-w-[100px]">Completed</TabsTrigger>
                            <TabsTrigger value="Processing" className="min-w-[100px]">Processing</TabsTrigger>
                            <TabsTrigger value="Failed" className="min-w-[100px]">Failed</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="p-4 bg-gray-50/50 border border-gray-100 rounded-lg flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <div className="text-sm font-medium text-gray-700">Filters</div>
                            {!isTableLoading && (
                                <Badge variant="secondary" className="bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 cursor-default">
                                    {totalDonations} matching transactions
                                </Badge>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="relative flex items-center">
                                <Search className="absolute left-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Search by Donor..."
                                    className="pl-9 h-10 w-full bg-white"
                                    value={searchDonor}
                                    onChange={(e) => setSearchDonor(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilters(); }}
                                />
                            </div>

                            <div className="relative flex items-center">
                                <Search className="absolute left-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Search Reference..."
                                    className="pl-9 h-10 w-full bg-white"
                                    value={searchRef}
                                    onChange={(e) => setSearchRef(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilters(); }}
                                />
                            </div>

                            <Select value={searchBankName} onValueChange={setSearchBankName}>
                                <SelectTrigger className="h-10 bg-white text-gray-700">
                                    <SelectValue placeholder="Bank Name" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Banks</SelectItem>
                                    {uniqueBanks.map(b => (
                                        <SelectItem key={b} value={b}>{b}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    placeholder="Min ₱"
                                    className="h-10 w-full bg-white"
                                    value={minAmount}
                                    onChange={(e) => setMinAmount(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilters(); }}
                                />
                                <span className="text-sm text-gray-500">-</span>
                                <Input
                                    type="number"
                                    placeholder="Max ₱"
                                    className="h-10 w-full bg-white"
                                    value={maxAmount}
                                    onChange={(e) => setMaxAmount(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilters(); }}
                                />
                            </div>

                            <div className="flex items-center gap-2 lg:col-span-2">
                                <span className="text-sm text-gray-500 shrink-0">Date:</span>
                                <Input
                                    type="date"
                                    className="h-10 w-full bg-white px-2 text-sm text-gray-700"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilters(); }}
                                />
                                <span className="text-sm text-gray-500">-</span>
                                <Input
                                    type="date"
                                    className="h-10 w-full bg-white px-2 text-sm text-gray-700"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilters(); }}
                                />
                            </div>

                            <div className="flex items-center gap-2 lg:col-span-2 justify-end">
                                <Button variant="outline" onClick={handleClearFilters} className="w-24">Clear</Button>
                                <Button className="w-24 bg-brand-primary hover:bg-brand-primary-hover text-white" onClick={handleApplyFilters}>Submit</Button>
                            </div>
                        </div>
                    </div>

                    <div className="border rounded-md overflow-x-auto bg-white">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700 border-b">
                                <tr>
                                    <th className="px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('date')}>
                                        <div className="flex items-center gap-1">Date {renderSortIcon('date')}</div>
                                    </th>
                                    <th className="px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('donor')}>
                                        <div className="flex items-center gap-1">Donor {renderSortIcon('donor')}</div>
                                    </th>
                                    <th className="px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('amount')}>
                                        <div className="flex items-center gap-1">Amount {renderSortIcon('amount')}</div>
                                    </th>
                                    <th className="px-6 py-3 hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-1">Status</div>
                                    </th>
                                    <th className="px-6 py-3 hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-1">Bank Name</div>
                                    </th>
                                    <th className="px-6 py-3 hover:bg-gray-100 transition-colors">
                                        <div className="flex items-center gap-1">Donation Reference</div>
                                    </th>
                                    <th className="px-6 py-3 text-right">Receipt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isTableLoading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center border-t bg-gray-50/50">
                                            <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                                            <p className="mt-2 text-gray-500">Loading transactions...</p>
                                        </td>
                                    </tr>
                                ) : paginatedDonations.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500 border-t bg-gray-50">
                                            No transactions found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedDonations.map((donation) => (
                                        <tr key={donation.id} className="border-t hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{donation.date}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{donation.donor}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{donation.amount}</td>
                                            <td className="px-6 py-4">
                                                <Badge className={
                                                    donation.status === 'Completed' ? 'bg-green-100 text-green-800 border-transparent hover:bg-green-200' :
                                                        donation.status === 'Processing' ? 'bg-yellow-100 text-yellow-800 border-transparent hover:bg-yellow-200' :
                                                            donation.status === 'Failed' ? 'bg-red-100 text-red-800 border-transparent hover:bg-red-200' : 'bg-gray-100 text-gray-800'
                                                }>
                                                    {donation.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{donation.bankName || 'N/A'}</td>
                                            <td className="px-6 py-4 text-gray-500 font-mono text-xs">{donation.donationReference}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="sm" disabled={donation.status !== 'Completed'} className="text-brand-primary hover:text-brand-primary-hover hover:bg-brand-primary/10">
                                                    {donation.status === 'Completed' ? 'View' : ''}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && !isTableLoading && (
                        <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-4">
                            <div className="text-sm text-gray-500">
                                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalDonations)} of {totalDonations} transactions
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="text-sm font-medium px-2">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
