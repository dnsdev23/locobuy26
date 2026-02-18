'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getProduct } from '@/lib/api';
import { Loader2, MapPin, DollarSign, Package, MessageCircle, ArrowLeft, Store } from 'lucide-react';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

export default function ProductDetailPage() {
    const params = useParams();
    const router = useRouter();
    const productId = params.id as string;

    const { data: product, isLoading, error } = useQuery({
        queryKey: ['product', productId],
        queryFn: () => getProduct(productId),
        enabled: !!productId,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">找不到商品</p>
                </div>
            </div>
        );
    }

    const userLocation = product.pickup_location
        ? { lat: product.pickup_location.latitude, lng: product.pickup_location.longitude }
        : { lat: 0, lng: 0 };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">返回搜尋</span>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column - Images & Details */}
                    <div className="space-y-6">
                        {/* Product Image */}
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                            <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-50">
                                {product.image_urls && product.image_urls.length > 0 ? (
                                    <img
                                        src={product.image_urls[0]}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-24 h-24 text-primary-300" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        {product.name}
                                    </h1>
                                    {product.category && (
                                        <span className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                                            {product.category}
                                        </span>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 text-primary-600">
                                        <DollarSign className="w-8 h-8" />
                                        <span className="text-4xl font-bold">{product.price}</span>
                                    </div>
                                </div>
                            </div>

                            {product.description && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <h3 className="font-semibold text-gray-900 mb-2">商品描述</h3>
                                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                                </div>
                            )}

                            {/* Seller Info */}
                            {product.seller && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <h3 className="font-semibold text-gray-900 mb-3">賣家</h3>
                                    <div className="flex items-center gap-3">
                                        {product.seller.avatar_url ? (
                                            <img
                                                src={product.seller.avatar_url}
                                                alt={product.seller.name}
                                                className="w-12 h-12 rounded-full border-2 border-primary-100"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                                                {product.seller.name[0].toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-gray-900">{product.seller.name}</p>
                                            <p className="text-sm text-gray-500">已驗證賣家</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="mt-8 flex gap-3">
                                <button className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                                    <MessageCircle className="w-5 h-5" />
                                    聯絡賣家
                                </button>
                                <button className="px-6 py-4 border-2 border-primary-500 text-primary-600 hover:bg-primary-50 rounded-xl font-semibold transition">
                                    分享
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Pickup Location */}
                    <div className="space-y-6">
                        {/* Pickup Location Card */}
                        {product.pickup_location && (
                            <div className="bg-white rounded-2xl shadow-lg p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                        <Store className="w-6 h-6 text-primary-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">取貨地點</h2>
                                        <p className="text-sm text-gray-500">您可以在此取貨</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-lg">
                                            {product.pickup_location.name}
                                        </h3>
                                        <div className="flex items-start gap-2 mt-2 text-gray-600">
                                            <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                            <p>{product.pickup_location.address}</p>
                                        </div>
                                    </div>

                                    {product.distance !== undefined && (
                                        <div className="bg-primary-50 rounded-lg p-4">
                                            <p className="text-sm text-primary-700 font-medium">
                                                📍 距離您 {product.distance < 1
                                                    ? `${Math.round(product.distance * 1000)}m`
                                                    : `${product.distance.toFixed(1)}km`}
                                            </p>
                                        </div>
                                    )}

                                    {product.pickup_location.operating_hours && (
                                        <div className="pt-4 border-t border-gray-100">
                                            <h4 className="font-medium text-gray-900 mb-2">營業時間</h4>
                                            <p className="text-sm text-gray-600">週一至週五: 09:00 - 18:00</p>
                                            <p className="text-sm text-gray-600">週六至週日: 10:00 - 16:00</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Map */}
                        {product.pickup_location && (
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                <div className="h-96">
                                    <MapView
                                        userLocation={userLocation}
                                        products={[product]}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Stock Info */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">庫存狀況</p>
                                    <p className="text-2xl font-bold text-gray-900">{product.stock || '有現貨'}</p>
                                </div>
                                {product.is_available ? (
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
