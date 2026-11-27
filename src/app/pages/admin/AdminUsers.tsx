import { useState, useEffect, lazy, Suspense, useCallback, useRef, memo } from 'react';
import axios from 'axios';
import { subYears, format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Input } from '@components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@components/ui/dialog';
import { Label } from '@components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Textarea } from '@components/ui/textarea';
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight, Download, Search, Plus, FileText, Eye, Pencil } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, unwrapListResponse, type DegreeData, type UserStatusData, type ProfileData, type RecordData, type AdminUserRow } from '@/app/views/api';
import { formatDate } from '@/app/views/formatters';
import { Badge } from '@/app/components/ui/badge';
import {
    ColumnVisibilityDropdown,
    createDefaultColumnVisibility,
    escapeCsvCell,
    type ColumnOption,
} from '@components/admin/ColumnVisibilityDropdown';
import { toast } from 'sonner';

const USER_TABLE_COLUMNS = [
    { key: 'name', label: 'Name' },
    { key: 'degree', label: 'Degree Program' },
    { key: 'email', label: 'Email' },
    { key: 'batch', label: 'Batch' },
    { key: 'grantedDate', label: 'Granted/Expiry Date' },
    { key: 'status', label: 'Status' },
] as const satisfies readonly ColumnOption[];

type UserColumnKey = (typeof USER_TABLE_COLUMNS)[number]['key'];

const loadCreateUserModal = () => import('@components/admin/CreateUserModal').then(m => ({ default: m.CreateUserModal }));
const CreateUserModal = lazy(loadCreateUserModal);

interface AdminUserApiItem {
    id: string;
    currentRecordId?: string;
    profile?: ProfileData;
    userStatus?: UserStatusData;
    records?: RecordData[];
}

