import { useNavigate } from 'react-router-dom';
import { ProfileHeader } from '@components/user/ProfileHeader';
import { userData, ACHIEVEMENTS } from '@assets/mockData';
import {
    Star, Award, Trophy, BookOpen,
    Heart, HeartPulse, HandCoins,
    Calendar, CalendarDays,
    MessageSquare, MessageCircle
} from 'lucide-react';

const IconMap: Record<string, any> = {
    Star,
    Award,
    Trophy,
    BookOpen,
    Heart,
    HeartPulse,
    HandCoins,
    Calendar,
    CalendarDays,
    MessageSquare,
    MessageCircle
};

export function Achievements() {
    const navigate = useNavigate();

    // Map user achievements to their full data
    const userAchievementsFull = userData.achievements?.map(userAchv => {
        const achvData = ACHIEVEMENTS.find(a => a.id === userAchv.id);
        return achvData ? { ...userAchv, ...achvData } : null;
    }).filter(Boolean) as any[];

    // Filter to only show top tier for each type
    const topTierAchievements = Object.values(
        userAchievementsFull.reduce((acc, achv) => {
            const group = acc[achv.type];
            // If we already have one of this type, keep the highest tier
            if (!group || achv.tier > group.tier) {
                acc[achv.type] = achv;
            }
            return acc;
        }, {} as Record<string, any>)
    ).sort((a: any, b: any) => new Date(b.dateGranted).getTime() - new Date(a.dateGranted).getTime()) as any[];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
                {/* Profile Header */}
                <ProfileHeader
                    userData={userData}
                    isProfilePage={false}
                    onEdit={() => navigate('/profile/edit')}
                />

                <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-4">Achievements Showcase</h2>

                    {topTierAchievements.length === 0 ? (
                        <div className="text-center py-12">
                            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
                            <p className="text-gray-500">Engage more with the platform to earn badges!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {topTierAchievements.map(achv => {
                                const Icon = IconMap[achv.iconName!] || Trophy;

                                return (
                                    <div
                                        key={achv.id}
                                        className="group bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow duration-300 flex items-center gap-6"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-[#d97706]/10 flex items-center justify-center shrink-0 group-hover:bg-[#d97706]/20 transition-colors">
                                            <Icon className="w-8 h-8 text-[#d97706]" />
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#d97706] transition-colors">
                                                {achv.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {achv.description}
                                            </p>
                                            <div className="text-xs text-gray-400 mt-auto font-medium">
                                                Acquired: {new Date(achv.dateGranted).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </div>
                                        </div>
                                        {/* Optional Tier Badge visual */}
                                        {achv.tier && (
                                            <div className="absolute top-4 right-4 text-gray-300 font-black text-4xl opacity-20 pointer-events-none">
                                                {achv.tier}
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
