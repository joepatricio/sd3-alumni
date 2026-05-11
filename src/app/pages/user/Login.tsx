import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { api } from '@/app/views/api';
import bcrypt from 'bcryptjs';
import { useAuth } from '@/app/views/auth';

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

const loginSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
    password: z.string().min(1, {
        message: "Password is required.",
    }),
    rememberMe: z.boolean().default(false),
});

export function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { isLoggedIn, setSession } = useAuth();

    useEffect(() => {
        if (isLoggedIn) {
            const from = location.state?.from || '/profile';
            navigate(from, { replace: true });
        }
    }, [isLoggedIn, navigate]);

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema) as any,
        defaultValues: {
            email: "",
            password: "",
            rememberMe: false,
        },
    });

    const onSubmit = async (values: z.infer<typeof loginSchema>) => {
        try {
            const response = await api.get(`/userAuths?email=${values.email}`);
            const users = response.data;

            if (users.length === 0) {
                toast.error("Login failed", { description: "Invalid email or password." });
                return;
            }

            const user = users[0];
            const isValidPassword = bcrypt.compareSync(values.password, user.passwordHash);

            if (!isValidPassword) {
                toast.error("Login failed", { description: "Invalid email or password." });
                return;
            }

            // Update last_login
            await api.patch(`/userAuths/${user.id}`, {
                last_login: new Date().toISOString()
            });

            setSession({ userId: user.userId, email: user.email }, values.rememberMe);

            toast.success("Welcome back!", {
                description: "You have successfully signed in.",
            });
            const from = location.state?.from || '/profile';
            navigate(from, { replace: true });
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Login failed", { description: "An unexpected error occurred." });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary rounded-full mb-4">
                    <User className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                <p className="text-gray-600">Sign in to your USJ-R SEA Alumni account</p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter your password"
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

                            <div className="flex items-center justify-between">
                                <FormField
                                    control={form.control}
                                    name="rememberMe"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    className="data-[state=checked]:bg-brand-primary data-[state=checked]:border-brand-primary"
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal text-gray-600">
                                                Remember me
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />

                                <div className="text-sm">
                                    <Link to="/forgot-password" className="font-medium text-brand-primary hover:text-brand-primary-hover">
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white"
                                disabled={form.formState.isSubmitting}
                            >
                                {form.formState.isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Sign In
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
                                    New to USJ-R SEA Alumni?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <Link
                                to="/register"
                                className="font-medium text-brand-primary hover:text-brand-primary-hover"
                            >
                                Create an account
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
