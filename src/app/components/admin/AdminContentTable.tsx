import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Input } from '@components/ui/input';
import { Badge } from '@components/ui/badge';
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight, Search, CheckCircle, XCircle, RotateCcw, Eye } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export interface ContentItem {
    id: string;
    title: string;
    author: string;
    date: string;
    type: 'Event' | 'Bulletin';
    status: "Pending" | "Approved" | "Rejected" | string;
    description: string;
    rawDate: number;
}

interface AdminContentTableProps {
    title: string;
    description: string;
    contentType: 'Event' | 'Bulletin';
    mockData: ContentItem[];
    primaryColorClass: string; // e.g., 'bg-brand-primary hover:bg-brand-primary-hover'
    outlineColorClass: string; // e.g., 'text-amber-600 border-amber-200 hover:bg-amber-50'
    onStatusChange?: (id: string, newStatus: "Approved" | "Rejected" | "Pending") => void;
}

export function AdminContentTable({
    title,
    description,
    contentType,
    mockData,
    primaryColorClass,
    onStatusChange
}: AdminContentTableProps) {
    const statuses = ["All", "Pending", "Approved", "Rejected"];
    const ITEMS_PER_PAGE = 20;

    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'All');

    // Search & Filter state
    const [searchName, setSearchName] = useState('');

    // Explicit filter applied state
    const [appliedSearchName, setAppliedSearchName] = useState('');

    // Sorting
    const [sortConfig, setSortConfig] = useState<{ key: keyof ContentItem; direction: 'asc' | 'desc' } | null>({ key: 'rawDate', direction: 'desc' });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    const handleSort = (key: keyof ContentItem) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const renderSortIcon = (key: keyof ContentItem) => {
        if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown className="ml-1 w-4 h-4 text-gray-400" />;
        return sortConfig.direction === 'asc' ? <ArrowUp className="ml-1 w-4 h-4 text-gray-700" /> : <ArrowDown className="ml-1 w-4 h-4 text-gray-700" />;
    };

    const handleApplyFilters = () => {
        setAppliedSearchName(searchName);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setSearchName('');
        setAppliedSearchName('');
        setCurrentPage(1);
    };

    const handleExportCSV = () => {
        const headers = ['Title', 'Author', 'Date', 'Type', 'Status'];
        const csvContent = filteredContent.map(c =>
            `"${c.title.replace(/"/g, '""')}","${c.author}","${new Date(c.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}","${c.type}","${c.status}"`
        );

        const csvString = [headers.join(','), ...csvContent].join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${contentType.toLowerCase()}s_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const filteredContent = useMemo(() => {
        let filtered = [...mockData];

        if (activeTab !== "All") {
            filtered = filtered.filter(c => c.status === activeTab);
        }

        if (appliedSearchName) {
            const lowerQuery = appliedSearchName.toLowerCase();
            filtered = filtered.filter(c =>
                c.title.toLowerCase().includes(lowerQuery) ||
                c.author.toLowerCase().includes(lowerQuery)
            );
        }

        if (sortConfig) {
            filtered.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [mockData, activeTab, appliedSearchName, sortConfig]);

    const totalPages = Math.ceil(filteredContent.length / ITEMS_PER_PAGE);
    const paginatedContent = filteredContent.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const onTabChange = (val: string) => {
        setActiveTab(val);
        setCurrentPage(1);
        setSearchParams({ tab: val }, { replace: true });
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "All": return { title: `All ${contentType}s`, description: `All ${contentType}s submitted to the platform` };
            case "Pending": return { title: 'Needs Attention', description: `${contentType}s awaiting moderator approval before publishing` };
            case "Approved": return { title: `Published ${contentType}s`, description: 'Previously approved and currently visible to the public' };
            case "Rejected": return { title: `Rejected ${contentType}s`, description: 'Submissions that did not meet community guidelines' };
            default: return { title: '', description: '' };
        }
    };

    const renderTable = () => {
        if (filteredContent.length === 0) {
            return (
                <div className="py-8 text-center border rounded-md border-dashed text-gray-500 bg-gray-50">
                    No items found for this category or search criteria.
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <div className="border rounded-md bg-white overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('title')}>
                                    <div className="flex items-center gap-1">Title {renderSortIcon('title')}</div>
                                </th>
                                <th className="px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('author')}>
                                    <div className="flex items-center gap-1">Author {renderSortIcon('author')}</div>
                                </th>
                                <th className="px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('date')}>
                                    <div className="flex items-center gap-1">Date Submitted {renderSortIcon('date')}</div>
                                </th>
                                {activeTab === "All" && (
                                    <th className="px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('status')}>
                                        <div className="flex items-center gap-1">Status {renderSortIcon('status')}</div>
                                    </th>
                                )}
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedContent.map((item) => (
                                <tr key={item.id} className="border-t">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900">{item.title}</div>
                                        <div className="text-xs text-gray-500 line-clamp-1 max-w-sm">{item.description}</div>
                                    </td>
                                    <td className="px-6 py-4">{item.author}</td>
                                    <td className="px-6 py-4">{new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                                    {activeTab === "All" && (
                                        <td className="px-6 py-4">
                                            <Badge className={
                                                item.status === "Approved" ? 'bg-green-100 text-green-800' :
                                                    item.status === "Pending" ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-red-100 text-red-800'
                                            }>
                                                {item.status}
                                            </Badge>
                                        </td>
                                    )}
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2 justify-end">
                                            {activeTab !== "All" && item.status === "Pending" && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => onStatusChange?.(item.id, "Approved")}
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => onStatusChange?.(item.id, "Rejected")}
                                                    >
                                                        <XCircle className="w-4 h-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                            {activeTab !== "All" && (item.status === "Approved" || item.status === "Rejected") && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    onClick={() => onStatusChange?.(item.id, "Pending")}
                                                >
                                                    <RotateCcw className="w-4 h-4 mr-1" />
                                                    Reset
                                                </Button>
                                            )}
                                            <Link to={`/${item.type === 'Bulletin' ? 'bulletin' : 'events'}/${item.id}`}>
                                                <Button variant="outline" size="sm" className="gap-1 px-3">
                                                    <Eye className="w-4 h-4" />
                                                    View Details
                                                </Button>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredContent.length)} of {filteredContent.length} items
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
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
                <p className="text-gray-500">{description}</p>
            </div>

            <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
                <div className="overflow-x-auto pb-2 flex justify-between items-center gap-4">
                    <TabsList className="mb-4 inline-flex min-w-full sm:min-w-0 flex-1">
                        <TabsTrigger value="All">All</TabsTrigger>
                        <TabsTrigger value="Pending">Pending</TabsTrigger>
                        <TabsTrigger value="Approved">Approved</TabsTrigger>
                        <TabsTrigger value="Rejected">Rejected</TabsTrigger>
                    </TabsList>
                </div>

                <div className="p-4 bg-white border rounded-md shadow-sm mb-6 flex flex-col gap-4">
                    <div className="text-sm font-medium text-gray-700">Filters</div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder={`Search ${contentType.toLowerCase()}s...`}
                                className="pl-9 h-10 w-full bg-white border-gray-200"
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleApplyFilters();
                                    }
                                }}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleClearFilters}>Clear</Button>
                            <Button className={primaryColorClass} onClick={handleApplyFilters}>Submit</Button>
                        </div>
                    </div>
                </div>

                {statuses.map(status => (
                    <TabsContent key={status} value={status}>
                        <Card className="border-none shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>{getStatusConfig(status).title}</CardTitle>
                                    <CardDescription>
                                        {getStatusConfig(status).description}
                                    </CardDescription>
                                </div>
                                <Button variant="outline" onClick={handleExportCSV}>Export CSV</Button>
                            </CardHeader>
                            <CardContent>
                                {renderTable()}
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
