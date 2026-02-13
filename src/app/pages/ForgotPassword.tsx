import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/app/components/ui/form';

const forgotPasswordSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid email address.",
    }),
});

export function ForgotPassword() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema) as any,
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = (values: z.infer<typeof forgotPasswordSchema>) => {
        // Mock API call
        console.log('Forgot password attempt:', values);

        setIsSubmitted(true);
        toast.success("Password reset link sent!");

        // Countdown timer
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
                        <p className="text-gray-600 mb-6">
                            We've sent a password reset link to <br />
                            <span className="font-semibold text-gray-900">{form.getValues().email}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                            Redirecting to homepage in {countdown} seconds...
                        </p>
                        <div className="mt-6">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => navigate('/')}
                            >
                                Return to Homepage Now
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1a5f3f]/10 rounded-full mb-4">
                    <Mail className="w-8 h-8 text-[#1a5f3f]" />
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
                                className="w-full bg-[#1a5f3f] hover:bg-[#2d7a4f] text-white"
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
