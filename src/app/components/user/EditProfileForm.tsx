import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Save, X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ProfileHeader } from '@components/user/ProfileHeader';
import { ImageUpload } from '@components/user/ImageUpload';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@components/ui/select';
import {
    api,
    unwrapListResponse,
    type ProfileData,
    type User,
    type DegreeData,
    type ProfileStatusData,
} from '@/app/views/api';

const profileSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    currentJob: z.string().optional(),
    company: z.string().optional(),
    bio: z.string().optional(),
    birthday: z.string().optional(),
    profileStatusId: z.string().optional(),
    gender: z.string().optional(),
    pronoun: z.string().optional(),
    degreeId: z.string().optional(),
    batch: z
        .string()
        .optional()
        .refine(
            (val) => {
                if (!val || val.trim() === '') return true;
                const parsed = Number(val.trim());
                return Number.isInteger(parsed) && parsed > 0;
            },
            { message: 'Batch must be a valid year.' }
        ),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export interface EditProfileFormProps {
    userId: string;
    isAdmin?: boolean;
    variant?: 'page' | 'modal';
    degrees?: DegreeData[];
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function EditProfileForm({
    userId,
    isAdmin = false,
    variant = 'page',
    degrees: initialDegrees,
    onSuccess,
    onCancel,
}: EditProfileFormProps) {
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [userRecord, setUserRecord] = useState<User | null>(null);
    const [degreeInfo, setDegreeInfo] = useState<DegreeData | null>(null);
    const [availableDegrees, setAvailableDegrees] = useState<DegreeData[]>(initialDegrees || []);
    const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
    const [profileStatuses, setProfileStatuses] = useState<ProfileStatusData[]>([]);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
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
            gender: '',
            pronoun: '',
            degreeId: '',
            batch: '',
        },
    });

    useEffect(() => {
        if (initialDegrees && initialDegrees.length > 0) {
            setAvailableDegrees(initialDegrees);
            return;
        }
        if (!isAdmin) return;
        let cancelled = false;
        api.get('/degrees')
            .then((res) => {
                if (!cancelled) {
                    setAvailableDegrees(unwrapListResponse<DegreeData>(res).items);
                }
            })
            .catch((err) => {
                console.error('Failed to load degrees:', err);
            });
        return () => {
            cancelled = true;
        };
    }, [isAdmin, initialDegrees]);

    useEffect(() => {
        let cancelled = false;

        const fetchProfile = async () => {
            if (!userId) return;
            setLoading(true);
            setLoadError(null);

            try {
                const [profileRes, userRes, statusRes] = await Promise.all([
                    api.get('/profiles', { params: { userId } }),
                    api.get('/users', { params: { id: userId } }),
                    api.get('/profileStatuses'),
                ]);

                if (cancelled) return;

                const statuses = unwrapListResponse<ProfileStatusData>(statusRes).items;
                setProfileStatuses(statuses);

                const uData = unwrapListResponse<User>(userRes).items;
                let defaultStatusId = '';
                if (uData.length > 0) {
                    setUserRecord(uData[0]);
                    defaultStatusId = uData[0].profileStatusId;
                } else if (statuses.length > 0) {
                    const privateStatus = statuses.find((s: ProfileStatusData) => s.statusName === 'Private');
                    defaultStatusId = privateStatus ? privateStatus.id : statuses[0].id;
                }

                const pData = unwrapListResponse<ProfileData>(profileRes).items;
                if (pData.length > 0) {
                    const p = pData[0];
                    setProfile(p);
                    setProfileImageUrl(p.profileImage || null);

                    let genderVal = '';
                    let pronounVal = '';
                    if (p.gender === 'Male' || p.gender === 'Female') {
                        genderVal = p.gender;
                    } else if (p.gender) {
                        genderVal = 'Custom';
                        pronounVal = p.gender;
                    }

                    form.reset({
                        name: p.userName || '',
                        email: p.email || '',
                        phone: p.phone || '',
                        location: p.location || '',
                        currentJob: p.currentJob || '',
                        company: p.company || '',
                        bio: p.bio || '',
                        birthday: p.birthday ? p.birthday.split('T')[0] : '',
                        profileStatusId: defaultStatusId,
                        gender: genderVal,
                        pronoun: pronounVal,
                        degreeId: p.degreeId || '',
                        batch: p.batch != null ? String(p.batch) : '',
                    });

                    if (p.degree) {
                        setDegreeInfo(p.degree);
                    } else if (p.degreeId) {
                        const degRes = await api.get('/degrees', { params: { id: p.degreeId } });
                        if (!cancelled) {
                            const degItems = unwrapListResponse<DegreeData>(degRes).items;
                            if (degItems.length > 0) {
                                setDegreeInfo(degItems[0]);
                            }
                        }
                    }
                } else {
                    setProfile(null);
                    setLoadError('User profile not found.');
                }
            } catch (error) {
                if (!cancelled) {
                    setLoadError('Failed to load profile.');
                    toast.error('Failed to load profile');
                    console.error(error);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchProfile();

        return () => {
            cancelled = true;
        };
    }, [userId, form]);

    const handleImageSelect = (fileOrUrl: string | File) => {
        if (typeof fileOrUrl === 'string') {
            setProfileImageUrl(fileOrUrl);
        }
    };

    const onSubmit = async (values: ProfileFormValues) => {
        if (!profile) return;
        const targetProfileId = profile.id || profile.userId || userId;
        const profilePayload: Record<string, unknown> = {
            userName: values.name,
            email: values.email,
            phone: values.phone,
            location: values.location,
            currentJob: values.currentJob,
            company: values.company,
            bio: values.bio,
            birthday: values.birthday ? new Date(values.birthday).toISOString() : null,
            gender: values.gender === 'Custom' ? (values.pronoun || '') : values.gender,
            profileImage: profileImageUrl,
        };

        if (isAdmin) {
            if (values.degreeId) {
                profilePayload.degreeId = values.degreeId;
            }
            profilePayload.batch =
                values.batch && values.batch.trim() !== ''
                    ? parseInt(values.batch.trim(), 10)
                    : null;
        }

        try {
            await Promise.all([
                api.patch(`/profiles/${targetProfileId}`, profilePayload),
                userRecord && values.profileStatusId
                    ? api.patch(`/users/${userRecord.id}`, {
                          profileStatusId: values.profileStatusId,
                      })
                    : Promise.resolve(),
            ]);
            toast.success('Profile updated successfully!');
            onSuccess?.();
        } catch (error) {
            toast.error('Failed to update profile');
            console.error('Error in EditProfileForm:', error);
        }
    };

    const watchedValues = form.watch();
    const activeDegree =
        (isAdmin && watchedValues.degreeId
            ? availableDegrees.find((d) => d.id === watchedValues.degreeId)
            : null) || degreeInfo;
    const displayedBatch =
        (isAdmin ? watchedValues.batch : profile?.batch?.toString()) || 'YYYY';

    if (loading) {
        if (variant === 'modal') {
            return (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Loader2 className="w-8 h-8 text-brand-primary animate-spin mb-2" />
                    <p className="text-sm font-medium">Loading profile...</p>
                </div>
            );
        }
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                Loading...
            </div>
        );
    }

    if (loadError || !profile) {
        return (
            <div className="py-10 text-center space-y-4">
                <p className="text-sm text-red-600 font-medium">{loadError || 'Profile not found.'}</p>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm"
                    >
                        Close
                    </button>
                )}
            </div>
        );
    }

    return (
        <>
            {variant === 'page' && (
                <ProfileHeader
                    name={watchedValues.name || 'Your Name'}
                    degree={activeDegree ? `${activeDegree.degreeName} (${activeDegree.degreeAbbr})` : ''}
                    graduationYear={displayedBatch}
                    profileImage={profileImageUrl || '/images/profile-image.jpg'}
                    bio={watchedValues.bio || ''}
                    isAdminPreview={isAdmin}
                />
            )}

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className={
                        variant === 'page'
                            ? 'bg-white rounded-lg shadow-md p-6 space-y-8'
                            : 'space-y-6'
                    }
                >
                    {variant === 'page' && (
                        <div className="flex items-center justify-between border-b pb-4">
                            <h2 className="text-xl font-bold">Edit Profile</h2>
                            <div className="flex gap-2">
                                {onCancel && (
                                    <button
                                        type="button"
                                        onClick={onCancel}
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                                    >
                                        <X className="w-4 h-4" />
                                        Cancel
                                    </button>
                                )}
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
                    )}

                    {/* Profile Picture */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-brand-primary border-b pb-2">Profile Picture</h3>
                        <ImageUpload
                            previewUrl={profileImageUrl}
                            onFileSelect={handleImageSelect}
                            onClear={() => setProfileImageUrl('/images/engineer.png')}
                            placeholderText="Upload a new profile picture"
                        />
                    </div>

                    {/* Personal Information */}
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

                            {isAdmin && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="degreeId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Degree Program</FormLabel>
                                                <Select
                                                    key={availableDegrees.length}
                                                    onValueChange={field.onChange}
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger className="focus-visible:ring-brand-primary">
                                                            <SelectValue placeholder="Select degree program" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {availableDegrees.map((deg) => (
                                                            <SelectItem key={deg.id} value={deg.id}>
                                                                {deg.degreeAbbr} - {deg.degreeName}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="batch"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Batch / Graduation Year</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g. 2023"
                                                        inputMode="numeric"
                                                        {...field}
                                                        className="selection:bg-blue-500 selection:text-white focus-visible:ring-brand-primary"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

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
                                        <Select
                                            key={profileStatuses.length}
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
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

                            <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2 mb-2">
                                            <FormLabel className="!mb-0">Gender</FormLabel>
                                            <div className="w-4 h-4 rounded-full border border-gray-400 text-gray-500 flex items-center justify-center text-[10px] font-bold cursor-help" title="You can change who sees your gender on your profile later. Select Custom to choose another gender, or if you'd rather not say.">?</div>
                                        </div>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="selection:bg-blue-500 selection:text-white">
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Female">Female</SelectItem>
                                                <SelectItem value="Custom">Custom</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {watchedValues.gender === 'Custom' && (
                                <FormField
                                    control={form.control}
                                    name="pronoun"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Pronouns (optional)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Gender (optional)"
                                                    className="selection:bg-blue-500 selection:text-white"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

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

                    <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={form.formState.isSubmitting}
                            className="flex items-center gap-2 px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-hover transition-colors font-semibold text-sm disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {form.formState.isSubmitting ? 'Saving...' : 'Accept Changes'}
                        </button>
                    </div>
                </form>
            </Form>
        </>
    );
}
