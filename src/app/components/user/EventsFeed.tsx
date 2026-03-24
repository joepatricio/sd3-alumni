import { Calendar, MapPin, Users, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { events } from '@assets/mockData';
import { getCategoryColor } from '@utils/categoryColors';
import { filterUpcomingEvents } from '@utils/eventFilters';
import { LazyImage } from '@components/user/LazyImage';

const mockEvents = filterUpcomingEvents(events.filter(e => e.status === "Approved"));

export function EventsFeed() {
  const formatLocation = (event: any) => {
    if (event.category === 'Virtual') return `Virtual (${event.modality || 'Online'})`;
    const loc = event.location;
    if (typeof loc === 'string') return loc;
    const parts = [loc.streetOrLandmark, loc.barangay, loc.cityMunicipality, loc.province].filter(Boolean);
    return parts.join(', ');
  };

  const events = mockEvents.slice(0, 4).map(e => ({
    ...e,
    attendees: e.responses.going,
    location: formatLocation(e),
    url: `/events/${e.id}`,
  }));

  if (events.length === 0) {
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
            className="text-[#1a5f3f] hover:text-[#2d7a4f] font-semibold hidden sm:block"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="relative h-48 overflow-hidden">
                <LazyImage
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-semibold ${getCategoryColor(event.category)}`}>
                  {event.category}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">{event.title}</h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {event.category === 'Virtual' ? (
                      <Video className="w-4 h-4" />
                    ) : (
                      <MapPin className="w-4 h-4" />
                    )}
                    <span className="text-sm">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{event.attendees} attending</span>
                  </div>
                </div>
                <Link
                  to={event.url}
                  className="mt-4 block text-center w-full bg-[#1a5f3f] cursor-pointer text-white py-2 rounded-lg hover:bg-[#2d7a4f] transition-colors font-semibold"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link
            to="/events"
            className="text-[#1a5f3f] cursor-pointer hover:text-[#2d7a4f] font-semibold"
          >
            View All Events →
          </Link>
        </div>
      </div>
    </section>
  );
}