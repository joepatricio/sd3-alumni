import React, { useState, useMemo } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger
} from '@components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@components/ui/select';
import { Link } from 'react-router-dom';
import {
    Users,
    CheckCircle2,
    XCircle,
    Search,
    Globe,
    UserCheck,
    Lock,
    RotateCcw
} from 'lucide-react';

export interface FullGuestItem {
    id: string;
    userId: string;
    isAttending: boolean;
    isValid?: boolean | null;
    user?: {
        id?: string;
        userStatus?: { statusName?: string };
        profileStatus?: { statusName?: string };
        profile?: {
            userName?: string;
            profileImage?: string;
            currentJob?: string;
            company?: string;
            batch?: number;
            birthday?: string | null;
            degree?: { degreeAbbr?: string; degreeName?: string };
        };
    } | null;
}

export interface FullGuestListModalProps {
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
    guestList: FullGuestItem[];
    currentUserId?: string | null;
    friendIds?: Set<string>;
    eventTitle?: string;
}

export function getDemographicCohort(birthday?: string | null): string {
    if (!birthday) return 'Unspecified';
    const d = new Date(birthday);
    if (isNaN(d.getTime())) return 'Unspecified';
    const yr = d.getFullYear();
    if (yr <= 1964) return 'Baby Boomers (Pre-1964)';
    if (yr <= 1980) return 'Gen X (1965-1980)';
    if (yr <= 1996) return 'Millennials (1981-1996)';
    return 'Gen Z (1997 Beyond)';
}

export const DEMOGRAPHIC_OPTIONS = [
    'Baby Boomers (Pre-1964)',
    'Gen X (1965-1980)',
    'Millennials (1981-1996)',
    'Gen Z (1997 Beyond)',
    'Unspecified'
] as const;

export const PRIVACY_OPTIONS = [
    'Public',
    'Connections Only',
    'Private'
] as const;

