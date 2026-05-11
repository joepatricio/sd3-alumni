import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ProfileHeader } from '@components/user/ProfileHeader';
import { Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@components/ui/form';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { useAuth } from '@/app/views/auth';
import { api } from '@/app/views/api';
import { useEffect, useState } from 'react';
import { ImageUpload } from '@components/user/ImageUpload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';

const profileSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    currentJob: z.string().optional(),
    company: z.string().optional(),
    bio: z.string().optional(),
    birthday: z.string().optional(),
    profileStatusId: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function EditProfile() {
    const navigate = useNavigate();
    const { session } = useAuth();

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [userRecord, setUserRecord] = useState<any>(null);
    const [degreeInfo, setDegreeInfo] = useState<any>(null);
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    const [profileStatuses, setProfileStatuses] = useState<any[]>([]);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema) as any,
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            location: '',
            currentJob: '',
            company: '',
            bio: '',
            birthday: '',
            profileStatusId: '',
        },
    });

    useEffect(() => {
        const fetchProfile = async () => {
            if (!session?.userId) return;
            try {
                const [profileRes, userRes, statusRes] = await Promise.all([
                    api.get(`/profiles?userId=${session.userId}`),
                    api.get(`/users?id=${session.userId}`),
                    api.get(`/profileStatuses`)
                ]);
                
                if (statusRes.data) {
                    setProfileStatuses(statusRes.data);
                }

                const uData = userRes.data;
                let defaultStatusId = '';
                if (uData && uData.length > 0) {
                    setUserRecord(uData[0]);
                    defaultStatusId = uData[0].profileStatusId;
                } else if (statusRes.data && statusRes.data.length > 0) {
                    const privateStatus = statusRes.data.find((s: any) => s.statusName === 'Private');
                    defaultStatusId = privateStatus ? privateStatus.id : statusRes.data[0].id;
                }

                const data = profileRes.data;
                if (data && data.length > 0) {
                    const p = data[0];
                    setProfile(p);
                    setProfileImageUrl(p.profileImage);
                    form.reset({
                        name: p.userName || '',
                        email: p.email || '',
                        phone: p.phone || '',
                        location: p.location || '',
                        currentJob: p.currentJob || '',
                        company: p.company || '',
                        bio: p.bio || '',
                        birthday: p.birthday ? new Date(p.birthday).toISOString().split('T')[0] : '',
                        profileStatusId: defaultStatusId,
                    });

                    if (p.degreeId) {
                        const deg = await api.get(`/degrees?id=${p.degreeId}`);
                        if (deg.data && deg.data.length > 0) {
                            setDegreeInfo(deg.data[0]);
                        }
                    }
                }
            } catch (error) {
                toast.error('Failed to load profile');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [session, form]);

    const handleImageSelect = (url: string) => {
        setProfileImageUrl(url);
    };

    const onSubmit = async (values: ProfileFormValues) => {
        if (!profile) return;
        try {
            await Promise.all([
                api.patch(`/profiles/${profile.id}`, {
                    userName: values.name,
                    email: values.email,
                    phone: values.phone,
                    location: values.location,
                    currentJob: values.currentJob,
                    company: values.company,
                    bio: values.bio,
                    birthday: values.birthday ? new Date(values.birthday).toISOString() : '',
                    profileImage: profileImageUrl,
                }),
                userRecord && values.profileStatusId ? api.patch(`/users/${userRecord.id}`, {
                    profileStatusId: values.profileStatusId
                }) : Promise.resolve()
            ]);
            toast.success('Profile updated successfully!');
            navigate('/profile');
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    const watchedValues = form.watch();

    if (loading) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">

                <ProfileHeader
                    name={watchedValues.name || 'Your Name'}
                    degree={degreeInfo?.degreeAbbr || 'Degree'}
                    graduationYear={profile?.batch?.toString() || 'YYYY'}
                    profileImage={profileImageUrl || 'http://localhost:3000/profile-image.jpg'}
                    bio={watchedValues.bio || ''}
                />

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-6 space-y-8">
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
                                    disabled={form.formState.isSubmitting}
                                    className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors font-semibold disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    Accept Changes
                                </button>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-brand-primary border-b pb-2">Profile Picture</h3>
                            <ImageUpload
                                previewUrl={profileImageUrl}
                                onFileSelect={handleImageSelect}
                                onClear={() => setProfileImageUrl('http://localhost:3000/profile-image.jpg')}
                                placeholderText="Upload a new profile picture"
                            />
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-brand-primary border-b pb-2">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="Full Name" {...field} className="selection:bg-blue-500 selection:text-white focus-visible:ring-brand-primary" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Email Address" type="email" {...field} className="selection:bg-blue-500 selection:text-white focus-visible:ring-brand-primary" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Phone Number" {...field} className="selection:bg-blue-500 selection:text-white focus-visible:ring-brand-primary" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Location</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Location" {...field} className="selection:bg-blue-500 selection:text-white focus-visible:ring-brand-primary" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="currentJob"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Job</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Current Job" {...field} className="selection:bg-blue-500 selection:text-white focus-visible:ring-brand-primary" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="company"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Company</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Company" {...field} className="selection:bg-blue-500 selection:text-white focus-visible:ring-brand-primary" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="birthday"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Birthday</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} className="selection:bg-blue-500 selection:text-white focus-visible:ring-brand-primary" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="profileStatusId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Profile Visibility</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="focus-visible:ring-brand-primary">
                                                        <SelectValue placeholder="Select visibility" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {profileStatuses.map((status) => (
                                                        <SelectItem key={status.id} value={status.id}>
                                                            {status.statusName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="md:col-span-2">
                                    <FormField
                                        control={form.control}
                                        name="bio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Bio</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Bio" rows={4} {...field} className="selection:bg-blue-500 selection:text-white resize-none focus-visible:ring-brand-primary" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={form.formState.isSubmitting}
                                className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors font-semibold disabled:opacity-50"
                            >
                                Accept Changes
                            </button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}
