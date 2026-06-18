import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Input } from '@components/ui/input';
import { Badge } from '@components/ui/badge';
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight, Search, CheckCircle, XCircle, RotateCcw, Eye, Archive, FileText } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';

export interface ContentItem {
    id: string;
    title: string;
    author: string;
    date: string;
    type: 'Event' | 'Bulletin';
    status: string;
    description: string;
    rawDate: number;
}

interface AdminContentTableProps {
    title: string;
    description: string;
    contentType: 'Event' | 'Bulletin';
    fetchData: (params: { page: number, perPage: number, search: string, status: string, sort: { key: string, direction: 'asc' | 'desc' } | null }) => Promise<{ data: ContentItem[], total: number }>;
    primaryColorClass: string;
    outlineColorClass: string;
    statuses?: string[];
    onStatusChange?: (id: string, newStatus: string) => void;
}

export function AdminContentTable({
    title,
    description,
    contentType,
    fetchData,
    primaryColorClass,
    statuses = ["All", "Pending", "Approved", "Rejected"],
    onStatusChange
}: AdminContentTableProps) {
    const ITEMS_PER_PAGE = 20;

    const [data, setData] = useState<ContentItem[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

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
        const csvContent = data.map(c =>
            `"${c.title.replace(/"/g, '""')}","${c.author}","${new Date(c.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}","${c.type}","${c.status}"`
        );

        const csvString = [headers.join(','), ...csvContent].join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${contentType.toLowerCase()}s_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const result = await fetchData({
                    page: currentPage,
                    perPage: ITEMS_PER_PAGE,
                    search: appliedSearchName,
                    status: activeTab,
                    sort: sortConfig
                });
                setData(result.data);
                setTotalItems(result.total);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [currentPage, appliedSearchName, activeTab, sortConfig, fetchData]);

    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const paginatedContent = data;

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
            case "Cancelled": return { title: `Cancelled ${contentType}s`, description: 'Events that were cancelled' };
            case "Archived": return { title: `Archived ${contentType}s`, description: 'Events that are archived' };
            case "Concluded": return { title: `Concluded ${contentType}s`, description: 'Events that have concluded successfully' };
            default: return { title: `${status} ${contentType}s`, description: `Viewing ${status.toLowerCase()} items` };
        }
    };

    const getBadgeClass = (status: string) => {
        switch (status) {
            case "Approved": return 'bg-green-100 text-green-800';
            case "Pending": return 'bg-yellow-100 text-yellow-800';
            case "Rejected": return 'bg-red-100 text-red-800';
            case "Cancelled": return 'bg-gray-100 text-gray-800';
            case "Archived": return 'bg-slate-200 text-slate-800';
            case "Concluded": return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const renderTable = () => {
        if (isLoading) {
            return (
                <div className="py-8 text-center border rounded-md border-dashed text-gray-500 bg-gray-50">
                    Loading items...
                </div>
            );
        }
        if (data.length === 0) {
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
                                {activeTab === "All" ? (
                                    <th className="px-6 py-3 hover:bg-gray-100 transition-colors flex justify-center">
                                        <div className="flex items-center justify-center gap-1">Status</div>
                                    </th>
                                ) : (
                                    <th className="px-6 py-3 text-center">Quick Actions</th>
                                )}
                                <th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedContent.map((item) => (
                                <tr key={item.id} className="border-t">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                                            {item.title}
                                            <Link to={`/${item.type === 'Bulletin' ? 'bulletin' : 'events'}/${item.id}`} className="text-gray-400 hover:text-brand-primary">
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                        </div>
                                        <div className="text-xs text-gray-500 line-clamp-1 max-w-sm">{item.description}</div>
                                    </td>
                                    <td className="px-6 py-4">{item.author}</td>
                                    <td className="px-6 py-4">{new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                                    {activeTab === "All" ? (
                                        <td className="px-6 py-4 flex justify-center">
                                            <Badge className={getBadgeClass(item.status)}>
                                                {item.status}
                                            </Badge>
                                        </td>
                                    ) : (
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                {item.status === "Pending" && (
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
                                                {(item.status === "Approved" || item.status === "Rejected" || item.status === "Cancelled") && (
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
                                                {item.status === "Concluded" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                                                        onClick={() => onStatusChange?.(item.id, "Archived")}
                                                    >
                                                        <Archive className="w-4 h-4 mr-1" />
                                                        Archive
                                                    </Button>
                                                )}
                                                {item.status === "Archived" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                                                        onClick={() => onStatusChange?.(item.id, "Concluded")}
                                                    >
                                                        <RotateCcw className="w-4 h-4 mr-1" />
                                                        Unarchive
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2 justify-center">
                                            <Select value={item.status} onValueChange={(val) => onStatusChange?.(item.id, val)}>
                                                <SelectTrigger className="w-[140px] h-8 text-xs bg-white">
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {statuses.filter(s => s !== "All").map(s => (
                                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-700 hover:bg-gray-50">
                                                <FileText className="w-4 h-4 mr-1" />
                                                Details
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {
                    totalPages > 1 && (
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} items
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
                    )
                }
            </div >
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
                        {statuses.map(status => (
                            <TabsTrigger key={status} value={status}>{status}</TabsTrigger>
                        ))}
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
