import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Input } from '@components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@components/ui/dialog';
import { Label } from '@components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Textarea } from '@components/ui/textarea';
import { ArrowUp, ArrowDown, ArrowUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { adminUsersMock } from '@assets/adminMockData';

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
    const statuses = ['All', 'Pending', 'Official', 'Regular', 'Suspended', 'Banned'];
    const ITEMS_PER_PAGE = 20;

    const [searchParams, setSearchParams] = useSearchParams();
    const [users, setUsers] = useState<User[]>(adminUsersMock as User[]);
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'All');

    // Search & Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [searchBatch, setSearchBatch] = useState('');

    // Explicit filter state
    const [appliedSearchTerm, setAppliedSearchTerm] = useState('');
    const [appliedSearchBatch, setAppliedSearchBatch] = useState('');

    // Sorting
    const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'asc' | 'desc' } | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);

    // Editing
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editStatus, setEditStatus] = useState<string>('');
    const [editReason, setEditReason] = useState<string>('');
    const [editExpiryDate, setEditExpiryDate] = useState<string>('');

    const handleSort = (key: keyof User) => {
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
        setCurrentPage(1);
    };

    const handleClearFilters = () => {
        setSearchTerm('');
        setSearchBatch('');
        setAppliedSearchTerm('');
        setAppliedSearchBatch('');
        setCurrentPage(1);
    };

    const handleExportCSV = () => {
        const headers = ['Name', 'Email', 'Batch', 'Status', 'Granted Date', 'Expiry Date', 'Reason'];
        const csvContent = filteredUsers.map(u =>
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
    };

    const handleSaveEdit = () => {
        if (!editingUser) return;
        setUsers(users.map(u => {
            if (u.id === editingUser.id) {
                const now = new Date();
                const formattedGranted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                let rawExpiryDateObj = undefined;
                if (editStatus === 'Suspended' && editExpiryDate) {
                    const d = new Date(editExpiryDate);
                    if (!isNaN(d.getTime())) rawExpiryDateObj = d.getTime();
                }

                return {
                    ...u,
                    status: editStatus,
                    reason: (editStatus === 'Suspended' || editStatus === 'Banned') ? editReason : undefined,
                    expiryDate: editStatus === 'Suspended' ? editExpiryDate : undefined,
                    rawExpiryDate: rawExpiryDateObj,
                    grantedDate: formattedGranted,
                    rawGrantedDate: now.getTime(),
                };
            }
            return u;
        }));
        setEditingUser(null);
    };

    const filteredUsers = useMemo(() => {
        let result = users;

        if (activeTab !== 'All') {
            result = result.filter(u => u.status === activeTab);
        }

        if (appliedSearchTerm) {
            result = result.filter(u => u.name.toLowerCase().includes(appliedSearchTerm.toLowerCase()));
        }
        if (appliedSearchBatch) {
            result = result.filter(u => u.batch.includes(appliedSearchBatch));
        }

        if (sortConfig) {
            result.sort((a, b) => {
                if (sortConfig.key === 'grantedDate') {
                    const valA = a.status === 'Suspended' && a.rawExpiryDate ? a.rawExpiryDate : (a.rawGrantedDate || 0);
                    const valB = b.status === 'Suspended' && b.rawExpiryDate ? b.rawExpiryDate : (b.rawGrantedDate || 0);
                    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                    return 0;
                }
                if (sortConfig.key === 'status') {
                    const statusOrder: Record<string, number> = {
                        'Official': 1,
                        'Regular': 2,
                        'Pending': 3,
                        'Suspended': 4,
                        'Banned': 5
                    };
                    const valA = statusOrder[a.status] || 99;
                    const valB = statusOrder[b.status] || 99;
                    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                    return 0;
                }
                const valA = a[sortConfig.key] || '';
                const valB = b[sortConfig.key] || '';
                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [users, activeTab, appliedSearchTerm, appliedSearchBatch, sortConfig]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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

    const renderTable = () => {
        if (filteredUsers.length === 0) {
            return (
                <div className="py-8 text-center border rounded-md border-dashed text-gray-500">
                    No users found for this category or search criteria.
                </div>
            );
        }

        return (
            <div className="space-y-4">
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
                                <th className="px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('status')}>
                                    <div className="flex items-center gap-1">Status {renderSortIcon('status')}</div>
                                </th>
                                <th className="px-6 py-3 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('grantedDate')}>
                                    <div className="flex items-center gap-1">Granted/Expiry Date {renderSortIcon('grantedDate')}</div>
                                </th>
                                {(activeTab === 'All' || activeTab === 'Suspended' || activeTab === 'Banned') && (
                                    <th className="px-6 py-3">Reason</th>
                                )}
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.map((user) => (
                                <tr key={user.id} className="border-t">
                                    <td className="px-6 py-4 font-medium">{user.name}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">{user.batch}</td>
                                    <td className="px-6 py-4">
                                        <Badge className={
                                            user.status === 'Official' ? 'bg-blue-100 text-blue-800' :
                                                user.status === 'Regular' ? 'bg-green-100 text-green-800' :
                                                    user.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        user.status === 'Suspended' ? 'bg-orange-100 text-orange-800' :
                                                            'bg-red-100 text-red-800'
                                        }>
                                            {user.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.status === 'Suspended' ? (
                                            <div className="text-orange-700">Expires: {user.expiryDate || 'N/A'}</div>
                                        ) : (
                                            user.grantedDate ? `Granted: ${user.grantedDate}` : 'N/A'
                                        )}
                                    </td>
                                    {(activeTab === 'All' || activeTab === 'Suspended' || activeTab === 'Banned') && (
                                        <td className="px-6 py-4">
                                            <span className="text-gray-500 line-clamp-1 max-w-[150px]" title={user.reason}>{user.reason || '-'}</span>
                                        </td>
                                    )}
                                    <td className="px-6 py-4 text-right">
                                        {user.status !== 'Pending' && (
                                            <div className="flex justify-end gap-2">
                                                {user.status === 'Regular' && activeTab !== 'All' && (
                                                    <>
                                                        <Button variant="outline" size="sm" className="text-brand-primary border-orange-200 hover:bg-orange-50" onClick={() => openEditModal(user, 'Suspended')}>Suspend</Button>
                                                        <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => openEditModal(user, 'Banned')}>Ban</Button>
                                                    </>
                                                )}
                                                <Button variant="ghost" size="sm" onClick={() => openEditModal(user)}>Edit</Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} of {filteredUsers.length} users
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
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">User Management</h1>
                <p className="text-gray-500">Manage roles, and monitor user statuses.</p>
            </div>

            <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
                <div className="overflow-x-auto pb-2 flex justify-between items-center gap-4">
                    <TabsList className="mb-4 inline-flex min-w-full sm:min-w-0 flex-1">
                        <TabsTrigger value="All">All Users</TabsTrigger>
                        <TabsTrigger value="Official">Official Accounts</TabsTrigger>
                        <TabsTrigger value="Regular">Regular Users</TabsTrigger>
                        <TabsTrigger value="Pending">Pending</TabsTrigger>
                        <TabsTrigger value="Suspended">Suspended Users</TabsTrigger>
                        <TabsTrigger value="Banned">Banned Users</TabsTrigger>
                    </TabsList>
                </div>

                <div className="p-4 bg-white border rounded-md shadow-sm mb-6 flex flex-col gap-4">
                    <div className="text-sm font-medium text-gray-700">Filters</div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Search user by name..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilters(); }}
                            />
                        </div>
                        <div className="w-full sm:w-48">
                            <Input
                                placeholder="Filter by batch..."
                                value={searchBatch}
                                onChange={(e) => setSearchBatch(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilters(); }}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={handleClearFilters}>Clear</Button>
                            <Button className="bg-brand-primary hover:bg-brand-primary-hover" onClick={handleApplyFilters}>Submit</Button>
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

            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User: {editingUser?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={editStatus} onValueChange={setEditStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.filter(s => s !== 'All' && s !== 'Pending').map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        {(editStatus === 'Suspended' || editStatus === 'Banned') && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                {editStatus === 'Suspended' && (
                                    <div className="space-y-2">
                                        <Label>Suspension Expiry Date</Label>
                                        <Input
                                            type="date"
                                            value={editExpiryDate}
                                            onChange={(e) => setEditExpiryDate(e.target.value)}
                                        />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label>Reason for {editStatus === 'Suspended' ? 'Suspension' : 'Ban'} (Optional)</Label>
                                    <Textarea
                                        placeholder="Provide a reasoning to the user..."
                                        value={editReason}
                                        onChange={(e) => setEditReason(e.target.value)}
                                        rows={4}
                                    />
                                    <p className="text-xs text-gray-500">This reason will be visible to the user.</p>
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
        </div>
    );
}
