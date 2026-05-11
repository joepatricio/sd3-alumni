import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Loader2, GraduationCap, School } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { api } from '@/app/views/api';
import bcrypt from 'bcryptjs';
import { useAuth } from '@/app/views/auth';
import { nanoid } from 'nanoid'

import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Checkbox } from '@components/ui/checkbox';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@components/ui/select';

const DEGREES = [
    { id: "100", name: "Mechanical Engineering" },
    { id: "101", name: "Civil Engineering" },
    { id: "102", name: "Industrial Engineering" },
    { id: "103", name: "Electrical Engineering" },
    { id: "104", name: "Electronics and Communications Engineering" },
    { id: "105", name: "Computer Engineering" }
];

const registerSchema = z.object({
    fullName: z.string().min(2, {
        message: "Full name must be at least 2 characters.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string(),
    degreeProgram: z.string().min(1, {
        message: "Please select a degree program.",
    }),
    batch: z.coerce.number().min(1950).max(new Date().getFullYear() + 5, {
        message: "Please enter a valid batch year.",
    }),
    terms: z.boolean().refine(val => val === true, {
        message: "You must accept the terms and conditions.",
    }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();

    useEffect(() => {
        if (isLoggedIn) {
            navigate('/profile', { replace: true });
        }
    }, [isLoggedIn, navigate]);

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema) as any,
        defaultValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
            degreeProgram: "",
            batch: new Date().getFullYear(),
            terms: false,
        },
    });

    const onSubmit = async (values: z.infer<typeof registerSchema>) => {
        try {
            // Check user limit
            const usersResponse = await api.get('/userAuths');
            if (usersResponse.data.length >= 100) {
                toast.error("Registrations are closed", {
                    description: "The maximum number of users has been reached."
                });
                return;
            }

            // Check if email already exists
            const existingUser = await api.get(`/userAuths?email=${values.email}`);
            if (existingUser.data.length > 0) {
                toast.error("Registration failed", {
                    description: "Email is already registered."
                });
                return;
            }

            if (isSubmitting) return;
            setIsSubmitting(true);

            // Generate ID and hash password
            const user_id = Math.floor(Math.random() * 1000000) + 1000;
            const password_hash = bcrypt.hashSync(values.password, 10);
            const degree = DEGREES.find(d => d.name === values.degreeProgram);

            // Create USER_AUTH
            await api.post('/userAuths', {
                user_id,
                email: values.email,
                password_hash,
                last_login: new Date().toISOString()
            });

            const record_id = nanoid(11);

            // Create RECORDS
            await api.post('/RECORDS', {
                record_id,
                user_id,
                admin_id: "admin3",
                status_id: "401",
                date_created: new Date().toISOString(),
                description: "User registered",
                date_expires: null
            });

            // Create USER
            await api.post('/USER', {
                user_id,
                status_id: "401",
                current_record_id: record_id
            });

            // Create PROFILE
            await api.post('/PROFILE', {
                user_id,
                user_name: values.fullName,
                email: values.email,
                phone: "",
                location: "",
                currentJob: "",
                company: "",
                bio: "",
                degree_id: degree ? parseInt(degree.id) : null,
                batch: values.batch,
                birthday: null,
                date_registered: new Date().toISOString(),
                profileImage: "http://localhost:3000/engineer.png"
            });

            // Create USER_STATISTICS
            await api.post('/USER_STATISTICS', {
                user_id,
                date_registered: new Date().toISOString(),
                user_connections: 0,
                events_attended: 0,
                events_created: 0,
                bulletins_created: 0,
                comments_written: 0,
                achievements: 0,
                donated_amount: 0
            });

            toast.success("Account created successfully!", {
                description: "Welcome to the USJ-R SEA Alumni community.",
            });
            navigate('/login');
        } catch (error) {
            console.error("Registration error:", error);
            toast.error("Registration failed", {
                description: "An unexpected error occurred. Please try again."
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary rounded-full mb-4">
                    <User className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                <p className="text-gray-600">Join the USJ-R SEA Alumni community</p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                <Input
                                                    placeholder="John Doe"
                                                    className="pl-10 selection:bg-blue-500 selection:text-white"
                                                    {...field}
                                                />
                                            </div>
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
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                <Input
                                                    placeholder="alumni@example.com"
                                                    className="pl-10 selection:bg-blue-500 selection:text-white"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="degreeProgram"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Degree Program</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <div className="relative">
                                                    <School className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                    <SelectTrigger className="selection:bg-blue-500 selection:text-white pl-10">
                                                        <SelectValue placeholder="Select your degree program" />
                                                    </SelectTrigger>
                                                </div>
                                            </FormControl>
                                            <SelectContent>
                                                {DEGREES.map((degree) => (
                                                    <SelectItem key={degree.id} value={degree.name}>
                                                        {degree.name}
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
                                        <FormLabel>Batch Year</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <GraduationCap className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                <Input
                                                    type="number"
                                                    placeholder="YYYY"
                                                    className="pl-10 selection:bg-blue-500 selection:text-white"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Create a password"
                                                    className="pl-10 pr-10 selection:bg-blue-500 selection:text-white"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="h-5 w-5" />
                                                    ) : (
                                                        <Eye className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                <Input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    placeholder="Confirm your password"
                                                    className="pl-10 pr-10 selection:bg-blue-500 selection:text-white"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff className="h-5 w-5" />
                                                    ) : (
                                                        <Eye className="h-5 w-5" />
                                                    )}
                                                </button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="terms"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="font-normal text-gray-600">
                                                I agree to the{' '}
                                                <Link to="/terms" className="text-brand-primary hover:text-brand-primary-hover font-medium" target="_blank">
                                                    Terms of Service
                                                </Link>{' '}
                                                and{' '}
                                                <Link to="/privacy" className="text-brand-primary hover:text-brand-primary-hover font-medium" target="_blank">
                                                    Privacy Policy
                                                </Link>
                                            </FormLabel>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white"
                                disabled={form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Create Account
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Already have an account?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <Link
                                to="/login"
                                className="font-medium text-brand-primary hover:text-brand-primary-hover"
                            >
                                Sign in instead
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
