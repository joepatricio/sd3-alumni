import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ProfileHeader } from '@/app/components/user/ProfileHeader';
import { userData } from '@/assets/mockData';
import { Save, X } from 'lucide-react';

export function EditProfile() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        ...userData,
        // Ensure nested objects are initialized if they might be missing in some mock data versions
        primaryEducation: userData.primaryEducation || { school: '', year: '' },
        secondaryEducationJHS: userData.secondaryEducationJHS || { school: '', year: '' },
        secondaryEducationSHS: userData.secondaryEducationSHS || { school: '', year: '' },
        postGraduateEducation: userData.postGraduateEducation || { school: '', year: '', degree: '' },
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEducationChange = (
        section: 'primaryEducation' | 'secondaryEducationJHS' | 'secondaryEducationSHS' | 'postGraduateEducation',
        field: string,
        value: string
    ) => {
        setFormData((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value,
            },
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation
        if (!formData.name || !formData.email) {
            toast.error('Name and Email are required.');
            return;
        }

        // Simulate API call
        setTimeout(() => {
            toast.success('Profile updated successfully!');
            navigate('/profile');
        }, 800);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">

                <ProfileHeader userData={formData} />

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-8">
                    <div className="flex items-center justify-between border-b pb-4">
                        <h2 className="text-xl font-bold">Edit Profile</h2>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-4 py-2 bg-[#1a5f3f] text-white rounded-lg hover:bg-[#2d7a4f] transition-colors font-semibold"
                            >
                                <Save className="w-4 h-4" />
                                Accept Changes
                            </button>
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-[#1a5f3f] border-b pb-2">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Job</label>
                                <input
                                    type="text"
                                    name="currentJob"
                                    value={formData.currentJob}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Education */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-[#1a5f3f] border-b pb-2">Education</h3>

                        {/* Primary */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-800">Primary Education</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <input
                                        type="text"
                                        placeholder="School Name"
                                        value={formData.primaryEducation.school}
                                        onChange={(e) => handleEducationChange('primaryEducation', 'school', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Year Graduated"
                                        value={formData.primaryEducation.year}
                                        onChange={(e) => handleEducationChange('primaryEducation', 'year', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Secondary JHS */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-800">Secondary Education (JHS)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <input
                                        type="text"
                                        placeholder="School Name"
                                        value={formData.secondaryEducationJHS.school}
                                        onChange={(e) => handleEducationChange('secondaryEducationJHS', 'school', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Year Graduated"
                                        value={formData.secondaryEducationJHS.year}
                                        onChange={(e) => handleEducationChange('secondaryEducationJHS', 'year', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Secondary SHS */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-800">Secondary Education (SHS)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <input
                                        type="text"
                                        placeholder="School Name"
                                        value={formData.secondaryEducationSHS.school}
                                        onChange={(e) => handleEducationChange('secondaryEducationSHS', 'school', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Year Graduated"
                                        value={formData.secondaryEducationSHS.year}
                                        onChange={(e) => handleEducationChange('secondaryEducationSHS', 'year', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* College */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-800">College / Tertiary</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs text-gray-500 mb-1">Degree</label>
                                    <input
                                        type="text"
                                        name="degree"
                                        value={formData.degree}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] mb-2"
                                    />
                                    <label className="block text-xs text-gray-500 mb-1">School (Default)</label>
                                    <input
                                        type="text"
                                        value="University of San Jose-Recoletos"
                                        disabled
                                        className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Year Graduated</label>
                                    <input
                                        type="text"
                                        name="graduationYear"
                                        value={formData.graduationYear}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Postgraduate */}
                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-800">Postgraduate Education</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-xs text-gray-500 mb-1">Degree</label>
                                    <input
                                        type="text"
                                        placeholder="Degree / Program"
                                        value={formData.postGraduateEducation.degree}
                                        onChange={(e) => handleEducationChange('postGraduateEducation', 'degree', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f] mb-2"
                                    />
                                    <label className="block text-xs text-gray-500 mb-1">School</label>
                                    <input
                                        type="text"
                                        placeholder="School Name"
                                        value={formData.postGraduateEducation.school}
                                        onChange={(e) => handleEducationChange('postGraduateEducation', 'school', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Year Graduated</label>
                                    <input
                                        type="text"
                                        placeholder="Year"
                                        value={formData.postGraduateEducation.year}
                                        onChange={(e) => handleEducationChange('postGraduateEducation', 'year', e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a5f3f]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-6 border-t">
                        <button
                            type="button"
                            onClick={() => navigate('/profile')}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-[#1a5f3f] text-white rounded-lg hover:bg-[#2d7a4f] transition-colors font-semibold"
                        >
                            Accept Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
