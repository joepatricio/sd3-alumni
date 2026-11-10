import React, { useState, useMemo, useEffect, useRef } from 'react';
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
import { Link } from 'react-router-dom';
import {
    Users,
    Search,
    UserCheck,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

export interface PublicGuestItem {
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

export interface PublicGuestListModalProps {
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
    guestList: PublicGuestItem[];
    currentUserId?: string | null;
    friendIds?: Set<string>;
    eventTitle?: string;
}

const MODAL_PAGE_SIZE = 20;

export function PublicGuestListModal({
    isOpen,
    onOpenChange,
    trigger,
    guestList,
    currentUserId,
    friendIds,
    eventTitle
}: PublicGuestListModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const listRef = useRef<HTMLDivElement>(null);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    // Public list: confirmed attendees only + visibility rules
    // (Public profiles OR connections who aren't Private OR current user)
    const visibleGuests = useMemo(() => {
        const confirmedAttendees = guestList.filter(rsvp => {
            if (!rsvp.isAttending) return false;

            const statusName = rsvp.user?.profileStatus?.statusName;
            const isPublic = statusName === 'Public';
            const targetId = String(rsvp.userId || rsvp.user?.id || '');
            const isFriend = Boolean(currentUserId && friendIds?.has(targetId));
            const isSelf = Boolean(currentUserId && targetId === String(currentUserId));
            const isNotPrivate = statusName !== 'Private';

            return isPublic || (isFriend && isNotPrivate) || isSelf;
        });

        if (!searchTerm.trim()) return confirmedAttendees;

        const term = searchTerm.toLowerCase();
        return confirmedAttendees.filter(item => {
            const name = item.user?.profile?.userName?.toLowerCase() || '';
            const degree = item.user?.profile?.degree?.degreeAbbr?.toLowerCase() || item.user?.profile?.degree?.degreeName?.toLowerCase() || '';
            const job = item.user?.profile?.currentJob?.toLowerCase() || '';
            const company = item.user?.profile?.company?.toLowerCase() || '';
            return name.includes(term) || degree.includes(term) || job.includes(term) || company.includes(term);
        });
    }, [guestList, currentUserId, friendIds, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(visibleGuests.length / MODAL_PAGE_SIZE));

    // Clamp current page when visibleGuests length changes
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setSearchTerm('');
            setCurrentPage(1);
        }
        onOpenChange?.(open);
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const startIndex = (currentPage - 1) * MODAL_PAGE_SIZE;
    const paginatedGuests = useMemo(() => {
        return visibleGuests.slice(startIndex, startIndex + MODAL_PAGE_SIZE);
    }, [visibleGuests, startIndex]);

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-white">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-100">
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                        <Users className="w-5 h-5 text-brand-primary" />
                        Event Guest List
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-500">
                        Confirmed alumni attendees for &ldquo;{eventTitle || 'this event'}&rdquo;.
                    </DialogDescription>

                    {/* Search bar */}
                    <div className="relative pt-2">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-5" />
                        <Input
                            placeholder="Search attendees by name, degree, or job..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="pl-9 h-9 text-sm bg-gray-50/50 border-gray-200"
                        />
                    </div>
                </DialogHeader>

                {/* Attendees list */}
                <div ref={listRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                    {visibleGuests.length > 0 ? (
                        paginatedGuests.map((guest) => {
                            const profile = guest.user?.profile;
                            const userId = guest.userId || guest.user?.id || '';
                            const userName = profile?.userName || 'Anonymous Alumnus';
                            const degreeAbbr = profile?.degree?.degreeAbbr || profile?.degree?.degreeName;
                            const batch = profile?.batch;
                            const job = profile?.currentJob;
                            const company = profile?.company;

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

                                            <div className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap">
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
                                        </div>
                                    </div>

                                    {/* Attending Badge */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                                            Attending
                                        </Badge>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-10 px-4">
                            <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-700">No attendees to display</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {searchTerm
                                    ? 'No matching alumni found for your search.'
                                    : 'Confirmed attendees will appear here based on privacy settings.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer summary and pagination */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3 text-xs text-gray-500">
                    <div className="min-w-0">
                        <span className="font-medium text-gray-700">
                            {visibleGuests.length > 0
                                ? `Showing ${startIndex + 1}–${Math.min(startIndex + MODAL_PAGE_SIZE, visibleGuests.length)} of ${visibleGuests.length}`
                                : 'Showing 0 attendees'}
                        </span>
                        <span className="hidden sm:inline text-gray-400 ml-2 italic text-[11px]">
                            (Visible profiles only)
                        </span>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center gap-1.5 shrink-0">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="h-7 px-2 text-xs text-gray-700 hover:text-brand-primary"
                                aria-label="Previous page"
                            >
                                <ChevronLeft className="w-3.5 h-3.5 sm:mr-1" />
                                <span className="hidden sm:inline">Prev</span>
                            </Button>
                            <span className="text-xs font-semibold px-1 text-gray-800">
                                {currentPage} / {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage >= totalPages}
                                className="h-7 px-2 text-xs text-gray-700 hover:text-brand-primary"
                                aria-label="Next page"
                            >
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRight className="w-3.5 h-3.5 sm:ml-1" />
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
