import { Link } from 'react-router-dom';
import { Users, Heart, Eye } from 'lucide-react';

export function QuickActions() {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-wrap items-center gap-4">

            <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors font-medium"
            >
                <Eye className="w-4 h-4" />
                View Profile
            </Link>

            <Link
                to="/profile/connections"
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors font-medium"
            >
                <Users className="w-4 h-4" />
                View Connections
            </Link>

            <Link
                to="/directory"
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors font-medium"
            >
                <Users className="w-4 h-4" />
                Alumni Directory
            </Link>

            <Link
                to="/donate"
                className="flex items-center gap-2 px-4 py-2 bg-brand-accent hover:bg-brand-accent-hover text-white rounded-lg transition-colors font-medium"
            >
                <Heart className="w-4 h-4" />
                Make a Donation
            </Link>
        </div>
    );
}
