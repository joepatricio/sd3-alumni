import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ProfileHeader } from '@components/user/ProfileHeader';
import { Calendar, MapPin, Clock, Loader2 } from 'lucide-react';
import { LazyImage } from '@components/user/LazyImage';
import { formatDate, getEventImage } from '@/app/views/formatters';
import { api, useProfileRoute, type ProfileData } from '@/app/views/api';

interface EventItem {
    id: string;
    title: string;
    eventDate: string;
    startTime?: string;
    endTime?: string;
    eventImage?: string;
    location?: {
        landmark?: string;
        cityMunicipality?: string;
    };
}

export function UserEvents() {
    const navigate = useNavigate();
    const { profileId } = useProfileRoute();
    
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [userEvents, setUserEvents] = useState<EventItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserEvents = async () => {
            if (!profileId) {
                setLoading(false);
                setProfileLoading(false);
                return;
            }
            try {
                const profileRes = await api.get(`/profiles/${profileId}`, { params: { _include: 'degree' } });
                setProfile(profileRes.data);

                const rsvpRes = await api.get('/userRsvps', { params: { userId: profileId, isAttending: true } });
                const rsvps = rsvpRes.data.data || rsvpRes.data || [];
                const eventIds = rsvps.map((r: any) => r.eventId).filter(Boolean);

                if (eventIds.length > 0) {
                    const eventsRes = await api.get('/events', {
                        params: {
                            _where: JSON.stringify({ id: { in: eventIds } }),
                            _include: 'location'
                        }
                    });
                    const evts = eventsRes.data.data || eventsRes.data || [];
                    setUserEvents(evts);
                } else {
                    setUserEvents([]);
                }
            } catch (err) {
                console.error("Failed to fetch user events:", err);
            } finally {
                setLoading(false);
                setProfileLoading(false);
            }
        };

        fetchUserEvents();
    }, [profileId]);

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const sortedEvents = [...userEvents].sort((a, b) => {
        const dateA = new Date(a.eventDate);
        const dateB = new Date(b.eventDate);
        const isUpcomingA = dateA >= now;
        const isUpcomingB = dateB >= now;

        if (isUpcomingA && !isUpcomingB) return -1;
        if (!isUpcomingA && isUpcomingB) return 1;

        if (isUpcomingA) {
            return dateA.getTime() - dateB.getTime();
        }

        return dateB.getTime() - dateA.getTime();
    });

    if (loading || profileLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                <p className="text-gray-500 font-medium">Loading user events...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
                {/* Profile Header */}
                <ProfileHeader
                    name={profile?.userName || 'Alumni Member'}
                    degree={profile?.degree?.degreeName || 'Alumni'}
                    graduationYear={profile?.batch ? String(profile.batch) : 'N/A'}
                    profileImage={profile?.profileImage || ''}
                    bio={profile?.bio || ''}
                    isProfilePage={false}
                    onEdit={() => navigate('/profile/edit')}
                />

                <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-4">Events Attended</h2>

                    {sortedEvents.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                            <p className="text-gray-500">You haven't RSVP'd to any events yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {sortedEvents.map(event => {
                                const isUpcoming = new Date(event.eventDate) >= now;
                                return (
                                    <Link
                                        key={event.id}
                                        to={`/events/${event.id}`}
                                        className="group bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                                    >
                                        <div className="relative h-48 w-full overflow-hidden">
                                            <LazyImage
                                                src={getEventImage(event)}
                                                alt={event.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            {isUpcoming && (
                                                <div className="absolute top-4 right-4 bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                                    Upcoming
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5 flex flex-col flex-1">
                                            <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-brand-primary transition-colors line-clamp-2">
                                                {event.title}
                                            </h3>
                                            <div className="space-y-2 text-sm text-gray-600 mt-auto">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-brand-primary shrink-0" />
                                                    <span>{formatDate(event.eventDate, 'full')}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-brand-primary shrink-0" />
                                                    <span>{event.startTime || '09:00'} - {event.endTime || '17:00'}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-brand-primary shrink-0" />
                                                    <span className="truncate">{event.location?.landmark || event.location?.cityMunicipality || 'Virtual / TBD'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
