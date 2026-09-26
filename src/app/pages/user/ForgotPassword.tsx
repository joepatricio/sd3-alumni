
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/app/views/auth';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { api } from '@/app/views/api';

import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@components/ui/form';

const forgotPasswordSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
});

export function ForgotPassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const { isLoggedIn } = useAuth();

    useEffect(() => {
        if (isLoggedIn) {
            const from = location.state?.from || '/profile';
            navigate(from, { replace: true });
        }
    }, [isLoggedIn, navigate]);

    const form = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema) as any,
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
        try {
            const res = await api.post('/auth/check-email', { email: values.email });
            if (res.data.exists) {
                navigate('/reset-password', { state: { email: values.email } });
            } else {
                toast.error("This email is not registered.");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-primary/10 rounded-full mb-4">
                    <Mail className="w-8 h-8 text-brand-primary" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Forgot Password?</h1>
                <p className="text-gray-600">
                    No worries, we'll send you reset instructions.
                </p>
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
                                                    placeholder="Enter your email"
                                                    className="pl-10"
                                                    {...field}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
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
                                Send Reset Link
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-6">
                        <div className="mt-6 text-center">
                            <Link
                                to="/login"
                                className="flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to log in
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
