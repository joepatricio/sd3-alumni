import {
    Calendar,
    GraduationCap,
    Award,
    Users,
    Heart,
} from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ProfileHeader } from '../components/ProfileHeader';
import { QuickActions } from '../components/QuickActions';
import { userData } from '../../assets/mockData';

export function Profile() {
    const navigate = useNavigate();
    const { isLoggedIn } = useOutletContext<{ isLoggedIn: boolean }>();

    const stats = [
        { icon: Users, label: 'Connections', value: '248' },
        { icon: Calendar, label: 'Events Attended', value: '12' },
        { icon: Award, label: 'Achievements', value: '5' },
        { icon: Heart, label: 'Donated Amount', value: '₱36,000.00' },
    ];

    const recentActivity = [
        {
            id: 1,
            type: 'event',
            title: 'Attended Annual Homecoming 2026',
            date: 'March 15, 2026',
        },
        {
            id: 2,
            type: 'connection',
            title: 'Connected with John Doe',
            date: 'March 10, 2026',
        },
        {
            id: 3,
            type: 'volunteer',
            title: 'Volunteered at Community Service Day',
            date: 'February 28, 2026',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
                {/* Profile Header */}
                <ProfileHeader
                    userData={userData}
                    isOwner={isLoggedIn}
                    onEdit={() => navigate('/profile/edit')}
                />

                {/* Quick Actions Bar */}
                <QuickActions isLoggedIn={isLoggedIn} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stats */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4">Activity Overview</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {stats.map((stat, index) => (
                                    <div
                                        key={index}
                                        className="text-center p-4 bg-gray-50 rounded-lg"
                                    >
                                        <stat.icon className="w-8 h-8 text-[#1a5f3f] mx-auto mb-2" />
                                        <div className="text-2xl font-bold text-gray-900">
                                            {stat.value}
                                        </div>
                                        <div className="text-sm text-gray-600">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                            <div className="space-y-4">
                                {recentActivity.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-start gap-3 pb-4 border-b border-gray-200 last:border-0"
                                    >
                                        <div className="w-10 h-10 bg-[#1a5f3f] rounded-full flex items-center justify-center flex-shrink-0">
                                            {activity.type === 'event' && (
                                                <Calendar className="w-5 h-5 text-white" />
                                            )}
                                            {activity.type === 'connection' && (
                                                <Users className="w-5 h-5 text-white" />
                                            )}
                                            {activity.type === 'volunteer' && (
                                                <Heart className="w-5 h-5 text-white" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">
                                                {activity.title}
                                            </p>
                                            <p className="text-sm text-gray-500">{activity.date}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Education */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-[#1a5f3f]" />
                                Education
                            </h2>
                            <div className="space-y-4">
                                {userData.postGraduateEducation && (
                                    <div className="pb-3 border-b border-gray-100 last:border-0">
                                        <p className="font-semibold text-gray-900">{userData.postGraduateEducation.degree}</p>
                                        <p className="text-sm text-gray-600">{userData.postGraduateEducation.school}</p>
                                        <p className="text-xs text-gray-500">Graduated {userData.postGraduateEducation.year}</p>
                                    </div>
                                )}

                                <div className="pb-3 border-b border-gray-100 last:border-0">
                                    <p className="font-semibold text-gray-900">{userData.degree}</p>
                                    <p className="text-sm text-gray-600">University of San Jose-Recoletos</p>
                                    <p className="text-xs text-gray-500">Graduated {userData.graduationYear}</p>
                                </div>

                                {userData.secondaryEducationSHS && (
                                    <div className="pb-3 border-b border-gray-100 last:border-0">
                                        <p className="font-semibold text-gray-900">Secondary (Senior High)</p>
                                        <p className="text-sm text-gray-600">{userData.secondaryEducationSHS.school}</p>
                                        <p className="text-xs text-gray-500">Graduated {userData.secondaryEducationSHS.year}</p>
                                    </div>
                                )}

                                {userData.secondaryEducationJHS && (
                                    <div className="pb-3 border-b border-gray-100 last:border-0">
                                        <p className="font-semibold text-gray-900">Secondary (Junior High)</p>
                                        <p className="text-sm text-gray-600">{userData.secondaryEducationJHS.school}</p>
                                        <p className="text-xs text-gray-500">Graduated {userData.secondaryEducationJHS.year}</p>
                                    </div>
                                )}

                                {userData.primaryEducation && (
                                    <div className="pb-3 border-b border-gray-100 last:border-0">
                                        <p className="font-semibold text-gray-900">Primary Education</p>
                                        <p className="text-sm text-gray-600">{userData.primaryEducation.school}</p>
                                        <p className="text-xs text-gray-500">Graduated {userData.primaryEducation.year}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}