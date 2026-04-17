import { Mail, Phone, MapPin, Briefcase, Edit, LogOut, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@utils/auth';

interface ProfileHeaderProps {
    profileData: {
        name: string;
        email: string;
        phone: string;
        location: string;
        graduationYear: string;
        degree: string;
        currentJob: string;
        company: string;
        bio: string;
        profileImage: string;
    };
    isProfilePage?: boolean;
    onEdit?: () => void;
}

// Use isLoggedIn instead of isOwner
export function ProfileHeader({
    profileData,
    isProfilePage,
    onEdit,
}: ProfileHeaderProps) {
    const { isLoggedIn, setIsLoggedIn } = useAuth();

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            {/* Cover Image */}
            <div className="h-32 bg-gradient-to-r from-brand-primary to-brand-primary-hover"></div>

            {/* Profile Info */}
            <div className="px-6 pb-6">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-4">
                    {/* Profile Picture */}
                    <div className="flex items-end gap-4">
                        <img
                            src={profileData.profileImage}
                            alt={profileData.name}
                            className="w-32 h-32 rounded-full border-4 border-white object-cover"
                        />
                        {/* Profile Info */}
                        <div className="gap-3 mt-4 md:mt-0">
                            <h1 className="text-2xl font-bold">{profileData.name}</h1>
                            <p className="text-gray-600">
                                Class of {profileData.graduationYear}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4 md:mt-0 md:pb-2">
                        {onEdit && (
                            <>
                                {!isProfilePage ? (
                                    <Link
                                        to={"/profile"}
                                        className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors font-semibold"
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
                                                    className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors font-semibold"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Edit Profile
                                                </button>
                                                {/* Sign Out Button */}
                                                <Link
                                                    to="/login"
                                                    onClick={() => setIsLoggedIn(false)}
                                                    className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium ml-auto"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Sign Out
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

                {/* Bio */}
                <p className="text-gray-700 mb-4">{profileData.bio}</p>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-brand-primary" />
                        <span>{profileData.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-brand-primary" />
                        <span>{profileData.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-brand-primary" />
                        <span>{profileData.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-brand-primary" />
                        <span>
                            {profileData.currentJob} at {profileData.company}
                        </span>
                    </div>
                </div>
            </div>
        </div >
    );
}
