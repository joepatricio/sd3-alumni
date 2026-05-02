import { Edit, LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/app/views/auth';

interface ProfileHeaderProps {
    name: string;
    degree: string;
    graduationYear: string;
    profileImage: string;
    bio: string;
    isProfilePage?: boolean;
    onEdit?: () => void;
    activeTab?: string;
    onTabChange?: (tab: string) => void;
    statsData?: {
        bulletins_created: number;
        comments_written: number;
        events_attended: number;
    };
    isOwner?: boolean;
}

export function ProfileHeader({
    name,
    degree,
    graduationYear,
    profileImage,
    bio,
    isProfilePage,
    onEdit,
    activeTab = 'overview',
    onTabChange = () => { },
    statsData,
    isOwner = false
}: ProfileHeaderProps) {
    const { isLoggedIn, setSession } = useAuth();

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-100">
            {/* Cover Image - taller and more vibrant */}
            <div className="h-48 bg-gradient-to-br from-brand-primary via-brand-primary/90 to-brand-secondary relative">
                <div className="absolute inset-0 opacity-20 bg-[url('http://localhost:3000/cubes.png')]"></div>
            </div>

            {/* Profile Info Container */}
            <div className="px-8 pb-6 relative">
                {/* Overlapping Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between -mt-12 mb-6 gap-6">
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                        {/* Profile Picture with Shadow and Border */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-tr from-brand-primary to-brand-accent rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                            <img
                                src={profileImage}
                                alt={name}
                                className="relative w-32 h-32 rounded-full border-4 border-white object-cover shadow-2xl"
                            />
                        </div>

                        {/* Name and Basic Info */}
                        <div className="pb-2">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{name}</h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 mt-1">
                                <p className="text-brand-primary font-bold text-sm uppercase tracking-wider">
                                    {degree}
                                </p>
                                <span className="hidden md:block w-1 h-1 bg-gray-300 rounded-full"></span>
                                <p className="text-gray-500 font-medium text-sm">
                                    Class of {graduationYear}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons - slightly more refined */}
                    <div className="flex items-center gap-3 md:pb-2">
                        {onEdit && (
                            <>
                                {!isProfilePage ? (
                                    <Link
                                        to={"/profile"}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl hover:bg-brand-primary-hover hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-bold text-sm"
                                    >
                                        <User className="w-4 h-4" />
                                        Back to Profile
                                    </Link>
                                ) : (
                                    <>
                                        {isLoggedIn && (
                                            <>
                                                <button
                                                    onClick={onEdit}
                                                    className="flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-brand-primary text-brand-primary rounded-xl hover:bg-brand-primary hover:text-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-bold text-sm"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Edit Profile
                                                </button>
                                                <Link
                                                    to="/login"
                                                    onClick={() => setSession(null)}
                                                    className="flex items-center justify-center p-2.5 border-2 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all duration-300"
                                                    title="Sign Out"
                                                >
                                                    <LogOut className="w-5 h-5" />
                                                </Link>
                                            </>
                                        )
                                        }
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Bio Section - centered on mobile, left on desktop */}
                <div className="max-w-2xl mb-8">
                    <p className="text-gray-600 leading-relaxed text-center md:text-left font-medium">
                        {bio}
                    </p>
                </div>

                {/* Tabs Navigation - redesigned for premium feel */}
                {isProfilePage && (<div className="flex gap-4 md:gap-8 border-t border-gray-100 pt-6 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'overview', label: 'Overview', count: statsData ? statsData.bulletins_created + statsData.comments_written : 0 },
                        { id: 'bulletins', label: 'Bulletins', count: statsData ? statsData.bulletins_created : 0 },
                        { id: 'comments', label: 'Comments', count: statsData ? statsData.comments_written : 0 },
                        { id: 'events', label: 'Events', count: statsData ? statsData.events_attended : 0 },
                        ...(isOwner ? [{ id: 'donations', label: 'Donations', count: 0 }] : []),
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all border-b-3 relative whitespace-nowrap ${activeTab === tab.id
                                ? 'border-brand-primary text-brand-primary'
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === tab.id
                                    ? 'bg-brand-primary/10 text-brand-primary'
                                    : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary rounded-t-full shadow-[0_-2px_10px_rgba(var(--brand-primary-rgb),0.5)]"></div>
                            )}
                        </button>
                    ))}
                </div>)}
            </div>
        </div >

    );
}