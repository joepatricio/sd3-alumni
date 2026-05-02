import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Calendar, Award, Heart, Loader2, Mail, Phone, MapPin, Briefcase, MessageSquare, FileText } from 'lucide-react';
import { ProfileHeader } from '@components/user/ProfileHeader';
import { api, AchievementIconMap, useProfileRoute, useSystemLookup, type ProfileData, type UserStatisticsData } from '@/app/views/api';
import { formatCurrency } from '@/app/views/formatters';
import { NotFound } from '@pages/NotFound';
import { LazyImage } from '@components/user/LazyImage';
import { UserDonations } from '@components/user/UserDonations';

export function Profile() {
    const navigate = useNavigate();
    const location = useLocation();
    const { profileId, isOwner } = useProfileRoute();
    const { lookup, loading: lookupLoading } = useSystemLookup();

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [statsData, setStatsData] = useState<UserStatisticsData | null>(null);

    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'overview');

    const [connections, setConnections] = useState<any[]>([]);
    const [achievements, setAchievements] = useState<any[]>([]);
    const [bulletins, setBulletins] = useState<any[]>([]);
    const [comments, setComments] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const [profileRes, statsRes, connRes, achUserRes, achAllRes] = await Promise.all([
                    api.get<any>('/PROFILE', { params: { 'user_id': profileId } }),
                    api.get<any>('/USER_STATISTICS', { params: { 'user_id': profileId } }),
                    api.get(`/USER_CONNECTIONS`, { params: { 'user_id': profileId, _per_page: 6, 'connection_code': 201 } }),
                    api.get(`/USER_ACHIEVEMENT`, { params: { 'user_id': profileId, _sort: '-achieved_date' } }),
                    api.get(`/ACHIEVEMENTS`)
                ]);

                const profileData = profileRes.data.data || profileRes.data;
                const profile = Array.isArray(profileData) ? profileData[0] : profileData;

                const statsDataRaw = statsRes.data.data || statsRes.data;
                const statsData = Array.isArray(statsDataRaw) ? statsDataRaw[0] : statsDataRaw;

                setProfile(profile);
                setStatsData(statsData);

                const conns = connRes.data.data || connRes.data || [];
                if (conns.length > 0) {
                    const friendIds = conns.map((c: any) => c.friend_id).join(',');
                    const friendsRes = await api.get(`/PROFILE`, { params: { 'user_id:in': friendIds } });
                    setConnections(friendsRes.data.data || friendsRes.data || []);
                }

                const userAchs = achUserRes.data.data || achUserRes.data || [];
                const allAchs = achAllRes.data.data || achAllRes.data || [];
                const achPreviews = userAchs.map((ua: any) => {
                    const ach = allAchs.find((a: any) => String(a.achievement_id) === String(ua.achievement_id) && Number(a.achievement_tier) === Number(ua.achievement_tier));
                    return ach ? { ...ach, achieved_date: ua.achieved_date } : null;
                }).filter(Boolean);
                setAchievements(achPreviews);

            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, [profileId]);

    useEffect(() => {
        const fetchTabContent = async () => {
            if (activeTab === 'overview' || activeTab === 'bulletins') {
                api.get('/BULLETIN', { params: { 'author_id': profileId, _sort: '-bulletin_date' } })
                    .then(res => setBulletins(res.data.data || res.data || []));
            }
            if (activeTab === 'overview' || activeTab === 'comments') {
                api.get('/COMMENTS', { params: { 'user_id': profileId, _sort: '-comment_date' } })
                    .then(async res => {
                        const fetchedComments = res.data.data || res.data || [];
                        if (fetchedComments.length > 0) {
                            const bulletinIds = [...new Set(fetchedComments.map((c: any) => c.bulletin_id))].join(',');
                            const bulletinRes = await api.get('/BULLETIN', { params: { 'bulletin_id:in': bulletinIds } });
                            const bulletinsData = bulletinRes.data.data || bulletinRes.data || [];

                            const commentsWithBulletins = fetchedComments.map((c: any) => {
                                const bulletin = bulletinsData.find((b: any) => String(b.bulletin_id) === String(c.bulletin_id));
                                return { ...c, bulletin_title: bulletin ? bulletin.title : 'Deleted Bulletin' };
                            });
                            setComments(commentsWithBulletins);
                        } else {
                            setComments([]);
                        }
                    });
            }
            if (activeTab === 'events') {
                api.get('/USER_RSVP', { params: { 'user_id': profileId, 'is_attending': true } }).then(async rsvpRes => {
                    const rsvps = rsvpRes.data.data || rsvpRes.data || [];
                    if (rsvps.length > 0) {
                        const eventIds = rsvps.map((r: any) => r.event_id).join(',');
                        const eventRes = await api.get('/EVENTS', { params: { 'event_id:in': eventIds } });
                        const attended = eventRes.data.data || eventRes.data || [];
                        const now = new Date();
                        now.setHours(0, 0, 0, 0);
                        attended.sort((a: any, b: any) => {
                            const dateA = new Date(a.date);
                            const dateB = new Date(b.date);
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

    if (!profile || !statsData) {
        return <NotFound />;
    }

    const overviewContent = [...bulletins.map(b => ({ ...b, type: 'bulletin' })), ...comments.map(c => ({ ...c, type: 'comment' }))]
        .sort((a, b) => new Date(b.bulletin_date || b.comment_date).getTime() - new Date(a.bulletin_date || a.comment_date).getTime());

    const renderBulletin = (b: any) => (
        <div key={`bulletin-${b.bulletin_id}`} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4 last:mb-0 hover:shadow-md transition-shadow">
            <Link to={`/bulletin/${b.bulletin_id}`}>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <FileText className="w-4 h-4" />
                    <span>Posted a bulletin • {new Date(b.bulletin_date).toLocaleDateString()}</span>
                </div>
                {b.bulletin_image && (
                    <div className="w-full h-48 mb-3 rounded-md overflow-hidden bg-gray-100">
                        <LazyImage
                            src={b.bulletin_image}
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
        <div key={`comment-${c.comment_id}`} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4 last:mb-0 hover:shadow-md transition-shadow">
            <Link to={`/bulletin/${c.bulletin_id}`}>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Commented on {c.bulletin_title ? `"${c.bulletin_title}"` : 'a bulletin'} • {new Date(c.comment_date).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-800 text-sm">"{c.comment}"</p>
                <p className="text-sm text-brand-accent font-medium mt-2 inline-block">View Bulletin</p>
            </Link >
        </div >
    );

    const renderEvent = (event: any) => {
        const isUpcoming = new Date(event.event_date) >= new Date();
        return (
            <Link
                key={event.event_id}
                to={`/events/${event.event_id}`}
                className="group bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full"
            >
                <div className="relative h-32 w-full overflow-hidden bg-gray-100">
                    {event.event_image && (
                        <LazyImage
                            src={event.event_image}
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
                            <span>{new Date(event.event_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-brand-primary shrink-0" />
                            <span className="truncate">{event.location || 'Virtual'}</span>
                        </div>
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
                <ProfileHeader
                    name={profile.user_name}
                    degree={lookup(profile.degree_id)}
                    graduationYear={profile.batch.toString()}
                    profileImage={profile.profileImage}
                    bio={profile.bio}
                    isProfilePage={true}
                    onEdit={isOwner ? () => navigate('/profile/edit') : undefined}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    statsData={statsData}
                    isOwner={isOwner}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                    <div className="md:col-span-1 sticky top-24 space-y-4">
                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                            <h3 className="font-bold text-lg mb-4 text-gray-900">About</h3>
                            <div className="space-y-3 text-sm text-gray-600">
                                {profile.email && (
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <a href={`mailto:${profile.email}`} target='_blank' rel='noopener noreferrer'
                                            className="truncate hover:underline hover:text-brand-primary-hover cursor-pointer">
                                            {profile.email}
                                        </a>
                                    </div>
                                )}
                                {profile.phone && (
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span>{profile.phone}</span>
                                    </div>
                                )}
                                {profile.location && (
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span>{profile.location}</span>
                                    </div>
                                )}
                                {profile.birthday && (
                                    <div className="flex items-center gap-3">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span>Born {new Date(profile.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                )}
                                {(profile.currentJob || profile.company) && (
                                    <div className="flex items-center gap-3">
                                        <Briefcase className="w-4 h-4 text-gray-400" />
                                        <span>
                                            {profile.currentJob} {profile.company && `at ${profile.company}`}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">Connections</h3>
                                    <p className="text-xs text-gray-500">{statsData.user_connections} friends</p>
                                </div>
                                <Link to={`/profile/connections${isOwner ? '' : `/${profileId}`}`} className="text-sm text-brand-primary hover:underline">See all</Link>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {connections.map(c => (
                                    <Link key={c.user_id} to={`/profile/${c.user_id}`} className="group relative aspect-square overflow-hidden rounded-md">
                                        <img src={c.profileImage} alt={c.user_name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1">
                                            <span className="text-white text-[10px] font-medium truncate w-full leading-tight">{c.user_name}</span>
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
                                    const Icon = AchievementIconMap[ach.achievement_icon] || Award;
                                    return (
                                        <div key={i} className="flex justify-center" title={ach.achievement_title}>
                                            <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary  hover:bg-brand-primary/20 flex items-center justify-center border border-brand-primary/20">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {achievements.length === 0 && <p className="text-sm text-gray-500">No achievements yet.</p>}
                        </div>

                        {statsData.donated_amount > 0 && (
                            <div className="relative overflow-hidden grid grid-cols-4 items-center gap-4 bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-6 shadow-sm border border-white transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                                {/* Subtle decorative background element */}
                                <div className="absolute -top-6 -right-6 w-16 h-16 bg-brand-primary/5 rounded-full blur-3xl" />
                                <div className="col-span-3 text-left">
                                    <p className="font-bold text-lg text-gray-900">
                                        Total Contribution
                                    </p>
                                    <h3 className="text-2xl font-semibold tracking-tight text-brand-accent">
                                        {formatCurrency(statsData.donated_amount)}
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
                                    setStatsData(prev => prev ? { ...prev, donated_amount: newAmount } : prev);
                                }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}