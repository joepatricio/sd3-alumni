import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from './ImageUpload';

import { Button } from '@components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/app/components/ui/dialog';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@components/ui/form';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';

const formSchema = z.object({
    title: z.string().min(2, {
        message: 'Title must be at least 2 characters.',
    }),
    date: z.string().min(1, {
        message: 'A date of publication is required.',
    }),
    content: z.string().min(10, {
        message: 'Content must be at least 10 characters.',
    }),
    heroImage: z.any().optional(),
});

export interface BulletinData {
    title: string;
    date: string;
    content: string;
    heroImage?: string | File | null;
}

interface CreateBulletinModalProps {
    trigger: React.ReactNode;
    initialData?: BulletinData;
    isAdmin?: boolean;
}

export function CreateBulletinModal({ trigger, initialData, isAdmin = false }: CreateBulletinModalProps) {
    const [open, setOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            content: '',
            date: '',
        },
    });

    // Effect to update form values when initialData changes or modal opens
    useEffect(() => {
        if (initialData) {
            form.reset({
                title: initialData.title,
                content: initialData.content,
                date: initialData.date,
            });
            if (typeof initialData.heroImage === 'string') {
                setPreviewUrl(initialData.heroImage);
            }
        }
    }, [initialData, form, open]);


    function onSubmit(values: z.infer<typeof formSchema>) {
        // Simulate API call
        console.log({ ...values, heroImage: previewUrl });

        setTimeout(() => {
            const isPending = !isAdmin && isEditMode;
            const message = initialData
                ? (isPending ? 'Bulletin update submitted for review!' : 'Bulletin successfully updated!')
                : 'Bulletin successfully created!';
            const description = initialData
                ? (isPending ? 'Your changes require admin approval before they are live.' : 'Your changes have been saved.')
                : 'Your bulletin has been submitted for review.';

            toast.success(message, {
                description: description,
            });
            setOpen(false);
            if (!initialData) {
                form.reset();
                setPreviewUrl(null);
            }
        }, 1000);
    }

    const handleFileSelect = (file: File) => {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        form.setValue('heroImage', file);
    };

    const handleClearImage = () => {
        setPreviewUrl(null);
        form.setValue('heroImage', undefined);
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
