import { Calendar, MapPin, Tag, Clock } from 'lucide-react';

interface Event {
    id: number;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    category: string;
    image: string;
}

export function Events() {
    const events: Event[] = [
        {
            id: 1,
            title: 'Annual Homecoming Celebration 2026',
            description:
                'Join us for the biggest alumni gathering of the year! Reconnect with classmates, enjoy live entertainment, campus tours, and celebrate Josenian pride together.',
            date: 'March 15, 2026',
            time: '9:00 AM - 5:00 PM',
            location: 'USJR Main Campus, Cebu City',
            category: 'Reunion',
            image: 'https://images.unsplash.com/photo-1770097042618-438684ff665f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBjZWxlYnJhdGlvbiUyMGV2ZW50fGVufDF8fHx8MTc3MDI3MTkyOXww&ixlib=rb-4.1.0&q=80&w=1080',
        },
        {
            id: 2,
            title: 'Professional Networking Night: Tech & Innovation',
            description:
                'Connect with fellow Josenian professionals in the technology and innovation sectors. Share insights, explore collaborations, and expand your network.',
            date: 'February 28, 2026',
            time: '6:00 PM - 9:00 PM',
            location: 'Oakridge Business Park, Cebu',
            category: 'Networking',
            image: 'https://images.unsplash.com/photo-1761195689615-9469b65dac01?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG5ldHdvcmtpbmclMjBldmVudCUyMHByb2Zlc3Npb25hbHN8ZW58MXx8fHwxNzcwMTU3OTY3fDA&ixlib=rb-4.1.0&q=80&w=1080',
        },
        {
            id: 3,
            title: 'Leadership Summit: Alumni Edition',
            description:
                'A full-day conference featuring keynote speakers, panel discussions, and workshops on leadership, entrepreneurship, and professional development.',
            date: 'March 22, 2026',
            time: '8:00 AM - 6:00 PM',
            location: 'Radisson Blu Hotel, Cebu City',
            category: 'Conference',
            image: 'https://images.unsplash.com/photo-1769839271768-aee5469799ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjb25mZXJlbmNlJTIwc2VtaW5hcnxlbnwxfHx8fDE3NzAyNzE5Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080',
        },
        {
            id: 4,
            title: 'Class of 2016 10-Year Reunion',
            description:
                'Celebrate a decade since graduation! Reminisce about college memories, catch up with classmates, and see how far we\'ve all come in our respective journeys.',
            date: 'April 5, 2026',
            time: '5:00 PM - 11:00 PM',
            location: 'Waterfront Hotel, Cebu City',
            category: 'Reunion',
            image: 'https://images.unsplash.com/photo-1717944186818-c628ca7c2b99?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZW9wbGUlMjBtaW5nbGluZyUyMHNvY2lhbCUyMGV2ZW50fGVufDF8fHx8MTc3MDI3MTkzMnww&ixlib=rb-4.1.0&q=80&w=1080',
        },
        {
            id: 5,
            title: 'Mentorship Workshop: Guiding the Next Generation',
            description:
                'Learn effective mentorship strategies and connect with current students seeking guidance. Make a lasting impact on the future of USJR.',
            date: 'February 18, 2026',
            time: '2:00 PM - 5:00 PM',
            location: 'USJR Alumni Center',
            category: 'Workshop',
            image: 'https://images.unsplash.com/photo-1760420940953-3958ad9f6287?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc2hvcCUyMHRyYWluaW5nJTIwc2Vzc2lvbnxlbnwxfHx8fDE3NzAyNzE5Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080',
        },
        {
            id: 6,
            title: 'Commencement Ceremony 2026',
            description:
                'Witness the graduation of the newest members of the Josenian alumni community. Alumni are invited to attend and welcome the graduates.',
            date: 'April 20, 2026',
            time: '3:00 PM - 6:00 PM',
            location: 'USJR Gymnasium',
            category: 'Ceremony',
            image: 'https://images.unsplash.com/photo-1738949538943-e54722a44ffc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFkdWF0aW9uJTIwY2VyZW1vbnklMjB1bml2ZXJzaXR5fGVufDF8fHx8MTc3MDI3MTkzMnww&ixlib=rb-4.1.0&q=80&w=1080',
        },
        {
            id: 7,
            title: 'Global Alumni Virtual Summit',
            description:
                'A virtual gathering for Josenians around the world. Join from anywhere to hear updates, participate in discussions, and connect globally.',
            date: 'March 8, 2026',
            time: '7:00 PM - 9:00 PM (PHT)',
            location: 'Virtual Event (Zoom)',
            category: 'Virtual',
            image: 'https://images.unsplash.com/photo-1769839271768-aee5469799ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBjb25mZXJlbmNlJTIwc2VtaW5hcnxlbnwxfHx8fDE3NzAyNzE5Mjh8MA&ixlib=rb-4.1.0&q=80&w=1080',
        },
        {
            id: 8,
            title: 'Sports Fest: Alumni Edition',
            description:
                'Show your competitive spirit at the annual alumni sports festival. Basketball, volleyball, and other games await. All skill levels welcome!',
            date: 'May 10, 2026',
            time: '7:00 AM - 4:00 PM',
            location: 'USJR Sports Complex',
            category: 'Sports',
            image: 'https://images.unsplash.com/photo-1770097042618-438684ff665f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBjZWxlYnJhdGlvbiUyMGV2ZW50fGVufDF8fHx8MTc3MDI3MTkyOXww&ixlib=rb-4.1.0&q=80&w=1080',
        },
    ];

    // Filter events not older than 5 years
    const currentDate = new Date();
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(currentDate.getFullYear() - 5);

    const filteredEvents = events.filter((event) => {
        const eventDate = new Date(event.date);
        return eventDate >= fiveYearsAgo;
    });

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Alumni Events</h1>
                    <p className="text-gray-600 text-lg">
                        Connect, learn, and celebrate with fellow Josenians at our upcoming
                        events
                    </p>
                </div>

                {/* Events List */}
                <div className="space-y-6">
                    {filteredEvents.map((event) => (
                        <a
                            key={event.id}
                            href={`/events/${event.id}`}
                            className="block bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
                        >
                            <div className="flex flex-col md:flex-row">
                                {/* Image */}
                                <div className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0 overflow-hidden">
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
                                <div className="flex-1 p-6">
                                    <h2 className="text-2xl font-bold mb-3 text-gray-900 hover:text-[#1a5f3f] transition-colors">
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
                                            <span>{event.location}</span>
                                        </div>
                                    </div>

                                    {/* View Details Link */}
                                    <div className="mt-4">
                                        <span className="text-[#1a5f3f] font-semibold hover:text-[#2d7a4f] inline-flex items-center gap-1">
                                            View Details
                                            <span aria-hidden="true">→</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </a>
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
