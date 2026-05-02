import { useState } from 'react';
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
} from 'lucide-react';
import { CreateEventModal } from '@components/user/CreateEventModal';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@components/ui/alert';
import { NotFound } from '@pages/NotFound';
import { events } from '@assets/mockData';
import { useAuth } from '@/app/views/auth';

export function EventDetail() {
    const { id } = useParams<{ id: string }>();
    const [rsvpStatus, setRsvpStatus] = useState<'going' | 'not_going' | null>(null);
    const isAdmin = !!localStorage.getItem('adminToken');
    const { isLoggedIn } = useAuth();

    // Mock data for the event being edited
    // In a real app, this would be fetched based on the ID
    const eventData = events.find((e) => e.id === id);

    if (!eventData || eventData.status === "Rejected") {
        return <NotFound />;
    }

    const isPastEvent = new Date(eventData.date) < new Date();

    // Calculate display time
    const displayTime = `${eventData.startTimeHour}:${eventData.startTimeMinute} ${eventData.startTimeAmPm} - ${eventData.endTimeHour}:${eventData.endTimeMinute} ${eventData.endTimeAmPm}`;

    const handleRsvp = (status: 'going' | 'not_going') => {
        setRsvpStatus(status);
        // In a real app, this would accept the invite via API
    };

    const formatLocation = (event: any) => {
        if (event.category === 'Virtual') return `Virtual (${event.modality || 'Online'})`;
        const loc = event.location;
        if (typeof loc === 'string') return loc;
        const parts = [loc.landmark, loc.street, loc.barangay, loc.cityMunicipality, loc.province].filter(Boolean);
        return parts.join(', ');
    };

    const loc: any = eventData.location;
    const mapLat = typeof loc === 'object' && loc.lat ? loc.lat : 10.2954;
    const mapLng = typeof loc === 'object' && loc.lng ? loc.lng : 123.8944;

    return (
        <div className="bg-gray-50 pb-12">
            {eventData.status === "Pending" && (
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
                                    src={eventData.image}
                                    alt={eventData.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 left-4">
                                    <Badge className="bg-white/90 text-brand-primary hover:bg-white text-sm px-3 py-1 shadow-sm font-semibold backdrop-blur-sm border-none">
                                        {eventData.category}
                                    </Badge>
                                </div>
                            </div>

                            <div className="p-6 sm:p-8">
                                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{eventData.title}</h1>

                                <div className="flex flex-wrap gap-4 sm:gap-6 text-gray-600 mb-6">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-brand-primary" />
                                        <span>{new Date(eventData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
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

                        {eventData.category !== 'Virtual' && (
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
                                    <p className="font-medium text-gray-900 text-sm">{typeof loc === 'string' ? loc : loc.landmark || loc.street}</p>
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
                            ) : isLoggedIn ? (
                                <>
                                    <div className="text-center mb-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">Are you going?</h3>
                                        <p className="text-gray-500 text-sm">Let us know if you'll be there!</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <Button
                                            variant={rsvpStatus === 'going' ? 'default' : 'outline'}
                                            className={`w-full gap-2 ${rsvpStatus === 'going' ? 'bg-brand-primary hover:bg-brand-primary-hover' : 'hover:text-brand-primary hover:border-brand-primary'}`}
                                            onClick={() => handleRsvp('going')}
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            Going
                                        </Button>
                                        <Button
                                            variant={rsvpStatus === 'not_going' ? 'default' : 'outline'}
                                            className={`w-full gap-2 ${rsvpStatus === 'not_going' ? 'bg-gray-600 hover:bg-gray-700' : 'hover:text-gray-700 hover:border-gray-400'}`}
                                            onClick={() => handleRsvp('not_going')}
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Not Going
                                        </Button>
                                    </div>
                                </>
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
                                            <span className="text-brand-primary font-bold">{eventData.responses.going + (rsvpStatus === 'going' ? 1 : 0)} Going</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-gray-100">
                                        <div className="flex -space-x-2 overflow-hidden mb-3 justify-center">
                                            {[
                                                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=64&h=64",
                                                "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=64&h=64",
                                                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=64&h=64",
                                                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=64&h=64",
                                                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=64&h=64"
                                            ].map((url, i) => (
                                                <img
                                                    key={i}
                                                    src={url}
                                                    alt=""
                                                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                                                />
                                            ))}
                                            <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 text-xs text-gray-500 font-medium">
                                                +{(eventData.responses.going - 5)}
                                            </div>
                                        </div>
                                        <p className="text-center text-sm text-gray-500">
                                            See who else is going from your class
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Organizer Info */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Event Organizer</h3>

                            {/* Organizer header */}
                            <div className="flex items-center gap-4 mb-6">
                                <Avatar className="w-16 h-16 border-2 border-gray-100 shadow-sm">
                                    <AvatarImage src={eventData.organizer.image} />
                                    <AvatarFallback className="bg-brand-primary text-white text-xl font-semibold">
                                        {eventData.organizer.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>

                                <div>
                                    <span className="text-lg font-semibold text-gray-900 leading-tight">
                                        {eventData.organizer.name}
                                    </span>
                                </div>
                            </div>

                            {/* Contact info */}
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Mail className="w-4 h-4 text-brand-primary" />
                                    <a
                                        href={`mailto:${eventData.organizer.email}`}
                                        rel="noopener noreferrer"
                                        className="hover:text-brand-primary transition-colors"
                                    >
                                        {eventData.organizer.email}
                                    </a>
                                </div>

                                <div className="flex items-center gap-3 text-gray-600">
                                    <Phone className="w-4 h-4 text-brand-primary" />
                                    <span className="hover:text-brand-primary transition-colors">
                                        {eventData.organizer.phone}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
