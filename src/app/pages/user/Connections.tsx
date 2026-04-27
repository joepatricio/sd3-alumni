import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Ban, UserMinus, Loader2, Search } from 'lucide-react';
import { ProfileHeader } from '@components/user/ProfileHeader';
import { api, type ProfileData } from '@utils/api';

export function Connections() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const profileId = id || '1';
    const isOwner = profileId === '1';

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [degree, setDegree] = useState<string>('');
    const [connections, setConnections] = useState<ProfileData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchConnectionsData = async () => {
            try {
                setLoading(true);
                // Fetch profile of the user being viewed
                const [profileRes, degreesRes] = await Promise.all([
                    api.get('/PROFILE', { params: { 'user_id': profileId } }),
                    api.get('/DEGREE')
                ]);

                const profileDataRaw = profileRes.data.data || profileRes.data;
                const profile = Array.isArray(profileDataRaw) ? profileDataRaw[0] : profileDataRaw;
                setProfile(profile);

                if (profile) {
                    const degrees = degreesRes.data.data || degreesRes.data || [];
                    const degreeData = degrees.find((d: any) => Number(d.degree_id) === Number(profile.degree_id));
                    setDegree(degreeData ? `${degreeData.degree_name} (${degreeData.degree_abbr})` : '');
                }

                // Fetch user's connections (accepted status: 201)
                const connectionsRes = await api.get('/USER_CONNECTIONS', {
                    params: {
                        'user_id': profileId,
                        'connection_code': 201
                    }
                });

                const connData = connectionsRes.data.data || connectionsRes.data || [];

                if (connData.length > 0) {
                    const friendIds = connData.map((c: any) => c.friend_id).join(',');
                    const friendsRes = await api.get('/PROFILE', { params: { 'user_id:in': friendIds } });
                    const friendsData = friendsRes.data.data || friendsRes.data || [];
                    setConnections(Array.isArray(friendsData) ? friendsData : [friendsData]);
                } else {
                    setConnections([]);
                }
            } catch (err) {
                console.error("Failed to load connections", err);
            } finally {
                setLoading(false);
            }
        };

        fetchConnectionsData();
    }, [profileId]);

    const filteredConnections = connections.filter(conn =>
        conn.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                    name={profile.user_name}
                    degree={degree}
                    graduationYear={profile.batch.toString()}
                    profileImage={profile.profileImage}
                    bio="Alumni of University of San Jose - Recoletos."
                    isProfilePage={false}
                    onEdit={() => navigate('/profile/edit')}
                />

                <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <h2 className="text-xl font-bold text-gray-800">
                            Connections ({filteredConnections.length})
                        </h2>
                        <div className="relative">
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
                                <div key={connection.user_id} className="border border-gray-100 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-all group">
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={connection.profileImage}
                                            alt={connection.user_name}
                                            className="w-14 h-14 rounded-full object-cover border-2 border-gray-50"
                                        />
                                        <div>
                                            <h3 className="font-semibold text-gray-900 group-hover:text-brand-primary transition-colors cursor-pointer" onClick={() => navigate(`/profile/${connection.user_id}`)}>
                                                {connection.user_name}
                                            </h3>
                                            <p className="text-sm text-gray-600">{connection.currentJob} at {connection.company}</p>
                                            <p className="text-xs text-gray-400 mt-1">Batch {connection.batch}</p>
                                        </div>
                                    </div>

                                    {isOwner && (
                                        <div className="flex items-center gap-1">
                                            <button
                                                className="p-2 text-gray-400 hover:text-brand-primary hover:bg-orange-50 rounded-lg transition-colors"
                                                title="Remove Connection"
                                            >
                                                <UserMinus className="w-5 h-5" />
                                            </button>
                                            <button
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Block User">
                                                <Ban className="w-5 h-5" />
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
