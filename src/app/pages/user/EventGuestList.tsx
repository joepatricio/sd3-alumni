import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { api, unwrapListResponse, type EventData } from '@/app/views/api';
import { useAuth } from '@/app/views/auth';
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
import {
    Users,
    CheckCircle2,
    XCircle,
    Search,
    Globe,
    UserCheck,
    Lock,
    RotateCcw,
    Download,
    ArrowLeft,
    Calendar,
    Clock,
    MapPin,
    Mail,
    Phone,
    Loader2,
    ShieldAlert,
    GraduationCap,
    Briefcase,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { formatDate } from '@/app/views/formatters';

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
            email?: string | null;
            phone?: string | null;
            location?: string | null;
            degree?: { degreeAbbr?: string; degreeName?: string };
        };
    } | null;
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

export function EventGuestList() {
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const { session } = useAuth();

    const [eventData, setEventData] = useState<EventData | null>(null);
    const [friendIds, setFriendIds] = useState<Set<string>>(new Set());
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    // Filters state
    const [searchTerm, setSearchTerm] = useState('');
    const [filterTab, setFilterTab] = useState<'all' | 'going' | 'not_going'>('all');
    const [selectedDegree, setSelectedDegree] = useState<string>('all');
    const [selectedDemographic, setSelectedDemographic] = useState<string>('all');
    const [selectedPrivacy, setSelectedPrivacy] = useState<string>('all');

    useEffect(() => {
        let isMounted = true;
        const fetchInitialData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const [eventRes, adminRes] = await Promise.all([
                    api.get(`/events/${id}`),
                    api.get('/auth/admin/me').catch(() => null)
                ]);

                if (!isMounted) return;

                if (adminRes && adminRes.data?.admin) {
                    setIsAdmin(true);
                }

                setEventData(eventRes.data);
            } catch (err) {
                console.error('Failed to load event attendee data:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchInitialData();
        return () => {
            isMounted = false;
        };
    }, [id, location.pathname]);

    // Fetch friend connections for privacy check
    useEffect(() => {
        if (!session?.userId) {
            setFriendIds(new Set());
            return;
        }

        const fetchFriends = async () => {
            try {
                const [res1, res2] = await Promise.all([
                    api.get('/userConnections', { params: { 'userId': session.userId, 'status.connectionName': 'Accepted' } }).catch(() => ({ data: [] })),
                    api.get('/userConnections', { params: { 'friendId': session.userId, 'status.connectionName': 'Accepted' } }).catch(() => ({ data: [] }))
                ]);
                const c1 = unwrapListResponse<{ userId?: string; friendId?: string }>(res1).items;
                const c2 = unwrapListResponse<{ userId?: string; friendId?: string }>(res2).items;
                const set = new Set<string>();
                c1.forEach((c: { userId?: string; friendId?: string }) => {
                    if (c.friendId && String(c.friendId) !== String(session.userId)) set.add(String(c.friendId));
                });
                c2.forEach((c: { userId?: string; friendId?: string }) => {
                    if (c.userId && String(c.userId) !== String(session.userId)) set.add(String(c.userId));
                });
                setFriendIds(set);
            } catch (err) {
                console.error('Failed to load user connections:', err);
            }
        };

        fetchFriends();
    }, [session?.userId]);

    const enrichedGuestList: FullGuestItem[] = useMemo(() => {
        return (eventData?.userRsvps || []) as FullGuestItem[];
    }, [eventData?.userRsvps]);

    const isAuthor = Boolean(session?.userId && eventData?.authorId && String(session.userId) === String(eventData.authorId));
    const isAuthorized = isAuthor || isAdmin;

    // Available Degree Programs
    const availableDegrees = useMemo(() => {
        const set = new Set<string>();
        enrichedGuestList.forEach(item => {
            const deg = item.user?.profile?.degree?.degreeAbbr || item.user?.profile?.degree?.degreeName;
            if (deg) set.add(deg);
        });
        return Array.from(set).sort();
    }, [enrichedGuestList]);

    // Counts
    const goingCount = useMemo(() => enrichedGuestList.filter(g => Boolean(g.isAttending)).length, [enrichedGuestList]);
    const notGoingCount = useMemo(() => enrichedGuestList.filter(g => !g.isAttending).length, [enrichedGuestList]);

    const hasActiveFilters =
        selectedDegree !== 'all' ||
        selectedDemographic !== 'all' ||
        selectedPrivacy !== 'all' ||
        searchTerm.trim() !== '' ||
        filterTab !== 'all';

    const handleResetFilters = () => {
        setSelectedDegree('all');
        setSelectedDemographic('all');
        setSelectedPrivacy('all');
        setSearchTerm('');
        setFilterTab('all');
        setCurrentPage(1);
    };

    // Filtered list applying RSVP tab, Degree, Demographics, Privacy, and Search (name, job, company, contact info)
    const filteredGuests = useMemo(() => {
        return enrichedGuestList.filter(item => {
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

            // 5. Keyword search filter (Name, Job, Company, and Contact info: Email, Phone, Location)
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const name = item.user?.profile?.userName?.toLowerCase() || '';
                const job = item.user?.profile?.currentJob?.toLowerCase() || '';
                const company = item.user?.profile?.company?.toLowerCase() || '';
                const email = item.user?.profile?.email?.toLowerCase() || '';
                const phone = item.user?.profile?.phone?.toLowerCase() || '';
                const locationStr = item.user?.profile?.location?.toLowerCase() || '';

                if (
                    !name.includes(term) &&
                    !job.includes(term) &&
                    !company.includes(term) &&
                    !email.includes(term) &&
                    !phone.includes(term) &&
                    !locationStr.includes(term)
                ) {
                    return false;
                }
            }

            return true;
        });
    }, [enrichedGuestList, filterTab, selectedDegree, selectedDemographic, selectedPrivacy, searchTerm]);

    // CSV Exporter
    const handleExportCSV = () => {
        if (!filteredGuests.length) return;

        const headers = [
            'Full Name',
            'RSVP Status',
            'Degree Program',
            'Batch Year',
            'Current Job',
            'Company',
            'Demographic Cohort',
            'Profile Privacy',
            'Email Address',
            'Phone Number',
            'Location / Address'
        ];

        const escapeCsv = (val: unknown) => {
            if (val === null || val === undefined) return '""';
            const str = String(val).replace(/"/g, '""');
            return `"${str}"`;
        };

        const rows = filteredGuests.map(item => {
            const profile = item.user?.profile;
            const userName = profile?.userName || 'Anonymous Alumnus';
            const rsvpStatus = item.isAttending ? 'Going' : 'Not Going';
            const degree = profile?.degree?.degreeAbbr || profile?.degree?.degreeName || '';
            const batch = profile?.batch ? String(profile.batch) : '';
            const job = profile?.currentJob || '';
            const company = profile?.company || '';
            const cohort = getDemographicCohort(profile?.birthday);
            const privacy = item.user?.profileStatus?.statusName || 'Unspecified';
            const email = profile?.email || '';
            const phone = profile?.phone || '';
            const locationVal = profile?.location || '';

            return [
                escapeCsv(userName),
                escapeCsv(rsvpStatus),
                escapeCsv(degree),
                escapeCsv(batch),
                escapeCsv(job),
                escapeCsv(company),
                escapeCsv(cohort),
                escapeCsv(privacy),
                escapeCsv(email),
                escapeCsv(phone),
                escapeCsv(locationVal)
            ].join(',');
        });

        const csvContent = '\uFEFF' + [headers.map(escapeCsv).join(','), ...rows].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const sanitizedTitle = (eventData?.title || 'event')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
        const dateStr = new Date().toISOString().split('T')[0];
        link.href = url;
        link.setAttribute('download', `${sanitizedTitle}_guest_list_${dateStr}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Responsive viewport detection:
    // Single column viewport (< lg / < 1024px): 20 rows = 20 entries
    // Double column viewport (>= lg / >= 1024px): 20 rows = 40 entries
    const [isDoubleColumn, setIsDoubleColumn] = useState<boolean>(() => {
        if (typeof window === 'undefined') return true;
        return window.matchMedia('(min-width: 1024px)').matches;
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mql = window.matchMedia('(min-width: 1024px)');
        const onChange = (e: MediaQueryListEvent) => {
            setIsDoubleColumn(e.matches);
        };

        mql.addEventListener('change', onChange);
        setIsDoubleColumn(mql.matches);

        return () => {
            mql.removeEventListener('change', onChange);
        };
    }, []);

    const pageSize = isDoubleColumn ? 40 : 20;
    const [currentPage, setCurrentPage] = useState(1);
    const guestListTopRef = useRef<HTMLDivElement>(null);

    const totalPages = Math.max(1, Math.ceil(filteredGuests.length / pageSize));

    // Reset pagination to page 1 whenever search, tab, or dropdown filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filterTab, selectedDegree, selectedDemographic, selectedPrivacy, searchTerm]);

    // Keep page clamped within valid range
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        guestListTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, filteredGuests.length);

    const paginatedGuests = useMemo(() => {
        return filteredGuests.slice(startIndex, endIndex);
    }, [filteredGuests, startIndex, endIndex]);

    const visiblePages = useMemo(() => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
        if (currentPage >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    }, [currentPage, totalPages]);

    const formatTime = (timeStr?: string) => {
        if (!timeStr) return '';
        if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayHours = h % 12 || 12;
        return `${displayHours}:${minutes} ${ampm}`;
    };

    const formatLocation = (event: EventData | null) => {
        if (!event) return '';
        if (event.eventCategory?.eventCategoryName === 'Virtual') return `Virtual (${event.modality || 'Online'})`;
        const loc = event.location;
        if (!loc) return 'TBA';
        const parts = [loc.landmark, loc.street, loc.barangay, loc.cityMunicipality, loc.province].filter(Boolean);
        return parts.join(', ') || 'TBA';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <Loader2 className="w-10 h-10 text-brand-primary animate-spin mb-3" />
                <p className="text-sm font-medium text-gray-500">Loading guest list &amp; RSVP responses...</p>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
                    <p className="text-sm text-gray-600 mb-6">
                        The full attendee roster and contact details are reserved for the event organizer and platform administrators.
                    </p>
                    <Button asChild className="w-full bg-brand-primary hover:bg-brand-primary-hover">
                        <Link to={`/events/${id}`}>Return to Event Details</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const displayTime = eventData ? `${formatTime(eventData.startTime)} - ${formatTime(eventData.endTime)}` : '';

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
                {/* Top Breadcrumb & Navigation */}
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-gray-600 hover:text-brand-primary hover:bg-white -ml-2 gap-1.5 text-xs font-semibold"
                    >
                        <Link to={`/events/${id}`}>
                            <ArrowLeft className="w-4 h-4" />
                            Back to Event Details
                        </Link>
                    </Button>

                    <div className="flex items-center gap-2">
                        <Badge className="bg-brand-primary/10 text-brand-primary border-brand-primary/20 hover:bg-brand-primary/15 text-xs font-semibold gap-1.5 px-3 py-1 shadow-none transition-colors">
                            <Users className="w-3.5 h-3.5 text-brand-primary" />
                            <span>Attendee Management</span>
                        </Badge>
                    </div>
                </div>

                {/* Event Summary Banner Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 sm:p-8 space-y-5">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        <div className="space-y-3 max-w-2xl">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-tight">
                                {eventData?.title || 'Event Guest List'}
                            </h1>
                            <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm text-gray-600">
                                {eventData?.eventDate && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-brand-primary shrink-0" />
                                        <span className="font-medium text-gray-800">{formatDate(eventData.eventDate, 'full')}</span>
                                    </div>
                                )}
                                {displayTime && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-brand-primary shrink-0" />
                                        <span className="font-medium text-gray-800">{displayTime}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats Pill */}
                        <div className="flex items-center gap-2 shrink-0 bg-gray-50/90 p-2.5 sm:p-3 rounded-xl border border-gray-100 self-start lg:self-auto">
                            <div className="px-3.5 py-1 text-center">
                                <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Total Responses</p>
                                <p className="text-xl font-bold text-gray-900">{enrichedGuestList.length}</p>
                            </div>
                            <div className="h-8 w-px bg-gray-200" />
                            <div className="px-3.5 py-1 text-center">
                                <p className="text-[11px] font-medium text-emerald-700 uppercase tracking-wide">Going</p>
                                <p className="text-xl font-bold text-emerald-700">{goingCount}</p>
                            </div>
                            <div className="h-8 w-px bg-gray-200" />
                            <div className="px-3.5 py-1 text-center">
                                <p className="text-[11px] font-medium text-gray-600 uppercase tracking-wide">Not Going</p>
                                <p className="text-xl font-bold text-gray-700">{notGoingCount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Dedicated Location Banner - Fully visible across viewports, wrapping naturally without truncation */}
                    {eventData && (
                        <div className="pt-4 border-t border-gray-100 flex items-center gap-3 text-xs sm:text-sm text-gray-700 bg-gray-50/60 p-3.5 rounded-xl border border-gray-100">
                            <div className="p-1.5 bg-brand-primary/10 rounded-lg shrink-0 mt-0.5">
                                <MapPin className="w-4 h-4 text-brand-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Venue &amp; Location</p>
                                <p className="font-medium text-gray-900 break-words whitespace-normal leading-relaxed">
                                    {formatLocation(eventData)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Filter and Action Controls Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-5 space-y-4">
                    {/* Row 1: RSVP Tabs + Export to CSV */}
                    <div className="flex items-center justify-between flex-wrap gap-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Button
                                size="sm"
                                variant={filterTab === 'going' ? 'default' : 'outline'}
                                onClick={() => setFilterTab(filterTab === 'going' ? 'all' : 'going')}
                                className={`text-xs h-8 gap-1.5 ${filterTab === 'going' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'text-gray-700 border-gray-200'}`}
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Going ({goingCount})
                            </Button>
                            <Button
                                size="sm"
                                variant={filterTab === 'not_going' ? 'default' : 'outline'}
                                onClick={() => setFilterTab(filterTab === 'not_going' ? 'all' : 'not_going')}
                                className={`text-xs h-8 gap-1.5 ${filterTab === 'not_going' ? 'bg-gray-700 hover:bg-gray-800 text-white' : 'text-gray-700 border-gray-200'}`}
                            >
                                <XCircle className="w-3.5 h-3.5" />
                                Not Going ({notGoingCount})
                            </Button>
                        </div>

                        {/* Export to CSV Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExportCSV}
                            disabled={filteredGuests.length === 0}
                            className="h-8 text-xs gap-1.5 border-gray-300 text-gray-700 hover:text-brand-primary hover:border-brand-primary/50 ml-auto"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Export CSV ({filteredGuests.length})
                        </Button>
                    </div>

                    {/* Row 2: Dropdown Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                        {/* Degree Program Filter */}
                        <div>
                            <Select value={selectedDegree} onValueChange={setSelectedDegree}>
                                <SelectTrigger className="h-9 text-xs bg-gray-50/70 border-gray-200">
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
                                <SelectTrigger className="h-9 text-xs bg-gray-50/70 border-gray-200">
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
                                <SelectTrigger className="h-9 text-xs bg-gray-50/70 border-gray-200">
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

                    {/* Row 3: Keyword Search + Reset Filters */}
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                            <Input
                                placeholder="Search by name, job, company, or contact info..."
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
                                className="h-9 px-3 text-xs text-brand-primary hover:text-brand-primary-hover hover:bg-brand-primary/10 gap-1 shrink-0"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Reset
                            </Button>
                        )}
                    </div>
                </div>

                <div ref={guestListTopRef} />

                {/* Guest List Grid Body (Responsive 2-column card grid) */}
                {filteredGuests.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {paginatedGuests.map((guest) => {
                            const profile = guest.user?.profile;
                            const userId = guest.userId || guest.user?.id || '';
                            const userName = profile?.userName || 'Anonymous Alumnus';
                            const degreeAbbr = profile?.degree?.degreeAbbr || profile?.degree?.degreeName;
                            const batch = profile?.batch;
                            const job = profile?.currentJob;
                            const company = profile?.company;
                            const statusName = guest.user?.profileStatus?.statusName;
                            const cohort = getDemographicCohort(profile?.birthday);

                            const email = profile?.email;
                            const phone = profile?.phone;
                            const locationVal = profile?.location;
                            const hasContact = Boolean(email || phone || locationVal);

                            const isFriend = Boolean(session?.userId && friendIds?.has(String(userId)));
                            const isSelf = Boolean(session?.userId && String(userId) === String(session.userId));

                            return (
                                <div
                                    key={guest.id}
                                    className="bg-white rounded-xl border border-gray-200/80 hover:border-gray-300 hover:shadow-sm transition-all p-4 flex flex-col justify-between gap-3"
                                >
                                    {/* Top Row: Avatar, Identity, Subtitle, and RSVP Badge */}
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar className="w-11 h-11 border border-gray-200 shrink-0">
                                                <AvatarImage src={profile?.profileImage} alt={userName} className="object-cover" />
                                                <AvatarFallback className="bg-brand-primary/10 text-brand-primary font-bold text-sm">
                                                    {userName.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Link
                                                        to={`/profile/${userId}`}
                                                        className="font-bold text-gray-900 hover:text-brand-primary text-sm transition-colors truncate"
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

                                                {(job || company) ? (
                                                    <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5 truncate">
                                                        <Briefcase className="w-3 h-3 text-gray-400 shrink-0" />
                                                        <span className="truncate">
                                                            {[job, company].filter(Boolean).join(' at ')}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-400 italic mt-0.5">Alumnus</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* RSVP Status Badge */}
                                        <div className="shrink-0 mt-0.5">
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

                                    {/* Middle Row: Degree Cohort, Generational Cohort & Profile Privacy Badges */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {/* Degree Program Cohort Card */}
                                        {degreeAbbr && (
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold inline-flex items-center gap-1">
                                                <GraduationCap size={11} className="text-blue-600 shrink-0" />
                                                <span>{degreeAbbr} {batch ? `'${String(batch).slice(-2)}` : ''}</span>
                                            </span>
                                        )}

                                        {/* Generational Cohort Badge */}
                                        {cohort !== 'Unspecified' && (
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                                                {cohort}
                                            </span>
                                        )}

                                        {/* Profile Privacy Badge */}
                                        {statusName && (
                                            <span className="text-[10px] text-gray-600 font-medium inline-flex items-center gap-1 px-2 py-0.5 rounded bg-gray-100 border border-gray-200">
                                                {statusName === 'Public' && <Globe size={10} className="text-emerald-600" />}
                                                {statusName === 'Connections Only' && <Users size={10} className="text-blue-600" />}
                                                {statusName === 'Private' && <Lock size={10} className="text-gray-500" />}
                                                {statusName}
                                            </span>
                                        )}
                                    </div>

                                    {/* Bottom Section: Contact Information & Address */}
                                    <div className="border-t border-gray-100 pt-2.5 mt-0.5 space-y-1.5">
                                        {(email || phone) && (
                                            <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-xs text-gray-600">
                                                {email && (
                                                    <a
                                                        href={`mailto:${email}`}
                                                        className="inline-flex items-center gap-1.5 text-gray-600 hover:text-brand-primary transition-colors truncate max-w-[240px]"
                                                        title={email}
                                                    >
                                                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                        <span className="truncate">{email}</span>
                                                    </a>
                                                )}
                                                {phone && (
                                                    <a
                                                        href={`tel:${phone}`}
                                                        className="inline-flex items-center gap-1.5 text-gray-600 hover:text-brand-primary transition-colors shrink-0"
                                                    >
                                                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                        <span>{phone}</span>
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        {/* Dedicated Row for Location / Address */}
                                        {locationVal && (
                                            <div
                                                className="flex items-start gap-1.5 text-xs text-gray-600 w-full"
                                                title={locationVal}
                                            >
                                                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                                                <span className="leading-relaxed text-gray-700 break-words">{locationVal}</span>
                                            </div>
                                        )}

                                        {!hasContact && (
                                            <span className="text-[11px] text-gray-400 italic">
                                                No contact information or address provided
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 pt-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="h-9 px-3 text-xs gap-1 border-gray-200 text-gray-700 hover:text-brand-primary disabled:opacity-40"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Previous</span>
                            </Button>

                            <div className="flex items-center gap-1">
                                {visiblePages.map((page, index) => {
                                    if (page === '...') {
                                        return (
                                            <span key={`ellipsis-${index}`} className="px-2 text-xs text-gray-400 select-none">
                                                ...
                                            </span>
                                        );
                                    }
                                    const isCurrent = currentPage === page;
                                    return (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() => handlePageChange(page as number)}
                                            className={`min-w-9 h-9 px-3 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors border shadow-xs ${
                                                isCurrent
                                                    ? 'bg-brand-primary text-white border-brand-primary'
                                                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-brand-primary'
                                            }`}
                                            aria-current={isCurrent ? 'page' : undefined}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="h-9 px-3 text-xs gap-1 border-gray-200 text-gray-700 hover:text-brand-primary disabled:opacity-40"
                            >
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-200/80 text-center py-16 px-4">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-base font-semibold text-gray-800">No responses match your criteria</h3>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                            Try broadening your search term or clearing the active filters to see all attendee records.
                        </p>
                        {hasActiveFilters && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleResetFilters}
                                className="mt-4 text-xs"
                            >
                                Clear all filters
                            </Button>
                        )}
                    </div>
                )}

                {/* Footer summary card */}
                <div className="bg-white rounded-xl border border-gray-200/80 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
                    <span>
                        Showing <strong className="text-gray-900">{filteredGuests.length > 0 ? `${startIndex + 1}–${endIndex}` : 0}</strong> of{' '}
                        <strong className="text-gray-900">{filteredGuests.length}</strong> {filteredGuests.length === 1 ? 'response' : 'responses'}
                        {hasActiveFilters && (
                            <span> (filtered from <strong className="text-gray-900">{enrichedGuestList.length}</strong> total)</span>
                        )}
                    </span>
                    <div className="flex items-center gap-3">
                        {totalPages > 1 && (
                            <span className="text-gray-600 font-medium">
                                Page {currentPage} of {totalPages}
                            </span>
                        )}
                        {hasActiveFilters && (
                            <span className="text-[11px] text-brand-primary font-medium">
                                Filters applied
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
