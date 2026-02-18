'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, MapIcon, List, Loader2, MapPin, Package } from 'lucide-react';
import dynamic from 'next/dynamic';
import { searchProducts } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

// Dynamic import for MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/MapView'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
    ),
});

export default function SearchPage() {
    const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
    const [searchTerm, setSearchTerm] = useState('');
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [radius, setRadius] = useState(5);
    const [selectedCategory, setSelectedCategory] = useState('');

    // Get user's location on mount
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
                    // Default to a fallback location (e.g., city center)
                    setUserLocation({ lat: 40.7128, lng: -74.0060 }); // New York as fallback
                }
            );
        }
    }, []);

    // Search products query
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
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary-500 p-2 rounded-xl shadow-lg">
                                <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                                Locobuy
                            </h1>
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('map')}
                                className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${viewMode === 'map'
                                    ? 'bg-primary-500 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <MapIcon className="w-4 h-4" />
                                <span className="hidden sm:inline">地圖</span>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${viewMode === 'list'
                                    ? 'bg-primary-500 text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <List className="w-4 h-4" />
                                <span className="hidden sm:inline">列表</span>
                            </button>
                        </div>
                    </div>

                    {/* Search & Filters */}
                    <div className="mt-4 space-y-3">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="搜尋商品..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
                            />
                        </div>

                        {/* Location Info */}
                        {userLocation && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2 px-1">
                                <MapPin className="w-4 h-4" />
                                <span>
                                    正在搜尋附近 <span className="font-mono font-medium text-gray-700">{userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
                                </span>
                                <button
                                    onClick={() => {
                                        const res = prompt('輸入座標 (緯度,經度):', `${userLocation.lat},${userLocation.lng}`);
                                        if (res) {
                                            const [lat, lng] = res.split(',').map(n => parseFloat(n.trim()));
                                            if (!isNaN(lat) && !isNaN(lng)) setUserLocation({ lat, lng });
                                        }
                                    }}
                                    className="text-xs text-primary-600 hover:text-primary-800 underline ml-2"
                                >
                                    (更改)
                                </button>
                            </div>
                        )}

                        {/* Filters */}
                        <div className="flex gap-3 overflow-x-auto pb-2">
                            <select
                                value={radius}
                                onChange={(e) => setRadius(Number(e.target.value))}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            >
                                <option value={1}>1 km</option>
                                <option value={5}>5 km</option>
                                <option value={10}>10 km</option>
                                <option value={25}>25 km</option>
                                <option value={50}>50 km</option>
                                <option value={100}>100 km</option>
                            </select>

                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            >
                                <option value="">所有分類</option>
                                <option value="電子產品">電子產品</option>
                                <option value="時尚">時尚</option>
                                <option value="食品">食品</option>
                                <option value="書籍">書籍</option>
                                <option value="玩具">玩具</option>
                                <option value="外部匯入">外部匯入</option>
                            </select>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {!userLocation ? (
                    <div className="flex flex-col items-center justify-center h-96 space-y-4">
                        <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
                        <p className="text-gray-600 font-medium">正在取得您的位置...</p>
                    </div>
                ) : isLoading ? (
                    <div className="flex flex-col items-center justify-center h-96 space-y-4">
                        <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
                        <p className="text-gray-600 font-medium">正在搜尋附近商品...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <p className="text-red-600 font-medium">載入商品時發生錯誤</p>
                    </div>
                ) : (
                    <>
                        {/* Results Count */}
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-800">
                                找到 {products.length} 個附近商品
                            </h2>
                        </div>

                        {/* View Content */}
                        {viewMode === 'map' ? (
                            <div className="grid lg:grid-cols-2 gap-6">
                                {/* Map */}
                                <div className="h-[600px] lg:sticky lg:top-24">
                                    <MapView
                                        userLocation={userLocation}
                                        products={products}
                                        onProductClick={(product) => {
                                            console.log('Product clicked:', product);
                                        }}
                                    />
                                </div>

                                {/* Products List */}
                                <div className="space-y-4 lg:h-[600px] lg:overflow-y-auto">
                                    {products.length === 0 ? (
                                        <div className="bg-white rounded-xl p-12 text-center">
                                            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                            <p className="text-gray-500 font-medium">找不到商品</p>
                                            <p className="text-gray-400 text-sm mt-2">
                                                請嘗試調整搜尋範圍或篩選條件
                                            </p>
                                        </div>
                                    ) : (
                                        products.map((product: any) => (
                                            <ProductCard key={product.id} product={product} />
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.length === 0 ? (
                                    <div className="col-span-full bg-white rounded-xl p-12 text-center">
                                        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                            <Search className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 font-medium">No products found</p>
                                        <p className="text-gray-400 text-sm mt-2">
                                            Try adjusting your search radius or filters
                                        </p>
                                    </div>
                                ) : (
                                    products.map((product: any) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
