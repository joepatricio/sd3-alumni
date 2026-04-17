import { useNavigate, Link } from 'react-router-dom';
import { ProfileHeader } from '@components/user/ProfileHeader';
import { profileData, events } from '@assets/mockData';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { LazyImage } from '@components/user/LazyImage';

export function UserEvents() {
    const navigate = useNavigate();

    // Get events attended by user
    const userEvents = profileData.eventsAttended?.map(id => events.find(e => e.id === id)).filter(Boolean) as typeof events;

    const now = new Date();
    // Reset time for today to count events happening today as upcoming
    now.setHours(0, 0, 0, 0);

    // Sort events
    const sortedEvents = [...userEvents].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        const isUpcomingA = dateA >= now;
        const isUpcomingB = dateB >= now;

        if (isUpcomingA && !isUpcomingB) return -1;
        if (!isUpcomingA && isUpcomingB) return 1;

        // If both are upcoming, sort soonest first
        if (isUpcomingA) {
            return dateA.getTime() - dateB.getTime();
        }

        // If both are past, sort most recent first
        return dateB.getTime() - dateA.getTime();
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
                {/* Profile Header */}
                <ProfileHeader
                    profileData={profileData}
                    isProfilePage={false}
                    onEdit={() => navigate('/profile/edit')}
                />

                <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-4">Events Attended</h2>

                    {sortedEvents.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                            <p className="text-gray-500">You haven't attended any events yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {sortedEvents.map(event => {
                                const isUpcoming = new Date(event.date) >= now;
                                return (
                                    <Link
                                        key={event.id}
                                        to={`/events/${event.id}`}
                                        className="group bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                                    >
                                        <div className="relative h-48 w-full overflow-hidden">
                                            <LazyImage
                                                src={event.image || ''}
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
                                                    <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-brand-primary shrink-0" />
                                                    <span>{event.time}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-brand-primary shrink-0" />
                                                    <span className="truncate">{event.address || 'Virtual / TBD'}</span>
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
