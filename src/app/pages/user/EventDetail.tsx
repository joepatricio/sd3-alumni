import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Calendar,
    MapPin,
    Clock,
    ArrowLeft,
    Edit,
    Mail,
    Phone,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { CreateEventModal } from '@components/user/CreateEventModal';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert';
import { NotFound } from '@pages/NotFound';
import { useAuth } from '@/app/views/auth';
import { api, useSystemLookup, type EventData, type ProfileData } from '@/app/views/api';

export function EventDetail() {
    const { id } = useParams<{ id: string }>();
    const { lookup, reverseLookup } = useSystemLookup();
    const isAdmin = !!localStorage.getItem('adminToken');
    const { isLoggedIn, session } = useAuth();

    const [eventData, setEventData] = useState<EventData | null>(null);
    const [organizer, setOrganizer] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [rsvpLoading, setRsvpLoading] = useState(false);
    const [isSuspended, setIsSuspended] = useState(false);

    useEffect(() => {
        const fetchEventAndOrganizer = async () => {
            try {
                const [eventRes, usersRes] = await Promise.all([
                    api.get(`/events/${id}?_embed=userRsvps`),
                    api.get('/users')
                ]);
                const event = eventRes.data;
                const allUsers = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.data || []);

                if (event?.authorId) {
                    const authorUser = allUsers.find((u: any) => String(u.id) === String(event.authorId));
                    if (authorUser && authorUser.userStatusId === reverseLookup('Banned')) {
                        setEventData(null);
                        setLoading(false);
                        return;
                    }

                    const profRes = await api.get(`/profiles?userId=${event.authorId}`);
                    const profData = Array.isArray(profRes.data) ? profRes.data : profRes.data.data;
                    if (profData && profData.length > 0) {
                        setOrganizer(profData[0]);
                    }
                }

                if (session?.userId) {
                    const currentU = allUsers.find((u: any) => String(u.userId) === String(session.userId));
                    if (currentU && currentU.userStatusId === reverseLookup('Suspended')) {
                        setIsSuspended(true);
                    }
                }

                setEventData(event);
            } catch (error) {
                console.error("Failed to fetch event details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEventAndOrganizer();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-brand-primary animate-spin mb-4" />
                <p className="text-gray-500">Loading event details...</p>
            </div>
        );
    }

    const currentStatusName = eventData ? lookup(eventData.contentStatusId) : null;

    if (!eventData || currentStatusName === "Rejected") {
        return <NotFound />;
    }

    const isPastEvent = new Date(eventData.eventDate) < new Date();

    const formatTime = (timeStr: string) => {
        // timeStr might be "16:00:00"
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayHours = h % 12 || 12;
        return `${displayHours}:${minutes} ${ampm}`;
    };

    const displayTime = `${formatTime(eventData.startTime)} - ${formatTime(eventData.endTime)}`;
    const categoryName = lookup(eventData.eventCategoryId);

    const currentUserRsvp = eventData.userRsvps?.find(r => r.userId === session?.userId?.toString());
    const rsvpStatus = currentUserRsvp ? (currentUserRsvp.isAttending ? 'going' : 'not_going') : null;

    // Calculate total going responses directly from the field
    const goingResponsesCount = eventData.responses;

    const handleRsvp = async (status: 'going' | 'not_going') => {
        if (!session?.userId || !eventData) return;
        setRsvpLoading(true);
        const isAttending = status === 'going';

        try {
            let newResponsesCount = eventData.responses || 0;

            if (currentUserRsvp) {
                // Update existing if status changed
                if (currentUserRsvp.isAttending !== isAttending) {
                    await api.patch(`/userRsvps/${currentUserRsvp.id}`, { isAttending });
                    newResponsesCount += isAttending ? 1 : -1;

                    await api.patch(`/events/${eventData.id}`, { responses: newResponsesCount });

                    setEventData(prev => prev ? {
                        ...prev,
                        responses: newResponsesCount,
                        userRsvps: prev.userRsvps?.map(r => r.id === currentUserRsvp.id ? { ...r, isAttending } : r)
                    } : null);
                }
            } else {
                // Create new
                const res = await api.post('/userRsvps', {
                    userId: session.userId.toString(),
                    eventId: eventData.id,
                    isAttending
                });

                if (isAttending) {
                    newResponsesCount += 1;
                    await api.patch(`/events/${eventData.id}`, { responses: newResponsesCount });
                }

                setEventData(prev => prev ? {
                    ...prev,
                    responses: newResponsesCount,
                    userRsvps: [...(prev.userRsvps || []), res.data]
                } : null);
            }
        } catch (error) {
            console.error("Failed to update RSVP:", error);
        } finally {
            setRsvpLoading(false);
        }
    };

    const formatLocation = (event: EventData) => {
        if (categoryName === 'Virtual') return `Virtual (${event.modality || 'Online'})`;
        const loc = event.location;
        if (!loc) return 'TBA';
        const parts = [loc.landmark, loc.street, loc.barangay, loc.cityMunicipality, loc.province].filter(Boolean);
        return parts.join(', ');
    };

    const loc = eventData.location;
    const mapLat = loc?.lat || 10.2954;
    const mapLng = loc?.lng || 123.8944;

    return (
        <div className="bg-gray-50 pb-12">
            {currentStatusName === "Pending" && (
                <div className="bg-yellow-50 px-4 py-3 border-b border-yellow-200 text-center">
                    <p className="text-yellow-800 font-medium text-sm">
                        ⚠️ This event is currently under review by an administrator. It is not visible to the public.
                    </p>
                </div>
            )}
            {/* Header / Nav */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex justify-between items-center">
                <Link
                    to="/events"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-brand-primary transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="font-medium">Back to Events</span>
                </Link>

                <div className="flex gap-2">
                    {isLoggedIn && (
                        <CreateEventModal
                            trigger={
                                <Button variant="outline" className="gap-2 text-brand-primary border-brand-primary hover:bg-brand-primary hover:text-white transition-colors">
                                    <Edit className="w-4 h-4" />
                                    Edit Event
                                </Button>
                            }
                            initialData={eventData as any}
                            isAdmin={isAdmin}
                        />
                    )}
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Event Hero */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                            <div className="h-64 sm:h-80 w-full relative">
                                <img
                                    src={eventData.eventImage}
                                    alt={eventData.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 left-4">
                                    <Badge className="bg-white/90 text-brand-primary hover:bg-white text-sm px-3 py-1 shadow-sm font-semibold backdrop-blur-sm border-none">
                                        {categoryName}
                                    </Badge>
                                </div>
                            </div>

                            <div className="p-6 sm:p-8">
                                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{eventData.title}</h1>

                                <div className="flex flex-wrap gap-4 sm:gap-6 text-gray-600 mb-6">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-brand-primary" />
                                        <span>{new Date(eventData.eventDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-brand-primary" />
                                        <span>{displayTime}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-brand-primary" />
                                        <span>{formatLocation(eventData)}</span>
                                    </div>
                                </div>

                                <div className="prose prose-green max-w-none text-gray-700">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-3">About this Event</h3>
                                    {eventData.description.split('\n\n').map((para, i) => (
                                        <p key={i} className="mb-4 leading-relaxed">{para.trim()}</p>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {categoryName !== 'Virtual' && loc && (
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-brand-primary" />
                                        Location
                                    </h3>
                                </div>
                                <div className="aspect-2/1 w-full relative">
                                    {/* OpenStreetMap Iframe */}
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        frameBorder="0"
                                        scrolling="no"
                                        marginHeight={0}
                                        marginWidth={0}
                                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapLng - 0.001}%2C${mapLat - 0.001}%2C${mapLng + 0.001}%2C${mapLat + 0.001}&layer=mapnik&marker=${mapLat}%2C${mapLng}`}
                                        style={{ border: 0 }}
                                        title="Event Location"
                                    ></iframe>
                                </div>
                                <div className="p-4 bg-gray-50">
                                    <p className="font-medium text-gray-900 text-sm">{loc.landmark || loc.street}</p>
                                    <p className="text-gray-500 text-xs mt-1">{formatLocation(eventData)}</p>
                                    <a
                                        href={`https://www.openstreetmap.org/?mlat=${mapLat}&mlon=${mapLng}#map=16/${mapLat}/${mapLng}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block mt-3 text-xs text-brand-primary font-medium hover:underline"
                                    >
                                        View larger map
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="space-y-8 sticky top-24 self-start">
                        {/* RSVP Card */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            {isPastEvent ? (
                                <Alert className="bg-amber-50 border-amber-200 text-amber-800">
                                    <AlertCircle className="h-4 w-4 text-amber-600" />
                                    <AlertTitle className="font-bold">Event Passed</AlertTitle>
                                    <AlertDescription className="text-amber-700">
                                        This event has already taken place. RSVP is no longer available.
                                    </AlertDescription>
                                </Alert>
                            ) : isLoggedIn && !isSuspended ? (
                                <>
                                    <div className="text-center mb-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Are you going?</h3>
                                        <p className="text-gray-500 text-sm">Let us know if you'll be there!</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <Button
                                            disabled={rsvpLoading}
                                            variant={rsvpStatus === 'going' ? 'default' : 'outline'}
                                            className={`w-full gap-2 ${rsvpStatus === 'going' ? 'bg-brand-primary hover:bg-brand-primary-hover text-white' : 'hover:text-brand-primary hover:border-brand-primary'}`}
                                            onClick={() => handleRsvp('going')}
                                        >
                                            {rsvpLoading && rsvpStatus === 'going' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                            Going
                                        </Button>
                                        <Button
                                            disabled={rsvpLoading}
                                            variant={rsvpStatus === 'not_going' ? 'default' : 'outline'}
                                            className={`w-full gap-2 ${rsvpStatus === 'not_going' ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'hover:text-gray-700 hover:border-gray-400'}`}
                                            onClick={() => handleRsvp('not_going')}
                                        >
                                            {rsvpLoading && rsvpStatus === 'not_going' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                            Not Going
                                        </Button>
                                    </div>
                                </>
                            ) : isSuspended ? (
                                <div className="text-center py-4">
                                    <AlertCircle className="w-8 h-8 text-brand-primary/50 mx-auto mb-3" />
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">RSVP Restricted</h3>
                                    <p className="text-gray-500 text-sm mb-6">Your account has been suspended. You cannot RSVP to events at this time.</p>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">RSVP to this Event</h3>
                                    <p className="text-gray-500 text-sm mb-6">Log in to let alumni know you'll be attending.</p>
                                    <Link to="/login" state={{ from: `/events/${eventData.id}` }} className="inline-block w-full">
                                        <Button className="w-full bg-brand-primary hover:bg-brand-primary-hover">
                                            Log In to RSVP
                                        </Button>
                                    </Link>
                                </div>
                            )}

                            {isLoggedIn && (
                                <>
                                    <div className="border-t border-gray-100 pt-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-gray-600 font-medium">Responses</span>
                                            <span className="text-brand-primary font-bold">{goingResponsesCount} Going</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Organizer Info */}
                        {organizer && (
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Event Organizer</h3>

                                {/* Organizer header */}
                                <div className="flex items-center gap-4 mb-6">
                                    <Avatar className="w-16 h-16 border-2 border-gray-100 shadow-sm">
                                        <AvatarImage src={organizer.profileImage} />
                                        <AvatarFallback className="bg-brand-primary text-white text-xl font-semibold">
                                            {organizer.userName.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div>
                                        <span className="text-lg font-semibold text-gray-900 leading-tight block hover:text-brand-primary transition-colors">
                                            <Link to={`/profile/${organizer.userId}`}>{organizer.userName}</Link>
                                        </span>
                                    </div>
                                </div>

                                {/* Contact info */}
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Mail className="w-4 h-4 text-brand-primary" />
                                        <a
                                            href={`mailto:${organizer.email}`}
                                            rel="noopener noreferrer"
                                            className="hover:text-brand-primary transition-colors"
                                        >
                                            {organizer.email}
                                        </a>
                                    </div>

                                    {organizer.phone && (
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <Phone className="w-4 h-4 text-brand-primary" />
                                            <span className="hover:text-brand-primary transition-colors cursor-default">
                                                {organizer.phone}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
