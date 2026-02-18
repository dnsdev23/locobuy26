'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { login } from '@/lib/auth';
import { Loader2, Mail, Lock, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface LoginForm {
    email: string;
    password: string;
}

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

    const loginMutation = useMutation({
        mutationFn: login,
        onSuccess: (data) => {
            // Store user info
            localStorage.setItem('user_id', data.user.id);
            localStorage.setItem('user_name', data.user.name);
            localStorage.setItem('user_role', data.user.role);

            // Redirect to search page
            router.push('/search');
        },
        onError: (error: any) => {
            setError(error.response?.data?.message || '登入失敗，請重試。');
        },
    });

    const onSubmit = (data: LoginForm) => {
        setError('');
        loginMutation.mutate(data);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-slate-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl shadow-lg mb-4">
                        <ShoppingBag className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                        歡迎來到 Locobuy
                    </h1>
                    <p className="text-gray-600 mt-2">登入以探索在地商品</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                電子郵件
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    {...register('email', {
                                        required: '請輸入電子郵件',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: '無效的電子郵件格式'
                                        }
                                    })}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                                    placeholder="you@example.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                密碼
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    {...register('password', {
                                        required: '請輸入密碼',
                                        minLength: {
                                            value: 6,
                                            message: '密碼長度至少需 6 個字元'
                                        }
                                    })}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loginMutation.isPending}
                            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loginMutation.isPending ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    登入中...
                                </>
                            ) : (
                                '登入'
                            )}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            還沒有帳號？{' '}
                            <Link href="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
                                註冊
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Demo Credentials */}
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">
                        Demo: test@example.com / password123
                    </p>
                </div>
            </div>
        </div>
    );
}
