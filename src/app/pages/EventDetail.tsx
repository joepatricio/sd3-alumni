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
    Globe,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { CreateEventModal } from '../components/CreateEventModal';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

export function EventDetail() {
    const { id } = useParams<{ id: string }>();
    const [rsvpStatus, setRsvpStatus] = useState<'going' | 'not_going' | null>(null);

    // Mock data for the event being edited
    // In a real app, this would be fetched based on the ID
    const eventData = {
        id: id || '1',
        title: "Annual Alumni Homecoming 2026",
        category: "Reunion",
        date: "2026-12-15",
        startTimeHour: "5",
        startTimeMinute: "00",
        startTimeAmPm: "PM",
        endTimeHour: "10",
        endTimeMinute: "00",
        endTimeAmPm: "PM",
        location: "Grand Ballroom, City Hotel",
        address: "123 Main St, Cebu City, Philippines", // For map
        description: `Join us for our biggest event of the year! Reconnect with old friends, network with fellow alumni, and celebrate the spirit of our alma mater. The evening will feature a buffet dinner, live entertainment, and an awards ceremony honoring outstanding alumni achievements.

        We will also be unveiling the new scholarship fund initiatives and recognizing the Golden Jubilarians (Class of 1976). Don't miss this opportunity to walk down memory lane and make new memories.
        
        Attire is semi-formal. Please RSVP by December 1st to ensure your seat.`,
        organizer: {
            name: "USJR Alumni Association",
            contactName: "Maria Santos",
            email: "alumni@usjr.edu.ph",
            phone: "(032) 123-4567",
            website: "www.usjr-alumni.org",
            image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
        },
        responses: {
            going: 142,
            invited: 500
        },
        image: "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    };

    // Calculate display time
    const displayTime = `${eventData.startTimeHour}:${eventData.startTimeMinute} ${eventData.startTimeAmPm} - ${eventData.endTimeHour}:${eventData.endTimeMinute} ${eventData.endTimeAmPm}`;

    const handleRsvp = (status: 'going' | 'not_going') => {
        setRsvpStatus(status);
        // In a real app, this would accept the invite via API
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header / Nav */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <Link
                        to="/events"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1a5f3f] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="font-medium">Back to Events</span>
                    </Link>

                    <div className="flex gap-2">
                        <CreateEventModal
                            trigger={
                                <Button variant="outline" className="gap-2 text-[#1a5f3f] border-[#1a5f3f] hover:bg-[#1a5f3f] hover:text-white transition-colors">
                                    <Edit className="w-4 h-4" />
                                    Edit Event
                                </Button>
                            }
                            initialData={eventData}
                        />
                    </div>
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
                                <div className="absolute top-4 right-4">
                                    <Badge className="bg-white/90 text-[#1a5f3f] hover:bg-white text-sm px-3 py-1 shadow-sm font-semibold backdrop-blur-sm border-none">
                                        {eventData.category}
                                    </Badge>
                                </div>
                            </div>

                            <div className="p-6 sm:p-8">
                                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{eventData.title}</h1>

                                <div className="flex flex-wrap gap-4 sm:gap-6 text-gray-600 mb-6">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-[#1a5f3f]" />
                                        <span>{new Date(eventData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-[#1a5f3f]" />
                                        <span>{displayTime}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-[#1a5f3f]" />
                                        <span>{eventData.location}</span>
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

                        {/* Organizer Info */}
                        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Organizer</h3>
                            <div className="flex items-start sm:items-center gap-4">
                                <Avatar className="w-16 h-16 border-2 border-gray-100">
                                    <AvatarImage src={eventData.organizer.image} />
                                    <AvatarFallback className="bg-[#1a5f3f] text-white text-xl">
                                        {eventData.organizer.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <h4 className="text-xl font-semibold text-gray-900">{eventData.organizer.name}</h4>
                                    <p className="text-gray-500 mb-2">Point of Contact: {eventData.organizer.contactName}</p>
                                    <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-[#1a5f3f]" />
                                            <a href={`mailto:${eventData.organizer.email}`} className="hover:text-[#1a5f3f] transition-colors">{eventData.organizer.email}</a>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 text-[#1a5f3f]" />
                                            <a href={`tel:${eventData.organizer.phone}`} className="hover:text-[#1a5f3f] transition-colors">{eventData.organizer.phone}</a>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-4 h-4 text-[#1a5f3f]" />
                                            <a href={`https://${eventData.organizer.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#1a5f3f] transition-colors">{eventData.organizer.website}</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="space-y-8">
                        {/* RSVP Card */}
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 top-24">
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">Are you going?</h3>
                                <p className="text-gray-500 text-sm">Let us know if you'll be there!</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <Button
                                    variant={rsvpStatus === 'going' ? 'default' : 'outline'}
                                    className={`w-full gap-2 ${rsvpStatus === 'going' ? 'bg-[#1a5f3f] hover:bg-[#154e33]' : 'hover:text-[#1a5f3f] hover:border-[#1a5f3f]'}`}
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

                            <div className="border-t border-gray-100 pt-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-gray-600 font-medium">Responses</span>
                                    <span className="text-[#1a5f3f] font-bold">{eventData.responses.going + (rsvpStatus === 'going' ? 1 : 0)} Going</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
                                    <div
                                        className="bg-[#1a5f3f] h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${((eventData.responses.going + (rsvpStatus === 'going' ? 1 : 0)) / eventData.responses.invited) * 100}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs text-gray-400 text-right">{eventData.responses.invited} Invited</p>
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
                                            className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                                            src={url}
                                            alt=""
                                        />
                                    ))}
                                    <div className="flex items-center justify-center h-8 w-8 rounded-full ring-2 ring-white bg-gray-100 text-xs text-gray-500 font-medium">
                                        +{(eventData.responses.going - 5) + (rsvpStatus === 'going' ? 1 : 0)}
                                    </div>
                                </div>
                                <p className="text-center text-sm text-gray-500">
                                    See who else is going from your class
                                </p>
                            </div>
                        </div>

                        {/* Map Card */}
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-[#1a5f3f]" />
                                    Location
                                </h3>
                            </div>
                            <div className="aspect-square w-full relative">
                                {/* OpenStreetMap Iframe */}
                                <iframe
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    scrolling="no"
                                    marginHeight={0}
                                    marginWidth={0}
                                    src="https://www.openstreetmap.org/export/embed.html?bbox=123.8850%2C10.2900%2C123.9050%2C10.3100&amp;layer=mapnik&amp;marker=10.3000%2C123.8950"
                                    style={{ border: 0 }}
                                    title="Event Location"
                                ></iframe>
                            </div>
                            <div className="p-4 bg-gray-50">
                                <p className="font-medium text-gray-900 text-sm">{eventData.location}</p>
                                <p className="text-gray-500 text-xs mt-1">{eventData.address}</p>
                                <a
                                    href={`https://www.openstreetmap.org/?mlat=10.3000&mlon=123.8950#map=16/10.3000/123.8950`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block mt-3 text-xs text-[#1a5f3f] font-medium hover:underline"
                                >
                                    View larger map
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
