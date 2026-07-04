import { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, Video, Loader2 } from 'lucide-react';
import { Plus } from 'lucide-react';
import { CreateEventModal } from '@components/user/CreateEventModal';
import { Button } from '@components/ui/button';
import { Link } from 'react-router-dom';
import { getCategoryColor } from '@/app/views/formatters';

import { api, type EventData } from '@/app/views/api';
import { useAuth } from '@/app/views/auth';

const EVENTS_PER_PAGE = 6;

export function Events() {
    const [events, setEvents] = useState<EventData[]>([]);
    const [loading, setLoading] = useState(true);
    const { session } = useAuth();
    const [currentUserStatus, setCurrentUserStatus] = useState<string>('');

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [timeRange, setTimeRange] = useState<string>('Upcoming');
    const [visibleCount, setVisibleCount] = useState(EVENTS_PER_PAGE);

    const [allCategories, setAllCategories] = useState<string[]>([]);
    const [totalEvents, setTotalEvents] = useState(0);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/eventCategories');
                const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                setAllCategories(data.map((c: any) => c.eventCategoryName));
            } catch (err) {
                console.error("Failed to fetch event categories", err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const [usersRes] = await Promise.all([
                    api.get('/users')
                ]);

                const allUsers = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.data || []);
                const restricted = allUsers
                    .filter((u: any) => u.userStatus?.statusName === 'Banned' || u.userStatus?.statusName === 'Suspended')
                    .map((u: any) => String(u.id));

                if (session?.userId) {
                    const currentU = allUsers.find((u: any) => String(u.userId) === String(session.userId));
                    if (currentU) {
                        setCurrentUserStatus(currentU.userStatus?.statusName || '');
                    }
                }

                const whereClause: any = {
                    status: { statusName: 'Approved' }
                };

                if (restricted.length > 0) {
                    whereClause.authorId = { notIn: restricted };
                }

                if (selectedCategories.length > 0) {
                    whereClause.category = { eventCategoryName: { in: selectedCategories } };
                }

                const now = new Date();
                now.setHours(0, 0, 0, 0);

                if (timeRange === 'Upcoming') {
                    whereClause.eventDate = { gte: now.toISOString() };
                } else if (timeRange === 'Past') {
                    whereClause.eventDate = { lt: now.toISOString() };
                } else if (timeRange === '7 days') {
                    const next7Days = new Date(now);
                    next7Days.setDate(next7Days.getDate() + 7);
                    whereClause.eventDate = { gte: now.toISOString(), lte: next7Days.toISOString() };
                } else if (timeRange === '30 days') {
                    const next30Days = new Date(now);
                    next30Days.setDate(next30Days.getDate() + 30);
                    whereClause.eventDate = { gte: now.toISOString(), lte: next30Days.toISOString() };
                }

                const res = await api.get('/events', {
                    params: {
                        _limit: visibleCount,
                        _sort: timeRange === 'Past' ? '-eventDate' : 'eventDate',
                        _where: JSON.stringify(whereClause),
                        _include: 'location,status,category'
                    }
                });

                const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                setEvents(data);
                setTotalEvents(res.data?.items !== undefined ? res.data.items : data.length);
            } catch (error) {
                console.error("Failed to fetch events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [visibleCount, selectedCategories, timeRange, session?.userId]);

    const categories = allCategories;

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

    const formatLocation = (loc: any) => {
        if (!loc) return 'TBA';
        if (typeof loc === 'string') return loc;
        const parts = [loc.landmark, loc.barangay, loc.cityMunicipality, loc.province].filter(Boolean);
        return parts.join(', ');
    };

    const formatTime = (timeStr: string) => {
        if (!timeStr) return '';
        if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayHours = h % 12 || 12;
        return `${displayHours}:${minutes} ${ampm}`;
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
                            {currentUserStatus !== 'Suspended' && currentUserStatus !== 'Banned' && (
                                <CreateEventModal
                                    trigger={
                                        <button
                                            className="flex items-center justify-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-lg hover:bg-brand-primary-hover transition-colors font-semibold"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Create Event
                                        </button>
                                    }
                                />
                            )}
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
                                className={timeRange === range ? "bg-brand-primary hover:bg-brand-primary text-white" : ""}
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
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                        <Loader2 className="w-12 h-12 text-brand-primary animate-spin mb-4" />
                        <p className="text-gray-500">Loading events...</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-6 mb-6">
                            {events.map((event) => {
                                const categoryName = event.eventCategory?.eventCategoryName || 'Unknown';
                                return (
                                    <Link
                                        key={event.id}
                                        to={`/events/${event.id}`}
                                        className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
                                    >
                                        <div className="flex flex-col md:flex-row md:h-[200px] lg:h-[220px]">
                                            {/* Image */}
                                            <div className="relative w-full md:w-64 lg:w-80 h-48 md:h-full flex-shrink-0 overflow-hidden">
                                                <img
                                                    src={event.eventImage}
                                                    alt={event.title}
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                />
                                                <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-semibold ${getCategoryColor(categoryName)}`}>
                                                    {categoryName}
                                                </span>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 p-6 flex flex-col">
                                                <div className="flex-1 overflow-hidden">
                                                    <h2 className="text-2xl font-bold mb-3 text-gray-900 hover:text-brand-primary transition-colors line-clamp-2">
                                                        {event.title}
                                                    </h2>

                                                    <p className="text-gray-600 mb-4 line-clamp-2">
                                                        {event.description}
                                                    </p>

                                                    {/* Event Meta Information */}
                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-brand-primary" />
                                                            <span>{new Date(event.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4 text-brand-primary" />
                                                            <span>{event.endTime ? `${formatTime(event.startTime)} - ${formatTime(event.endTime)}` : formatTime(event.startTime)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {categoryName === 'Virtual' ? (
                                                                <Video className="w-4 h-4 text-brand-primary" />
                                                            ) : (
                                                                <MapPin className="w-4 h-4 text-brand-primary" />
                                                            )}
                                                            <span>
                                                                {categoryName === 'Virtual'
                                                                    ? `Virtual (${event.modality || 'Online'})`
                                                                    : formatLocation(event.location)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* View Details Link */}
                                                <div className="pt-2 mt-auto">
                                                    <span className="text-brand-primary font-semibold hover:text-brand-primary-hover inline-flex items-center gap-1">
                                                        View Details
                                                        <span aria-hidden="true">→</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {events.length < totalEvents && (
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
                        {events.length === 0 && (
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
                    </>
                )}
            </div>
        </div>
    );
}

