'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, MapPin, X, Upload } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/app/components/ui/select';
import { cn } from '@/lib/utils';

const formSchema = z.object({
    title: z.string().min(2, {
        message: 'Title must be at least 2 characters.',
    }),
    category: z.string().min(1, {
        message: 'Please select an event category.',
    }),
    date: z.string().min(1, {
        message: 'A date for the event is required.',
    }),
    startTimeHour: z.string(),
    startTimeMinute: z.string(),
    startTimeAmPm: z.string(),
    endTimeHour: z.string(),
    endTimeMinute: z.string(),
    endTimeAmPm: z.string(),
    location: z.string().min(2, {
        message: 'Location is required.',
    }),
    description: z.string().min(10, {
        message: 'Description must be at least 10 characters.',
    }),
    image: z.any().optional(),
});

export interface EventData {
    title: string;
    category: string;
    date: string;
    startTimeHour: string;
    startTimeMinute: string;
    startTimeAmPm: string;
    endTimeHour: string;
    endTimeMinute: string;
    endTimeAmPm: string;
    location: string;
    description: string;
    image?: string | File | null;
}

interface CreateEventModalProps {
    trigger: React.ReactNode;
    initialData?: EventData;
}

export function CreateEventModal({ trigger, initialData }: CreateEventModalProps) {
    const [open, setOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            category: '',
            location: '',
            description: '',
            date: '',
            startTimeHour: '12',
            startTimeMinute: '00',
            startTimeAmPm: 'AM',
            endTimeHour: '1',
            endTimeMinute: '00',
            endTimeAmPm: 'PM',
        },
    });

    // Effect to update form values when initialData changes or modal opens
    useEffect(() => {
        if (initialData) {
            form.reset({
                title: initialData.title,
                category: initialData.category,
                location: initialData.location,
                description: initialData.description,
                date: initialData.date,
                startTimeHour: initialData.startTimeHour,
                startTimeMinute: initialData.startTimeMinute,
                startTimeAmPm: initialData.startTimeAmPm,
                endTimeHour: initialData.endTimeHour,
                endTimeMinute: initialData.endTimeMinute,
                endTimeAmPm: initialData.endTimeAmPm,
            });
            if (typeof initialData.image === 'string') {
                setPreviewUrl(initialData.image);
            }
        }
    }, [initialData, form, open]);


    function onSubmit(values: z.infer<typeof formSchema>) {
        // Construct final time strings
        const startTime = `${values.startTimeHour}:${values.startTimeMinute} ${values.startTimeAmPm}`;
        const endTime = `${values.endTimeHour}:${values.endTimeMinute} ${values.endTimeAmPm}`;

        const finalValues = {
            ...values,
            startTime,
            endTime,
            image: previewUrl
        };

        console.log(finalValues);

        setTimeout(() => {
            const message = initialData ? 'Event successfully updated!' : 'Event successfully created!';
            const description = initialData ? 'Your changes have been saved.' : 'Your event has been scheduled.';
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
            form.setValue('image', file);
        }
    };

    const clearImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setPreviewUrl(null);
        form.setValue('image', undefined);
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
            form.setValue('image', file);
            // Also update the input element if possible
            if (fileInputRef.current) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInputRef.current.files = dataTransfer.files;
            }
        } else if (file) {
            toast.error("Please upload an image file.");
        }
    };

    const categories = [
        'Reunion',
        'Networking',
        'Conference',
        'Workshop',
        'Ceremony',
        'Sports',
        'Virtual',
        'Other',
    ];

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
    const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
    const ampm = ['AM', 'PM'];

    const isEditMode = !!initialData;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] md:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Event' : 'Create Event'}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? 'Update event details.' : 'Schedule a new event for the alumni community.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Event Title</FormLabel>
                                        <FormControl>
                                            <Input
                                                className="selection:bg-blue-500 selection:text-white"
                                                placeholder="Annual Homecoming..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category} value={category}>
                                                        {category}
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

                            {/* Start Time Picker */}
                            <FormItem>
                                <FormLabel>Start Time</FormLabel>
                                <div className="flex gap-2">
                                    <FormField
                                        control={form.control}
                                        name="startTimeHour"
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Hour" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="startTimeMinute"
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Min" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {minutes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="startTimeAmPm"
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="AM/PM" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {ampm.map(ap => <SelectItem key={ap} value={ap}>{ap}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            </FormItem>

                            {/* End Time Picker */}
                            <FormItem>
                                <FormLabel>End Time</FormLabel>
                                <div className="flex gap-2">
                                    <FormField
                                        control={form.control}
                                        name="endTimeHour"
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Hour" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="endTimeMinute"
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Min" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {minutes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="endTimeAmPm"
                                        render={({ field }) => (
                                            <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="AM/PM" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {ampm.map(ap => <SelectItem key={ap} value={ap}>{ap}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            </FormItem>

                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Location</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Input
                                                    className="selection:bg-blue-500 selection:text-white"
                                                    placeholder="Event venue or address"
                                                    {...field}
                                                />
                                                <MapPin className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormItem className="md:col-span-2">
                                <FormLabel>Event Image (Optional)</FormLabel>
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
                                                    <p className="text-sm text-gray-600 font-medium">Click or drag to upload event banner</p>
                                                    <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG (max. 5MB)</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </FormControl>
                                <FormDescription>
                                    Upload a banner image for the event.
                                </FormDescription>
                            </FormItem>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Provide details about the event..."
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button className="bg-[#1a5f3f]  hover:bg-[#2d7a4f]" type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                {isEditMode ? 'Save Changes' : 'Create Event'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
