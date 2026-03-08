'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Megaphone, MessageSquare, MapPin } from 'lucide-react';
import { getBlogPosts } from '@/lib/api';

export default function BlogPage() {
    const { data: posts, isLoading, error } = useQuery({
        queryKey: ['blog-posts'],
        queryFn: getBlogPosts,
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-white">
            <header className="border-b border-stone-200 bg-white/85 backdrop-blur-sm">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500">Locobuy Blog</p>
                        <h1 className="mt-2 text-3xl font-bold text-stone-900">店家開箱與買家心得</h1>
                    </div>
                    <Link href="/search" className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50">
                        返回搜尋
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                {isLoading && <p className="text-stone-600">載入文章中...</p>}
                {error && <p className="text-red-600">載入文章失敗</p>}

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {posts?.map((post: any) => (
                        <article key={post.id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                            {post.cover_image_url && (
                                <img src={post.cover_image_url} alt={post.title} className="h-48 w-full object-cover" />
                            )}
                            <div className="space-y-4 p-5">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
                                    {post.type === 'seller_promo' ? <Megaphone className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                                    <span>{post.type === 'seller_promo' ? '店家推廣' : '買家心得'}</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-stone-900">{post.title}</h2>
                                    <p className="mt-2 text-sm leading-6 text-stone-600">{post.excerpt}</p>
                                </div>
                                <div className="rounded-xl bg-stone-50 p-4 text-sm leading-6 text-stone-700">
                                    {post.content}
                                </div>
                                <div className="flex items-center justify-between border-t border-stone-100 pt-4 text-sm text-stone-500">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-4 w-4" />
                                        <span>{post.author?.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>North District</span>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </main>
        </div>
    );
}
