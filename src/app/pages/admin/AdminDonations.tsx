import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Input } from '@components/ui/input';
import { formatCurrency } from '@/app/views/formatters';
import { Download, Search, ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { api, type Donation } from '@/app/views/api';
import { format } from 'date-fns';

export function AdminDonations() {
    const ITEMS_PER_PAGE = 20;

    const [donations, setDonations] = useState<Donation[]>([]);
    const [totalDonations, setTotalDonations] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ totalRaised: '₱0', pendingClearances: '₱0', pendingCount: 0, uniqueDonors: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/donations');
                const currentYear = new Date().getFullYear();
                let totalRaised = 0;
                let pendingCount = 0;
                let pendingClearances = 0;
                const uniqueDonors = new Set();
                const allData = res.data.data || res.data;

                allData.forEach((d: any) => {
                    const isThisYear = new Date(d.donationDate).getFullYear() === currentYear;
                    const status = d.donationStatus?.statusName;
                    const amount = d.donationAmount;
                    const donor = d.donationAnonymous || !d.user?.profile?.userName ? 'Anonymous' : d.user.profile.userName;

                    if (status === 'Completed') {
                        totalRaised += amount;
                    } else if (status === 'Processing') {
                        pendingCount++;
                        pendingClearances += amount;
                    }
                    if (isThisYear && donor !== 'Anonymous') {
                        uniqueDonors.add(donor);
                    }
                });

                setStats({
                    totalRaised: `₱${totalRaised.toLocaleString()}`,
                    pendingClearances: `₱${pendingClearances.toLocaleString()}`,
                    pendingCount,
                    uniqueDonors: uniqueDonors.size
                });
            } catch (err) {
                console.error(err);
            }
        };
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

    // Explicit filter applied state
    const [appliedSearchDonor, setAppliedSearchDonor] = useState('');
    const [appliedSearchRef, setAppliedSearchRef] = useState('');
    const [appliedMinAmount, setAppliedMinAmount] = useState('');
    const [appliedMaxAmount, setAppliedMaxAmount] = useState('');
    const [appliedStartDate, setAppliedStartDate] = useState('');
    const [appliedEndDate, setAppliedEndDate] = useState('');

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

    const handleExportCSV = () => {
        const headers = ['Date', 'Donor', 'Amount', 'Status'];
        const csvContent = donations.map(d =>
            `"${d.date}","${d.donor}","${d.amount}","${d.status}"`
        );

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
    };

    useEffect(() => {
        const fetchDonations = async () => {
            setIsLoading(true);
            try {
                const whereClause: any = {};
                if (activeTab !== 'All') {
                    whereClause.status = { statusName: activeTab };
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

                let sortStr = undefined;
                if (sortConfig) {
                    let sortKey: string = sortConfig.key;
                    if (sortKey === 'amount') sortKey = 'donationAmount';
                    else if (sortKey === 'date') sortKey = 'donationDate';
                    else if (sortKey === 'donor') sortKey = 'user.profile.userName';
                    else if (sortKey === 'status') sortKey = 'status.statusName';

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
                    rawDate: new Date(d.donationDate).getTime()
                }));
                setDonations(mapped);
                setTotalDonations(total);
            } catch (error) {
                console.error("Failed to fetch donations", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDonations();
    }, [activeTab, appliedSearchDonor, appliedSearchRef, appliedMinAmount, appliedMaxAmount, appliedStartDate, appliedEndDate, sortConfig, currentPage]);

    // Add filters by bank as dropdown of unique banks
    const handleApplyFilters = () => {
        setAppliedSearchDonor(searchDonor);
        setAppliedSearchRef(searchRef);
        setAppliedMinAmount(minAmount);
        setAppliedMaxAmount(maxAmount);
        setAppliedStartDate(startDate);
        setAppliedEndDate(endDate);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setSearchDonor('');
        setSearchRef('');
        setMinAmount('');
        setMaxAmount('');
        setStartDate('');
        setEndDate('');

        setAppliedSearchDonor('');
        setAppliedSearchRef('');
        setAppliedMinAmount('');
        setAppliedMaxAmount('');
        setAppliedStartDate('');
        setAppliedEndDate('');

        setCurrentPage(1);
    };

    const totalPages = Math.ceil(totalDonations / ITEMS_PER_PAGE);
    const paginatedDonations = donations;

    const onTabChange = (val: string) => {
        setActiveTab(val);
        setCurrentPage(1);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Donations Tracking</h1>
                <p className="text-gray-500">View recent contributions and generate financial reports.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-3 flex justify-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
                    </div>
                ) : (
                    <>
                        <Card className="border-none shadow-md bg-green-50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-green-800">Total Raised (YTD)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalRaised}</div>
                                <p className="text-xs text-green-700 mt-1">Up from last year</p>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-md">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">Pending Clearances</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.pendingClearances}</div>
                                <p className="text-xs text-gray-500 mt-1">{stats.pendingCount} transactions pending</p>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-md">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-gray-500">Unique Donors</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-gray-900">{stats.uniqueDonors}</div>
                                <p className="text-xs text-gray-500 mt-1">This year</p>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            <Card className="border-none shadow-md">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-lg">All Donations</CardTitle>
                        <CardDescription>Detailed log of all monetary contributions from alumni</CardDescription>
                    </div>
                    <Button variant="outline" className="gap-2 shrink-0" onClick={handleExportCSV}>
                        <Download size={16} /> Export Report
                    </Button>
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
                        <div className="text-sm font-medium text-gray-700">Filters</div>
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                            <div className="lg:col-span-2 relative flex items-center">
                                <Search className="absolute left-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Search by Donor..."
                                    className="pl-9 h-10 w-full"
                                    value={searchDonor}
                                    onChange={(e) => setSearchDonor(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilters(); }}
                                />
                            </div>

                            <div className="lg:col-span-2 relative flex items-center">
                                <Search className="absolute left-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Search Reference..."
                                    className="pl-9 h-10 w-full"
                                    value={searchRef}
                                    onChange={(e) => setSearchRef(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilters(); }}
                                />
                            </div>

                            <div className="lg:col-span-3 flex items-center gap-2">
                                <span className="text-sm text-gray-500 shrink-0">Amt:</span>
                                <Input
                                    type="number"
                                    placeholder="Min"
                                    className="h-10"
                                    value={minAmount}
                                    onChange={(e) => setMinAmount(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilters(); }}
                                />
                                <span className="text-sm text-gray-500">-</span>
                                <Input
                                    type="number"
                                    placeholder="Max"
                                    className="h-10"
                                    value={maxAmount}
                                    onChange={(e) => setMaxAmount(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilters(); }}
                                />
                            </div>

                            <div className="lg:col-span-3 flex items-center gap-2">
                                <span className="text-sm text-gray-500 shrink-0">Date:</span>
                                <Input
                                    type="date"
                                    className="h-10 px-2"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilters(); }}
                                />
                                <span className="text-sm text-gray-500">-</span>
                                <Input
                                    type="date"
                                    className="h-10 px-2"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilters(); }}
                                />
                            </div>

                            <div className="lg:col-span-2 flex items-center gap-2 justify-end lg:justify-start">
                                <Button variant="outline" onClick={handleClearFilters}>Clear</Button>
                                <Button className="bg-brand-primary hover:bg-brand-primary-hover" onClick={handleApplyFilters}>Submit</Button>
                            </div>
                        </div>
                    </div>

                    <div className="border rounded-md overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700">
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
                                {paginatedDonations.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500 border-t bg-gray-50">
                                            No transactions found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedDonations.map((donation) => (
                                        <tr key={donation.id} className="border-t">
                                            <td className="px-6 py-4">{donation.date}</td>
                                            <td className="px-6 py-4 font-medium">{donation.donor}</td>
                                            <td className="px-6 py-4">{donation.amount}</td>
                                            <td className="px-6 py-4">
                                                <Badge className={
                                                    donation.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                        donation.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                                                            donation.status === 'Failed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                                }>
                                                    {donation.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">{donation.bankName || 'N/A'}</td>
                                            <td className="px-6 py-4">{donation.donationReference}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="sm" disabled={donation.status === 'Processing'}>
                                                    {donation.status === 'Completed' ? 'View' : 'Wait'}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-2">
                            <div className="text-sm text-gray-500">
                                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalDonations)} of {totalDonations} transactions
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="text-sm font-medium">
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
