import { Calendar, MapPin, Users } from 'lucide-react';

export function EventsFeed() {
  const events = [
    {
      id: 1,
      title: 'Annual Homecoming 2026',
      date: 'March 15, 2026',
      location: 'USJR Main Campus',
      attendees: 450,
      image:
        'https://images.unsplash.com/photo-1758270703262-2b40b6b66be6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwYWx1bW5pJTIwY2VsZWJyYXRpb24lMjBncmFkdWF0aW9ufGVufDF8fHx8MTc3MDA5MTgzOHww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Reunion',
    },
    {
      id: 2,
      title: 'Business Networking Night',
      date: 'February 20, 2026',
      location: 'Cebu Business Park',
      attendees: 120,
      image:
        'https://images.unsplash.com/photo-1768508948485-a7adc1f3427f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG5ldHdvcmtpbmclMjBldmVudCUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NzAwOTE4Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Networking',
    },
    {
      id: 3,
      title: 'Community Service Day',
      date: 'February 28, 2026',
      location: 'Various Locations, Cebu',
      attendees: 85,
      image:
        'https://images.unsplash.com/photo-1767274101063-a735a6849afc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBnYXRoZXJpbmclMjBwZW9wbGUlMjBkaXZlcnNlfGVufDF8fHx8MTc3MDA5MTgzOXww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Community',
    },
    {
      id: 4,
      title: 'Career Development Workshop',
      date: 'March 5, 2026',
      location: 'Online Event',
      attendees: 200,
      image:
        'https://images.unsplash.com/photo-1763718432504-7716caff6e99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXJlZXIlMjBwcm9mZXNzaW9uYWwlMjBzdWNjZXNzJTIwbWVudG9yfGVufDF8fHx8MTc3MDA5MTg0MHww&ixlib=rb-4.1.0&q=80&w=1080',
      category: 'Professional',
    },
  ];

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
          <a
            href="/events"
            className="text-[#1a5f3f] hover:text-[#2d7a4f] font-semibold hidden sm:block"
          >
            View All →
          </a>
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
                <button className="mt-4 w-full bg-[#1a5f3f] text-white py-2 rounded-lg hover:bg-[#2d7a4f] transition-colors font-semibold">
                  Register Now
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <a
            href="/events"
            className="text-[#1a5f3f] hover:text-[#2d7a4f] font-semibold"
          >
            View All Events →
          </a>
        </div>
      </div>
    </section>
  );
}