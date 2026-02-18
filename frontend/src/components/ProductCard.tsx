'use client';

import { useRouter } from 'next/navigation';
import { MapPin, DollarSign, Package } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    distance: number;
    image_urls?: string[];
    category?: string;
    pickup_location: {
        id: string;
        name: string;
        address: string;
        latitude: number;
        longitude: number;
    };
    seller: {
        id: string;
        name: string;
        avatar_url?: string;
    };
}

interface ProductCardProps {
    product: Product;
    onClick?: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
    const router = useRouter();

    const formatDistance = (distance: number) => {
        if (distance < 1) {
            return `${Math.round(distance * 1000)}m`;
        }
        return `${distance.toFixed(1)}km`;
    };

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            router.push(`/products/${product.id}`);
        }
    };

    return (
        <div
            onClick={handleClick}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group border border-gray-100 hover:border-primary-500"
        >
            {/* Image */}
            <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-50 overflow-hidden">
                {product.image_urls && product.image_urls.length > 0 ? (
                    <img
                        src={product.image_urls[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-primary-300" />
                    </div>
                )}
                {product.category && (
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-primary-700">
                        {product.category}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Title & Distance */}
                <div className="space-y-1">
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
                        {product.name}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-primary-600">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">距離 {formatDistance(product.distance)}</span>
                    </div>
                </div>

                {/* Description */}
                {product.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                        {product.description}
                    </p>
                )}

                {/* Location */}
                <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-700">
                        {product.pickup_location.name}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                        {product.pickup_location.address}
                    </p>
                </div>

                {/* Price & Seller */}
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1">
                        <DollarSign className="w-5 h-5 text-primary-600" />
                        <span className="text-2xl font-bold text-gray-900">
                            {Number(product.price).toFixed(2)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {product.seller.avatar_url ? (
                            <img
                                src={product.seller.avatar_url}
                                alt={product.seller.name}
                                className="w-8 h-8 rounded-full border-2 border-primary-100"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm">
                                {product.seller.name[0].toUpperCase()}
                            </div>
                        )}
                        <span className="text-xs text-gray-600 max-w-[80px] truncate">
                            {product.seller.name}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
