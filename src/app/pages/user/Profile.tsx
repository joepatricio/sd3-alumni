import {
    Calendar,
    GraduationCap,
    Award,
    Users,
    Heart,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ProfileHeader } from '@components/user/ProfileHeader';
import { userData } from '@assets/mockData';

export function Profile() {
    const navigate = useNavigate();

    const IconMap: Record<string, any> = {
        Users,
        Calendar,
        Award,
        Heart,
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
                {/* Profile Header */}
                <ProfileHeader
                    userData={userData}
                    isProfilePage={true}
                    onEdit={() => navigate('/profile/edit')}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stats */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4">Activity Overview</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {userData.stats?.map((stat, index) => {
                                    const Icon = IconMap[stat.iconName];
                                    let href = '';
                                    let interactClass = '';

                                    if (stat.label === 'Connections') href = '/profile/connections';
                                    else if (stat.label === 'Events Attended') href = '/profile/events';
                                    else if (stat.label === 'Achievements') href = '/profile/achievements';
                                    else if (stat.label === 'Donated Amount') interactClass = 'hover:scale-105 hover:-translate-y-1 active:scale-95 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md';

                                    const CardContent = (
                                        <>
                                            {Icon && <Icon className={`w-8 h-8 text-[#d97706] mx-auto mb-2 ${href ? 'group-hover:scale-110 transition-transform duration-300' : ''}`} />}
                                            <div className="text-2xl font-bold text-gray-900">
                                                {stat.value}
                                            </div>
                                            <div className="text-sm text-gray-600">{stat.label}</div>
                                        </>
                                    );

                                    return href ? (
                                        <Link
                                            key={index}
                                            to={href}
                                            className="group text-center p-4 bg-gray-50 rounded-lg hover:bg-white hover:shadow-md transition-all duration-300 block border border-transparent hover:border-gray-200"
                                        >
                                            {CardContent}
                                        </Link>
                                    ) : (
                                        <div
                                            key={index}
                                            className={`text-center p-4 bg-gray-50 rounded-lg ${interactClass}`}
                                        >
                                            {CardContent}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                            <div className="space-y-4">
                                {userData.recentActivity?.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-start gap-3 pb-4 border-b border-gray-200 last:border-0"
                                    >
                                        <div className="w-10 h-10 bg-[#d97706] rounded-full flex items-center justify-center flex-shrink-0">
                                            {/* TODO: Add icons for each activity type */}
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
                                <GraduationCap className="w-5 h-5 text-[#d97706]" />
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

                                {userData.degree && (
                                    <div className="pb-3 border-b border-gray-100 last:border-0">
                                        <p className="font-semibold text-gray-900">{userData.degree}</p>
                                        {userData.school && <p className="text-sm text-gray-600">{userData.school}</p>}
                                        <p className="text-xs text-gray-500">Graduated {userData.graduationYear}</p>
                                    </div>
                                )}

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