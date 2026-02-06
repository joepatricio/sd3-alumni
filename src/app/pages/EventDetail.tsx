import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, ArrowLeft, Users } from 'lucide-react';

export function EventDetail() {
    const { id } = useParams<{ id: string }>();

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
                {/* Back Button */}
                <Link
                    to="/events"
                    className="inline-flex items-center gap-2 text-[#1a5f3f] hover:text-[#2d7a4f] mb-6 font-semibold"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Events
                </Link>

                {/* Placeholder Content */}
                <div className="text-center py-16">
                    <Calendar className="w-16 h-16 text-[#1a5f3f] mx-auto mb-4" />
                    <h1 className="text-3xl font-bold mb-4">Event Details</h1>
                    <p className="text-gray-600 mb-8">
                        Event ID: <span className="font-semibold">{id}</span>
                    </p>
                    <div className="bg-gray-50 rounded-lg p-8 max-w-2xl mx-auto">
                        <p className="text-gray-700">
                            This is a placeholder for the event detail page. The full event
                            details, registration functionality, and additional features will be
                            implemented in the next sprint.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
