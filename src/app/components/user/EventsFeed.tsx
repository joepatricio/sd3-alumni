import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Video, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCategoryColor } from '@/app/views/formatters';
import { LazyImage } from '@components/user/LazyImage';
import { api, type EventData } from '@/app/views/api';

export function EventsFeed() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const todayStr = new Date().toISOString().split('T')[0] + 'T00:00:00.000Z';
        const res = await api.get('/events', {
          params: {
            _limit: 4,
            _sort: 'eventDate',
            _include: 'location,status,category',
            _where: JSON.stringify({
              eventStatus: { statusName: 'Approved' },
              eventDate: { gte: todayStr }
            })
          }
        });
        const data = Array.isArray(res.data) ? res.data : res.data.data;
        setEvents(data || []);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const displayEvents = events;

  const formatLocation = (loc: any) => {
    if (!loc) return 'TBA';
    if (typeof loc === 'string') return loc;
    const parts = [loc.landmark, loc.barangay, loc.cityMunicipality, loc.province].filter(Boolean);
    return parts.join(', ');
  };

  if (loading) {
    return (
      <section id="events" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
          <Loader2 className="w-12 h-12 text-brand-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading upcoming events...</p>
        </div>
      </section>
    );
  }

  if (displayEvents.length === 0) {
    return (
      <section id="events" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-8 text-center">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">Upcoming Events</h2>
          </div>
          <div className="py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-xl font-medium text-gray-600 mb-1">No Upcoming Events</h3>
            <p className="text-gray-500">Check back later for exciting events and gatherings.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="events" className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Upcoming Events</h2>
            <p className="text-gray-600">
              Join us for exciting gatherings and networking opportunities
            </p>
          </div>
          <Link
            to="/events"
            className="text-brand-primary hover:text-brand-primary-hover font-semibold hidden sm:block"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayEvents.map((event) => {
            const categoryName = event.eventCategory?.eventCategoryName || 'Unknown';
            return (
              <div
                key={event.id}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48 overflow-hidden">
                  <LazyImage
                    src={event.eventImage}
                    alt={event.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold ${getCategoryColor(categoryName)}`}>
                    {categoryName}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3 line-clamp-2">{event.title}</h3>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{new Date(event.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {categoryName === 'Virtual' ? (
                        <Video className="w-4 h-4" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                      <span className="text-sm">
                        {categoryName === 'Virtual' ? `Virtual (${event.modality || 'Online'})` : formatLocation(event.location)}
                      </span>
                    </div>
                    {event.responses > 0 && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{event.responses} attending</span>
                      </div>
                    )}
                  </div>
                  <Link
                    to={`/events/${event.id}`}
                    className="mt-4 block text-center w-full bg-brand-primary cursor-pointer text-white py-2 rounded-lg hover:bg-brand-primary-hover transition-colors font-semibold"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link
            to="/events"
            className="text-brand-primary cursor-pointer hover:text-brand-primary-hover font-semibold"
          >
            View All Events →
          </Link>
        </div>
      </div>
    </section>
  );
}