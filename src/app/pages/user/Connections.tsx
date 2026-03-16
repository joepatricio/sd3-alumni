import { MoreVertical, UserMinus } from 'lucide-react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { ProfileHeader } from '@components/user/ProfileHeader';
import { QuickActions } from '@components/user/QuickActions';
import { userData, connectionsData } from '@assets/mockData';

export function Connections() {
    const navigate = useNavigate();
    const { isLoggedIn } = useOutletContext<{ isLoggedIn: boolean }>();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
                {/* Profile Header */}
                <ProfileHeader
                    userData={userData}
                    isOwner={false}
                    onEdit={() => navigate('/profile/edit')}
                />

                <QuickActions isLoggedIn={isLoggedIn} />

                <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold">Connections ({connectionsData.length})</h2>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Search connections..."
                                className="px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {connectionsData.map((connection) => (
                            <div key={connection.id} className="border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={connection.avatar}
                                        alt={connection.name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div>
                                        <h3 className="font-semibold">{connection.name}</h3>
                                        <p className="text-sm text-gray-600">{connection.role} at {connection.company}</p>
                                        <p className="text-xs text-gray-500">Connected since {connection.connectedSince}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full" title="Remove Connection">
                                        <UserMinus className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
