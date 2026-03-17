import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Input } from '@components/ui/input';
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';

export interface ContentItem {
    id: number;
    type: string;
    title: string;
    description: string;
    author: string;
    date: string;
    rawDate: number;
    status: string;
}

interface AdminContentTableProps {
    title: string;
    description: string;
    contentType: 'Event' | 'Bulletin';
    mockData: ContentItem[];
    primaryColorClass: string; // e.g., 'bg-[#1a5f3f] hover:bg-[#154d33]'
    outlineColorClass: string; // e.g., 'text-amber-600 border-amber-200 hover:bg-amber-50'
}

export function AdminContentTable({
    title,
    description,
    contentType,
    mockData,
    primaryColorClass,
    outlineColorClass
}: AdminContentTableProps) {
    const statuses = ['pending', 'approved', 'rejected'];
    const ITEMS_PER_PAGE = 20;

    const [contents, setContents] = useState<ContentItem[]>(mockData.filter(c => c.type === contentType));
    const [activeTab, setActiveTab] = useState('pending');

    // Search & Filter state
    const [searchName, setSearchName] = useState('');

    // Explicit filter applied state
    const [appliedSearchName, setAppliedSearchName] = useState('');

    // Sorting
    const [sortConfig, setSortConfig] = useState<{ key: keyof ContentItem; direction: 'asc' | 'desc' } | null>(null);

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
        if (sortConfig?.key !== key) return <ArrowUpDown size={14} className="text-gray-400" />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-gray-700" /> : <ArrowDown size={14} className="text-gray-700" />;
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

    const handleStatusUpdate = (id: number, newStatus: string) => {
        setContents(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    };

    const handleExportCSV = () => {
        // Mock export functionality
        console.log(`Exporting ${contentType}s to CSV...`);
    };

    const filteredContent = useMemo(() => {
        let result = contents.filter(c => c.status === activeTab);

        if (appliedSearchName) {
            result = result.filter(c => c.title.toLowerCase().includes(appliedSearchName.toLowerCase()));
        }

        if (sortConfig) {
            result.sort((a, b) => {
                let valA: string | number = '';
                let valB: string | number = '';

                if (sortConfig.key === 'date') {
                    valA = a.rawDate;
                    valB = b.rawDate;
                } else {
                    valA = a[sortConfig.key] as string;
                    valB = b[sortConfig.key] as string;
                }

                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [contents, activeTab, appliedSearchName, sortConfig]);

    const totalPages = Math.ceil(filteredContent.length / ITEMS_PER_PAGE);
    const paginatedContent = filteredContent.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const onTabChange = (val: string) => {
        setActiveTab(val);
        setCurrentPage(1);
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'pending': return { title: 'Needs Attention', description: `${contentType}s awaiting moderator approval before publishing` };
            case 'approved': return { title: `Published ${contentType}s`, description: 'Previously approved and currently visible to the public' };
            case 'rejected': return { title: `Rejected ${contentType}s`, description: 'Submissions that did not meet community guidelines' };
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
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedContent.map((content) => (
                                <tr key={content.id} className="border-t">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-gray-900">{content.title}</div>
                                        <div className="text-xs text-gray-500 line-clamp-1 max-w-sm">{content.description}</div>
                                    </td>
                                    <td className="px-6 py-4">{content.author}</td>
                                    <td className="px-6 py-4">{content.date}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex gap-2 justify-end">
                                            {content.status === 'pending' && (
                                                <>
                                                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleStatusUpdate(content.id, 'rejected')}>Reject</Button>
                                                    <Button size="sm" className={primaryColorClass} onClick={() => handleStatusUpdate(content.id, 'approved')}>Approve</Button>
                                                </>
                                            )}
                                            {content.status === 'approved' && (
                                                <Button size="sm" variant="outline" className={outlineColorClass} onClick={() => handleStatusUpdate(content.id, 'pending')}>Revert to Pending</Button>
                                            )}
                                            {content.status === 'rejected' && (
                                                <Button size="sm" variant="outline" className="text-gray-600 border-gray-200 hover:bg-gray-50" onClick={() => handleStatusUpdate(content.id, 'pending')}>Re-evaluate</Button>
                                            )}
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
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="approved">Approved</TabsTrigger>
                        <TabsTrigger value="rejected">Rejected</TabsTrigger>
                    </TabsList>
                </div>

                <div className="p-4 bg-white border rounded-md shadow-sm mb-6 flex flex-col gap-4">
                    <div className="text-sm font-medium text-gray-700">Filters</div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder={`Search ${contentType.toLowerCase()} by name...`}
                                className="pl-9"
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilters(); }}
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
