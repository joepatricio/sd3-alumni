import { useState, useEffect, lazy, Suspense, useCallback, useMemo, useRef, memo } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Input } from '@components/ui/input';
import { ArrowUp, ArrowDown, ArrowUpDown, Ban, ChevronLeft, ChevronRight, Download, Search, Eye, FileText, HardHat, Lock, Pencil, UserX } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@components/ui/dialog';
import { Label } from '@components/ui/label';
import { Textarea } from '@components/ui/textarea';
import { toast } from 'sonner';
import { getCategoryColor, formatDate } from '@/app/views/formatters';
import {
    ColumnVisibilityDropdown,
    createDefaultColumnVisibility,
    escapeCsvCell,
    type ColumnOption,
} from '@components/admin/ColumnVisibilityDropdown';
import {
    readAdminContentFilters,
    writeAdminContentFilters,
    type ContentSortKey,
} from '@components/admin/adminFilterStorage';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, format } from 'date-fns';

type ContentColumnKey = 'title' | 'category' | 'author' | 'date' | 'status';

import type { EventModalInitialData } from '@components/user/CreateEventModal';
import type { BulletinModalInitialData } from '@components/user/CreateBulletinModal';

const loadCreateEventModal = () => import('@components/user/CreateEventModal').then(m => ({ default: m.CreateEventModal }));
const CreateEventModal = lazy(loadCreateEventModal);

const loadCreateBulletinModal = () => import('@components/user/CreateBulletinModal').then(m => ({ default: m.CreateBulletinModal }));
const CreateBulletinModal = lazy(loadCreateBulletinModal);
export const ACCOUNT_SCOPES = ['All', 'Regular', 'Official', 'Suspended', 'Banned', 'Deactivated'] as const;
export type AccountScope = typeof ACCOUNT_SCOPES[number];

export interface ContentItem {
    id: string;
    title: string;
    author: string;
    authorId?: string;
    date: string;
    type: 'Event' | 'Bulletin';
    status: string;
    description: string;
    rawDate: number;
    category: string;
    isOfficial: boolean;
    isBanned: boolean;
    isSuspended: boolean;
    isDeactivated?: boolean;
    adminNotes?: string | null;
}

