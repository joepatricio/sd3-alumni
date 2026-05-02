import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileHeader } from '@components/user/ProfileHeader';
import { api, AchievementIconMap, useProfileRoute, type ProfileData, type UserStatisticsData } from '@/app/views/api';
import { NotFound } from '@pages/NotFound';
import { Trophy, Loader2 } from 'lucide-react';

export function Achievements() {
    const navigate = useNavigate();
    const { profileId, isOwner } = useProfileRoute();

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [degree, setDegree] = useState<string>('');
    const [statsData, setStatsData] = useState<UserStatisticsData | null>(null);
    const [achievements, setAchievements] = useState<any[]>([]);

    useEffect(() => {
        const fetchAchievementsData = async () => {
            try {
                setLoading(true);
                const [profileRes, statsRes, degreesRes, achUserRes, achAllRes] = await Promise.all([
                    api.get<any>('/PROFILE', { params: { 'user_id': profileId } }),
                    api.get<any>('/USER_STATISTICS', { params: { 'user_id': profileId } }),
                    api.get<any>('/DEGREE'),
                    api.get(`/USER_ACHIEVEMENT`, { params: { 'user_id': profileId, _sort: '-achieved_date' } }),
                    api.get(`/ACHIEVEMENTS`)
                ]);

                const profileData = profileRes.data.data || profileRes.data;
                const profile = Array.isArray(profileData) ? profileData[0] : profileData;

                const statsDataRaw = statsRes.data.data || statsRes.data;
                const statsData = Array.isArray(statsDataRaw) ? statsDataRaw[0] : statsDataRaw;

                const degrees = degreesRes.data.data || degreesRes.data || [];
                const degreeData = degrees.find((d: any) => Number(d.degree_id) === Number(profile.degree_id));

                setProfile(profile);
                setDegree(degreeData ? `${degreeData.degree_name} (${degreeData.degree_abbr})` : '');
                setStatsData(statsData);

                const userAchs = achUserRes.data.data || achUserRes.data || [];
                const allAchs = achAllRes.data.data || achAllRes.data || [];
                const fullAchs = userAchs.map((ua: any) => {
                    const ach = allAchs.find((a: any) => String(a.achievement_id) === String(ua.achievement_id) && Number(a.achievement_tier) === Number(ua.achievement_tier));
                    return ach ? { ...ach, achieved_date: ua.achieved_date } : null;
                }).filter(Boolean);

                setAchievements(fullAchs);
            } catch (err) {
                console.error("Failed to load achievements", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAchievementsData();
    }, [profileId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
            </div>
        );
    }

    if (!profile || !statsData) {
        return <NotFound />;
    }

    const handleTabChange = (tab: string) => {
        navigate(`/profile${isOwner ? '' : `/${profileId}`}`, { state: { activeTab: tab } });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
                <ProfileHeader
                    name={profile.user_name}
                    degree={degree}
                    graduationYear={profile.batch.toString()}
                    profileImage={profile.profileImage}
                    bio="Alumni of University of San Jose - Recoletos."
                    isProfilePage={false}
                    onEdit={isOwner ? () => navigate('/profile/edit') : undefined}
                    activeTab="achievements"
                    onTabChange={handleTabChange}
                    statsData={statsData}
                />

                <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-4">Achievements Showcase</h2>

                    {achievements.length === 0 ? (
                        <div className="text-center py-12">
                            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
                            <p className="text-gray-500">Engage more with the platform to earn badges!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {achievements.map((achv, i) => {
                                const Icon = AchievementIconMap[achv.achievement_icon] || Trophy;

                                return (
                                    <div
                                        key={i}
                                        className="group bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow duration-300 flex items-center gap-6"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center shrink-0 group-hover:bg-brand-primary/20 transition-colors">
                                            <Icon className="w-8 h-8 text-brand-primary" />
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-brand-primary transition-colors">
                                                {achv.achievement_title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {achv.achievement_description}
                                            </p>
                                            <div className="text-xs text-gray-400 mt-auto font-medium">
                                                Acquired: {new Date(achv.achieved_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </div>
                                        </div>
                                        {achv.achievement_tier && (
                                            <div className="absolute top-4 right-4 text-gray-300 font-black text-4xl opacity-20 pointer-events-none">
                                                {achv.achievement_tier}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
