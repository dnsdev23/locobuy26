'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapIcon, List, Loader2, MapPin, Package, BookOpen } from 'lucide-react';
import dynamic from 'next/dynamic';
import { searchProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

const MapView = dynamic(() => import('@/components/MapView'), {
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-100">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
    ),
});

const categories = [
    'Electronics',
    'Books',
    'Home',
    'Sports',
    'Fashion',
    'Lifestyle',
    'Restaurant',
    'Cafe',
    'Beauty',
    '3C Repair',
];

export default function SearchPage() {
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    const [searchTerm, setSearchTerm] = useState('');
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [radius, setRadius] = useState(5);
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                    setUserLocation({ lat: 24.1637, lng: 120.6836 });
                }
            );
        }
    }, []);

    const { data, isLoading, error } = useQuery({
        queryKey: ['products', userLocation, radius, selectedCategory, searchTerm],
        queryFn: () =>
            searchProducts({
                latitude: userLocation!.lat,
                longitude: userLocation!.lng,
                radius,
                category: selectedCategory || undefined,
                search: searchTerm || undefined,
            }),
        enabled: !!userLocation,
    });

    const products = data?.products || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
            <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 shadow-sm backdrop-blur-md">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-primary-500 p-2 shadow-lg">
                                <MapPin className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-2xl font-bold text-transparent">Locobuy</h1>
                                <p className="text-sm text-gray-500">North District, Taichung demo</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link href="/blog" className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-primary-300 hover:text-primary-700">
                                <BookOpen className="h-4 w-4" />
                                <span>Blog</span>
                            </Link>
                            <div className="flex items-center gap-2 rounded-lg bg-gray-100 p-1">
                                <button
                                    onClick={() => setViewMode('map')}
                                    className={`flex items-center gap-2 rounded-md px-4 py-2 transition-all ${viewMode === 'map' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
                                >
                                    <MapIcon className="h-4 w-4" />
                                    <span className="hidden sm:inline">地圖</span>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`flex items-center gap-2 rounded-md px-4 py-2 transition-all ${viewMode === 'list' ? 'bg-primary-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-200'}`}
                                >
                                    <List className="h-4 w-4" />
                                    <span className="hidden sm:inline">列表</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="搜尋商品、服務、店家..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>

                        {userLocation && (
                            <div className="mb-2 flex items-center gap-2 px-1 text-sm text-gray-500">
                                <MapPin className="h-4 w-4" />
                                <span>
                                    正在搜尋附近 <span className="font-mono font-medium text-gray-700">{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
                                </span>
                                <button
                                    onClick={() => {
                                        const res = prompt('輸入座標 (緯度,經度):', `${userLocation.lat},${userLocation.lng}`);
                                        if (res) {
                                            const [lat, lng] = res.split(',').map((n) => parseFloat(n.trim()));
                                            if (!isNaN(lat) && !isNaN(lng)) setUserLocation({ lat, lng });
                                        }
                                    }}
                                    className="ml-2 text-xs text-primary-600 underline hover:text-primary-800"
                                >
                                    (更改)
                                </button>
                            </div>
                        )}

                        <div className="flex gap-3 overflow-x-auto pb-2">
                            <select value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                                <option value={1}>1 km</option>
                                <option value={3}>3 km</option>
                                <option value={5}>5 km</option>
                                <option value={10}>10 km</option>
                                <option value={25}>25 km</option>
                            </select>

                            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                                <option value="">所有分類</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {!userLocation ? (
                    <div className="flex h-96 flex-col items-center justify-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
                        <p className="font-medium text-gray-600">正在取得您的位置...</p>
                    </div>
                ) : isLoading ? (
                    <div className="flex h-96 flex-col items-center justify-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
                        <p className="font-medium text-gray-600">正在搜尋附近商品...</p>
                    </div>
                ) : error ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                        <p className="font-medium text-red-600">載入商品時發生錯誤</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-800">找到 {products.length} 個附近商品</h2>
                        </div>

                        {viewMode === 'map' ? (
                            <div className="grid gap-6 lg:grid-cols-2">
                                <div className="h-[600px] lg:sticky lg:top-24">
                                    <MapView userLocation={userLocation} products={products} onProductClick={(product) => console.log('Product clicked:', product)} />
                                </div>
                                <div className="space-y-4 lg:h-[600px] lg:overflow-y-auto">
                                    {products.length === 0 ? (
                                        <div className="rounded-xl bg-white p-12 text-center">
                                            <Package className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                                            <p className="font-medium text-gray-500">找不到商品</p>
                                            <p className="mt-2 text-sm text-gray-400">請嘗試調整搜尋範圍或篩選條件</p>
                                        </div>
                                    ) : (
                                        products.map((product: any) => <ProductCard key={product.id} product={product} />)
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {products.length === 0 ? (
                                    <div className="col-span-full rounded-xl bg-white p-12 text-center">
                                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                            <Search className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <p className="font-medium text-gray-500">No products found</p>
                                        <p className="mt-2 text-sm text-gray-400">Try adjusting your search radius or filters</p>
                                    </div>
                                ) : (
                                    products.map((product: any) => <ProductCard key={product.id} product={product} />)
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
