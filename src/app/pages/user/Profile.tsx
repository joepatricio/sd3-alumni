import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Calendar, Award, Heart, Loader2, Mail, Phone, MapPin, Briefcase, MessageSquare, FileText, User } from 'lucide-react';
import { ProfileHeader } from '@components/user/ProfileHeader';
import { api, AchievementIconMap, useProfileRoute, useSystemLookup, type ProfileData, type UserStatisticsData } from '@/app/views/api';
import { useAuth } from '@/app/views/auth';
import { formatCurrency } from '@/app/views/formatters';
import { NotFound } from '@pages/NotFound';
import { LazyImage } from '@components/user/LazyImage';
import { UserDonations } from '@components/user/UserDonations';

export function Profile() {
    const navigate = useNavigate();
    const location = useLocation();
    const { profileId, isOwner } = useProfileRoute();
    const { session } = useAuth();
    const currentUserId = session?.userId;
    const { lookup, reverseLookup, loading: lookupLoading } = useSystemLookup();

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [userRecord, setUserRecord] = useState<any>(null);
    const [statsData, setStatsData] = useState<UserStatisticsData | null>(null);
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'overview');

    const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
    const [connections, setConnections] = useState<any[]>([]);
    const [connection, setConnection] = useState<any>(null);
    const [achievements, setAchievements] = useState<any[]>([]);
    const [bulletins, setBulletins] = useState<any[]>([]);
    const [comments, setComments] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const [profileRes, userRes, statsRes, connRes, achUserRes, relRes, pendingRes] = await Promise.all([
                    api.get<any>('/profiles', { params: { 'userId': profileId, '_embed': 'degree' } }),
                    api.get<any>('/users', { params: { 'id': profileId } }),
                    api.get<any>('/userStatistics', { params: { 'userId': profileId } }),
                    api.get(`/userConnections`, { params: { 'userId': profileId, _per_page: 6, 'connectionStatusId': reverseLookup('Accepted') } }),
                    api.get(`/userAchievements`, { params: { 'userId': profileId, _sort: '-achievedDate', '_embed': 'achievement' } }),
                    !isOwner && currentUserId ? api.get(`/userConnections`, { params: { 'userId': currentUserId, 'friendId': profileId } }) : Promise.resolve({ data: [] }),
                    isOwner ? api.get(`/userConnections`, { params: { 'userId': profileId, 'connectionStatusId': reverseLookup('Requested') } }) : Promise.resolve({ data: [] })
                ]);

                setProfile(profileRes.data[0]);
                setUserRecord(userRes.data[0]);
                setStatsData(statsRes.data[0]);

                if (relRes.data && relRes.data.length > 0) {
                    setConnection(relRes.data[0]);
                } else {
                    setConnection(null);
                }

                if (pendingRes.data) {
                    setPendingRequestsCount(pendingRes.data.length);
                }

                const conns = connRes.data || [];
                if (conns.length > 0) {
                    const friendIds = conns.map((c: any) => c.friendId).join(',');
                    const friendsRes = await api.get(`/profiles`, { params: { 'userId:in': friendIds } });
                    setConnections(friendsRes.data || []);
                }

                const userAchs = achUserRes.data || [];
                setAchievements(userAchs);

            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setLoading(false);
            }
        };

        if (!lookupLoading) {
            fetchProfileData();
        }
    }, [profileId, lookupLoading, reverseLookup]);

    useEffect(() => {
        const fetchTabContent = async () => {
            if (activeTab === 'overview' || activeTab === 'bulletins') {
                api.get('/bulletins', { params: { 'authorId': profileId, _sort: '-bulletinDate' } })
                    .then(res => setBulletins(res.data || []));
            }
            if (activeTab === 'overview' || activeTab === 'comments') {
                api.get('/comments', { params: { 'userId': profileId, _sort: '-commentDate', '_embed': 'bulletin' } })
                    .then(res => {
                        const fetchedComments = res.data || [];
                        setComments(fetchedComments);
                    });
            }
            if (activeTab === 'events') {
                api.get('/userRsvps', { params: { 'userId': profileId, 'isAttending': true } }).then(async rsvpRes => {
                    const rsvps = rsvpRes.data || [];
                    if (rsvps.length > 0) {
                        const eventIds = rsvps.map((r: any) => r.eventId).join(',');
                        const eventRes = await api.get('/events', { params: { 'id:in': eventIds, _sort: '-eventDate', '_embed': 'location' } });
                        const attended = eventRes.data || [];
                        const now = new Date();
                        now.setHours(0, 0, 0, 0);
                        attended.sort((a: any, b: any) => {
                            const dateA = new Date(a.eventDate);
                            const dateB = new Date(b.eventDate);
                            const isUpcomingA = dateA >= now;
                            const isUpcomingB = dateB >= now;
                            if (isUpcomingA && !isUpcomingB) return -1;
                            if (!isUpcomingA && isUpcomingB) return 1;
                            if (isUpcomingA) return dateA.getTime() - dateB.getTime();
                            return dateB.getTime() - dateA.getTime();
                        });
                        setEvents(attended);
                    } else {
                        setEvents([]);
                    }
                });
            }
        };
        fetchTabContent();
    }, [profileId, activeTab]);

    if (loading || lookupLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
            </div>
        );
    }

    if (!profile || !statsData || !userRecord) {
        return <NotFound />;
    }

    const overviewContent = [...bulletins.map(b => ({ ...b, type: 'bulletin' })), ...comments.map(c => ({ ...c, type: 'comment' }))]
        .sort((a, b) => new Date(b.bulletinDate || b.commentDate).getTime() - new Date(a.bulletinDate || a.commentDate).getTime());

    const renderBulletin = (b: any) => (
        <div key={`bulletin-${b.id}`} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4 last:mb-0 hover:shadow-md transition-shadow">
            <Link to={`/bulletin/${b.id}`}>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <FileText className="w-4 h-4" />
                    <span>Posted a bulletin • {new Date(b.bulletinDate).toLocaleDateString()}</span>
                </div>
                {b.bulletinImage && (
                    <div className="w-full h-48 mb-3 rounded-md overflow-hidden bg-gray-100">
                        <LazyImage
                            src={b.bulletinImage}
                            alt={b.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                <h4 className="font-bold text-lg text-brand-primary">{b.title}</h4>
                <p className="text-gray-700 text-sm line-clamp-2 mt-1">{b.content}</p>
                <p className="text-sm text-brand-accent font-medium mt-2 inline-block">Read more</p>
            </Link>
        </div>
    );

    const renderComment = (c: any) => (
        <div key={`comment-${c.id}`} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4 last:mb-0 hover:shadow-md transition-shadow">
            <Link to={`/bulletin/${c.bulletinId}`}>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Commented on {c.bulletin?.title ? `"${c.bulletin.title}"` : 'a bulletin'} • {new Date(c.commentDate).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-800 text-sm">"{c.comment}"</p>
                <p className="text-sm text-brand-accent font-medium mt-2 inline-block">View Bulletin</p>
            </Link >
        </div >
    );

    const renderEvent = (event: any) => {
        const isUpcoming = new Date(event.eventDate) >= new Date();
        return (
            <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="group bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full"
            >
                <div className="relative h-32 w-full overflow-hidden bg-gray-100">
                    {event.eventImage && (
                        <LazyImage
                            src={event.eventImage}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    )}
                    {isUpcoming ? (
                        <div className="absolute top-2 right-2 bg-brand-primary text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                            Upcoming
                        </div>
                    ) : (
                        <div className="absolute top-2 right-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                            Past
                        </div>
                    )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-base mb-2 text-gray-900 group-hover:text-brand-primary transition-colors line-clamp-1">
                        {event.title}
                    </h3>
                    <div className="space-y-1 text-xs text-gray-600 mt-auto">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-brand-primary shrink-0" />
                            <span>{new Date(event.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-brand-primary shrink-0" />
                            <span className="truncate">{event.location?.landmark || event.modality}</span>
                        </div>
                    </div>
                </div>
            </Link>
        );
    };

    const aboutConfig = [
        {
            condition: profile.currentJob || profile.company,
            icon: Briefcase,
            content: (
                <>
                    {profile.currentJob}
                    {profile.currentJob && profile.company && " at "}
                    {profile.company}
                </>
            ),
        },
        {
            condition: profile.email,
            icon: Mail,
            content: (
                <a
                    href={`mailto:${profile.email}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate hover:underline hover:text-brand-primary-hover cursor-pointer"
                >
                    {profile.email}
                </a>
            ),
        },
        {
            condition: profile.phone,
            icon: Phone,
            content: profile.phone,
        },
        {
            condition: profile.location,
            icon: MapPin,
            content: profile.location,
        },
        {
            condition: profile.birthday,
            icon: Calendar,
            content: `Born ${new Date(profile.birthday).toLocaleDateString(
                "en-US",
                { month: "long", day: "numeric", year: "numeric" }
            )}`,
        },
    ];
    const aboutIsEmpty = !aboutConfig.some(field => field.condition);

    let visibility = 'hidden';
    let tabVisibility = false;
    const profStatus = userRecord ? lookup(userRecord.profileStatusId) : 'hidden';
    const isConnected = connection?.connectionStatusId === reverseLookup('Accepted');

    if (isOwner || profStatus === 'Public') {
        visibility = 'full';
        tabVisibility = true;
    } else if (profStatus === 'Connections Only' && !isConnected) {
        visibility = 'left-only';
        tabVisibility = false;
    }
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
                <ProfileHeader
                    name={profile.userName}
                    degree={profile.degree ? `${profile.degree.degreeName} (${profile.degree.degreeAbbr})` : lookup(profile.degreeId)}
                    graduationYear={profile.batch.toString()}
                    profileImage={profile.profileImage}
                    bio={profile.bio}
                    isProfilePage={true}
                    showTab={tabVisibility}
                    onEdit={isOwner ? () => navigate('/profile/edit') : undefined}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    statsData={statsData}
                    isOwner={isOwner}
                    connectionCode={connection?.connectionStatusId}
                    pendingRequestsCount={pendingRequestsCount}
                    onConnectionUpdate={(newCode, newCount) => {
                        setConnection(newCode !== null ? { connectionStatusId: newCode } : null);
                        if (newCount !== undefined) {
                            setStatsData(prev => prev ? { ...prev, userConnections: newCount } : prev);
                        }
                    }}
                    reverseLookup={reverseLookup}
                />

                {visibility === 'hidden' ? (
                    <div className="bg-white p-12 text-center rounded-lg border border-gray-100 shadow-sm">
                        <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Profile Unavailable</h2>
                        <p className="text-gray-500">This profile is private or unavailable to you.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                        <div className="md:col-span-1 static md:sticky top-24 space-y-4">
                            {!aboutIsEmpty && <>
                                <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                                    <h3 className="font-bold text-lg mb-4 text-gray-900">About</h3>
                                    <div className="space-y-3 text-sm text-gray-600">
                                        {aboutConfig.map(({ icon: Icon, content }, i) => {
                                            if (!content) return null;
                                            return (
                                                <div key={i} className="flex items-center gap-3">
                                                    <Icon className="w-4 h-4 text-gray-900" />
                                                    <span>{content}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </>}


                            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900">Connections</h3>
                                        <p className="text-xs text-gray-500">{statsData.userConnections} friends</p>
                                    </div>
                                    <Link to={`/profile/connections${isOwner ? '' : `/${profileId}`}`} className="text-sm text-brand-primary hover:underline">See all</Link>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {connections.map(c => (
                                        <Link key={c.userId} to={`/profile/${c.userId}`} className="group relative aspect-square overflow-hidden rounded-md">
                                            <img src={c.profileImage} alt={c.userName} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1">
                                                <span className="text-white text-[10px] font-medium truncate w-full leading-tight">{c.userName}</span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                {connections.length === 0 && <p className="text-sm text-gray-500">No connections yet.</p>}
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                                <div className="flex justify-between items-end mb-4">
                                    <h3 className="font-bold text-lg text-gray-900">Achievements</h3>
                                    <Link to={`/profile/achievements${isOwner ? '' : `/${profileId}`}`} className="text-sm text-brand-primary hover:underline">See all</Link>
                                </div>
                                <div className="grid grid-cols-4 gap-3">
                                    {achievements.map((ach, i) => {
                                        const Icon = AchievementIconMap[ach.achievement.achievementIcon] || Award;
                                        return (
                                            <div key={i} className="flex justify-center" title={ach.achievement.achievementTitle}>
                                                <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary  hover:bg-brand-primary/20 flex items-center justify-center border border-brand-primary/20">
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {achievements.length === 0 && <p className="text-sm text-gray-500">No achievements yet.</p>}
                            </div>

                            {statsData.donatedAmount > 0 && (
                                <div className="relative overflow-hidden grid grid-cols-4 items-center gap-4 bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-6 shadow-sm border border-white transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                                    {/* Subtle decorative background element */}
                                    <div className="absolute -top-6 -right-6 w-16 h-16 bg-brand-primary/5 rounded-full blur-3xl" />
                                    <div className="col-span-3 text-left">
                                        <p className="font-bold text-lg text-gray-900">
                                            Total Contribution
                                        </p>
                                        <h3 className="text-2xl font-semibold tracking-tight text-brand-accent">
                                            {formatCurrency(statsData.donatedAmount)}
                                        </h3>
                                    </div>
                                    <div className="col-span-1 flex items-center justify-center">
                                        <div className="p-3 rounded-xl bg-brand-primary/10 text-brand-primary ring-1 ring-brand-primary/20">
                                            <Heart className="w-6 h-6" strokeWidth={1.5} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2 space-y-4">
                            {visibility === 'left-only' ? (
                                <div className="bg-white p-12 text-center rounded-lg border border-gray-100 shadow-sm h-full flex flex-col justify-center items-center">
                                    <FileText className="w-12 h-12 text-gray-300 mb-4" />
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">Private Feed</h3>
                                    <p className="text-gray-500">Connect with {profile.userName} to view their activity and posts.</p>
                                </div>
                            ) : (
                                <>
                                    {activeTab === 'overview' && (
                                        <div className="space-y-0">
                                            {overviewContent.length === 0 && (
                                                <div className="bg-white p-8 text-center rounded-lg border border-gray-100 text-gray-500">No recent activity to show.</div>
                                            )}
                                            {overviewContent.map(item => item.type === 'bulletin' ? renderBulletin(item) : renderComment(item))}
                                        </div>
                                    )}
                                    {activeTab === 'bulletins' && (
                                        <div className="space-y-0">
                                            {bulletins.length === 0 && (
                                                <div className="bg-white p-8 text-center rounded-lg border border-gray-100 text-gray-500">No bulletins posted yet.</div>
                                            )}
                                            {bulletins.map(renderBulletin)}
                                        </div>
                                    )}
                                    {activeTab === 'comments' && (
                                        <div className="space-y-0">
                                            {comments.length === 0 && (
                                                <div className="bg-white p-8 text-center rounded-lg border border-gray-100 text-gray-500">No comments written yet.</div>
                                            )}
                                            {comments.map(renderComment)}
                                        </div>
                                    )}
                                    {activeTab === 'events' && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {events.length === 0 && (
                                                <div className="col-span-full bg-white p-8 text-center rounded-lg border border-gray-100 text-gray-500">No events attended yet.</div>
                                            )}
                                            {events.map(renderEvent)}
                                        </div>
                                    )}
                                    {activeTab === 'donations' && isOwner && (
                                        <UserDonations
                                            userId={profileId}
                                            onStatsUpdate={(newAmount) => {
                                                setStatsData(prev => prev ? { ...prev, donatedAmount: newAmount } : prev);
                                            }}
                                        />
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}