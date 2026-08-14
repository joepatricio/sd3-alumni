import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@components/ui/dialog';
import { Button } from '@components/ui/button';
import { Label } from '@components/ui/label';
import { Input } from '@components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import { Textarea } from '@components/ui/textarea';
import { api, type DegreeData, type UserStatusData } from '@/app/views/api';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUserCreated: () => void;
    degrees: DegreeData[];
    dbStatuses: UserStatusData[];
}

export function CreateUserModal({
    isOpen,
    onClose,
    onUserCreated,
    degrees,
    dbStatuses
}: CreateUserModalProps) {
    const [createName, setCreateName] = useState('');
    const [createEmail, setCreateEmail] = useState('');
    const [createPassword, setCreatePassword] = useState('');
    const [createBatch, setCreateBatch] = useState('');
    const [createDegreeId, setCreateDegreeId] = useState('');
    const [createGender, setCreateGender] = useState('');
    const [createStatusId, setCreateStatusId] = useState('');
    const [createReason, setCreateReason] = useState('');
    const [createError, setCreateError] = useState('');

    useEffect(() => {
        if (degrees.length > 0 && !createDegreeId) {
            setCreateDegreeId(degrees[0].id);
        }
    }, [degrees, createDegreeId]);

    useEffect(() => {
        if (dbStatuses.length > 0 && !createStatusId) {
            const regularStatus = dbStatuses.find(s => s.statusName === 'Regular');
            if (regularStatus) {
                setCreateStatusId(regularStatus.id);
            } else {
                setCreateStatusId(dbStatuses[0].id);
            }
        }
    }, [dbStatuses, createStatusId]);

    const resetForm = () => {
        setCreateName('');
        setCreateEmail('');
        setCreatePassword('');
        setCreateBatch('');
        setCreateGender('');
        setCreateReason('');
        setCreateError('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleCreateUser = async () => {
        setCreateError('');
        if (!createName || !createEmail || !createPassword || !createDegreeId) {
            setCreateError('Please fill in all required fields (Name, Email, Password, Degree).');
            return;
        }

        try {
            await api.post('/admin/users', {
                fullName: createName,
                email: createEmail,
                password: createPassword,
                batch: createBatch,
                degreeId: createDegreeId,
                gender: createGender === 'Other' ? '' : createGender,
                userStatusId: createStatusId,
                reason: createReason
            });

            resetForm();
            onUserCreated();
            onClose();
        } catch (err: any) {
            console.error(err);
            setCreateError(err.response?.data?.error || 'Failed to create user.');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-2 text-sm">
                    {createError && (
                        <div className="p-2 text-xs bg-red-50 border border-red-200 text-red-700 rounded-md">
                            {createError}
                        </div>
                    )}
                    <div className="space-y-1">
                        <Label>Full Name *</Label>
                        <Input
                            placeholder="e.g. John Doe"
                            value={createName}
                            onChange={(e) => setCreateName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Email *</Label>
                        <Input
                            type="email"
                            placeholder="e.g. john@example.com"
                            value={createEmail}
                            onChange={(e) => setCreateEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label>Password *</Label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={createPassword}
                            onChange={(e) => setCreatePassword(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <Label>Batch</Label>
                            <Input
                                placeholder="e.g. 2023"
                                value={createBatch}
                                onChange={(e) => setCreateBatch(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Gender</Label>
                            <Select value={createGender} onValueChange={setCreateGender}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label>Degree Program *</Label>
                        <Select value={createDegreeId} onValueChange={setCreateDegreeId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select degree" />
                            </SelectTrigger>
                            <SelectContent>
                                {degrees.map(d => (
                                    <SelectItem key={d.id} value={d.id}>{d.degreeAbbr} - {d.degreeName}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label>Initial Status</Label>
                        <Select value={createStatusId} onValueChange={setCreateStatusId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select initial status" />
                            </SelectTrigger>
                            <SelectContent>
                                {dbStatuses.map(s => (
                                    <SelectItem key={s.id} value={s.id}>{s.statusName}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label>Initial Reason / Record Note</Label>
                        <Textarea
                            placeholder="Optional note for user creation..."
                            value={createReason}
                            onChange={(e) => setCreateReason(e.target.value)}
                            rows={2}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleCreateUser} className="bg-brand-primary hover:bg-brand-primary-hover">Create User</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
