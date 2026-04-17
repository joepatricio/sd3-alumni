import {
    Calendar,
    Award,
    Users,
    Heart,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ProfileHeader } from '@components/user/ProfileHeader';
import { profileData } from '@assets/mockData';

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
                    profileData={profileData}
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
                                {profileData.stats?.map((stat, index) => {
                                    const Icon = IconMap[stat.iconName];
                                    let href = '';
                                    let interactClass = '';

                                    if (stat.label === 'Connections') href = '/profile/connections';
                                    else if (stat.label === 'Events Attended') href = '/profile/events';
                                    else if (stat.label === 'Achievements') href = '/profile/achievements';
                                    else if (stat.label === 'Donated Amount') interactClass = 'hover:scale-105 hover:-translate-y-1 active:scale-95 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md';

                                    const CardContent = (
                                        <>
                                            {Icon && <Icon className={`w-8 h-8 text-brand-primary mx-auto mb-2 ${href ? 'group-hover:scale-110 transition-transform duration-300' : ''}`} />}
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

                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">

                    </div>
                </div>
            </div>
        </div>
    );
}