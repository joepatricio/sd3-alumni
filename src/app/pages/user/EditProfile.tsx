import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ProfileHeader } from '@/app/components/user/ProfileHeader';
import { profileData } from '@/assets/mockData';
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
} from '@/app/components/ui/form';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';

const profileSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    phone: z.string().optional(),
    location: z.string().optional(),
    currentJob: z.string().optional(),
    company: z.string().optional(),
    bio: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function EditProfile() {
    const navigate = useNavigate();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema) as any,
        defaultValues: {
            name: profileData.name || '',
            email: profileData.email || '',
            phone: profileData.phone || '',
            location: profileData.location || '',
            currentJob: profileData.currentJob || '',
            company: profileData.company || '',
            bio: profileData.bio || '',
        },
    });

    const onSubmit = (values: ProfileFormValues) => {
        // Mock API call to save profile data
        setTimeout(() => {
            toast.success('Profile updated successfully!');
            navigate('/profile');
        }, 800);
    };

    // Watch the form values so the ProfileHeader can preview changes dynamically
    const watchedValues = form.watch();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">

                <ProfileHeader profileData={{ ...profileData, ...watchedValues }} />

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
                                            <FormLabel>Email Address <span className="text-red-500">*</span></FormLabel>
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
