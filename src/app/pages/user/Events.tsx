import { Calendar, MapPin, Clock } from 'lucide-react';
import { Plus } from 'lucide-react';
import { CreateEventModal } from '@/app/components/user/CreateEventModal';

import { events } from '@/assets/mockData';
import { Link } from 'react-router-dom';

export function Events() {
    // Filter events not older than 5 years
    const currentDate = new Date();
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(currentDate.getFullYear() - 5);

    const filteredEvents = events.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= fiveYearsAgo;
    });

    const formatLocation = (loc: any) => {
        if (typeof loc === 'string') return loc;
        const parts = [loc.streetOrLandmark, loc.barangay, loc.cityMunicipality, loc.province].filter(Boolean);
        return parts.join(', ');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div>
                    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Upcoming Events</h1>
                                <p className="text-gray-600">
                                    Connect, learn, and celebrate with fellow Josenians at our upcoming
                                    events
                                </p>
                            </div>
                            <CreateEventModal
                                trigger={
                                    <button
                                        className="flex items-center justify-center gap-2 bg-[#1a5f3f] text-white px-6 py-3 rounded-lg hover:bg-[#2d7a4f] transition-colors font-semibold"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Create Event
                                    </button>
                                }
                            />
                        </div>
                    </div>
                </div>

                {/* Events List */}
                <div className="space-y-6 mb-6">
                    {filteredEvents.map((event) => (
                        <Link
                            key={event.id}
                            to={`/events/${event.id}`}
                            className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="flex flex-col md:flex-row md:h-[260px] lg:h-[280px]">
                                {/* Image */}
                                <div className="relative w-full md:w-64 lg:w-80 h-48 md:h-full flex-shrink-0 overflow-hidden">
                                    <img
                                        src={event.image}
                                        alt={event.title}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                    <span className="absolute top-4 left-4 bg-[#1a5f3f] text-white px-3 py-1 rounded-full text-sm font-semibold">
                                        {event.category}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-6 flex flex-col">
                                    <div className="flex-1 overflow-hidden">
                                        <h2 className="text-2xl font-bold mb-3 text-gray-900 hover:text-[#1a5f3f] transition-colors line-clamp-2">
                                            {event.title}
                                        </h2>

                                        <p className="text-gray-600 mb-4 line-clamp-2">
                                            {event.description}
                                        </p>

                                        {/* Event Meta Information */}
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-[#1a5f3f]" />
                                                <span>{event.date}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-[#1a5f3f]" />
                                                <span>{event.time}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-[#1a5f3f]" />
                                                <span>{formatLocation(event.location)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* View Details Link */}
                                    <div className="pt-2 mt-auto">
                                        <span className="text-[#1a5f3f] font-semibold hover:text-[#2d7a4f] inline-flex items-center gap-1">
                                            View Details
                                            <span aria-hidden="true">→</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Empty State */}
                {filteredEvents.length === 0 && (
                    <div className="text-center py-16">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            No Upcoming Events
                        </h3>
                        <p className="text-gray-500">
                            Check back soon for new events and opportunities to connect with the
                            alumni community.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
