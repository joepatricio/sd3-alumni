import { useState, useEffect, useMemo } from 'react';
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
    content?: string;
    description?: string;
    bulletinImage?: string | File | null;
    readTimeMinutes?: number;
    category?: any;
    contentStatus?: { id: string; statusName: string };
    status?: { id: string; statusName: string };
    bulletinCategory?: any;
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
    { id: '1', bulletinCategoryName: 'Announcements' },
    { id: '2', bulletinCategoryName: 'Careers' },
    { id: '3', bulletinCategoryName: 'Success Stories' },
    { id: '4', bulletinCategoryName: 'Donations' },
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
        if (typeof data.category === 'string') return data.category;
        if (typeof data.category === 'object' && (data.category as any)?.bulletinCategoryName) {
            return (data.category as any).bulletinCategoryName;
        }
        if (data.bulletinCategory) {
            if (typeof data.bulletinCategory === 'object' && data.bulletinCategory.bulletinCategoryName) {
                return data.bulletinCategory.bulletinCategoryName;
            }
            if (typeof data.bulletinCategory === 'string') {
                return data.bulletinCategory;
            }
        }
        if ((data as any).bulletinCategoryName) {
            return (data as any).bulletinCategoryName;
        }
        return '';
    };

    // Effect to update form values when initialData changes or modal opens
    useEffect(() => {
        if (initialData && open) {
            const initialCategory = getInitialCategory(initialData);
            const initialContent = initialData.content || initialData.description || '';
            form.reset({
                title: initialData.title || '',
                category: initialCategory,
                content: initialContent,
                readTimeMinutes: initialData.readTimeMinutes || 5,
                bulletinImage: initialData.bulletinImage || null,
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

    const availableCategories = useMemo(() => {
        const list = categories.length > 0 ? [...categories] : [...DEFAULT_BULLETIN_CATEGORIES];
        const currentCategory = form.watch('category');
        if (currentCategory && !list.some(c => c.bulletinCategoryName === currentCategory)) {
            list.unshift({ id: 'current', bulletinCategoryName: currentCategory });
        }
        return list;
    }, [categories, form.watch('category')]);

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
        }

        if (!isAdmin) {
            try {
                const statusRes = await api.get('/contentStatuses?statusName=Pending');
                // Flagged for vague typing
                const statusData = Array.isArray(statusRes.data) ? statusRes.data : statusRes.data.data;
                const pendingStatus = statusData?.[0];
                if (pendingStatus) {
                    payload.contentStatusId = pendingStatus.id;
                }
            } catch (e) {
                console.error('Failed to fetch Pending status ID', e);
            }
        }

        try {
            const endpoint = isAdmin ? `/admin/bulletins` : `/bulletins`;

            if (isEditMode && initialData?.id) {
                const patchEndpoint = isAdmin ? `/admin/bulletins/${initialData.id}` : `/bulletins/${initialData.id}`;
                await api.patch(patchEndpoint, payload);

                // If it was valid and now it's pending (because !isAdmin), decrement bulletinsCreated
                if (!isAdmin && session?.userId) {
                    const validStatuses = ['Approved', 'Concluded'];
                    const oldStatus = initialData.contentStatus?.statusName;
                    if (oldStatus && validStatuses.includes(oldStatus)) {
                        try {
                            const statsRes = await api.get('/userStatistics', { params: { userId: session.userId } });
                            const stats = Array.isArray(statsRes.data) ? statsRes.data : (statsRes.data?.data || []);
                            if (stats && stats.length > 0) {
                                const currentStats = stats[0];
                                await api.patch(`/userStatistics/${currentStats.id}`, {
                                    bulletinsCreated: Math.max(0, (currentStats.bulletinsCreated || 0) - 1)
                                });
                            }
                        } catch (statErr) {
                            console.error("Failed to decrement user statistics for bulletin edit:", statErr);
                        }
                    }
                }
            } else {
                await api.post(endpoint, payload);
            }

            const message = initialData ? 'Bulletin successfully updated!' : 'Bulletin successfully created!';
            const description = isAdmin ? 'Your changes have been saved.' : 'Your bulletin has been submitted for review.';

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

    const onInvalid = (errors: any) => {
        console.error("Bulletin form validation errors:", errors);
        const getFirstError = (errObj: any): string | null => {
            for (const key of Object.keys(errObj)) {
                if (errObj[key]?.message) return String(errObj[key].message);
                if (typeof errObj[key] === 'object') {
                    const nested = getFirstError(errObj[key]);
                    if (nested) return nested;
                }
            }
            return null;
        };
        const message = getFirstError(errors) || "Please check the form for required fields.";
        toast.error(message);
    };

    const handleFileSelect = (url: string) => {
        setPreviewUrl(url);
        form.setValue('bulletinImage', url, { shouldValidate: true });
    };

    const handleClearImage = () => {
        setPreviewUrl(null);
        form.setValue('bulletinImage', null, { shouldValidate: true });
    };

    const isEditMode = !!initialData;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger && (
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Bulletin' : 'Create Bulletin'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? 'Update bulletin details.' : 'Share news and announcements with the alumni community.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-4">
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
                                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select bulletin category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {availableCategories.map((cat) => (
                                                <SelectItem
                                                    key={cat.id || cat.bulletinCategoryName}
                                                    value={cat.bulletinCategoryName}
                                                    className="cursor-pointer transition-colors hover:bg-brand-primary hover:text-white focus:bg-brand-primary focus:text-white data-[highlighted]:bg-brand-primary data-[highlighted]:text-white data-[highlighted]:[&_svg]:text-white hover:[&_svg]:text-white focus:[&_svg]:text-white"
                                                >
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
                        <FormField
                            control={form.control}
                            name="bulletinImage"
                            render={() => (
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
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                            <Button className="bg-brand-primary hover:bg-brand-primary-hover" type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {form.formState.isSubmitting
                                    ? (isEditMode ? 'Saving Changes...' : 'Creating Bulletin...')
                                    : (isEditMode ? 'Save Changes' : 'Create Bulletin')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
