import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    GraduationCap,
    Calendar,
    Edit,
    Settings,
    LogOut,
    Award,
    Users,
    Heart,
} from 'lucide-react';

export function Profile() {
    const [isEditing, setIsEditing] = useState(false);

    // Mock user data
    const userData = {
        name: 'Maria Santos',
        email: 'maria.santos@example.com',
        phone: '+63 917 123 4567',
        location: 'Cebu City, Philippines',
        graduationYear: '2015',
        degree: 'Bachelor of Science in Computer Science',
        currentJob: 'Senior Software Engineer',
        company: 'Tech Solutions Inc.',
        bio: 'Passionate about technology and education. Proud Josenian alumna dedicated to giving back to the community through mentorship and volunteering.',
        profileImage:
            'https://images.unsplash.com/photo-1655249493799-9cee4fe983bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdCUyMGJ1c2luZXNzJTIwcGVyc29ufGVufDF8fHx8MTc3MDMzODgyMHww&ixlib=rb-4.1.0&q=80&w=1080',
    };

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
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
                    {/* Cover Image */}
                    <div className="h-32 bg-gradient-to-r from-[#1a5f3f] to-[#2d7a4f]"></div>

                    {/* Profile Info */}
                    <div className="px-6 pb-6">
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-4">
                            {/* Profile Picture */}
                            <div className="flex items-end gap-4">
                                <img
                                    src={userData.profileImage}
                                    alt={userData.name}
                                    className="w-32 h-32 rounded-full border-4 border-white object-cover"
                                />
                                {/* Profile Info */}
                                <div className="gap-3 mt-4 md:mt-0">
                                    <h1 className="text-2xl font-bold">{userData.name}</h1>
                                    <p className="text-gray-600">
                                        Class of {userData.graduationYear}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-4 md:mt-0 md:pb-2">
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#1a5f3f] text-white rounded-lg hover:bg-[#2d7a4f] transition-colors font-semibold"
                                >
                                    <Edit className="w-4 h-4" />
                                    Edit Profile
                                </button>
                            </div>
                        </div>

                        {/* Bio */}
                        <p className="text-gray-700 mb-4">{userData.bio}</p>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-[#1a5f3f]" />
                                <span>{userData.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-[#1a5f3f]" />
                                <span>{userData.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#1a5f3f]" />
                                <span>{userData.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-[#1a5f3f]" />
                                <span>
                                    {userData.currentJob} at {userData.company}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

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
                            <div className="space-y-3">
                                <div>
                                    <p className="font-semibold text-gray-900">{userData.degree}</p>
                                    <p className="text-sm text-gray-600">
                                        University of San Jose-Recoletos
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Graduated {userData.graduationYear}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                            <div className="space-y-2">
                                <Link
                                    to="/events"
                                    className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Browse Events
                                </Link>
                                <a
                                    href="#directory"
                                    className="block w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Alumni Directory
                                </a>
                                <a
                                    href="#donate"
                                    className="block w-full text-left px-4 py-3 bg-[#d4af37] hover:bg-[#c19b2a] text-white rounded-lg transition-colors font-semibold text-center"
                                >
                                    Make a Donation
                                </a>
                            </div>
                        </div>

                        {/* Logout */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <Link
                                to="/"
                                className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-red-300 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}