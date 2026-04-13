import { useState, useMemo } from 'react';
import { Calendar, MapPin, Clock, Video } from 'lucide-react';
import { Plus } from 'lucide-react';
import { CreateEventModal } from '@components/user/CreateEventModal';
import { Button } from '@components/ui/button';
import { events } from '@assets/mockData';
import { Link } from 'react-router-dom';
import { getCategoryColor } from '@utils/categoryColors';
import { isEventUpcoming } from '@utils/eventFilters';

const EVENTS_PER_PAGE = 6;

export function Events() {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [timeRange, setTimeRange] = useState<string>('Upcoming');
    const [visibleCount, setVisibleCount] = useState(EVENTS_PER_PAGE);

    const categories = useMemo(() => {
        return Array.from(new Set(events.map(event => event.category)));
    }, []);

    const toggleCategory = (cat: string) => {
        setSelectedCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
        setVisibleCount(EVENTS_PER_PAGE);
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setTimeRange('Upcoming');
        setVisibleCount(EVENTS_PER_PAGE);
    };

    const filteredEvents = useMemo(() => {
        let sorted = events
            .filter(event => event.status === "Approved")
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (selectedCategories.length > 0) {
            sorted = sorted.filter(event => selectedCategories.includes(event.category));
        }

        sorted = sorted.filter(event => {
            if (timeRange === 'Upcoming') return isEventUpcoming(event.date);

            const now = new Date();
            now.setHours(0, 0, 0, 0); // Normalize to start of day
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);

            const diffTime = eventDate.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (timeRange === '7 days') return diffDays >= 0 && diffDays <= 7;
            if (timeRange === '30 days') return diffDays >= 0 && diffDays <= 30;
            else return diffDays < 0; // Past
        });

        if (timeRange === 'Past') return sorted.reverse();
        else return sorted;
    }, [selectedCategories, timeRange]);

    const paginatedEvents = filteredEvents.slice(0, visibleCount);

    const formatLocation = (loc: any) => {
        if (typeof loc === 'string') return loc;
        const parts = [loc.landmark, loc.barangay, loc.cityMunicipality, loc.province].filter(Boolean);
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
                                        className="flex items-center justify-center gap-2 bg-[#d97706] text-white px-6 py-3 rounded-lg hover:bg-[#b45309] transition-colors font-semibold"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Create Event
                                    </button>
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className="mb-8 bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-row items-center overflow-x-auto gap-4 hide-scrollbar">
                    {/* Category Filter */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {categories.map(cat => (
                            <Button
                                key={cat}
                                variant={selectedCategories.includes(cat) ? "default" : "outline"}
                                className={selectedCategories.includes(cat) ? getCategoryColor(cat) : ""}
                                onClick={() => toggleCategory(cat)}
                            >
                                {cat}
                            </Button>
                        ))}
                    </div>

                    <div className="h-8 w-px bg-gray-200 hidden md:block mx-1 flex-shrink-0"></div>

                    {/* Time Range Filter */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {['Upcoming', '7 days', '30 days', 'Past'].map(range => (
                            <Button
                                key={range}
                                variant={timeRange === range ? "default" : "outline"}
                                className={timeRange === range ? "bg-[#d97706] hover:bg-[#d97706] text-white" : ""}
                                onClick={() => { setTimeRange(range); setVisibleCount(EVENTS_PER_PAGE); }}
                            >
                                {range}
                            </Button>
                        ))}
                    </div>

                    {/* Clear Filters */}
                    <div className="flex items-center ml-auto flex-shrink-0">
                        <Button variant="ghost" className="text-gray-600 hover:text-gray-900 whitespace-nowrap" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    </div>
                </div>

                {/* Events List */}
                <div className="space-y-6 mb-6">
                    {paginatedEvents.map((event) => (
                        <Link
                            key={event.id}
                            to={`/events/${event.id}`}
                            className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="flex flex-col md:flex-row md:h-[200px] lg:h-[220px]">
                                {/* Image */}
                                <div className="relative w-full md:w-64 lg:w-80 h-48 md:h-full flex-shrink-0 overflow-hidden">
                                    <img
                                        src={event.image}
                                        alt={event.title}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                    <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-semibold ${getCategoryColor(event.category)}`}>
                                        {event.category}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-6 flex flex-col">
                                    <div className="flex-1 overflow-hidden">
                                        <h2 className="text-2xl font-bold mb-3 text-gray-900 hover:text-[#d97706] transition-colors line-clamp-2">
                                            {event.title}
                                        </h2>

                                        <p className="text-gray-600 mb-4 line-clamp-2">
                                            {event.description}
                                        </p>

                                        {/* Event Meta Information */}
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-[#d97706]" />
                                                <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-[#d97706]" />
                                                <span>{event.time}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {event.category === 'Virtual' ? (
                                                    <Video className="w-4 h-4 text-[#d97706]" />
                                                ) : (
                                                    <MapPin className="w-4 h-4 text-[#d97706]" />
                                                )}
                                                <span>
                                                    {event.category === 'Virtual'
                                                        ? `Virtual (${(event as any).modality || 'Online'})`
                                                        : formatLocation(event.location)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* View Details Link */}
                                    <div className="pt-2 mt-auto">
                                        <span className="text-[#d97706] font-semibold hover:text-[#b45309] inline-flex items-center gap-1">
                                            View Details
                                            <span aria-hidden="true">→</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Pagination */}
                {visibleCount < filteredEvents.length && (
                    <div className="flex justify-center items-center gap-4 mt-8 mb-12">
                        <Button
                            variant="outline"
                            onClick={() => setVisibleCount(prev => prev + EVENTS_PER_PAGE)}
                            className="px-8"
                        >
                            Load More
                        </Button>
                    </div>
                )}

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
