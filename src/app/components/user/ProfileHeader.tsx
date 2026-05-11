import { Edit, LogOut, User, UserPlus, UserMinus, UserCheck, Lock, Unlock, Clock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/app/views/auth';
import { handleConnection } from '@/app/views/user';
import { useProfileRoute } from '@/app/views/api';

interface ProfileHeaderProps {
    name: string;
    degree: string;
    graduationYear: string;
    profileImage: string;
    bio: string;
    isProfilePage?: boolean;
    showTab?: boolean;
    onEdit?: () => void;
    activeTab?: string;
    onTabChange?: (tab: string) => void;
    statsData?: {
        bulletinsCreated: number;
        commentsWritten: number;
        eventsAttended: number;
    };
    isOwner?: boolean;
    connectionCode?: string | null;
    pendingRequestsCount?: number;
    onConnectionUpdate?: (newStatusCode: string | null, newConnectionsCount?: number) => void;
    reverseLookup?: (val: string) => string | null;
}

export function ProfileHeader({
    name,
    degree,
    graduationYear,
    profileImage,
    bio,
    isProfilePage,
    showTab = false,
    onEdit,
    activeTab = 'overview',
    onTabChange = () => { },
    statsData,
    isOwner = false,
    connectionCode,
    pendingRequestsCount = 0,
    onConnectionUpdate,
    reverseLookup
}: ProfileHeaderProps) {
    const { isLoggedIn, session, setSession } = useAuth();
    const { profileId } = useProfileRoute();
    const currentUserId = session?.userId;
    const [actionLoading, setActionLoading] = useState(false);

    const onAction = async (action: 'add' | 'remove' | 'accept' | 'unblock' | 'block' | 'reject') => {
        if (!currentUserId || !profileId || !reverseLookup) return;
        setActionLoading(true);
        try {
            const result = await handleConnection(action, currentUserId, profileId, reverseLookup);
            if (onConnectionUpdate) {
                onConnectionUpdate(result.newStatusCode, result.newConnectionsCount);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-100">
            {/* Cover Image - taller and more vibrant */}
            <div className="h-48 bg-gradient-to-br from-brand-primary via-brand-primary/90 to-brand-secondary relative">
                <div className="absolute inset-0 opacity-20 bg-[url('http://localhost:3000/cubes.png')]"></div>
            </div>

            {/* Profile Info Container */}
            <div className="px-8 pb-6 relative">
                {/* Overlapping Section */}
                <div className="flex flex-col items-center md:flex-row justify-between mt-5 mb-6 gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left flex-1 min-w-0">
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
                        <div className="flex flex-col flex-1 gap-2 md:items-start min-w-0 w-full">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight break-words">{name}</h1>
                            <p className="text-brand-primary font-bold text-sm uppercase tracking-wider break-words max-w-full">
                                {degree}
                            </p>
                            <p className="text-gray-500 font-medium text-sm whitespace-nowrap shrink-0">
                                Class of {graduationYear}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons - slightly more refined */}
                    {/* Kinda sh*t but it works */}
                    <div className="flex items-center justify-center flex-wrap gap-3 md:pb-2 shrink-0">
                        {!isProfilePage ? (
                            <Link
                                to={"/profile"}
                                className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl hover:bg-brand-primary-hover hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-bold text-sm"
                            >
                                <User className="w-4 h-4" />
                                Back to Profile
                            </Link>
                        ) :
                            <>
                                {isOwner && isLoggedIn ? (
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
                                ) : !isOwner && isLoggedIn ? (
                                    <>
                                        {actionLoading ? (
                                            <button disabled className="flex items-center justify-center p-2.5 bg-gray-100 text-brand-primary rounded-xl">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            </button>
                                        ) : connectionCode === null || connectionCode === undefined ? (
                                            <>
                                                <button
                                                    onClick={() => onAction('add')}
                                                    className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl hover:bg-brand-primary-hover hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-bold text-sm"
                                                >
                                                    <UserPlus className="w-4 h-4" />
                                                    Connect
                                                </button>
                                                <button
                                                    onClick={() => onAction('block')}
                                                    className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-300 font-bold text-sm border border-red-200"
                                                >
                                                    <Lock className="w-4 h-4" />
                                                    Block
                                                </button>
                                            </>
                                        ) : connectionCode === (reverseLookup ? reverseLookup('Requesting') : '200') ? (
                                            <button
                                                disabled
                                                className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-500 rounded-xl cursor-not-allowed font-bold text-sm border border-gray-200"
                                            >
                                                <Clock className="w-4 h-4" />
                                                Pending
                                            </button>
                                        ) : connectionCode === (reverseLookup ? reverseLookup('Requested') : '201') ? (
                                            <button
                                                onClick={() => onAction('accept')}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-xl hover:bg-brand-primary-hover hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 font-bold text-sm"
                                            >
                                                <UserCheck className="w-4 h-4" />
                                                Accept Request
                                            </button>
                                        ) : connectionCode === (reverseLookup ? reverseLookup('Accepted') : '202') ? (
                                            <button
                                                onClick={() => onAction('remove')}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all duration-300 font-bold text-sm border border-red-200"
                                            >
                                                <UserMinus className="w-4 h-4" />
                                                Remove Connection
                                            </button>
                                        ) : connectionCode === (reverseLookup ? reverseLookup('Blocking') : '203') ? (
                                            <button
                                                onClick={() => onAction('unblock')}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-all duration-300 font-bold text-sm"
                                            >
                                                <Unlock className="w-4 h-4" />
                                                Unblock User
                                            </button>
                                        ) : null}
                                    </>
                                ) : null}
                            </>
                        }
                    </div>
                </div>

                {/* Bio Section - centered on mobile, left on desktop */}
                <div className="max-w-2xl mb-8">
                    <p className="text-gray-600 leading-relaxed text-center md:text-left font-medium">
                        {bio}
                    </p>
                </div>

                {/* Tabs Navigation - redesigned for premium feel */}
                {isProfilePage && showTab && (<div className="flex gap-4 md:gap-8 border-t border-gray-100 pt-6 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'overview', label: 'Overview', count: statsData ? statsData.bulletinsCreated + statsData.commentsWritten : 0 },
                        { id: 'bulletins', label: 'Bulletins', count: statsData ? statsData.bulletinsCreated : 0 },
                        { id: 'comments', label: 'Comments', count: statsData ? statsData.commentsWritten : 0 },
                        { id: 'events', label: 'Events', count: statsData ? statsData.eventsAttended : 0 },
                        ...(isOwner ? [{ id: 'donations', label: 'Donations', count: 0 }] : []),
                        ...(isOwner && pendingRequestsCount > 0 ? [{ id: 'pending', label: 'Pending Requests', count: pendingRequestsCount, isLink: true, href: '/profile/connections' }] : []),
                    ].map((tab) => (
                        tab.isLink ? (
                            <Link
                                key={tab.id}
                                to={tab.href as string}
                                state={{ tab: tab.id }}
                                className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all border-b-3 relative whitespace-nowrap border-transparent text-brand-accent hover:text-brand-accent/80`}
                            >
                                {tab.label}
                                {tab.count > 0 && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-brand-accent/10 text-brand-accent">
                                        {tab.count}
                                    </span>
                                )}
                            </Link>
                        ) : (
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
                        )
                    ))}
                </div>)}
            </div>
        </div >

    );
}