'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/app/components/ui/button';
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
} from '@/app/components/ui/form';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { cn } from '@/lib/utils';

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
}

export function CreateBulletinModal({ trigger, initialData }: CreateBulletinModalProps) {
    const [open, setOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        }, 1000);
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            form.setValue('heroImage', file);
        }
    };

    const clearImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreviewUrl(null);
        form.setValue('heroImage', undefined);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            form.setValue('heroImage', file);
            // Also update the input element if possible, though mostly for consistency
            if (fileInputRef.current) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInputRef.current.files = dataTransfer.files;
            }
        } else if (file) {
            toast.error("Please upload an image file.");
        }
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

                        {/* Date */}
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            {...field}
                                            className="w-full"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Hero Image */}
                        <FormItem>
                            <FormLabel>Hero Image (Optional)</FormLabel>
                            <FormControl>
                                <div className="space-y-2">
                                    <div
                                        onClick={handleUploadClick}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        className={cn(
                                            "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors relative",
                                            isDragging ? "border-[#1a5f3f] bg-[#1a5f3f]/10" : "border-gray-300 hover:border-[#1a5f3f]"
                                        )}
                                    >
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            ref={fileInputRef}
                                            className="hidden"
                                            style={{ display: 'none' }}
                                        />

                                        {previewUrl ? (
                                            <div className="relative w-full h-48 rounded-lg overflow-hidden">
                                                <img
                                                    src={previewUrl}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={clearImage}
                                                    className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className={cn("w-8 h-8 mb-2", isDragging ? "text-[#1a5f3f]" : "text-gray-400")} />
                                                <p className="text-sm text-gray-600 font-medium">Click or drag to upload hero image</p>
                                                <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG (max. 5MB)</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </FormControl>
                            <FormDescription>
                                Upload an image to be displayed at the top of the bulletin.
                            </FormDescription>
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
                            <Button className="bg-[#1a5f3f]  hover:bg-[#2d7a4f]" type="submit" disabled={form.formState.isSubmitting}>
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
