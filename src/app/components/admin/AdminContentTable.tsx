import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Input } from '@components/ui/input';
import { Badge } from '@components/ui/badge';
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight, Search, Eye, FileText, HardHat } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { CreateEventModal } from '@components/user/CreateEventModal';
import { CreateBulletinModal } from '@components/user/CreateBulletinModal';
import { getCategoryColor, formatDate } from '@/app/views/formatters';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, format } from 'date-fns';

export interface ContentItem {
    id: string;
    title: string;
    author: string;
    date: string;
    type: 'Event' | 'Bulletin';
    status: string;
    description: string;
    rawDate: number;
    category: string;
    isOfficial: boolean;
}

interface AdminContentTableProps {
    title: string;
    description: string;
    contentType: 'Event' | 'Bulletin';
    fetchData: (params: {
        page: number,
        perPage: number,
        search: string,
        searchAuthor?: string,
        searchStartDate?: string,
        searchEndDate?: string,
        status: string,
        categories?: string[],
        accountScope?: 'All' | 'Official' | 'Regular',
        sort: { key: string, direction: 'asc' | 'desc' } | null
    }) => Promise<{ data: ContentItem[], total: number }>;
    primaryColorClass: string;
    outlineColorClass: string;
    statuses?: string[];
    categories?: string[];
    onStatusChange?: (id: string, newStatus: string) => void | Promise<void>;
}

