import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Input } from '@components/ui/input';
import { Download, Search, ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminDonationsMock, getDonationStats } from '@assets/adminMockData';

interface Donation {
    id: number;
    date: string;
    donor: string;
    amount: string;
    status: string;
    rawAmount: number;
    rawDate: number;
}

export function AdminDonations() {
    const ITEMS_PER_PAGE = 20;
    const stats = getDonationStats();
    
    // Filter State
    const [activeTab, setActiveTab] = useState('All');
    
    // Filter State
    const [searchDonor, setSearchDonor] = useState('');
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    // Explicit filter applied state
    const [appliedSearchDonor, setAppliedSearchDonor] = useState('');
    const [appliedMinAmount, setAppliedMinAmount] = useState('');
    const [appliedMaxAmount, setAppliedMaxAmount] = useState('');
    const [appliedStartDate, setAppliedStartDate] = useState('');
    const [appliedEndDate, setAppliedEndDate] = useState('');

    const [sortConfig, setSortConfig] = useState<{ key: keyof Donation; direction: 'asc' | 'desc' } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const handleSort = (key: keyof Donation) => {
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

    const handleApplyFilters = () => {
        setAppliedSearchDonor(searchDonor);
        setAppliedMinAmount(minAmount);
        setAppliedMaxAmount(maxAmount);
        setAppliedStartDate(startDate);
        setAppliedEndDate(endDate);
        setCurrentPage(1);
    };

    const handleExportCSV = () => {
        const headers = ['Date', 'Donor', 'Amount', 'Status'];
        const csvContent = filteredDonations.map(d => 
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

    const handleClearFilters = () => {
        setSearchDonor('');
        setMinAmount('');
        setMaxAmount('');
        setStartDate('');
        setEndDate('');
        
        setAppliedSearchDonor('');
        setAppliedMinAmount('');
        setAppliedMaxAmount('');
        setAppliedStartDate('');
        setAppliedEndDate('');
        
        setCurrentPage(1);
    };

    const filteredDonations = useMemo(() => {
        const donations = adminDonationsMock as Donation[];
        let result = donations;

        // Status Filter
        if (activeTab !== 'All') {
            result = result.filter(d => d.status === activeTab);
        }

        // Search by Donor
        if (appliedSearchDonor) {
            result = result.filter(d => d.donor.toLowerCase().includes(appliedSearchDonor.toLowerCase()));
        }

        // Filter by Amount
        if (appliedMinAmount) {
            result = result.filter(d => d.rawAmount >= parseFloat(appliedMinAmount));
        }
        if (appliedMaxAmount) {
            result = result.filter(d => d.rawAmount <= parseFloat(appliedMaxAmount));
        }

        // Filter by Date
        if (appliedStartDate) {
            const startStr = new Date(appliedStartDate).getTime();
            result = result.filter(d => d.rawDate >= startStr);
        }
        if (appliedEndDate) {
            // Include fully the end date
            const endStr = new Date(appliedEndDate).getTime() + 86400000;
            result = result.filter(d => d.rawDate <= endStr);
        }

        // Sort
        if (sortConfig) {
            result.sort((a, b) => {
                let valA: string | number = '';
                let valB: string | number = '';

                // Special handling for correct numerical/date sorts
                if (sortConfig.key === 'amount') {
                    valA = a.rawAmount;
                    valB = b.rawAmount;
                } else if (sortConfig.key === 'date') {
                    valA = a.rawDate;
                    valB = b.rawDate;
                } else if (sortConfig.key === 'status') {
                    const statusOrder: Record<string, number> = { 'Completed': 1, 'Processing': 2, 'Failed': 3 };
                    valA = statusOrder[a.status] || 99;
                    valB = statusOrder[b.status] || 99;
                } else {
                    valA = a[sortConfig.key];
                    valB = b[sortConfig.key];
                }

                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [activeTab, appliedSearchDonor, appliedMinAmount, appliedMaxAmount, appliedStartDate, appliedEndDate, sortConfig]);

    const totalPages = Math.ceil(filteredDonations.length / ITEMS_PER_PAGE);
    const paginatedDonations = filteredDonations.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
    
    // Top 5 recent donations for the separate table
    // Creating a new array before sorting to avoid mutating the original mock data
    const recentDonations = useMemo(() => {
        return [...(adminDonationsMock as Donation[])].sort((a, b) => b.rawDate - a.rawDate).slice(0, 5);
    }, []);

    const onTabChange = (val: string) => {
        setActiveTab(val);
        setCurrentPage(1);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Donations Tracking</h1>
                <p className="text-gray-500">View recent contributions, generate financial reports, and manage campaigns.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-md bg-green-50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-800">Total Raised (YTD)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalRaised}</div>
                        <p className="text-xs text-green-700 mt-1">+5% from last month</p>
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
                        <CardTitle className="text-sm font-medium text-gray-500">Active Donors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-900">142</div>
                        <p className="text-xs text-gray-500 mt-1">This year</p>
                    </CardContent>
                </Card>
            </div>
            
            <Card className="border-none shadow-md">
                <CardHeader>
                    <CardTitle className="text-lg">Recent Donations</CardTitle>
                    <CardDescription>The 5 most recent monetary contributions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-md overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Donor</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Receipt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentDonations.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 border-t bg-gray-50">
                                            No recent transactions found.
                                        </td>
                                    </tr>
                                ) : (
                                    recentDonations.map((donation) => (
                                        <tr key={`recent-${donation.id}`} className="border-t">
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
                </CardContent>
            </Card>

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
                            <div className="lg:col-span-3 relative flex items-center">
                                <Search className="absolute left-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Search by Donor..."
                                    className="pl-9 h-10 w-full"
                                    value={searchDonor}
                                    onChange={(e) => setSearchDonor(e.target.value)}
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

                            <div className="lg:col-span-4 flex items-center gap-2">
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
                                <Button className="bg-[#1a5f3f] hover:bg-[#154d33]" onClick={handleApplyFilters}>Submit</Button>
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
                                    <th className="px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('status')}>
                                        <div className="flex items-center gap-1">Status {renderSortIcon('status')}</div>
                                    </th>
                                    <th className="px-6 py-3 text-right">Receipt</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedDonations.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500 border-t bg-gray-50">
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
                                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredDonations.length)} of {filteredDonations.length} transactions
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
