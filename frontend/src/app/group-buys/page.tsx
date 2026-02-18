'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Clock, Target, TrendingUp, CheckCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface GroupBuy {
    id: string;
    title: string;
    description: string;
    target_quantity: number;
    current_quantity: number;
    price_per_unit: number;
    start_time: string;
    end_time: string;
    status: 'active' | 'completed' | 'expired';
    product: {
        id: string;
        name: string;
        image_urls?: string[];
        pickup_location: {
            name: string;
            address: string;
        };
    };
    organizer: {
        id: string;
        name: string;
    };
}

const getGroupBuys = async (): Promise<GroupBuy[]> => {
    const response = await apiClient.get('/group-buys/active');
    return response.data;
};

const joinGroupBuy = async (data: { group_buy_id: string; user_id: string; quantity: number }) => {
    const response = await apiClient.post('/group-buys/join', data);
    return response.data;
};

export default function GroupBuysPage() {
    const queryClient = useQueryClient();
    const [selectedGroupBuy, setSelectedGroupBuy] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);

    const { data: groupBuys, isLoading } = useQuery({
        queryKey: ['groupBuys'],
        queryFn: getGroupBuys,
        refetchInterval: 5000, // Auto-refresh every 5 seconds
    });

    const joinMutation = useMutation({
        mutationFn: joinGroupBuy,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['groupBuys'] });
            setSelectedGroupBuy(null);
            setQuantity(1);

            // Show success notification
            if (data.message.includes('target has been met')) {
                alert('🎉 ' + data.message);
            } else {
                alert('✅ ' + data.message);
            }
        },
        onError: (error: any) => {
            alert('Error: ' + (error.response?.data?.message || 'Failed to join group buy'));
        },
    });

    const handleJoin = (groupBuyId: string) => {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            alert('Please login first');
            return;
        }

        joinMutation.mutate({
            group_buy_id: groupBuyId,
            user_id: userId,
            quantity,
        });
    };

    const calculateProgress = (current: number, target: number) => {
        return Math.min((current / target) * 100, 100);
    };

    const calculateTimeLeft = (endTime: string) => {
        const now = new Date();
        const end = new Date(endTime);
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) return 'Expired';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
        return `${hours} hour${hours > 1 ? 's' : ''} left`;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-xl">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                Group Buys
                            </h1>
                            <p className="text-sm text-gray-600">Join others to get better prices</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {isLoading ? (
                    <div className="flex items-center justify-center h-96">
                        <Loader2 className="w-12 h-12 animate-spin text-green-500" />
                    </div>
                ) : !groupBuys || groupBuys.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 font-medium">No active group buys at the moment</p>
                        <p className="text-gray-400 text-sm mt-2">Check back later for new deals!</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupBuys.map((groupBuy) => {
                            const progress = calculateProgress(groupBuy.current_quantity, groupBuy.target_quantity);
                            const isCompleted = groupBuy.status === 'completed';
                            const timeLeft = calculateTimeLeft(groupBuy.end_time);

                            return (
                                <div
                                    key={groupBuy.id}
                                    className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow"
                                >
                                    {/* Product Image */}
                                    <div className="relative h-48 bg-gradient-to-br from-green-100 to-emerald-50">
                                        {groupBuy.product.image_urls && groupBuy.product.image_urls.length > 0 ? (
                                            <img
                                                src={groupBuy.product.image_urls[0]}
                                                alt={groupBuy.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Target className="w-16 h-16 text-green-300" />
                                            </div>
                                        )}
                                        {isCompleted && (
                                            <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm font-semibold shadow-lg">
                                                <CheckCircle className="w-4 h-4" />
                                                Completed
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-6 space-y-4">
                                        {/* Title & Price */}
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                                                {groupBuy.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                                {groupBuy.description}
                                            </p>
                                            <div className="flex items-baseline gap-2 mt-2">
                                                <span className="text-3xl font-bold text-green-600">
                                                    ${groupBuy.price_per_unit}
                                                </span>
                                                <span className="text-sm text-gray-500">per unit</span>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">
                                                    Progress
                                                </span>
                                                <span className="text-sm font-bold text-green-600">
                                                    {groupBuy.current_quantity} / {groupBuy.target_quantity}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">
                                                {groupBuy.target_quantity - groupBuy.current_quantity} spots remaining
                                            </p>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Clock className="w-4 h-4" />
                                                <span>{timeLeft}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Users className="w-4 h-4" />
                                                <span>{groupBuy.current_quantity} joined</span>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        {isCompleted ? (
                                            <button
                                                disabled
                                                className="w-full bg-gray-100 text-gray-400 font-semibold py-3 px-4 rounded-xl cursor-not-allowed"
                                            >
                                                Target Reached
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => setSelectedGroupBuy(groupBuy.id)}
                                                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                            >
                                                <TrendingUp className="w-5 h-5" />
                                                Join Group Buy
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Join Modal */}
                {selectedGroupBuy && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-slide-up">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Join Group Buy</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setSelectedGroupBuy(null)}
                                        className="flex-1 px-6 py-3 border-2 border-gray-300 hover:border-gray-400 rounded-lg font-semibold text-gray-700 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleJoin(selectedGroupBuy)}
                                        disabled={joinMutation.isPending}
                                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {joinMutation.isPending ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Joining...
                                            </>
                                        ) : (
                                            'Confirm'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
