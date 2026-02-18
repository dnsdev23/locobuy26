'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { register as registerUser } from '@/lib/auth';
import { Loader2, Mail, Lock, User, Phone, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface RegisterForm {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    phone?: string;
    role: 'buyer' | 'seller' | 'local_store';
}

export default function RegisterPage() {
    const router = useRouter();
    const [error, setError] = useState('');

    const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({
        defaultValues: {
            role: 'buyer'
        }
    });

    const registerMutation = useMutation({
        mutationFn: registerUser,
        onSuccess: () => {
            // Redirect to login
            router.push('/login?registered=true');
        },
        onError: (error: any) => {
            setError(error.response?.data?.message || '註冊失敗，請重試。');
        },
    });

    const onSubmit = (data: RegisterForm) => {
        setError('');
        const { confirmPassword, ...registerData } = data;
        registerMutation.mutate(registerData);
    };

    const password = watch('password');

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-slate-50 flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl shadow-lg mb-4">
                        <ShoppingBag className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                        加入 Locobuy
                    </h1>
                    <p className="text-gray-600 mt-2">建立您的帳號以開始使用</p>
                </div>

                {/* Register Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                全名
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    {...register('name', {
                                        required: '請輸入全名',
                                        minLength: {
                                            value: 2,
                                            message: '全名長度至少需 2 個字元'
                                        }
                                    })}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                                    placeholder="John Doe"
                                />
                            </div>
                            {errors.name && (
                                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                            )}
                        </div>

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

                        {/* Phone (Optional) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                電話號碼 <span className="text-gray-400">(選填)</span>
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    {...register('phone')}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>
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

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                確認密碼
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    {...register('confirmPassword', {
                                        required: '請再次輸入密碼',
                                        validate: value => value === password || '密碼不符'
                                    })}
                                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                我想要
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                <label className="relative cursor-pointer">
                                    <input
                                        type="radio"
                                        {...register('role')}
                                        value="buyer"
                                        className="peer sr-only"
                                    />
                                    <div className="px-4 py-3 border-2 border-gray-200 rounded-lg text-center transition peer-checked:border-primary-500 peer-checked:bg-primary-50">
                                        <p className="text-sm font-medium">買東西</p>
                                    </div>
                                </label>
                                <label className="relative cursor-pointer">
                                    <input
                                        type="radio"
                                        {...register('role')}
                                        value="seller"
                                        className="peer sr-only"
                                    />
                                    <div className="px-4 py-3 border-2 border-gray-200 rounded-lg text-center transition peer-checked:border-primary-500 peer-checked:bg-primary-50">
                                        <p className="text-sm font-medium">賣東西</p>
                                    </div>
                                </label>
                                <label className="relative cursor-pointer">
                                    <input
                                        type="radio"
                                        {...register('role')}
                                        value="local_store"
                                        className="peer sr-only"
                                    />
                                    <div className="px-4 py-3 border-2 border-gray-200 rounded-lg text-center transition peer-checked:border-primary-500 peer-checked:bg-primary-50">
                                        <p className="text-sm font-medium">開店</p>
                                    </div>
                                </label>
                            </div>
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
                            disabled={registerMutation.isPending}
                            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {registerMutation.isPending ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    建立帳號中...
                                </>
                            ) : (
                                '建立帳號'
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            已經有帳號？{' '}
                            <Link href="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                                登入
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
