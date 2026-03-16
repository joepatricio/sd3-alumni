import { Calendar, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { events as mockEvents } from '@assets/mockData';

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
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-4 right-4 bg-[#1a5f3f] text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {event.category}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3">{event.title}</h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
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