const getStatusClass = (category: string) => {
    switch (category) {
        case "All": return 'bg-gray-100 text-gray-800 border-gray-300';
        case "For Review": return 'bg-amber-100 text-amber-800 border-amber-300';
        case "Pending": return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case "Approved": return 'bg-green-100 text-green-800 border-green-300';
        case "Rejected": return 'bg-red-100 text-red-800 border-red-300';
        case "Cancelled": return 'bg-gray-100 text-gray-800 border-gray-300';
        case "Archived": return 'bg-slate-200 text-slate-800 border-slate-300';
        case "Concluded": return 'bg-blue-100 text-blue-800 border-blue-300';
        case "Flagged": return 'bg-orange-100 text-orange-800 border-orange-300';
        default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
};

const getCategoryClass = (category: string) => {
    if (category === "All" || category === "For Review" || category === "Pending" || category === "Approved" || category === "Rejected" || category === "Cancelled" || category === "Archived" || category === "Concluded") {
        return getStatusClass(category);
    }
    if (category === "Official") return 'bg-brand-primary text-white border-transparent';
    if (category === "Regular") return 'bg-brand-accent text-white border-transparent';
    const staticCategoryColor = getCategoryColor(category).replace(/\bhover:\S+/g, '').trim();
    return `${staticCategoryColor} border-transparent`;
};

interface ContentTableRowProps {
    item: ContentItem;
    visibleColumns: Record<ContentColumnKey, boolean>;
    openStatusModal: (item: ContentItem, targetStatus?: string) => void;
    setEditingItem: (item: ContentItem) => void;
}

const ContentTableRow = memo(({
    item,
    visibleColumns,
    openStatusModal,
    setEditingItem,
}: ContentTableRowProps) => {
    return (
        <tr className="border-t divide-x divide-gray-100">
            {visibleColumns.title && (
                <td className="px-6 py-0 w-96 max-w-sm">
                    <div className="flex items-stretch justify-between gap-2 min-w-0">
                        <div className="flex-1 min-w-0 py-4 flex flex-col justify-center">
                            <Link
                                to={`/${item.type === 'Bulletin' ? 'bulletin' : 'events'}/${item.id}`}
                                className="text-gray-900 hover:text-brand-primary hover:underline font-semibold truncate w-fit max-w-full"
                                title={item.title}
                            >
                                {item.title}
                            </Link>
                            <div className="text-xs text-gray-500 truncate" title={item.description || ''}>{item.description}</div>
                        </div>
                        <Link
                            to={`/admin/preview/${item.type === 'Bulletin' ? 'bulletin' : 'event'}/${item.id}`}
                            className="flex items-center justify-center self-stretch px-1 text-gray-400 hover:text-brand-primary transition-colors shrink-0"
                            title="Preview as Approved"
                        >
                            <Eye className="w-4 h-4" />
                        </Link>
                    </div>
                </td>
            )}
            {visibleColumns.category && (
                <td className="px-6 py-4 whitespace-nowrap">
                    <span
                        title={item.category}
                        className={`inline-flex items-center justify-center rounded-full border w-30 px-2.5 py-1 text-xs font-semibold ${getCategoryClass(item.category)}`}
                    >
                        <span className="truncate">{item.category}</span>
                    </span>
                </td>
            )}
            {visibleColumns.author && (
                <td className="px-6 py-0 w-48 max-w-[200px]">
                    <div className="flex items-stretch justify-between gap-2 min-w-0">
                        <div className="flex items-center gap-2 flex-1 min-w-0 py-4">
                            {item.isOfficial && <HardHat className="w-4 h-4 text-brand-primary shrink-0" />}
                            {item.isBanned && (
                                <span title="Banned User" className="shrink-0">
                                    <Ban className="w-4 h-4 text-red-600" />
                                </span>
                            )}
                            {item.isSuspended && (
                                <span title="Suspended User" className="shrink-0">
                                    <Lock className="w-4 h-4 text-yellow-600" />
                                </span>
                            )}
                            {item.isDeactivated && (
                                <span title="Deactivated User" className="shrink-0">
                                    <UserX className="w-4 h-4 text-gray-500" />
                                </span>
                            )}
                            <span className="truncate" title={item.author}>{item.author}</span>
                        </div>
                        {item.authorId ? (
                            <Link
                                to={`/admin/preview/user/${item.authorId}`}
                                className="flex items-center justify-center self-stretch px-1 text-gray-400 hover:text-brand-primary transition-colors shrink-0"
                                title="Preview Profile"
                            >
                                <Eye className="w-4 h-4" />
                            </Link>
                        ) : null}
                    </div>
                </td>
            )}
            {visibleColumns.date && (
                <td className="px-6 py-4 whitespace-nowrap">{formatDate(item.date, 'long')}</td>
            )}
            {visibleColumns.status && (
                <td className="px-6 py-4 whitespace-nowrap">
                    <button
                        type="button"
                        onClick={() => openStatusModal(item)}
                        title="Click to change status"
                        aria-label={`Change status for ${item.title} (currently ${item.status})`}
                        className={`group inline-flex items-center justify-between gap-1.5 rounded-full border w-32 px-3 py-1 text-xs font-semibold shadow-xs transition-[box-shadow,filter,transform] cursor-pointer hover:shadow hover:brightness-95 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 focus-visible:ring-offset-1 ${getStatusClass(item.status)}`}
                    >
                        <span className="truncate">{item.status}</span>
                        <Pencil className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                </td>
            )}
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                    <button
                        className="shrink-0 inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors hover:bg-gray-200 h-8 px-2.5 border border-gray-200 text-gray-700"
                        onMouseEnter={() => {
                            if (item.type === 'Event') loadCreateEventModal();
                            else if (item.type === 'Bulletin') loadCreateBulletinModal();
                        }}
                        onFocus={() => {
                            if (item.type === 'Event') loadCreateEventModal();
                            else if (item.type === 'Bulletin') loadCreateBulletinModal();
                        }}
                        onClick={() => setEditingItem(item)}
                    >
                        <FileText className="w-3.5 h-3.5 mr-1" />
                        Edit
                    </button>
                </div>
            </td>
        </tr>
    );
});
ContentTableRow.displayName = 'ContentTableRow';



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
        accountScope?: AccountScope[],
        sort: { key: string, direction: 'asc' | 'desc' } | null,
        signal?: AbortSignal
    }) => Promise<{ data: ContentItem[], total: number }>;
    primaryColorClass: string;
    outlineColorClass: string;
    statuses?: string[];
    assignableStatuses?: string[];
    categories?: string[];
    onStatusChange?: (id: string, newStatus: string, adminNotes?: string | null) => void | Promise<void>;
}