export function AdminContentTable({
    title,
    description,
    contentType,
    fetchData,
    statuses = ["All", "Pending", "Approved", "Rejected"],
    categories,
    onStatusChange
}: AdminContentTableProps) {
    const [itemsPerPage, setItemsPerPage] = useState(20);

    const [data, setData] = useState<ContentItem[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [editingItem, setEditingItem] = useState<ContentItem | null>(null);


    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'All');

    // Search & Filter state
    const [searchName, setSearchName] = useState('');
    const [searchAuthor, setSearchAuthor] = useState('');
    const [searchStartDate, setSearchStartDate] = useState(searchParams.get('start') || '');
    const [searchEndDate, setSearchEndDate] = useState(searchParams.get('end') || '');
    const [datePreset, setDatePreset] = useState('all');
    const [searchCategories, setSearchCategories] = useState<string[]>(['All']);

    // Explicit filter applied state
    const [appliedSearchName, setAppliedSearchName] = useState('');
    const [appliedSearchAuthor, setAppliedSearchAuthor] = useState('');
    const [appliedSearchStartDate, setAppliedSearchStartDate] = useState(searchParams.get('start') || '');
    const [appliedSearchEndDate, setAppliedSearchEndDate] = useState(searchParams.get('end') || '');
    const [appliedSearchCategories, setAppliedSearchCategories] = useState<string[]>(['All']);

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

    const applyQuickFilter = (filter: 'this_week' | 'this_month' | 'this_year' | 'all') => {
        const now = new Date();
        let start = '';
        let end = '';
        if (filter === 'this_week') {
            // weekStartsOn: 1 sets Monday as the first day of the week
            start = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
            end = format(endOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        } else if (filter === 'this_month') {
            start = format(startOfMonth(now), 'yyyy-MM-dd');
            end = format(endOfMonth(now), 'yyyy-MM-dd');
        } else if (filter === 'this_year') {
            start = format(startOfYear(now), 'yyyy-MM-dd');
            end = format(endOfYear(now), 'yyyy-MM-dd');
        } else if (filter === 'all') {
            start = '';
            end = '';
        }
        setDatePreset(filter);
        setSearchStartDate(start);
        setSearchEndDate(end);
    };

    const [accountScope, setAccountScope] = useState<'All' | 'Official' | 'Regular'>('All');
    const [appliedAccountScope, setAppliedAccountScope] = useState<'All' | 'Official' | 'Regular'>('All');

    const handleApplyFilters = () => {
        setAppliedSearchName(searchName);
        setAppliedSearchAuthor(searchAuthor);
        setAppliedSearchStartDate(searchStartDate);
        setAppliedSearchEndDate(searchEndDate);
        setAppliedSearchCategories(searchCategories);
        setAppliedAccountScope(accountScope);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setSearchName('');
        setSearchAuthor('');
        setSearchStartDate('');
        setSearchEndDate('');
        setSearchCategories(['All']);
        setAccountScope('All');
        setAppliedSearchName('');
        setAppliedSearchAuthor('');
        setAppliedSearchStartDate('');
        setAppliedSearchEndDate('');
        setAppliedSearchCategories(['All']);
        setAppliedAccountScope('All');
        setCurrentPage(1);
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        if (onStatusChange) {
            try {
                await onStatusChange(id, newStatus);
                setData(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
            } catch (err) {
                console.error("Failed to update status", err);
            }
        }
    };

    const handleExportCSV = () => {
        const headers = ['Title', 'Author', 'Date', 'Type', 'Status'];
        const csvContent = data.map(c =>
            `"${c.title.replace(/"/g, '""')}","${c.author}","${formatDate(c.date, 'long')}","${c.type}","${c.status}"`
        );

        const csvString = [headers.join(','), ...csvContent].join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${contentType.toLowerCase()}s_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const result = await fetchData({
                    page: currentPage,
                    perPage: itemsPerPage,
                    search: appliedSearchName,
                    searchAuthor: appliedSearchAuthor,
                    searchStartDate: appliedSearchStartDate,
                    searchEndDate: appliedSearchEndDate,
                    status: activeTab,
                    categories: appliedSearchCategories,
                    accountScope: appliedAccountScope,
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
    }, [currentPage, appliedSearchName, appliedSearchAuthor, appliedSearchStartDate, appliedSearchEndDate, appliedSearchCategories, appliedAccountScope, activeTab, sortConfig, fetchData, refreshKey]);

    const totalPages = Math.ceil(totalItems / itemsPerPage);
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
            case "Archived": return { title: `Archived ${contentType}s`, description: `${contentType}s that are archived` };
            case "Concluded": return { title: `Concluded ${contentType}s`, description: 'Events that have concluded successfully' };
            default: return { title: `${status} ${contentType}s`, description: `Viewing ${status.toLowerCase()} items` };
        }
    };

    const getStatusClass = (category: string) => {
        switch (category) {
            case "All": return 'bg-gray-100 text-gray-800';
            case "Pending": return 'bg-yellow-100 text-yellow-800';
            case "Approved": return 'bg-green-100 text-green-800';
            case "Rejected": return 'bg-red-100 text-red-800';
            case "Cancelled": return 'bg-gray-100 text-gray-800';
            case "Archived": return 'bg-slate-200 text-slate-800';
            case "Concluded": return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    const getStatusIndicator = (status: string) => {
        switch (status) {
            case "All": return 'bg-gray-400';
            case "Pending": return 'bg-yellow-400';
            case "Approved": return 'bg-green-500';
            case "Rejected": return 'bg-red-500';
            case "Cancelled": return 'bg-gray-500';
            case "Archived": return 'bg-slate-500';
            case "Concluded": return 'bg-blue-500';
            default: return 'bg-gray-400';
        }
    }

    const getCategoryClass = (category: string) => {
        if (category === "All" || category === "Pending" || category === "Approved" || category === "Rejected" || category === "Cancelled" || category === "Archived" || category === "Concluded") {
            return getStatusClass(category);
        }
        if (category === "Official") return 'bg-brand-primary text-white';
        if (category === "Regular") return 'bg-brand-accent text-white';
        return getCategoryColor(category);
    }

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
                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Showing</span>
                        <Select value={itemsPerPage.toString()} onValueChange={(val) => { setItemsPerPage(Number(val)); setCurrentPage(1); }}>
                            <SelectTrigger className="w-20 h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="text-sm text-gray-500">entries. {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} total.</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="text-sm font-medium px-2">
                            Page {currentPage} of {Math.max(1, totalPages)}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
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
                                {/* <th className="px-9 py-3 ">Quick Actions</th> */}
                                <th className="px-9 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedContent.map((item) => (
                                <tr key={item.id} className="border-t">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900 flex items-center gap-2">
                                            <Link to={`/${item.type === 'Bulletin' ? 'bulletin' : 'events'}/${item.id}`} className="text-gray-900 hover:text-brand-primary hover:underline">
                                                {item.title}
                                            </Link>
                                            <Badge className={getCategoryClass(item.category)}>{item.category}</Badge>
                                            <Link to={`/admin/preview/${item.type === 'Bulletin' ? 'bulletin' : 'event'}/${item.id}`} className="text-gray-400 hover:text-brand-primary" title="Preview as Approved">
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                        </div>
                                        <div className="text-xs text-gray-500 line-clamp-1 max-w-sm">{item.description}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {item.isOfficial && <HardHat className="w-4 h-4 text-brand-primary" />}
                                            <span>{item.author}</span>
                                            {(item as any).authorId ? (
                                                <Link to={`/admin/preview/user/${(item as any).authorId}`} className="text-gray-400 hover:text-brand-primary" title="Preview Profile">
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                            ) : null}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{formatDate(item.date, 'long')}</td>
                                    {/* Quick actions, removed because of space constraints */}
                                    {/* <td className="px-6 py-4">
                                        <div className="flex justify-left gap-2">
                                            {item.status === "Pending" && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                        onClick={() => handleStatusUpdate(item.id, "Approved")}
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleStatusUpdate(item.id, "Rejected")}
                                                    >
                                                        <XCircle className="w-4 h-4 mr-1" />
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                            {(item.status === "Approved" || item.status === "Rejected" || item.status === "Cancelled") && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        onClick={() => handleStatusUpdate(item.id, "Pending")}
                                                    >
                                                        <RotateCcw className="w-4 h-4 mr-1" />
                                                        Reset
                                                    </Button>
                                                    {(item.status === "Rejected" || (item.type === "Bulletin" && item.status === "Approved")) && (<Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                                                        onClick={() => handleStatusUpdate(item.id, "Archived")}
                                                    >
                                                        <Archive className="w-4 h-4 mr-1" />
                                                        Archive
                                                    </Button>
                                                    )}
                                                </>
                                            )}
                                            {item.status === "Concluded" && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                                                    onClick={() => handleStatusUpdate(item.id, "Archived")}
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
                                                    onClick={() => handleStatusUpdate(item.id, item.type === "Bulletin" ? "Approved" : "Concluded")}
                                                >
                                                    <RotateCcw className="w-4 h-4 mr-1" />
                                                    Unarchive
                                                </Button>
                                            )}
                                        </div>
                                    </td> */}
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2 justify-center">
                                            <Select value={item.status} onValueChange={(val) => handleStatusUpdate(item.id, val)}>
                                                <SelectTrigger className="w-[140px] h-8 text-xs bg-white border border-gray-300">
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {statuses.filter(s => s !== "All").map(s => (
                                                        <SelectItem key={s} value={s}>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`w-2 h-2 rounded-full ${getStatusIndicator(s)}`}></span>
                                                                <span>{s}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="hover:bg-gray-200"
                                                onClick={() => setEditingItem(item)}
                                            >
                                                <FileText className="w-4 h-4 mr-1" />
                                                Edit
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
                    <div className="flex justify-between items-center">
                        <div className="text-sm font-medium text-gray-700">Filters</div>
                    </div>
                    <div className="grid grid-cols-8 gap-4">
                        <div className='col-span-3 flex flex-row gap-2'>
                            <div className="relative flex items-center flex-1">
                                <Search className="absolute left-3 text-gray-400 w-4 h-4 pointer-events-none" />
                                <Input
                                    placeholder="Search by Title..."
                                    className="pl-9 h-10 w-full bg-white border border-gray-300"
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
                            <div className="relative flex items-center flex-1">
                                <Input
                                    placeholder="Search by Author..."
                                    className="h-10 w-full bg-white border border-gray-300"
                                    value={searchAuthor}
                                    onChange={(e) => setSearchAuthor(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleApplyFilters();
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-1 col-span-3">
                            <span className="text-sm text-gray-500 shrink-0">Date:</span>
                            <Select value={datePreset} onValueChange={(val: any) => {
                                setDatePreset(val);
                                if (val !== 'custom') applyQuickFilter(val);
                            }}>
                                <SelectTrigger className="w-[140px] h-10 bg-white text-gray-700 border border-gray-300 shrink-0">
                                    <SelectValue placeholder="Preset Dates" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="this_week">This Week</SelectItem>
                                    <SelectItem value="this_month">This Month</SelectItem>
                                    <SelectItem value="this_year">This Year</SelectItem>
                                    <SelectItem value="custom">Custom Range</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex items-center gap-2 flex-1">
                                <span className={`text-xs shrink-0 ${datePreset === 'custom' ? 'text-gray-500' : 'text-gray-300'}`}>From</span>
                                <Input
                                    type="date"
                                    className="h-10 w-full bg-white px-2 text-sm text-gray-700 border border-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                                    value={searchStartDate}
                                    disabled={datePreset !== 'custom'}
                                    onChange={(e) => setSearchStartDate(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleApplyFilters();
                                        }
                                    }}
                                />
                                <span className={`text-xs shrink-0 ${datePreset === 'custom' ? 'text-gray-500' : 'text-gray-300'}`}>To</span>
                                <Input
                                    type="date"
                                    className="h-10 w-full bg-white px-2 text-sm text-gray-700 border border-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                                    value={searchEndDate}
                                    disabled={datePreset !== 'custom'}
                                    onChange={(e) => setSearchEndDate(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleApplyFilters();
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 ml-auto shrink-0 col-span-2">
                            <Button variant="outline" onClick={handleClearFilters} className="border border-gray-300 w-24">Clear</Button>
                            <Button className="bg-brand-primary hover:bg-brand-primary-hover text-white w-24" onClick={handleApplyFilters}>Submit</Button>
                        </div>

                        {contentType === 'Bulletin' && (
                            <div className="flex lg:col-span-8 items-center gap-3 pb-1 border-b border-gray-100 mb-1">
                                <span className="text-sm font-medium text-gray-700 mr-2 flex items-center gap-1.5">
                                    <HardHat className="w-4 h-4 text-brand-primary" /> Account Scope
                                </span>
                                <div className="relative flex items-center bg-gray-100 p-1 rounded-lg shadow-inner">
                                    {(['All', 'Official', 'Regular'] as const).map((scope) => {
                                        const isSelected = accountScope === scope;
                                        return (
                                            <button
                                                key={scope}
                                                type="button"
                                                onClick={() => {
                                                    setAccountScope(scope);
                                                    setAppliedAccountScope(scope);
                                                    setCurrentPage(1);
                                                }}
                                                className={`relative z-10 px-3.5 py-1 text-xs font-semibold rounded-md transition-all duration-200 ease-in-out flex items-center gap-1.5 ${isSelected
                                                    ? 'bg-white text-brand-primary shadow-sm scale-105 font-bold'
                                                    : 'text-gray-600 hover:text-gray-900'
                                                    }`}
                                            >
                                                {scope === 'Official' && <HardHat className="w-3.5 h-3.5 text-brand-primary" />}
                                                {scope}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {categories && categories.length > 0 && (
                            <div className="flex lg:col-span-8 items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
                                <span className="text-sm font-medium text-gray-700 mr-5">Categories</span>
                                <Button
                                    variant={searchCategories.includes('All') ? "default" : "outline"}
                                    className={searchCategories.includes('All') ? "bg-brand-secondary hover:bg-brand-secondary-hover text-white" : ""}
                                    onClick={() => {
                                        setSearchCategories(['All']);
                                        setAppliedSearchCategories(['All']);
                                        setCurrentPage(1);
                                    }}
                                    size="sm"
                                >
                                    All
                                </Button>
                                {categories.map(cat => (
                                    <Button
                                        key={cat}
                                        variant={searchCategories.includes(cat) ? "default" : "outline"}
                                        className={searchCategories.includes(cat) ? getCategoryColor(cat) : ""}
                                        onClick={() => {
                                            let next: string[];
                                            if (searchCategories.includes(cat)) {
                                                next = searchCategories.filter(c => c !== cat);
                                                if (next.length === 0) {
                                                    next = ['All'];
                                                }
                                            } else {
                                                next = [...searchCategories.filter(c => c !== 'All'), cat];
                                            }
                                            setSearchCategories(next);
                                            setAppliedSearchCategories(next);
                                            setCurrentPage(1);
                                        }}
                                        size="sm"
                                    >
                                        {cat}
                                    </Button>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border border-gray-300"
                                    onClick={() => {
                                        if (contentType === "Bulletin") {
                                            setAccountScope('All');
                                            setAppliedAccountScope('All');
                                        }
                                        setSearchCategories(['All']);
                                        setAppliedSearchCategories(['All']);
                                        setCurrentPage(1);
                                    }}
                                >
                                    Clear All
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {
                    statuses.map(status => (
                        <TabsContent key={status} value={status}>
                            <Card className="border-none shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>{getStatusConfig(status).title}</CardTitle>
                                        <CardDescription>
                                            {getStatusConfig(status).description}
                                        </CardDescription>
                                    </div>
                                    <Button variant="outline" onClick={handleExportCSV} className="border border-gray-300">Export CSV</Button>
                                </CardHeader>
                                <CardContent>
                                    {renderTable()}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    ))
                }
            </Tabs >

            {editingItem && contentType === 'Event' && (
                <CreateEventModal
                    isAdmin={true}
                    initialData={editingItem as any}
                    open={true}
                    onOpenChange={(isOpen) => {
                        if (!isOpen) {
                            setEditingItem(null);
                            setRefreshKey(k => k + 1);
                        }
                    }}
                />
            )}
            {editingItem && contentType === 'Bulletin' && (
                <CreateBulletinModal
                    isAdmin={true}
                    initialData={editingItem as any}
                    open={true}
                    onOpenChange={(isOpen) => {
                        if (!isOpen) {
                            setEditingItem(null);
                            setRefreshKey(k => k + 1);
                        }
                    }}
                />
            )}
        </div >
    );
}
