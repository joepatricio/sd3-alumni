import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from './ImageUpload';
import { api } from '@/app/views/api';
import { useAuth } from '@/app/views/auth';

import { Button } from '@components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@components/ui/dialog';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@components/ui/select';

const formSchema = z.object({
    title: z.string().min(2, {
        message: 'Title must be at least 2 characters.',
    }),
    category: z.string().min(1, {
        message: 'Please select a bulletin category.',
    }),
    content: z.string().min(10, {
        message: 'Content must be at least 10 characters.',
    }),
    bulletinImage: z.any().optional(),
    readTimeMinutes: z.number().min(1),
});

export interface BulletinData {
    id?: string;
    title: string;
    bulletinDate?: string;
    content: string;
    bulletinImage?: string | File | null;
    readTimeMinutes?: number;
    category?: string;
    bulletinCategory?: { id?: string; bulletinCategoryName: string } | string;
    bulletinCategoryId?: string;
}

interface CreateBulletinModalProps {
    trigger?: React.ReactNode;
    initialData?: BulletinData;
    isAdmin?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const DEFAULT_BULLETIN_CATEGORIES = [
    { id: '1', bulletinCategoryName: 'General News & Announcements' },
    { id: '2', bulletinCategoryName: 'Career & Networking' },
    { id: '3', bulletinCategoryName: 'Alumni Spotlight & Stories' },
    { id: '4', bulletinCategoryName: 'Donations & Giving' },
    { id: '5', bulletinCategoryName: 'Others' }
];

export function CreateBulletinModal({ trigger, initialData, isAdmin = false, open: externalOpen, onOpenChange: externalOnOpenChange }: CreateBulletinModalProps) {
    const { session } = useAuth();
    const [internalOpen, setInternalOpen] = useState(false);
    const open = externalOpen !== undefined ? externalOpen : internalOpen;
    const setOpen = externalOnOpenChange || setInternalOpen;
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [categories, setCategories] = useState<{ id: string; bulletinCategoryName: string }[]>([]);

    useEffect(() => {
        if (open && categories.length === 0) {
            api.get('/bulletinCategories')
                .then(res => {
                    const fetched = Array.isArray(res.data) ? res.data : (res.data?.data || []);
                    if (fetched.length > 0) {
                        setCategories(fetched);
                    }
                })
                .catch(err => console.error('Failed to fetch bulletin categories:', err));
        }
    }, [open, categories.length]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            category: '',
            content: '',
            readTimeMinutes: 5,
        },
    });

    const getInitialCategory = (data?: BulletinData) => {
        if (!data) return '';
        if (data.category && typeof data.category === 'string') return data.category;
        if (data.bulletinCategory) {
            if (typeof data.bulletinCategory === 'object' && data.bulletinCategory.bulletinCategoryName) {
                return data.bulletinCategory.bulletinCategoryName;
            }
            if (typeof data.bulletinCategory === 'string') {
                return data.bulletinCategory;
            }
        }
        return '';
    };

    // Effect to update form values when initialData changes or modal opens
    useEffect(() => {
        if (initialData && open) {
            form.reset({
                title: initialData.title,
                category: getInitialCategory(initialData),
                content: initialData.content,
                readTimeMinutes: initialData.readTimeMinutes || 5,
                bulletinImage: initialData.bulletinImage,
            });
            if (typeof initialData.bulletinImage === 'string') {
                setPreviewUrl(initialData.bulletinImage);
            } else {
                setPreviewUrl(null);
            }
        } else if (!initialData && open) {
            form.reset({
                title: '',
                category: '',
                content: '',
                readTimeMinutes: 5,
                bulletinImage: undefined,
            });
            setPreviewUrl(null);
        }
    }, [initialData, form, open]);


    async function onSubmit(values: z.infer<typeof formSchema>) {
        const payload: any = { ...values, bulletinImage: previewUrl };

        if (!initialData) {
            payload.bulletinDate = new Date().toISOString();
            if (session?.userId) {
                payload.authorId = session.userId.toString();
            }
        }

        if (isAdmin) {
            payload.reviewDate = new Date().toISOString();
            let adminId: string | undefined;
            const adminToken = sessionStorage.getItem('adminToken');
            if (adminToken) {
                try {
                    const parsed = JSON.parse(atob(adminToken.split('.')[1]));
                    if (parsed && parsed.id) {
                        adminId = parsed.id.toString();
                    }
                } catch (e) {
                    console.error("Failed to parse admin token", e);
                }
            }
            if (!adminId && session?.userId) {
                adminId = session.userId.toString();
            }
            if (adminId) {
                payload.adminId = adminId;
            }
        }

        try {
            const endpoint = isAdmin ? `/admin/bulletins` : `/bulletins`;
            const token = sessionStorage.getItem('adminToken') || sessionStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

            if (isEditMode && initialData?.id) {
                const patchEndpoint = isAdmin ? `/admin/bulletins/${initialData.id}` : `/bulletins/${initialData.id}`;
                await api.patch(patchEndpoint, payload, { headers });
            } else {
                await api.post(endpoint, payload, { headers });
            }

            // const isPending = !isAdmin && isEditMode;
            const message = initialData ? 'Bulletin successfully updated!' : 'Bulletin successfully created!';
            const description = initialData ? 'Your changes have been saved.' : 'Your bulletin has been submitted for review.';

            toast.success(message, {
                description: description,
            });
            setOpen(false);
            if (!initialData) {
                form.reset();
                setPreviewUrl(null);
            }
        } catch (error) {
            console.error("Failed to save bulletin", error);
            toast.error("Failed to save bulletin. Please try again.");
        }
    }

    const handleFileSelect = (url: string) => {
        setPreviewUrl(url);
        form.setValue('bulletinImage', url);
    };

    const handleClearImage = () => {
        setPreviewUrl(null);
        form.setValue('bulletinImage', null);
    };

    const isEditMode = !!initialData;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Bulletin' : 'Create Bulletin'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? 'Update bulletin details.' : 'Share news and announcements with the alumni community.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Title */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input className="selection:bg-blue-500 selection:text-white" placeholder="Enter bulletin title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Category */}
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || ''}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select bulletin category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {(categories.length > 0 ? categories : DEFAULT_BULLETIN_CATEGORIES).map((cat) => (
                                                <SelectItem key={cat.id || cat.bulletinCategoryName} value={cat.bulletinCategoryName}>
                                                    {cat.bulletinCategoryName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Banner Image */}
                        <FormItem>
                            <FormLabel>Banner Image (Optional)</FormLabel>
                            <FormControl>
                                <div className="space-y-2">
                                    <ImageUpload
                                        previewUrl={previewUrl}
                                        onFileSelect={handleFileSelect}
                                        onClear={handleClearImage}
                                        placeholderText="Click or drag to upload bulletin banner"
                                    />
                                </div>
                            </FormControl>
                        </FormItem>

                        {/* Content */}
                        <FormField
                            control={form.control}
                            name="content"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Content</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Write your bulletin content here..."
                                            className="min-h-[150px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Footer */}
                        <DialogFooter>
                            <Button className="bg-brand-primary  hover:bg-brand-primary-hover" type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {isEditMode ? 'Save Changes' : 'Create Bulletin'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