export function AdminContentTable({
    title,
    description,
    contentType,
    fetchData,
    statuses = ["All", "Pending", "Approved", "Rejected"],
    assignableStatuses,
    categories,
    onStatusChange
}: AdminContentTableProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [initialFilters] = useState(() =>
        readAdminContentFilters(contentType, {
            allowedStatuses: statuses,
            allowedCategories: categories,
        })
    );

    const urlTab = searchParams.get('tab');
    const urlStart = searchParams.get('start');
    const urlEnd = searchParams.get('end');
    const urlSort = searchParams.get('sort');

    const [itemsPerPage, setItemsPerPage] = useState(initialFilters.itemsPerPage);

    const [data, setData] = useState<ContentItem[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

    // Status Change Modal State
    const [statusModalItem, setStatusModalItem] = useState<ContentItem | null>(null);
    const [statusModalTarget, setStatusModalTarget] = useState<string>('');
    const [statusModalNote, setStatusModalNote] = useState<string>('');

    const openStatusModal = useCallback((item: ContentItem, targetStatus?: string) => {
        setStatusModalItem(item);
        setStatusModalTarget(targetStatus ?? item.status);
        setStatusModalNote(item.adminNotes || '');
    }, []);

    const handleSaveStatusModal = async () => {
        if (!statusModalItem) return;
        const noteToSend = statusModalNote.trim() ? statusModalNote.trim() : null;
        try {
            if (onStatusChange) {
                await onStatusChange(statusModalItem.id, statusModalTarget, noteToSend);
            }
            setData(prev => prev.map(item => item.id === statusModalItem.id ? {
                ...item,
                status: statusModalTarget,
                adminNotes: noteToSend
            } : item));
            toast.success(`${contentType} status updated to ${statusModalTarget}`);
            setStatusModalItem(null);
        } catch (err) {
            console.error("Failed to update status", err);
            toast.error("Failed to update status");
        }
    };


    const [activeTab, setActiveTab] = useState(() =>
        urlTab && statuses.includes(urlTab) ? urlTab : initialFilters.activeTab
    );

    // Search & Filter state
    const [searchName, setSearchName] = useState(initialFilters.searchName);
    const [searchAuthor, setSearchAuthor] = useState(initialFilters.searchAuthor);
    const [searchStartDate, setSearchStartDate] = useState(() =>
        urlStart !== null ? urlStart : initialFilters.searchStartDate
    );
    const [searchEndDate, setSearchEndDate] = useState(() =>
        urlEnd !== null ? urlEnd : initialFilters.searchEndDate
    );
    const [datePreset, setDatePreset] = useState(() =>
        urlStart !== null || urlEnd !== null
            ? (urlStart || urlEnd ? 'custom' : 'all')
            : initialFilters.datePreset
    );
    const [searchCategories, setSearchCategories] = useState<string[]>(initialFilters.searchCategories);

    // Explicit filter applied state
    const [appliedSearchName, setAppliedSearchName] = useState(initialFilters.searchName);
    const [appliedSearchAuthor, setAppliedSearchAuthor] = useState(initialFilters.searchAuthor);
    const [appliedSearchStartDate, setAppliedSearchStartDate] = useState(() =>
        urlStart !== null ? urlStart : initialFilters.searchStartDate
    );
    const [appliedSearchEndDate, setAppliedSearchEndDate] = useState(() =>
        urlEnd !== null ? urlEnd : initialFilters.searchEndDate
    );
    const [appliedDatePreset, setAppliedDatePreset] = useState(() =>
        urlStart !== null || urlEnd !== null
            ? (urlStart || urlEnd ? 'custom' : 'all')
            : initialFilters.datePreset
    );
    const [appliedSearchCategories, setAppliedSearchCategories] = useState<string[]>(initialFilters.searchCategories);

    // Sorting
    const [sortConfig, setSortConfig] = useState<{ key: keyof ContentItem; direction: 'asc' | 'desc' } | null>(() => {
        if (urlSort === 'asc') return { key: 'date', direction: 'asc' };
        if (urlSort === 'desc') return { key: 'date', direction: 'desc' };
        return initialFilters.sortConfig;
    });

    // Column Visibility (all columns shown by default)
    const tableColumns = useMemo<readonly ColumnOption<ContentColumnKey>[]>(() => [
        { key: 'title', label: 'Title' },
        { key: 'category', label: 'Category' },
        { key: 'author', label: 'Author' },
        { key: 'date', label: contentType === 'Event' ? 'Event Date' : 'Date Submitted' },
        { key: 'status', label: 'Status' },
    ], [contentType]);

    const [visibleColumns, setVisibleColumns] = useState<Record<ContentColumnKey, boolean>>(() =>
        createDefaultColumnVisibility(tableColumns)
    );

    const visibleColumnsRef = useRef(visibleColumns);
    useEffect(() => {
        visibleColumnsRef.current = visibleColumns;
    }, [visibleColumns]);

    const sortConfigRef = useRef(sortConfig);
    useEffect(() => {
        sortConfigRef.current = sortConfig;
    }, [sortConfig]);

    const handleToggleColumn = useCallback((key: ContentColumnKey) => {
        const current = visibleColumnsRef.current;
        const currentlyVisible = current[key];
        const visibleCount = Object.values(current).filter(Boolean).length;
        if (currentlyVisible && visibleCount <= 1) return;
        const nextVisible = !currentlyVisible;
        const nextColumns = { ...current, [key]: nextVisible };
        visibleColumnsRef.current = nextColumns;
        setVisibleColumns(nextColumns);
        const currentSort = sortConfigRef.current;
        if (!nextVisible && (currentSort?.key === key || (key === 'date' && currentSort?.key === 'rawDate'))) {
            sortConfigRef.current = null;
            setSortConfig(null);
        }
    }, []);

    const handleShowAllColumns = useCallback(() => {
        const allVisible = createDefaultColumnVisibility(tableColumns);
        visibleColumnsRef.current = allVisible;
        setVisibleColumns(allVisible);
    }, [tableColumns]);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) setActiveTab(tab);

        const start = searchParams.get('start');
        if (start !== null) {
            setSearchStartDate(start);
            setAppliedSearchStartDate(start);
        }

        const end = searchParams.get('end');
        if (end !== null) {
            setSearchEndDate(end);
            setAppliedSearchEndDate(end);
        }

        if (start !== null || end !== null) {
            const nextPreset = start || end ? 'custom' : 'all';
            setDatePreset(nextPreset);
            setAppliedDatePreset(nextPreset);
        }

        const sort = searchParams.get('sort');
        if (sort === 'asc') {
            setSortConfig({ key: 'date', direction: 'asc' });
        } else if (sort === 'desc') {
            setSortConfig({ key: 'date', direction: 'desc' });
        }
    }, [searchParams]);

    // Pagination
    const [currentPage, setCurrentPage] = useState(() => {
        const hasUrlFilterOverride =
            (urlTab !== null && statuses.includes(urlTab) && urlTab !== initialFilters.activeTab) ||
            (urlStart !== null && urlStart !== initialFilters.searchStartDate) ||
            (urlEnd !== null && urlEnd !== initialFilters.searchEndDate);
        return hasUrlFilterOverride ? 1 : initialFilters.currentPage;
    });

    const handleSort = (key: keyof ContentItem) => {
        setSortConfig((prev) => {
            if (!prev || prev.key !== key) return { key, direction: 'desc' };
            if (prev.direction === 'desc') return { key, direction: 'asc' };
            return null;
        });
    };

    const renderSortIcon = (key: keyof ContentItem) => {
        if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown size={14} className="text-gray-400 shrink-0" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp size={14} className="text-gray-700 shrink-0" />
            : <ArrowDown size={14} className="text-gray-700 shrink-0" />;
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

        // Automatically apply filters
        setAppliedSearchName(searchName);
        setAppliedSearchAuthor(searchAuthor);
        setAppliedSearchStartDate(start);
        setAppliedSearchEndDate(end);
        setAppliedDatePreset(filter);
        setAppliedSearchCategories(searchCategories);
        setAppliedAccountScope(accountScope);
        setCurrentPage(1);
    };

    const [accountScope, setAccountScope] = useState<AccountScope[]>(
        initialFilters.accountScope as AccountScope[]
    );
    const [appliedAccountScope, setAppliedAccountScope] = useState<AccountScope[]>(
        initialFilters.accountScope as AccountScope[]
    );

    useEffect(() => {
        writeAdminContentFilters(contentType, {
            activeTab,
            searchName: appliedSearchName,
            searchAuthor: appliedSearchAuthor,
            searchStartDate: appliedSearchStartDate,
            searchEndDate: appliedSearchEndDate,
            datePreset: appliedDatePreset,
            searchCategories: appliedSearchCategories,
            accountScope: appliedAccountScope,
            sortConfig: sortConfig
                ? { key: sortConfig.key as ContentSortKey, direction: sortConfig.direction }
                : null,
            itemsPerPage,
            currentPage,
        });
    }, [
        contentType,
        activeTab,
        appliedSearchName,
        appliedSearchAuthor,
        appliedSearchStartDate,
        appliedSearchEndDate,
        appliedDatePreset,
        appliedSearchCategories,
        appliedAccountScope,
        sortConfig,
        itemsPerPage,
        currentPage,
    ]);

    const handleApplyFilters = () => {
        setAppliedSearchName(searchName);
        setAppliedSearchAuthor(searchAuthor);
        setAppliedSearchStartDate(searchStartDate);
        setAppliedSearchEndDate(searchEndDate);
        setAppliedDatePreset(datePreset);
        setAppliedSearchCategories(searchCategories);
        setAppliedAccountScope(accountScope);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setSearchName('');
        setSearchAuthor('');
        setSearchStartDate('');
        setSearchEndDate('');
        setDatePreset('all');
        setSearchCategories(['All']);
        setAccountScope(['All']);
        setAppliedSearchName('');
        setAppliedSearchAuthor('');
        setAppliedSearchStartDate('');
        setAppliedSearchEndDate('');
        setAppliedDatePreset('all');
        setAppliedSearchCategories(['All']);
        setAppliedAccountScope(['All']);
        setCurrentPage(1);
        if (searchParams.has('start') || searchParams.has('end')) {
            const nextParams = new URLSearchParams(searchParams);
            nextParams.delete('start');
            nextParams.delete('end');
            setSearchParams(nextParams, { replace: true });
        }
    };

    const handleExportCSV = () => {
        const csvColumns: Array<{ header: string; getValue: (c: ContentItem) => unknown }> = [];
        if (visibleColumns.title) csvColumns.push({ header: 'Title', getValue: (c) => c.title });
        if (visibleColumns.category) csvColumns.push({ header: 'Category', getValue: (c) => c.category });
        if (visibleColumns.author) csvColumns.push({ header: 'Author', getValue: (c) => c.author });
        if (visibleColumns.date) csvColumns.push({ header: 'Date', getValue: (c) => formatDate(c.date, 'long') });
        csvColumns.push({ header: 'Type', getValue: (c) => c.type });
        if (visibleColumns.status) csvColumns.push({ header: 'Status', getValue: (c) => c.status });

        const headers = csvColumns.map((col) => col.header);
        const csvContent = data.map((c) =>
            csvColumns.map((col) => escapeCsvCell(col.getValue(c))).join(',')
        );

        const csvString = [headers.join(','), ...csvContent].join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = `${contentType.toLowerCase()}s_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
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
                    sort: sortConfig,
                    signal: controller.signal
                });
                if (!controller.signal.aborted) {
                    const maxPage = Math.max(1, Math.ceil(result.total / itemsPerPage));
                    if (result.total > 0 && currentPage > maxPage) {
                        setCurrentPage(maxPage);
                        return;
                    }
                    setData(result.data);
                    setTotalItems(result.total);
                }
            } catch (err) {
                if (axios.isCancel(err) || (err as { code?: string })?.code === 'ERR_CANCELED' || controller.signal.aborted) {
                    return;
                }
                console.error(err);
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };
        load();
        return () => controller.abort();
    }, [currentPage, itemsPerPage, appliedSearchName, appliedSearchAuthor, appliedSearchStartDate, appliedSearchEndDate, appliedSearchCategories, appliedAccountScope, activeTab, sortConfig, fetchData, refreshKey]);

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
            case "For Review": return { title: `For Review ${contentType}s`, description: `${contentType}s flagged or awaiting moderator review` };
            case "Pending": return { title: 'Needs Attention', description: `${contentType}s awaiting moderator approval before publishing` };
            case "Approved": return { title: `Published ${contentType}s`, description: 'Previously approved and currently visible to the public' };
            case "Rejected": return { title: `Rejected ${contentType}s`, description: 'Submissions that did not meet community guidelines' };
            case "Cancelled": return { title: `Cancelled ${contentType}s`, description: 'Events that were cancelled' };
            case "Archived": return { title: `Archived ${contentType}s`, description: `${contentType}s that are archived` };
            case "Concluded": return { title: `Concluded ${contentType}s`, description: 'Events that have concluded successfully' };
            case "Flagged": return { title: `Flagged ${contentType}s`, description: `${contentType}s that are flagged by the AI filter` };
            default: return { title: `${status} ${contentType}s`, description: `Viewing ${status.toLowerCase()} items` };
        }
    };

    const modalStatusOptions = useMemo(() => {
        const list = assignableStatuses || statuses;
        return list.filter(s => s !== "All" && s !== "For Review");
    }, [assignableStatuses, statuses]);

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
                            <tr className="divide-x divide-gray-200/70">
                                {visibleColumns.title && (
                                    <th className="w-96 max-w-sm px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('title')}>
                                        <div className="flex items-center gap-1">Title {renderSortIcon('title')}</div>
                                    </th>
                                )}
                                {visibleColumns.category && (
                                    <th className="px-6 py-3 whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('category')}>
                                        <div className="flex items-center gap-1">Category {renderSortIcon('category')}</div>
                                    </th>
                                )}
                                {visibleColumns.author && (
                                    <th className="w-48 max-w-[200px] px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('author')}>
                                        <div className="flex items-center gap-1">Author {renderSortIcon('author')}</div>
                                    </th>
                                )}
                                {visibleColumns.date && (
                                    <th className="w-44 px-6 py-3 whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('date')}>
                                        <div className="flex items-center gap-1">
                                            {contentType === 'Event' ? 'Event Date' : 'Date Submitted'}{renderSortIcon('date')}
                                        </div>
                                    </th>
                                )}
                                {visibleColumns.status && (
                                    <th className="px-6 py-3 whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('status')}>
                                        <div className="flex items-center gap-1">Status {renderSortIcon('status')}</div>
                                    </th>
                                )}
                                <th className="px-6 py-3 text-right whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedContent.map((item) => (
                                <ContentTableRow
                                    key={item.id}
                                    item={item}
                                    visibleColumns={visibleColumns}
                                    openStatusModal={openStatusModal}
                                    setEditingItem={setEditingItem}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
                <p className="text-gray-500">{description}</p>
            </div>

            <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
                <div className="overflow-x-auto pb-2 flex justify-between items-center gap-4">
                    <TabsList className="inline-flex min-w-full sm:min-w-0 flex-1">
                        {statuses.map(status => (
                            <TabsTrigger key={status} value={status}>{status}</TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                <div className="p-4 bg-white border rounded-md shadow-sm mb-6 flex flex-col gap-4">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="text-sm font-medium text-gray-700">Filters</div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Button size="sm" variant="outline" onClick={handleClearFilters} className="border border-gray-300 w-24">Clear</Button>
                            <Button size="sm" className="bg-brand-primary hover:bg-brand-primary-hover text-white w-24" onClick={handleApplyFilters}>Submit</Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <div className="col-span-full flex flex-col sm:flex-row gap-2 min-w-0">
                            <div className="relative flex items-center flex-1 min-w-0">
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
                            <div className="relative flex items-center flex-1 min-w-0">
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

                        <div className="col-span-full flex flex-wrap items-center gap-2 min-w-0">
                            <span className="text-sm font-medium text-gray-700 w-28 shrink-0">Date</span>
                            <Select value={datePreset} onValueChange={(val: string) => {
                                setDatePreset(val);
                                if (val === 'this_week' || val === 'this_month' || val === 'this_year' || val === 'all') {
                                    applyQuickFilter(val);
                                }
                            }}>
                                <SelectTrigger className="w-[140px] h-10 bg-white text-gray-700 border border-gray-300 shrink-0">
                                    <SelectValue placeholder="Preset Dates" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="this_week">This Week</SelectItem>
                                    <SelectItem value="this_month">This Month</SelectItem>
                                    <SelectItem value="this_year">This Year</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                                <span className={`text-xs shrink-0 ${datePreset === 'custom' ? 'text-gray-500' : 'text-gray-300'}`}>From</span>
                                <Input
                                    type="date"
                                    className="h-10 w-40 bg-white px-2 text-sm text-gray-700 border border-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
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
                                    className="h-10 w-40 bg-white px-2 text-sm text-gray-700 border border-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
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

                        <div className="flex col-span-full items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
                            <span className="text-sm font-medium text-gray-700 w-28 shrink-0 flex items-center gap-1.5">
                                Account Scope
                            </span>
                            {ACCOUNT_SCOPES
                                .map((scope) => {
                                    const isSelected = accountScope.includes(scope);
                                    return (
                                        <Button
                                            key={scope}
                                            variant={isSelected ? "default" : "outline"}
                                            size="sm"
                                            className={isSelected ? "border border-transparent bg-brand-secondary hover:bg-brand-secondary-hover text-white" : "border border-gray-300"}
                                            onClick={() => {
                                                let newScope = [...accountScope];
                                                if (scope === 'All') {
                                                    newScope = ['All'];
                                                } else {
                                                    newScope = newScope.filter(s => s !== 'All');
                                                    if (newScope.includes(scope)) {
                                                        newScope = newScope.filter(s => s !== scope);
                                                        if (newScope.length === 0) newScope = ['All'];
                                                    } else {
                                                        newScope.push(scope);
                                                    }
                                                }
                                                setAccountScope(newScope);
                                                setAppliedAccountScope(newScope);
                                                setCurrentPage(1);
                                            }}
                                        >
                                            {scope === 'Official' && <HardHat className={`w-3.5 h-3.5 mr-1 ${isSelected ? 'text-white' : 'text-brand-primary'}`} />}
                                            {scope === 'Suspended' && <Lock className={`w-3.5 h-3.5 mr-1 ${isSelected ? 'text-white' : 'text-yellow-600'}`} />}
                                            {scope === 'Banned' && <Ban className={`w-3.5 h-3.5 mr-1 ${isSelected ? 'text-white' : 'text-red-600'}`} />}
                                            {scope === 'Deactivated' && <UserX className={`w-3.5 h-3.5 mr-1 ${isSelected ? 'text-white' : 'text-gray-500'}`} />}
                                            {scope}
                                        </Button>
                                    );
                                })}
                        </div>


                        {categories && categories.length > 0 && (
                            <div className="flex col-span-full items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
                                <span className="text-sm font-medium text-gray-700 w-28 shrink-0">Categories</span>
                                <Button
                                    variant={searchCategories.includes('All') ? "default" : "outline"}
                                    className={searchCategories.includes('All') ? "border border-transparent bg-brand-secondary hover:bg-brand-secondary-hover text-white" : "border border-gray-300"}
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
                                        className={searchCategories.includes(cat) ? `border border-transparent ${getCategoryColor(cat)}` : "border border-gray-300"}
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
                                        setAccountScope(['All']);
                                        setAppliedAccountScope(['All']);
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

                <TabsContent value={activeTab}>
                    <Card className="border-none shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between gap-4">
                            <div>
                                <CardTitle>{getStatusConfig(activeTab).title}</CardTitle>
                                <CardDescription>
                                    {getStatusConfig(activeTab).description}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <ColumnVisibilityDropdown
                                    columns={tableColumns}
                                    visibleColumns={visibleColumns}
                                    onToggleColumn={handleToggleColumn}
                                    onShowAll={handleShowAllColumns}
                                />
                                <Button
                                    variant="outline"
                                    onClick={handleExportCSV}
                                    className="gap-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shrink-0"
                                >
                                    <Download className="h-4 w-4" />
                                    Export CSV
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {renderTable()}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs >

            {/* Status Change / Decision Modal */}
            <Dialog open={!!statusModalItem} onOpenChange={(open) => !open && setStatusModalItem(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update Status: {statusModalItem?.title}</DialogTitle>
                        <DialogDescription>
                            Update {contentType.toLowerCase()} status and administrative note for the author.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select
                                value={statusModalTarget}
                                onValueChange={setStatusModalTarget}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {modalStatusOptions.map(s => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Reason / Administrative Note (Optional)</Label>
                            <Textarea
                                placeholder="Provide reasoning or note for the author..."
                                value={statusModalNote}
                                onChange={(e) => setStatusModalNote(e.target.value)}
                                rows={3}
                            />
                            <p className="text-xs text-gray-500">
                                This note will be visible to the author on the {contentType.toLowerCase()}&apos;s page.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setStatusModalItem(null)}>Cancel</Button>
                        <Button className="bg-brand-primary hover:bg-brand-primary-hover text-white" onClick={handleSaveStatusModal}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Suspense fallback={null}>
                {editingItem && contentType === 'Event' && (
                    <CreateEventModal
                        isAdmin={true}
                        initialData={editingItem as unknown as EventModalInitialData}
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
                        initialData={editingItem as unknown as BulletinModalInitialData}
                        open={true}
                        onOpenChange={(isOpen) => {
                            if (!isOpen) {
                                setEditingItem(null);
                                setRefreshKey(k => k + 1);
                            }
                        }}
                    />
                )}
            </Suspense>
        </div >
    );
}