export function FullGuestListModal({
    isOpen,
    onOpenChange,
    trigger,
    guestList,
    currentUserId,
    friendIds,
    eventTitle
}: FullGuestListModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTab, setFilterTab] = useState<'all' | 'going' | 'not_going'>('all');
    const [selectedDegree, setSelectedDegree] = useState<string>('all');
    const [selectedDemographic, setSelectedDemographic] = useState<string>('all');
    const [selectedPrivacy, setSelectedPrivacy] = useState<string>('all');

    // Counts across all recorded responses
    const goingCount = useMemo(() => guestList.filter(g => Boolean(g.isAttending)).length, [guestList]);
    const notGoingCount = useMemo(() => guestList.filter(g => !g.isAttending).length, [guestList]);

    // Available Degree Programs in this event's guest list
    const availableDegrees = useMemo(() => {
        const set = new Set<string>();
        guestList.forEach(item => {
            const deg = item.user?.profile?.degree?.degreeAbbr || item.user?.profile?.degree?.degreeName;
            if (deg) set.add(deg);
        });
        return Array.from(set).sort();
    }, [guestList]);

    const hasActiveFilters = selectedDegree !== 'all' || selectedDemographic !== 'all' || selectedPrivacy !== 'all' || searchTerm.trim() !== '' || filterTab !== 'all';

    const handleResetFilters = () => {
        setSelectedDegree('all');
        setSelectedDemographic('all');
        setSelectedPrivacy('all');
        setSearchTerm('');
        setFilterTab('all');
    };

    // Filtered list applying RSVP tab, Degree, Demographics, Privacy, and Search
    const filteredGuests = useMemo(() => {
        return guestList.filter(item => {
            // 1. RSVP tab filter
            if (filterTab === 'going' && !item.isAttending) return false;
            if (filterTab === 'not_going' && item.isAttending) return false;

            // 2. Degree Program filter
            if (selectedDegree !== 'all') {
                const deg = item.user?.profile?.degree?.degreeAbbr || item.user?.profile?.degree?.degreeName || 'Other';
                if (deg !== selectedDegree) return false;
            }

            // 3. Demographics filter
            if (selectedDemographic !== 'all') {
                const cohort = getDemographicCohort(item.user?.profile?.birthday);
                if (cohort !== selectedDemographic) return false;
            }

            // 4. Profile Privacy filter
            if (selectedPrivacy !== 'all') {
                const privacy = item.user?.profileStatus?.statusName || 'Unspecified';
                if (privacy !== selectedPrivacy) return false;
            }

            // 5. Keyword search filter
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const name = item.user?.profile?.userName?.toLowerCase() || '';
                const degree = item.user?.profile?.degree?.degreeAbbr?.toLowerCase() || item.user?.profile?.degree?.degreeName?.toLowerCase() || '';
                const job = item.user?.profile?.currentJob?.toLowerCase() || '';
                const company = item.user?.profile?.company?.toLowerCase() || '';
                if (!name.includes(term) && !degree.includes(term) && !job.includes(term) && !company.includes(term)) {
                    return false;
                }
            }

            return true;
        });
    }, [guestList, filterTab, selectedDegree, selectedDemographic, selectedPrivacy, searchTerm]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-2xl max-h-[88vh] flex flex-col p-0 overflow-hidden bg-white">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100 space-y-3">
                    <div>
                        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                            <Users className="w-5 h-5 text-brand-primary" />
                            Guest List &amp; RSVP Responses
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-500 mt-1">
                            Complete responses for &ldquo;{eventTitle || 'this event'}&rdquo; ({goingCount} Going, {notGoingCount} Not Going).
                        </DialogDescription>
                    </div>

                    {/* RSVP Response Tabs */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <Button
                            size="sm"
                            variant={filterTab === 'all' ? 'default' : 'outline'}
                            onClick={() => setFilterTab('all')}
                            className={`text-xs h-8 ${filterTab === 'all' ? 'bg-brand-primary hover:bg-brand-primary-hover text-white' : 'text-gray-700'}`}
                        >
                            All Responses ({guestList.length})
                        </Button>
                        <Button
                            size="sm"
                            variant={filterTab === 'going' ? 'default' : 'outline'}
                            onClick={() => setFilterTab('going')}
                            className={`text-xs h-8 gap-1.5 ${filterTab === 'going' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'text-emerald-700 hover:text-emerald-800'}`}
                        >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Going ({goingCount})
                        </Button>
                        <Button
                            size="sm"
                            variant={filterTab === 'not_going' ? 'default' : 'outline'}
                            onClick={() => setFilterTab('not_going')}
                            className={`text-xs h-8 gap-1.5 ${filterTab === 'not_going' ? 'bg-gray-700 hover:bg-gray-800 text-white' : 'text-gray-700'}`}
                        >
                            <XCircle className="w-3.5 h-3.5" />
                            Not Going ({notGoingCount})
                        </Button>
                    </div>

                    {/* Filter controls row: Degree, Demographics, Profile Privacy */}
                    <div className="space-y-2 pt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {/* Degree Program Filter */}
                            <div>
                                <Select value={selectedDegree} onValueChange={setSelectedDegree}>
                                    <SelectTrigger className="h-8 text-xs bg-gray-50/70 border-gray-200">
                                        <SelectValue placeholder="Degree Program" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Degrees</SelectItem>
                                        {availableDegrees.map(deg => (
                                            <SelectItem key={deg} value={deg}>{deg}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Demographics Filter */}
                            <div>
                                <Select value={selectedDemographic} onValueChange={setSelectedDemographic}>
                                    <SelectTrigger className="h-8 text-xs bg-gray-50/70 border-gray-200">
                                        <SelectValue placeholder="Demographics" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Demographics</SelectItem>
                                        {DEMOGRAPHIC_OPTIONS.map(opt => (
                                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Profile Privacy Filter */}
                            <div>
                                <Select value={selectedPrivacy} onValueChange={setSelectedPrivacy}>
                                    <SelectTrigger className="h-8 text-xs bg-gray-50/70 border-gray-200">
                                        <SelectValue placeholder="Profile Privacy" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Privacy</SelectItem>
                                        {PRIVACY_OPTIONS.map(opt => (
                                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Search bar + Reset Filters */}
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                                <Input
                                    placeholder="Search by name, degree, job, or company..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 h-9 text-xs bg-gray-50/50 border-gray-200"
                                />
                            </div>
                            {hasActiveFilters && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleResetFilters}
                                    className="h-9 px-2.5 text-xs text-brand-primary hover:text-brand-primary-hover hover:bg-brand-primary/10 gap-1 shrink-0"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    Reset
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                {/* Responses List Body */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                    {filteredGuests.length > 0 ? (
                        filteredGuests.map((guest) => {
                            const profile = guest.user?.profile;
                            const userId = guest.userId || guest.user?.id || '';
                            const userName = profile?.userName || 'Anonymous Alumnus';
                            const degreeAbbr = profile?.degree?.degreeAbbr || profile?.degree?.degreeName;
                            const batch = profile?.batch;
                            const job = profile?.currentJob;
                            const company = profile?.company;
                            const statusName = guest.user?.profileStatus?.statusName;
                            const cohort = getDemographicCohort(profile?.birthday);

                            const isFriend = Boolean(currentUserId && friendIds?.has(String(userId)));
                            const isSelf = Boolean(currentUserId && String(userId) === String(currentUserId));

                            return (
                                <div
                                    key={guest.id}
                                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50/60 transition-colors gap-3"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar className="w-10 h-10 border border-gray-200 shrink-0">
                                            <AvatarImage src={profile?.profileImage} alt={userName} className="object-cover" />
                                            <AvatarFallback className="bg-brand-primary/10 text-brand-primary font-bold text-sm">
                                                {userName.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Link
                                                    to={`/profile/${userId}`}
                                                    className="font-semibold text-gray-900 hover:text-brand-primary text-sm transition-colors truncate"
                                                >
                                                    {userName}
                                                </Link>
                                                {isSelf && (
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                                        You
                                                    </span>
                                                )}
                                                {isFriend && !isSelf && (
                                                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                                                        <UserCheck size={10} /> Friend
                                                    </span>
                                                )}
                                            </div>

                                            <div className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap mt-0.5">
                                                {degreeAbbr && (
                                                    <span className="font-medium text-gray-700">
                                                        {degreeAbbr} {batch ? `'${String(batch).slice(-2)}` : ''}
                                                    </span>
                                                )}
                                                {(job || company) && (
                                                    <>
                                                        <span className="text-gray-300">&bull;</span>
                                                        <span className="truncate">
                                                            {[job, company].filter(Boolean).join(' at ')}
                                                        </span>
                                                    </>
                                                )}
                                            </div>

                                            {/* Demographics & Privacy tags */}
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                {cohort !== 'Unspecified' && (
                                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                                                        {cohort}
                                                    </span>
                                                )}
                                                {statusName && (
                                                    <span className="text-[10px] text-gray-500 font-medium inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200">
                                                        {statusName === 'Public' && <Globe size={10} className="text-emerald-600" />}
                                                        {statusName === 'Connections Only' && <Users size={10} className="text-blue-600" />}
                                                        {statusName === 'Private' && <Lock size={10} className="text-gray-500" />}
                                                        {statusName}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* RSVP Status Badge */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        {guest.isAttending ? (
                                            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs gap-1 font-semibold">
                                                <CheckCircle2 size={12} /> Going
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border border-gray-200 text-xs gap-1 font-semibold">
                                                <XCircle size={12} /> Not Going
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-10 px-4">
                            <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-700">No responses match your criteria</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Try adjusting your search or filters to see more results.
                            </p>
                            {hasActiveFilters && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleResetFilters}
                                    className="mt-3 text-xs"
                                >
                                    Clear all filters
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer summary */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>
                        Showing {filteredGuests.length} of {guestList.length} total responses
                    </span>
                    {hasActiveFilters && (
                        <span className="text-[11px] text-brand-primary font-medium">
                            Filters applied
                        </span>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

