import { useState, useEffect, lazy, Suspense } from 'react';
import { subYears, format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Input } from '@components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@components/ui/dialog';
import { Label } from '@components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Textarea } from '@components/ui/textarea';
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight, Search, Plus, FileText, Eye } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, type DegreeData, type UserStatusData } from '@/app/views/api';
import { formatDate } from '@/app/views/formatters';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';

const loadCreateUserModal = () => import('@components/admin/CreateUserModal').then(m => ({ default: m.CreateUserModal }));
const CreateUserModal = lazy(loadCreateUserModal);

interface User {
    id: string;
    name: string;
    email: string;
    batch: string;
    status: string;
    reason?: string;
    grantedDate?: string;
    rawGrantedDate?: number;
    expiryDate?: string;
    rawExpiryDate?: number;
}

export function AdminUsers() {
    const [itemsPerPage, setItemsPerPage] = useState(20);

    const [searchParams, setSearchParams] = useSearchParams();
    const [dbStatuses, setDbStatuses] = useState<UserStatusData[]>([]);
    const [degrees, setDegrees] = useState<DegreeData[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'All');

    // Search & Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [searchBatch, setSearchBatch] = useState('');
    const [searchReason, setSearchReason] = useState('');
    const [batchRange, setBatchRange] = useState<string>('All Batches');
    const [customMinBatch, setCustomMinBatch] = useState<string>('');
    const [customMaxBatch, setCustomMaxBatch] = useState<string>('');

    // Explicit filter state
    const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
    const [appliedSearchBatch, setAppliedSearchBatch] = useState('');
    const [appliedSearchReason, setAppliedSearchReason] = useState('');
    const [appliedBatchRange, setAppliedBatchRange] = useState<string>('All Batches');
    const [appliedCustomMinBatch, setAppliedCustomMinBatch] = useState<string>('');
    const [appliedCustomMaxBatch, setAppliedCustomMaxBatch] = useState<string>('');

    // Sorting
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // Editing
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editStatus, setEditStatus] = useState<string>('');
    const [editReason, setEditReason] = useState<string>('');
    const [editExpiryDate, setEditExpiryDate] = useState<string>('');

    // Create User Modal State
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Load initial lookup data (statuses & degrees)
    useEffect(() => {
        const fetchLookups = async () => {
            try {
                const [statusRes, degreeRes] = await Promise.all([
                    api.get('/userStatuses'),
                    api.get('/degrees')
                ]);
                const statusData = statusRes.data.data || statusRes.data || [];
                const degreeData = degreeRes.data.data || degreeRes.data || [];
                setDbStatuses(statusData);
                setDegrees(degreeData);
            } catch (err) {
                console.error("Failed to fetch lookups:", err);
            }
        };
        fetchLookups();
    }, []);

    const statuses = ['All', ...dbStatuses.map(s => s.statusName)];

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const renderSortIcon = (key: keyof User) => {
        if (sortConfig?.key !== key) return <ArrowUpDown size={14} className="text-gray-400" />;
        return sortConfig.direction === 'asc' ? <ArrowUp size={14} className="text-gray-700" /> : <ArrowDown size={14} className="text-gray-700" />;
    };

    const handleApplyFilters = () => {
        setAppliedSearchTerm(searchTerm);
        setAppliedSearchBatch(searchBatch);
        setAppliedSearchReason(searchReason);
        setAppliedBatchRange(batchRange);
        setAppliedCustomMinBatch(customMinBatch);
        setAppliedCustomMaxBatch(customMaxBatch);
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSearchBatch('');
        setSearchReason('');
        setBatchRange('All Batches');
        setCustomMinBatch('');
        setCustomMaxBatch('');
        setAppliedSearchTerm('');
        setAppliedSearchBatch('');
        setAppliedSearchReason('');
        setAppliedBatchRange('All Batches');
        setAppliedCustomMinBatch('');
        setAppliedCustomMaxBatch('');
        setCurrentPage(1);
    };

    const handleExportCSV = async () => {
        try {
            const whereClause: any = {};
            if (activeTab !== 'All') {
                whereClause.userStatus = { statusName: activeTab };
            }
            if (appliedSearchTerm) {
                whereClause.profile = { ...(whereClause.profile || {}), userName: { contains: appliedSearchTerm } };
            }

            const currentYear = new Date().getFullYear();
            let batchFilter: any = undefined;
            if (appliedBatchRange === 'Past 3') { batchFilter = { gte: currentYear - 3 }; }
            else if (appliedBatchRange === 'Past 5') { batchFilter = { gte: currentYear - 5 }; }
            else if (appliedBatchRange === 'Past 10') { batchFilter = { gte: currentYear - 10 }; }
            else if (appliedBatchRange === 'Past 30') { batchFilter = { gte: currentYear - 30 }; }
            else if (appliedBatchRange === 'Custom') {
                const min = appliedCustomMinBatch ? parseInt(appliedCustomMinBatch, 10) : undefined;
                const max = appliedCustomMaxBatch ? parseInt(appliedCustomMaxBatch, 10) : undefined;
                if (min !== undefined && max !== undefined) { batchFilter = { gte: min, lte: max }; }
                else if (min !== undefined) { batchFilter = { gte: min }; }
                else if (max !== undefined) { batchFilter = { lte: max }; }
            } else if (appliedSearchBatch) {
                batchFilter = parseInt(appliedSearchBatch, 10);
            }

            if (batchFilter !== undefined) {
                whereClause.profile = { ...(whereClause.profile || {}), batch: batchFilter };
            }

            if (appliedSearchReason) {
                whereClause.records = { some: { description: { contains: appliedSearchReason } } };
            }

            let sortStr = undefined;
            if (sortConfig) {
                let sortKey: string = sortConfig.key;
                if (sortKey === 'name') sortKey = 'profile.userName';
                else if (sortKey === 'email') sortKey = 'profile.email';
                else if (sortKey === 'batch') sortKey = 'profile.batch';
                else if (sortKey === 'status') sortKey = 'userStatus.statusName';

                sortStr = sortConfig.direction === 'desc' ? `-${sortKey}` : sortKey;
            }

            const res = await api.get('/users', {
                params: {
                    _sort: sortStr,
                    _where: Object.keys(whereClause).length > 0 ? JSON.stringify(whereClause) : undefined
                }
            });

            const data = res.data.data || res.data;

            const mapped = data.map((u: any) => {
                const currentRecord = u.records?.find((r: any) => r.id === u.currentRecordId) || u.records?.[0];
                let formattedGranted = undefined;
                let formattedExpiry = undefined;
                if (currentRecord?.dateCreated) {
                    const d = new Date(currentRecord.dateCreated);
                    if (!isNaN(d.getTime())) formattedGranted = formatDate(d, 'short');
                }
                if (currentRecord?.expirationDate) {
                    const d = new Date(currentRecord.expirationDate);
                    if (!isNaN(d.getTime())) formattedExpiry = formatDate(d, 'short');
                }

                return {
                    name: u.profile?.userName || 'Unknown',
                    email: u.profile?.email || 'Unknown',
                    batch: u.profile?.batch || 'Unknown',
                    status: u.userStatus?.statusName || 'Unknown',
                    reason: currentRecord?.description || '',
                    grantedDate: formattedGranted,
                    expiryDate: formattedExpiry
                };
            });

            const headers = ['Name', 'Email', 'Batch', 'Status', 'Granted Date', 'Expiry Date', 'Reason'];
            const csvContent = mapped.map((u: any) =>
                `"${u.name}","${u.email}","${u.batch}","${u.status}","${u.grantedDate || ''}","${u.expiryDate || ''}","${u.reason || ''}"`
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
            }
        } catch (error) {
            console.error("Failed to export CSV", error);
        }
    };

    const handleSaveEdit = async () => {
        if (!editingUser) return;

        try {
            await api.post(`/admin/users/${editingUser.id}/status`, {
                statusName: editStatus,
                reason: editReason,
                expiryDate: editStatus === 'Suspended' ? editExpiryDate : null
            });
            setEditingUser(null);
            fetchUsersList();
        } catch (err) {
            console.error("Failed to update user status:", err);
        }
    };

    const setPresetDuration = (days: number) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        setEditExpiryDate(d.toISOString().split('T')[0]);
    };

    const fetchUsersList = async () => {
        try {
            const whereClause: any = {};
            if (activeTab !== 'All') {
                whereClause.userStatus = { statusName: activeTab };
            }
            if (appliedSearchTerm) {
                whereClause.profile = { ...(whereClause.profile || {}), userName: { contains: appliedSearchTerm } };
            }

            const currentYear = new Date().getFullYear();
            let batchFilter: any = undefined;

            if (appliedBatchRange === 'Past 3') {
                batchFilter = { gte: currentYear - 3 };
            } else if (appliedBatchRange === 'Past 5') {
                batchFilter = { gte: currentYear - 5 };
            } else if (appliedBatchRange === 'Past 10') {
                batchFilter = { gte: currentYear - 10 };
            } else if (appliedBatchRange === 'Past 30') {
                batchFilter = { gte: currentYear - 30 };
            } else if (appliedBatchRange === 'Custom') {
                const min = appliedCustomMinBatch ? parseInt(appliedCustomMinBatch, 10) : undefined;
                const max = appliedCustomMaxBatch ? parseInt(appliedCustomMaxBatch, 10) : undefined;
                if (min !== undefined && max !== undefined) {
                    batchFilter = { gte: min, lte: max };
                } else if (min !== undefined) {
                    batchFilter = { gte: min };
                } else if (max !== undefined) {
                    batchFilter = { lte: max };
                }
            } else if (appliedSearchBatch) {
                batchFilter = parseInt(appliedSearchBatch, 10);
            }

            if (batchFilter !== undefined) {
                whereClause.profile = { ...(whereClause.profile || {}), batch: batchFilter };
            }

            if (appliedSearchReason) {
                whereClause.records = { some: { description: { contains: appliedSearchReason } } };
            }

            let sortStr = undefined;
            if (sortConfig) {
                let sortKey: string = sortConfig.key;
                if (sortKey === 'name') sortKey = 'profile.userName';
                else if (sortKey === 'email') sortKey = 'profile.email';
                else if (sortKey === 'batch') sortKey = 'profile.batch';
                else if (sortKey === 'status') sortKey = 'userStatus.statusName';

                sortStr = sortConfig.direction === 'desc' ? `-${sortKey}` : sortKey;
            }

            const res = await api.get('/users', {
                params: {
                    _page: currentPage,
                    _per_page: itemsPerPage,
                    _sort: sortStr,
                    _where: Object.keys(whereClause).length > 0 ? JSON.stringify(whereClause) : undefined
                }
            });

            const data = res.data.data || res.data;
            const total = res.data.items || data.length;

            const mapped = data.map((u: any) => {
                const currentRecord = u.records?.find((r: any) => r.id === u.currentRecordId) || u.records?.[0];

                let formattedGranted = undefined;
                let rawGranted = 0;
                if (currentRecord?.dateCreated) {
                    const d = new Date(currentRecord.dateCreated);
                    if (!isNaN(d.getTime())) {
                        formattedGranted = formatDate(d, 'short');
                        rawGranted = d.getTime();
                    }
                }

                let formattedExpiry = undefined;
                let rawExpiry = 0;
                if (currentRecord?.dateExpires) {
                    const d = new Date(currentRecord.dateExpires);
                    if (!isNaN(d.getTime())) {
                        formattedExpiry = formatDate(d, 'short');
                        rawExpiry = d.getTime();
                    }
                }

                return {
                    id: u.id,
                    name: u.profile?.userName || 'Unknown',
                    email: u.profile?.email || 'N/A',
                    batch: u.profile?.batch?.toString() || 'N/A',
                    status: u.userStatus?.statusName || 'Unknown',
                    reason: currentRecord?.description || undefined,
                    grantedDate: formattedGranted,
                    expiryDate: formattedExpiry,
                    rawGrantedDate: rawGranted,
                    rawExpiryDate: rawExpiry
                };
            });

            setUsers(mapped);
            setTotalUsers(total);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchUsersList();
    }, [activeTab, appliedSearchTerm, appliedSearchBatch, appliedSearchReason, appliedBatchRange, appliedCustomMinBatch, appliedCustomMaxBatch, sortConfig, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(totalUsers / itemsPerPage);
    const paginatedUsers = users;

    const onTabChange = (val: string) => {
        setActiveTab(val);
        setCurrentPage(1);
        setSearchParams({ tab: val }, { replace: true });
    };

    const openEditModal = (user: User, specificStatus?: string) => {
        setEditingUser(user);
        setEditStatus(specificStatus || user.status);
        setEditReason(user.reason || '');

        let initialExpiry = '';
        if (user.expiryDate) {
            const d = new Date(user.expiryDate);
            if (!isNaN(d.getTime())) {
                initialExpiry = d.toISOString().split('T')[0];
            }
        }
        setEditExpiryDate(initialExpiry);
    };

    const renderQuickActions = (user: User) => {
        const showRestoreUnbanActivate = ['Suspended', 'Banned', 'Deactivated'].includes(user.status);
        const showSuspend = user.status === 'Official' || user.status === 'Regular';
        const showBan = user.status === 'Official' || user.status === 'Regular' || user.status === 'Suspended';
        const showDeactivate = user.status !== 'Deactivated';

        return (
            <div className="flex justify-end gap-1">
                {showRestoreUnbanActivate && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-200 hover:text-blue-700 hover:bg-blue-200"
                        onClick={() => openEditModal(user, 'Regular')}
                    >
                        {user.status === 'Suspended' ? 'Restore' : user.status === 'Banned' ? 'Unban' : 'Activate'}
                    </Button>
                )}
                {showSuspend && (
                    <Button variant="outline" size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50" onClick={() => openEditModal(user, 'Suspended')}>Suspend</Button>
                )}
                {showBan && (
                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => openEditModal(user, 'Banned')}>Ban</Button>
                )}
                {showDeactivate && (
                    <Button variant="outline" size="sm" className="text-gray-600 border-gray-200 hover:bg-gray-100" onClick={() => openEditModal(user, 'Deactivated')}>Deactivate</Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => openEditModal(user)}>
                    <FileText className="w-4 h-4 mr-1" />
                    Edit
                </Button>
            </div>
        );
    };

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
                            Page {currentPage} of {totalPages}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="border rounded-md bg-white overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-700">
                            <tr>
                                <th className="px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('name')}>
                                    <div className="flex items-center gap-1">Name {renderSortIcon('name')}</div>
                                </th>
                                <th className="px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('email')}>
                                    <div className="flex items-center gap-1">Email {renderSortIcon('email')}</div>
                                </th>
                                <th className="px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('batch')}>
                                    <div className="flex items-center gap-1">Batch {renderSortIcon('batch')}</div>
                                </th>
                                <th className="px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('grantedDate')}>
                                    <div className="flex items-center gap-1">Granted/Expiry Date {renderSortIcon('grantedDate')}</div>
                                </th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-8 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.map((user) => (
                                <tr key={user.id} className="border-t">
                                    <td className="px-6 py-4 font-medium">
                                        <div className="flex items-center gap-2">
                                            <Link to={`/profile/${user.id}`} className="text-gray-900 hover:text-brand-primary" title="Link to Profile">
                                                <span>{user.name}</span>
                                            </Link>
                                            <Link to={`/admin/preview/user/${user.id}`} className="text-gray-400 hover:text-brand-primary" title="Preview Profile">
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">{user.batch}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.status === 'Suspended' ? (
                                            <div className="text-orange-700">Expires: {user.expiryDate || 'N/A'}</div>
                                        ) : (
                                            user.grantedDate ? formatDate(user.grantedDate, "long") : 'N/A'
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge className={
                                            user.status === 'Official' ? 'bg-blue-100 text-blue-800' :
                                                user.status === 'Regular' ? 'bg-green-100 text-green-800' :
                                                    user.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        user.status === 'Suspended' ? 'bg-orange-100 text-orange-800' :
                                                            user.status === 'Banned' ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'
                                        }>
                                            {user.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-left">
                                        {renderQuickActions(user)}
                                    </td>
                                </tr>
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
                    <TabsList className="mb-4 inline-flex min-w-full sm:min-w-0 flex-1">
                        {statuses.map(status => (
                            <TabsTrigger key={status} value={status}>
                                {status === 'All' ? 'All Users' : status}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>
                <div className="p-4 bg-white border rounded-md shadow-sm mb-6 flex flex-col gap-4">
                    <div className="text-sm font-medium text-gray-700">Filters</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 items-center">
                        <div className="col-span-2 relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search user by name..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilters(); }}
                            />
                        </div>
                        <div>
                            <Select value={batchRange} onValueChange={(val) => {
                                setBatchRange(val);
                                if (val !== 'All Batches' && val !== 'Custom Range') {
                                    const currentYear = new Date();
                                    let yearsToSubtract = 0;
                                    if (val === 'Past 3') yearsToSubtract = 3;
                                    else if (val === 'Past 5') yearsToSubtract = 5;
                                    else if (val === 'Past 10') yearsToSubtract = 10;
                                    else if (val === 'Past 30') yearsToSubtract = 30;

                                    if (yearsToSubtract > 0) {
                                        setCustomMaxBatch(format(currentYear, 'yyyy'));
                                        setCustomMinBatch(format(subYears(currentYear, yearsToSubtract), 'yyyy'));
                                    }
                                } else if (val === 'All Batches') {
                                    setCustomMinBatch('');
                                    setCustomMaxBatch('');
                                    setSearchBatch('');
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
                            <div>
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
                            <div className="flex gap-2 items-center">
                                <Input
                                    placeholder="Min"
                                    type="number"
                                    value={customMinBatch}
                                    onChange={(e) => setCustomMinBatch(e.target.value)}
                                    disabled={batchRange !== 'Custom Range'}
                                    className="w-full"
                                />
                                <span className="text-gray-400">-</span>
                                <Input
                                    placeholder="Max"
                                    type="number"
                                    value={customMaxBatch}
                                    onChange={(e) => setCustomMaxBatch(e.target.value)}
                                    disabled={batchRange !== 'Custom Range'}
                                    className="w-full"
                                />
                            </div>
                        )}
                        <div className="col-span-2 flex justify-end gap-2">
                            <Button variant="outline" onClick={handleClearFilters}>Clear</Button>
                            <Button className="bg-brand-primary hover:bg-brand-primary-hover" onClick={handleApplyFilters}>Submit</Button>
                            <Button
                                className="ml-auto bg-brand-secondary hover:bg-brand-secondary-hover hover:text-white"
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
                    </div>
                </div>

                {statuses.map(status => (
                    <TabsContent key={status} value={status}>
                        <Card className="border-none shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>{status === 'All' ? 'All Users' : `${status} Users`}</CardTitle>
                                    <CardDescription>
                                        {status === 'All' ? 'Manage all accounts across the platform' : `Manage ${status.toLowerCase()} accounts`}
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

            {/* Edit / Status Change Modal */}
            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User Status: {editingUser?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={editStatus} onValueChange={setEditStatus}>
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

                        {(editStatus === 'Suspended' || editStatus === 'Banned' || editStatus === 'Deactivated' || editStatus === 'Regular') && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                {editStatus === 'Suspended' && (
                                    <div className="space-y-2">
                                        <Label>Suspension Expiry Date</Label>
                                        <Input
                                            type="date"
                                            value={editExpiryDate}
                                            onChange={(e) => setEditExpiryDate(e.target.value)}
                                        />
                                        <div className="flex gap-2 pt-1">
                                            <Button type="button" variant="outline" size="sm" onClick={() => setPresetDuration(3)}>3 Days</Button>
                                            <Button type="button" variant="outline" size="sm" onClick={() => setPresetDuration(7)}>1 Week</Button>
                                            <Button type="button" variant="outline" size="sm" onClick={() => setPresetDuration(30)}>1 Month</Button>
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
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
                        <Button onClick={handleSaveEdit}>Save Changes</Button>
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
