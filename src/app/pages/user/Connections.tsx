import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Ban, UserMinus, Loader2, Search, UserCheck, X, Unlock } from 'lucide-react';
import { ProfileHeader } from '@components/user/ProfileHeader';
import { api, useProfileRoute, useSystemLookup, type ProfileData } from '@/app/views/api';
import { handleConnection } from '@/app/views/user';

export function Connections() {
    const navigate = useNavigate();
    const location = useLocation();

    const { profileId, isOwner } = useProfileRoute();
    const { lookup, reverseLookup } = useSystemLookup();

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [connections, setConnections] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState(location.state?.tab || 'friends');

    useEffect(() => {
        const fetchConnectionsData = async () => {
            try {
                setLoading(true);
                // Fetch profile of the user being viewed
                const [profileRes] = await Promise.all([
                    api.get('/profiles', { params: { 'userId': profileId, '_embed': 'degree' } })
                ]);

                const profileDataRaw = profileRes.data;
                const profile = Array.isArray(profileDataRaw) ? profileDataRaw[0] : profileDataRaw;
                setProfile(profile);

                let connectionCode = reverseLookup('Accepted');
                if (isOwner) {
                    if (activeTab === 'pending') connectionCode = reverseLookup('Requested');
                    if (activeTab === 'blocked') connectionCode = reverseLookup('Blocking');
                }

                // Fetch user's connections
                const connectionsRes = await api.get('/userConnections', {
                    params: {
                        'userId': profileId,
                        'connectionStatusId': connectionCode
                    }
                });

                const connData = connectionsRes.data;

                if (connData.length > 0) {
                    const friendIds = connData.map((c: any) => c.friendId).join(',');
                    const friendsRes = await api.get('/profiles', { params: { 'userId:in': friendIds, '_embed': 'degree' } });
                    const friendsArray = friendsRes.data;

                    // Attach the connection record to the profile data so we have the IDs for actions
                    const enrichedConnections = friendsArray.map((friend: any) => {
                        const conn = connData.find((c: any) => String(c.friendId) === String(friend.userId));
                        return { ...friend, _connection: conn };
                    });

                    setConnections(enrichedConnections);
                } else {
                    setConnections([]);
                }
            } catch (err) {
                console.error("Failed to load connections", err);
            } finally {
                setLoading(false);
            }
        };

        if (profileId) {
            fetchConnectionsData();
        }
    }, [profileId, activeTab, reverseLookup]);

    const handleAction = async (action: string, friendId: string) => {
        setLoading(true);
        try {
            await handleConnection(action as any, profileId, friendId, reverseLookup);
            // Refresh list
            setConnections(connections.filter(c => c.userId !== friendId));
        } catch (err) {
            console.error(`Action ${action} failed`, err);
        } finally {
            setLoading(false);
        }
    };

    const filteredConnections = connections.filter(conn =>
        conn.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conn.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conn.currentJob.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand-primary" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800">Profile not found</h2>
                    <button
                        onClick={() => navigate('/alumni')}
                        className="mt-4 text-brand-primary hover:underline"
                    >
                        Back to Directory
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
                {/* Profile Header */}
                <ProfileHeader
                    name={profile.userName}
                    degree={profile.degree ? `${profile.degree.degreeName} (${profile.degree.degreeAbbr})` : lookup(profile.degreeId)}
                    graduationYear={profile.batch.toString()}
                    profileImage={profile.profileImage}
                    bio="Alumni of University of San Jose - Recoletos."
                    isProfilePage={false}
                    onEdit={() => navigate('/profile/edit')}
                />

                <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-6 border-b border-gray-100 w-full md:w-auto overflow-x-auto no-scrollbar">
                            <button
                                onClick={() => setActiveTab('friends')}
                                className={`pb-3 font-bold text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === 'friends' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                            >
                                Friends
                            </button>
                            {isOwner && (
                                <>
                                    <button
                                        onClick={() => setActiveTab('pending')}
                                        className={`pb-3 font-bold text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === 'pending' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                    >
                                        Pending Requests
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('blocked')}
                                        className={`pb-3 font-bold text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === 'blocked' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                    >
                                        Blocked Users
                                    </button>
                                </>
                            )}
                        </div>
                        <div className="relative shrink-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, company, or role..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary w-full md:w-80"
                            />
                        </div>
                    </div>

                    {filteredConnections.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredConnections.map((connection) => (
                                <div key={connection.userId} className="border border-gray-100 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={connection.profileImage}
                                            alt={connection.userName}
                                            className="w-14 h-14 rounded-full object-cover border-2 border-gray-50"
                                        />
                                        <div>
                                            <h3 className="font-semibold text-gray-900 group-hover:text-brand-primary transition-colors cursor-pointer" onClick={() => navigate(`/profile/${connection.userId}`)}>
                                                {connection.userName}
                                            </h3>
                                            <p className="text-sm text-gray-600">{connection.currentJob} at {connection.company}</p>
                                            <p className="text-xs text-gray-400 mt-1">Batch {connection.batch}</p>
                                        </div>
                                    </div>

                                    {isOwner && activeTab === 'friends' && (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleAction('remove', connection.userId)}
                                                className="p-2 text-gray-400 hover:text-brand-primary hover:bg-orange-50 rounded-lg transition-colors"
                                                title="Remove Connection"
                                            >
                                                <UserMinus className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleAction('block', connection.userId)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Block User">
                                                <Ban className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}

                                    {isOwner && activeTab === 'pending' && (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleAction('accept', connection.userId)}
                                                className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors font-semibold"
                                                title="Accept Request"
                                            >
                                                <UserCheck className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleAction('reject', connection.userId)}
                                                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-semibold"
                                                title="Reject Request">
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )}

                                    {isOwner && activeTab === 'blocked' && (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleAction('unblock', connection.userId)}
                                                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-semibold"
                                                title="Unblock User"
                                            >
                                                <Unlock className="w-4 h-4" />
                                                Unblock
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-500">No connections found matching your search.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