const getUserStatusClass = (status: string) => {
    switch (status) {
        case 'Official': return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'Regular': return 'bg-green-100 text-green-800 border-green-300';
        case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'Suspended': return 'bg-orange-100 text-orange-800 border-orange-300';
        case 'Banned': return 'bg-red-100 text-red-800 border-red-300';
        case 'Deactivated': return 'bg-gray-100 text-gray-800 border-gray-300';
        default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
};

const getDegreeBadgeClass = (degree: string) => {
    switch (degree.trim().toUpperCase()) {
        case 'BSME': return 'bg-[#134f5c] text-white border-[#0c343d]';
        case 'BSCE': return 'bg-[#1155cc] text-white border-[#0d42a0]';
        case 'BSIE': return 'bg-[#7e22ce] text-white border-[#6b21a8]';
        case 'BSEE': return 'bg-[#bf9000] text-white border-[#9e7700]';
        case 'BSECE': return 'bg-[#4a86e8] text-white border-[#3c78d8]';
        case 'BSCPE': return 'bg-[#38761d] text-white border-[#274e13]';
        default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
};

const UserTableRow = memo(({
    user,
    visibleColumns,
    openEditModal,
}: {
    user: AdminUserRow;
    visibleColumns: Record<UserColumnKey, boolean>;
    openEditModal: (user: AdminUserRow, status?: string) => void;
}) => {
    const degreeTooltip = user.degreeName !== 'N/A' && user.degree !== 'N/A' && user.degree !== user.degreeName
        ? `${user.degreeName} (${user.degree})`
        : user.degreeName;

    return (
        <tr className="border-t divide-x divide-gray-100">
            {visibleColumns.name && (
                <td className="px-6 py-0 font-medium max-w-xs h-px">
                    <div className="flex items-stretch justify-between gap-2 min-w-0 h-full">
                        <div className="flex items-center flex-1 min-w-0 py-4">
                            <Link
                                to={`/profile/${user.id}`}
                                className="text-gray-900 hover:text-brand-primary truncate max-w-full"
                                title={user.name}
                            >
                                {user.name}
                            </Link>
                        </div>
                        <Link
                            to={`/admin/preview/user/${user.id}`}
                            className="flex items-center justify-center self-stretch px-1 text-gray-400 hover:text-brand-primary transition-colors shrink-0"
                            title="Preview Profile"
                        >
                            <Eye className="w-4 h-4" />
                        </Link>
                    </div>
                </td>
            )}
            {visibleColumns.degree && (
                <td className="px-6 py-4 max-w-[240px]" title={degreeTooltip}>
                    <div className="flex items-center justify-between gap-2 min-w-0">
                        <span className="truncate flex-1 min-w-0 text-gray-900">{user.degreeName}</span>
                        {user.degree !== 'N/A' && user.degree !== user.degreeName && (
                            <span className={`inline-flex items-center justify-center rounded-md border w-16 py-0.5 text-xs font-semibold shrink-0 ${getDegreeBadgeClass(user.degree)}`}>
                                {user.degree}
                            </span>
                        )}
                    </div>
                </td>
            )}
            {visibleColumns.email && (
                <td className="px-6 py-4 max-w-[200px] truncate" title={user.email}>
                    {user.email}
                </td>
            )}
            {visibleColumns.batch && <td className="px-6 py-4">{user.batch}</td>}
            {visibleColumns.grantedDate && (
                <td className="px-6 py-4 whitespace-nowrap">
                    {user.status === 'Suspended' ? (
                        <div className="text-orange-700">Expires: {user.expiryDate || 'N/A'}</div>
                    ) : (
                        user.grantedDate || 'N/A'
                    )}
                </td>
            )}
            {visibleColumns.status && (
                <td className="px-6 py-4 whitespace-nowrap">
                    <button
                        type="button"
                        onClick={() => openEditModal(user)}
                        title="Click to change status"
                        aria-label={`Change status for ${user.name} (currently ${user.status})`}
                        className={`group inline-flex items-center justify-between gap-1.5 rounded-full border w-32 px-3 py-1 text-xs font-semibold shadow-xs transition-[box-shadow,filter,transform] cursor-pointer hover:shadow hover:brightness-95 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 focus-visible:ring-offset-1 ${getUserStatusClass(user.status)}`}
                    >
                        <span className="truncate">{user.status}</span>
                        <Pencil className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                </td>
            )}
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                    <button
                        className="shrink-0 inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors hover:bg-gray-200 h-8 px-2.5 border border-gray-200 text-gray-700"
                        onClick={() => openEditModal(user)}
                    >
                        <FileText className="w-3.5 h-3.5 mr-1" />
                        Edit
                    </button>
                </div>
            </td>
        </tr>
    );
});
UserTableRow.displayName = 'UserTableRow';

export function AdminUsers() {
    const [itemsPerPage, setItemsPerPage] = useState(20);

    const [searchParams, setSearchParams] = useSearchParams();
    const [dbStatuses, setDbStatuses] = useState<UserStatusData[]>([]);
    const [degrees, setDegrees] = useState<DegreeData[]>([]);
    const [users, setUsers] = useState<AdminUserRow[]>([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [isExportingCsv, setIsExportingCsv] = useState(false);
    const isExportingCsvRef = useRef(false);
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'All');

    // Search & Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [searchBatch, setSearchBatch] = useState('');
    const [searchReason, setSearchReason] = useState('');
    const [selectedDegree, setSelectedDegree] = useState<string>('All');
    const [batchRange, setBatchRange] = useState<string>('All Batches');
    const [customMinBatch, setCustomMinBatch] = useState<string>('');
    const [customMaxBatch, setCustomMaxBatch] = useState<string>('');

    // Explicit filter state
    const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
    const [appliedSearchBatch, setAppliedSearchBatch] = useState('');
    const [appliedSearchReason, setAppliedSearchReason] = useState('');
    const [appliedDegree, setAppliedDegree] = useState<string>('All');
    const [appliedBatchRange, setAppliedBatchRange] = useState<string>('All Batches');
    const [appliedCustomMinBatch, setAppliedCustomMinBatch] = useState<string>('');
    const [appliedCustomMaxBatch, setAppliedCustomMaxBatch] = useState<string>('');

    // Sorting
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    // Column Visibility (all columns shown by default)
    const [visibleColumns, setVisibleColumns] = useState<Record<UserColumnKey, boolean>>(() =>
        createDefaultColumnVisibility(USER_TABLE_COLUMNS)
    );

    const visibleColumnsRef = useRef(visibleColumns);
    useEffect(() => {
        visibleColumnsRef.current = visibleColumns;
    }, [visibleColumns]);

    const sortConfigRef = useRef(sortConfig);
    useEffect(() => {
        sortConfigRef.current = sortConfig;
    }, [sortConfig]);

    const handleToggleColumn = useCallback((key: UserColumnKey) => {
        const current = visibleColumnsRef.current;
        const currentlyVisible = current[key];
        const visibleCount = Object.values(current).filter(Boolean).length;
        if (currentlyVisible && visibleCount <= 1) return;
        const nextVisible = !currentlyVisible;
        const nextColumns = { ...current, [key]: nextVisible };
        visibleColumnsRef.current = nextColumns;
        setVisibleColumns(nextColumns);
        const currentSort = sortConfigRef.current;
        if (!nextVisible && currentSort?.key === key) {
            sortConfigRef.current = null;
            setSortConfig(null);
        }
    }, []);

    const handleShowAllColumns = useCallback(() => {
        const allVisible = createDefaultColumnVisibility(USER_TABLE_COLUMNS);
        visibleColumnsRef.current = allVisible;
        setVisibleColumns(allVisible);
    }, []);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // Editing
    const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null);
    const [editStatus, setEditStatus] = useState<string>('');
    const [editReason, setEditReason] = useState<string>('');
    const [editExpiryDate, setEditExpiryDate] = useState<string>('');

    // Create User Modal State
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Load initial lookup data (statuses & degrees)
    useEffect(() => {
        const controller = new AbortController();
        const fetchLookups = async () => {
            try {
                const [statusRes, degreeRes] = await Promise.all([
                    api.get('/userStatuses', { signal: controller.signal }),
                    api.get('/degrees', { signal: controller.signal })
                ]);
                if (controller.signal.aborted) return;
                const statusData = unwrapListResponse<UserStatusData>(statusRes).items;
                const degreeData = unwrapListResponse<DegreeData>(degreeRes).items;
                setDbStatuses(statusData);
                setDegrees(degreeData);
            } catch (err) {
                if (axios.isCancel(err) || (err as { code?: string })?.code === 'ERR_CANCELED' || controller.signal.aborted) {
                    return;
                }
                console.error("Failed to fetch lookups:", err);
            }
        };
        fetchLookups();
        return () => controller.abort();
    }, []);

    const statuses = ['All', ...dbStatuses.map(s => s.statusName)];

    const handleSort = (key: string) => {
        setSortConfig((prev) => {
            if (!prev || prev.key !== key) return { key, direction: 'desc' };
            if (prev.direction === 'desc') return { key, direction: 'asc' };
            return null;
        });
    };

    const renderSortIcon = (key: keyof AdminUserRow) => {
        if (sortConfig?.key !== key) return <ArrowUpDown size={14} className="text-gray-400" />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-gray-700" /> : <ArrowDown size={14} className="text-gray-700" />;
    };

    const handleApplyFilters = () => {
        setAppliedSearchTerm(searchTerm);
        setAppliedSearchBatch(searchBatch);
        setAppliedSearchReason(searchReason);
        setAppliedDegree(selectedDegree);
        setAppliedBatchRange(batchRange);
        setAppliedCustomMinBatch(customMinBatch);
        setAppliedCustomMaxBatch(customMaxBatch);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSearchBatch('');
        setSearchReason('');
        setSelectedDegree('All');
        setBatchRange('All Batches');
        setCustomMinBatch('');
        setCustomMaxBatch('');
        setAppliedSearchTerm('');
        setAppliedSearchBatch('');
        setAppliedSearchReason('');
        setAppliedDegree('All');
        setAppliedBatchRange('All Batches');
        setAppliedCustomMinBatch('');
        setAppliedCustomMaxBatch('');
        setCurrentPage(1);
    };

    const buildQueryFiltersAndSort = () => {
        const whereClause: Record<string, unknown> = {};
        if (activeTab !== 'All') {
            whereClause.userStatus = { statusName: activeTab };
        }

        const profileFilter: Record<string, unknown> = {};
        if (appliedSearchTerm) {
            profileFilter.userName = { contains: appliedSearchTerm };
        }
        if (appliedDegree && appliedDegree !== 'All') {
            profileFilter.degreeId = appliedDegree;
        }

        const currentYear = new Date().getFullYear();
        let batchFilter: Record<string, unknown> | number | undefined = undefined;
        if (appliedBatchRange === 'Past 3') { batchFilter = { gte: currentYear - 3 }; }
        else if (appliedBatchRange === 'Past 5') { batchFilter = { gte: currentYear - 5 }; }
        else if (appliedBatchRange === 'Past 10') { batchFilter = { gte: currentYear - 10 }; }
        else if (appliedBatchRange === 'Past 30') { batchFilter = { gte: currentYear - 30 }; }
        else if (appliedBatchRange === 'Custom' || appliedBatchRange === 'Custom Range') {
            const min = appliedCustomMinBatch ? parseInt(appliedCustomMinBatch, 10) : undefined;
            const max = appliedCustomMaxBatch ? parseInt(appliedCustomMaxBatch, 10) : undefined;
            if (min !== undefined && max !== undefined) { batchFilter = { gte: min, lte: max }; }
            else if (min !== undefined) { batchFilter = { gte: min }; }
            else if (max !== undefined) { batchFilter = { lte: max }; }
        } else if (appliedSearchBatch) {
            const parsedBatch = parseInt(appliedSearchBatch, 10);
            if (!isNaN(parsedBatch)) {
                batchFilter = parsedBatch;
            }
        }

        if (batchFilter !== undefined) {
            profileFilter.batch = batchFilter;
        }

        if (Object.keys(profileFilter).length > 0) {
            whereClause.profile = profileFilter;
        }

        if (appliedSearchReason) {
            whereClause.records = { some: { description: { contains: appliedSearchReason } } };
        }

        let sortStr = undefined;
        if (sortConfig) {
            let sortKey: string = sortConfig.key;
            if (sortKey === 'name') sortKey = 'profile.userName';
            else if (sortKey === 'degree') sortKey = 'profile.degree.degreeName';
            else if (sortKey === 'email') sortKey = 'profile.email';
            else if (sortKey === 'batch') sortKey = 'profile.batch';
            else if (sortKey === 'status') sortKey = 'userStatus.statusName';

            sortStr = sortConfig.direction === 'desc' ? `-${sortKey}` : sortKey;
        }

        return { whereClause, sortStr };
    };

    const handleExportCSV = async () => {
        if (isExportingCsvRef.current) return;
        isExportingCsvRef.current = true;
        setIsExportingCsv(true);
        try {
            const { whereClause, sortStr } = buildQueryFiltersAndSort();

            const res = await api.get('/admin/users', {
                params: {
                    _sort: sortStr,
                    _where: Object.keys(whereClause).length > 0 ? JSON.stringify(whereClause) : undefined
                }
            });

            const { items: data } = unwrapListResponse<AdminUserApiItem>(res);

            const mapped = data.map((u: AdminUserApiItem) => {
                const currentRecord = u.records?.find((r: RecordData) => r.id === u.currentRecordId) || u.records?.[0];
                let formattedGranted = undefined;
                let formattedExpiry = undefined;
                if (currentRecord?.dateCreated) {
                    const d = new Date(currentRecord.dateCreated);
                    if (!isNaN(d.getTime())) formattedGranted = formatDate(d, 'short');
                }
                const expiryDateRaw = currentRecord?.dateExpires || currentRecord?.expirationDate;
                if (expiryDateRaw) {
                    const d = new Date(expiryDateRaw);
                    if (!isNaN(d.getTime())) {
                        formattedExpiry = d.getFullYear() >= 3000 ? 'Indefinite' : formatDate(d, 'short');
                    }
                }

                const degreeDisplay = u.profile?.degree
                    ? `${u.profile.degree.degreeName} (${u.profile.degree.degreeAbbr})`
                    : 'N/A';

                return {
                    name: u.profile?.userName || 'Unknown',
                    degree: degreeDisplay,
                    email: u.profile?.email || 'Unknown',
                    batch: u.profile?.batch || 'Unknown',
                    status: u.userStatus?.statusName || 'Unknown',
                    reason: currentRecord?.description || '',
                    grantedDate: formattedGranted,
                    expiryDate: formattedExpiry
                };
            });

            const csvColumns: Array<{ header: string; getValue: (u: (typeof mapped)[number]) => unknown }> = [];
            if (visibleColumns.name) csvColumns.push({ header: 'Name', getValue: (u) => u.name });
            if (visibleColumns.degree) csvColumns.push({ header: 'Degree Program', getValue: (u) => u.degree });
            if (visibleColumns.email) csvColumns.push({ header: 'Email', getValue: (u) => u.email });
            if (visibleColumns.batch) csvColumns.push({ header: 'Batch', getValue: (u) => u.batch });
            if (visibleColumns.status) csvColumns.push({ header: 'Status', getValue: (u) => u.status });
            if (visibleColumns.grantedDate) {
                csvColumns.push({ header: 'Granted Date', getValue: (u) => u.grantedDate || '' });
                csvColumns.push({ header: 'Expiry Date', getValue: (u) => u.expiryDate || '' });
            }
            csvColumns.push({ header: 'Reason', getValue: (u) => u.reason || '' });

            const headers = csvColumns.map((col) => col.header);
            const csvContent = mapped.map((u) =>
                csvColumns.map((col) => escapeCsvCell(col.getValue(u))).join(',')
            );

            const csvString = [headers.join(','), ...csvContent].join('\n');
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', 'users_export.csv');
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            }
        } catch (error) {
            console.error("Failed to export CSV", error);
        } finally {
            isExportingCsvRef.current = false;
            setIsExportingCsv(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!editingUser) return;

        if (editStatus === 'Suspended' && !editExpiryDate) {
            toast.error("Suspension expiry date is required.");
            return;
        }

        try {
            await api.post(`/admin/users/${editingUser.id}/status`, {
                statusName: editStatus,
                reason: editReason,
                expiryDate: editStatus === 'Suspended' ? editExpiryDate : null
            });
            toast.success(`User status updated to ${editStatus}`);
            setEditingUser(null);
            fetchUsersList();
        } catch (err: unknown) {
            const axiosErr = err as { response?: { data?: { error?: string } } };
            console.error("Failed to update user status:", err);
            toast.error(axiosErr?.response?.data?.error || "Failed to update user status");
        }
    };

    const setPresetDuration = (days: number) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        setEditExpiryDate(d.toISOString().split('T')[0]);
    };

    const setIndefiniteDuration = () => {
        const d = new Date();
        d.setFullYear(d.getFullYear() + 1000);
        setEditExpiryDate(d.toISOString().split('T')[0]);
    };

    const fetchUsersList = async (signal?: AbortSignal) => {
        try {
            const { whereClause, sortStr } = buildQueryFiltersAndSort();

            const res = await api.get('/admin/users', {
                params: {
                    _page: currentPage,
                    _per_page: itemsPerPage,
                    _sort: sortStr,
                    _where: Object.keys(whereClause).length > 0 ? JSON.stringify(whereClause) : undefined
                },
                signal
            });

            const { items: data, total } = unwrapListResponse<AdminUserApiItem>(res);

            const mapped = data.map((u: AdminUserApiItem) => {
                const currentRecord = u.records?.find((r: RecordData) => r.id === u.currentRecordId) || u.records?.[0];

                let formattedGranted = undefined;
                let rawGranted = 0;
                if (currentRecord?.dateCreated) {
                    const d = new Date(currentRecord.dateCreated);
                    if (!isNaN(d.getTime())) {
                        formattedGranted = formatDate(d, 'long');
                        rawGranted = d.getTime();
                    }
                }

                let formattedExpiry = undefined;
                let rawExpiry = 0;
                if (currentRecord?.dateExpires) {
                    const d = new Date(currentRecord.dateExpires);
                    if (!isNaN(d.getTime())) {
                        formattedExpiry = d.getFullYear() >= 3000 ? 'Indefinite' : formatDate(d, 'short');
                        rawExpiry = d.getTime();
                    }
                }

                return {
                    id: u.id,
                    name: u.profile?.userName || 'Unknown',
                    email: u.profile?.email || 'N/A',
                    degree: u.profile?.degree?.degreeAbbr || u.profile?.degree?.degreeName || 'N/A',
                    degreeName: u.profile?.degree?.degreeName || u.profile?.degree?.degreeAbbr || 'N/A',
                    batch: u.profile?.batch?.toString() || 'N/A',
                    status: u.userStatus?.statusName || 'Unknown',
                    reason: currentRecord?.description || undefined,
                    grantedDate: formattedGranted,
                    expiryDate: formattedExpiry,
                    rawGrantedDate: rawGranted,
                    rawExpiryDate: rawExpiry
                };
            });

            if (!signal?.aborted) {
                setUsers(mapped);
                setTotalUsers(total);
            }
        } catch (err) {
            if (axios.isCancel(err) || (err as { code?: string })?.code === 'ERR_CANCELED' || signal?.aborted) {
                return;
            }
            console.error(err);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchUsersList(controller.signal);
        return () => controller.abort();
    }, [activeTab, appliedSearchTerm, appliedSearchBatch, appliedSearchReason, appliedDegree, appliedBatchRange, appliedCustomMinBatch, appliedCustomMaxBatch, sortConfig, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(totalUsers / itemsPerPage);
    const paginatedUsers = users;

    const onTabChange = (val: string) => {
        setActiveTab(val);
        setCurrentPage(1);
        setSearchParams({ tab: val }, { replace: true });
    };

        const openEditModal = useCallback((user: AdminUserRow, specificStatus?: string) => {
            setEditingUser(user);
            setEditStatus(specificStatus || user.status);
            setEditReason(user.reason || '');

            let initialExpiry = '';
            if (user.rawExpiryDate) {
                const d = new Date(user.rawExpiryDate);
                if (!isNaN(d.getTime())) {
                    initialExpiry = d.toISOString().split('T')[0];
                }
            } else if (user.expiryDate && user.expiryDate !== 'Indefinite') {
                const d = new Date(user.expiryDate);
                if (!isNaN(d.getTime())) {
                    initialExpiry = d.toISOString().split('T')[0];
                }
            }
            if ((specificStatus || user.status) === 'Suspended' && !initialExpiry) {
                const defaultDate = new Date();
                defaultDate.setDate(defaultDate.getDate() + 7);
                initialExpiry = defaultDate.toISOString().split('T')[0];
            }

            setEditExpiryDate(initialExpiry);
        }, []);



        const renderTable = () => {
            if (users.length === 0) {
                return (
                    <div className="py-8 text-center border rounded-md border-dashed text-gray-500">
                        No users found for this category or search criteria.
                    </div>
                );
            }

            return (
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between pb-2 gap-4">
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
                            <span className="text-sm text-gray-500">entries. {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} total.</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="text-sm font-medium px-2">
                                Page {currentPage} of {Math.max(1, totalPages)}
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(Math.max(1, totalPages), p + 1))} disabled={currentPage >= totalPages}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="border rounded-md bg-white overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr className="divide-x divide-gray-200/70">
                                    {visibleColumns.name && (
                                        <th className="px-6 py-3 max-w-xs cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('name')}>
                                            <div className="flex items-center gap-1">Name {renderSortIcon('name')}</div>
                                        </th>
                                    )}
                                    {visibleColumns.degree && (
                                        <th className="px-6 py-3 max-w-[240px] whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('degree')}>
                                            <div className="flex items-center gap-1">Degree Program {renderSortIcon('degree')}</div>
                                        </th>
                                    )}
                                    {visibleColumns.email && (
                                        <th className="px-6 py-3 max-w-[200px] cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('email')}>
                                            <div className="flex items-center gap-1">Email {renderSortIcon('email')}</div>
                                        </th>
                                    )}
                                    {visibleColumns.batch && (
                                        <th className="px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('batch')}>
                                            <div className="flex items-center gap-1">Batch {renderSortIcon('batch')}</div>
                                        </th>
                                    )}
                                    {visibleColumns.grantedDate && (
                                        <th className="px-6 py-3 whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('grantedDate')}>
                                            <div className="flex items-center gap-1">Granted/Expiry Date {renderSortIcon('grantedDate')}</div>
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
                                {paginatedUsers.map((user) => (
                                    <UserTableRow
                                        key={user.id}
                                        user={user}
                                        visibleColumns={visibleColumns}
                                        openEditModal={openEditModal}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        };

        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">User Management</h1>
                    <p className="text-gray-500">Manage roles, and monitor user statuses.</p>
                </div>

                <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
                    <div className="overflow-x-auto pb-2 flex justify-between items-center gap-4">
                        <TabsList className="inline-flex min-w-full sm:min-w-0 flex-1">
                            {statuses.map(status => (
                                <TabsTrigger key={status} value={status}>
                                    {status === 'All' ? 'All Users' : status}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>
                    <div className="p-4 bg-white border rounded-md shadow-sm mb-6 flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="text-sm font-medium text-gray-700">Filters</div>
                            <Button
                                size="sm"
                                className="bg-brand-secondary hover:bg-brand-secondary-hover text-white hover:text-white"
                                onMouseEnter={loadCreateUserModal}
                                onFocus={loadCreateUserModal}
                                onClick={() => {
                                    loadCreateUserModal();
                                    setIsCreateOpen(true);
                                }}
                            >
                                <Plus className="mr-1 h-4 w-4" /> Create User
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
                            <div className="sm:col-span-2 lg:col-span-6 relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                    placeholder="Search user by name..."
                                    className="pl-9"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilters(); }}
                                />
                            </div>
                            <div className="sm:col-span-2 lg:col-span-6">
                                <Select
                                    value={selectedDegree}
                                    onValueChange={(val) => {
                                        setSelectedDegree(val);
                                        setAppliedSearchTerm(searchTerm);
                                        setAppliedSearchBatch(searchBatch);
                                        setAppliedSearchReason(searchReason);
                                        setAppliedDegree(val);
                                        setAppliedBatchRange(batchRange);
                                        setAppliedCustomMinBatch(customMinBatch);
                                        setAppliedCustomMaxBatch(customMaxBatch);
                                        setCurrentPage(1);
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Degree Programs" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All Degree Programs</SelectItem>
                                        {degrees.map(d => (
                                            <SelectItem key={d.id} value={d.id}>
                                                {d.degreeAbbr} - {d.degreeName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="sm:col-span-1 lg:col-span-3">
                                <Select value={batchRange} onValueChange={(val) => {
                                    setBatchRange(val);
                                    let min = '';
                                    let max = '';
                                    let sBatch = searchBatch;

                                    if (val !== 'All Batches' && val !== 'Custom Range') {
                                        const currentYear = new Date();
                                        let yearsToSubtract = 0;
                                        if (val === 'Past 3') yearsToSubtract = 3;
                                        else if (val === 'Past 5') yearsToSubtract = 5;
                                        else if (val === 'Past 10') yearsToSubtract = 10;
                                        else if (val === 'Past 30') yearsToSubtract = 30;

                                        if (yearsToSubtract > 0) {
                                            max = format(currentYear, 'yyyy');
                                            min = format(subYears(currentYear, yearsToSubtract), 'yyyy');
                                            setCustomMaxBatch(max);
                                            setCustomMinBatch(min);
                                        }
                                    } else if (val === 'All Batches') {
                                        setCustomMinBatch('');
                                        setCustomMaxBatch('');
                                        setSearchBatch('');
                                        sBatch = '';
                                    }

                                    if (val !== 'Custom Range') {
                                        setAppliedSearchTerm(searchTerm);
                                        setAppliedSearchBatch(sBatch);
                                        setAppliedSearchReason(searchReason);
                                        setAppliedDegree(selectedDegree);
                                        setAppliedBatchRange(val);
                                        setAppliedCustomMinBatch(min);
                                        setAppliedCustomMaxBatch(max);
                                        setCurrentPage(1);
                                    }
                                }}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Batches" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All Batches">All Batches</SelectItem>
                                        <SelectItem value="Past 3">Past 3</SelectItem>
                                        <SelectItem value="Past 5">Past 5</SelectItem>
                                        <SelectItem value="Past 10">Past 10</SelectItem>
                                        <SelectItem value="Past 30">Past 30</SelectItem>
                                        <SelectItem value="Custom Range">Custom Range</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {batchRange === 'All Batches' ? (
                                <div className="sm:col-span-1 lg:col-span-5">
                                    <Input
                                        placeholder="Batch year..."
                                        value={searchBatch}
                                        onChange={(e) => setSearchBatch(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilters(); }}
                                    />
                                </div>
                            ) : (
                                // The earliest possible batch for Engineering is 1966.
                                // For simplicity sake, the range entered here will not be validated.
                                <div className="sm:col-span-1 lg:col-span-5 flex gap-2 items-center min-w-0">
                                    <Input
                                        placeholder="Min"
                                        type="number"
                                        value={customMinBatch}
                                        onChange={(e) => setCustomMinBatch(e.target.value)}
                                        disabled={batchRange !== 'Custom Range'}
                                        className="w-full min-w-0"
                                    />
                                    <span className="text-gray-400 shrink-0">-</span>
                                    <Input
                                        placeholder="Max"
                                        type="number"
                                        value={customMaxBatch}
                                        onChange={(e) => setCustomMaxBatch(e.target.value)}
                                        disabled={batchRange !== 'Custom Range'}
                                        className="w-full min-w-0"
                                    />
                                </div>
                            )}
                            <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2">
                                <Button variant="outline" onClick={handleClearFilters} className="w-24 border border-gray-300">Clear</Button>
                                <Button className="w-24 bg-brand-primary hover:bg-brand-primary-hover text-white" onClick={handleApplyFilters}>Submit</Button>
                            </div>
                        </div>
                    </div>

                    <TabsContent value={activeTab}>
                        <Card className="border-none shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between gap-4">
                                <div>
                                    <CardTitle>{activeTab === 'All' ? 'All Users' : `${activeTab} Users`}</CardTitle>
                                    <CardDescription>
                                        {activeTab === 'All' ? 'Manage all accounts across the platform' : `Manage ${activeTab.toLowerCase()} accounts`}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <ColumnVisibilityDropdown
                                        columns={USER_TABLE_COLUMNS}
                                        visibleColumns={visibleColumns}
                                        onToggleColumn={handleToggleColumn}
                                        onShowAll={handleShowAllColumns}
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={handleExportCSV}
                                        disabled={isExportingCsv}
                                        className="gap-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shrink-0"
                                    >
                                        <Download className="h-4 w-4" />
                                        {isExportingCsv ? 'Exporting...' : 'Export CSV'}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {renderTable()}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Edit / Status Change Modal */}
                <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit User Status: {editingUser?.name}</DialogTitle>
                            <DialogDescription>
                                Update user account status, duration, and administrative record.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                    value={editStatus}
                                    onValueChange={(val) => {
                                        setEditStatus(val);
                                        if (val === 'Suspended' && !editExpiryDate) {
                                            const defaultDate = new Date();
                                            defaultDate.setDate(defaultDate.getDate() + 7);
                                            setEditExpiryDate(defaultDate.toISOString().split('T')[0]);
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dbStatuses.map(s => (
                                            <SelectItem key={s.id} value={s.statusName}>{s.statusName}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                {editStatus === 'Suspended' && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label>
                                                Suspension Expiry Date <span className="text-red-500">*</span>
                                            </Label>
                                            {editExpiryDate && new Date(editExpiryDate).getFullYear() >= 3000 && (
                                                <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                                                    Indefinite
                                                </Badge>
                                            )}
                                        </div>
                                        <Input
                                            type="date"
                                            required
                                            value={editExpiryDate}
                                            onChange={(e) => setEditExpiryDate(e.target.value)}
                                            className={!editExpiryDate ? "border-red-300 focus-visible:ring-red-400" : ""}
                                        />
                                        {!editExpiryDate && (
                                            <p className="text-xs text-red-500 font-medium">Expiry date is required for suspending a user.</p>
                                        )}
                                        <div className="flex gap-2 pt-1 flex-wrap">
                                            <Button type="button" variant="outline" size="sm" onClick={() => setPresetDuration(3)}>3 Days</Button>
                                            <Button type="button" variant="outline" size="sm" onClick={() => setPresetDuration(7)}>1 Week</Button>
                                            <Button type="button" variant="outline" size="sm" onClick={() => setPresetDuration(30)}>1 Month</Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className={editExpiryDate && new Date(editExpiryDate).getFullYear() >= 3000 ? "bg-orange-50 border-orange-300 text-orange-700 font-semibold" : ""}
                                                onClick={setIndefiniteDuration}
                                            >
                                                Indefinite
                                            </Button>
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label>Reason / Administrative Note (Optional)</Label>
                                    <Textarea
                                        placeholder="Provide reasoning or record note..."
                                        value={editReason}
                                        onChange={(e) => setEditReason(e.target.value)}
                                        rows={3}
                                    />
                                    <p className="text-xs text-gray-500">This description will be recorded in the user status logs.</p>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
                            <Button
                                onClick={handleSaveEdit}
                                disabled={editStatus === 'Suspended' && !editExpiryDate}
                            >
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Create User Modal Component (Lazyloaded on hover) */}
                <Suspense fallback={null}>
                    {isCreateOpen && (
                        <CreateUserModal
                            isOpen={isCreateOpen}
                            onClose={() => setIsCreateOpen(false)}
                            onUserCreated={() => {
                                fetchUsersList();
                                toast.success("User created successfully");
                            }}
                            degrees={degrees}
                            dbStatuses={dbStatuses}
                        />
                    )}
                </Suspense>
            </div>
        );
    }
