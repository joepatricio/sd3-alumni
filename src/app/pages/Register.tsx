import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Checkbox } from '@/app/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/app/components/ui/form';

const registerSchema = z.object({
    fullName: z.string().min(2, {
        message: "Full name must be at least 2 characters.",
    }),
    alumniId: z.string().min(1, {
        message: "Alumni ID is required.",
    }),
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(6, {
        message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string(),
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
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema) as any,
        defaultValues: {
            fullName: "",
            alumniId: "",
            email: "",
            password: "",
            confirmPassword: "",
            terms: false,
        },
    });

    const onSubmit = (values: z.infer<typeof registerSchema>) => {
        // Mock registration logic
        console.log('Registration attempt:', values);

        // Simulate network delay
        setTimeout(() => {
            toast.success("Account created successfully!", {
                description: "Welcome to the USJR Alumni community.",
            });
            navigate('/login');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1a5f3f] rounded-full mb-4">
                    <User className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                <p className="text-gray-600">Join the USJR Alumni community</p>
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
                                                    className="pl-10"
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
                                name="alumniId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Alumni ID</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                <Input
                                                    placeholder="Enter your Alumni ID"
                                                    className="pl-10"
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
                                                    className="pl-10"
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
                                                    className="pl-10 pr-10"
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
                                                    className="pl-10 pr-10"
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
                                                className="data-[state=checked]:bg-[#1a5f3f] data-[state=checked]:border-[#1a5f3f]"
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="font-normal text-gray-600">
                                                I agree to the{' '}
                                                <a href="#" className="text-[#1a5f3f] hover:text-[#2d7a4f] font-medium">
                                                    Terms of Service
                                                </a>{' '}
                                                and{' '}
                                                <a href="#" className="text-[#1a5f3f] hover:text-[#2d7a4f] font-medium">
                                                    Privacy Policy
                                                </a>
                                            </FormLabel>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full bg-[#1a5f3f] hover:bg-[#2d7a4f] text-white"
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
                                className="font-medium text-[#1a5f3f] hover:text-[#2d7a4f]"
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
