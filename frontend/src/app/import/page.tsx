'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Link, Save, Image as ImageIcon, CheckCircle, AlertCircle, MapPin, User, ChevronDown, Layers, FileText, ShoppingBag, CheckSquare, Square } from 'lucide-react';
import { parseProductUrl, createProduct, getPickupLocations, getSellers, batchImport, fetchShopProducts } from '@/lib/api';

export default function ImportPage() {
    const router = useRouter();
    console.log('ImportPage rendering');
    const [mode, setMode] = useState<'single' | 'bulk' | 'seller'>('single');

    // Single Import State
    const [url, setUrl] = useState('');
    const [parsedData, setParsedData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Bulk Import State
    const [bulkUrls, setBulkUrls] = useState('');
    const [bulkResults, setBulkResults] = useState<{ success: any[], failed: any[] } | null>(null);

    // Seller Import State
    const [sellerUrl, setSellerUrl] = useState('');
    const [sellerProducts, setSellerProducts] = useState<any[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [sellerLoading, setSellerLoading] = useState(false);

    // Fetch pickup locations
    const { data: locations } = useQuery({
        queryKey: ['pickup-locations'],
        queryFn: getPickupLocations,
    });

    // Fetch sellers
    const { data: sellers } = useQuery({
        queryKey: ['sellers'],
        queryFn: getSellers,
    });

    const handleParse = async () => {
        if (!url) return;
        setLoading(true);
        setError('');
        setParsedData(null);
        setSuccess(false);

        try {
            const data = await parseProductUrl(url);

            // Default Location (First available)
            if (locations && locations.length > 0) {
                data.pickup_location_id = locations[0].id;
            }

            // Seller ID logic: Use returned ID first, otherwise default to first available seller
            if (!data.seller_id && sellers && sellers.length > 0) {
                data.seller_id = sellers[0].id;
            }

            // Map original_url to external_link for backend compatibility
            data.external_link = data.original_url;

            setParsedData(data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || '解析網址失敗。請檢查連結並重試。');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!parsedData) return;
        setLoading(true);
        setError('');

        try {
            await createProduct(parsedData);
            setSuccess(true);
            setTimeout(() => {
                router.push('/search');
            }, 1500);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || '儲存商品失敗。');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkImport = async () => {
        if (!bulkUrls.trim()) return;
        setLoading(true);
        setBulkResults(null);

        try {
            const urls = bulkUrls.split('\n').filter(u => u.trim());
            const results = await batchImport(urls);
            setBulkResults(results);
        } catch (err: any) {
            setError(err.response?.data?.message || '批次匯入失敗。');
        } finally {
            setLoading(false);
        }
    };

    // Seller Import Functions
    const handleFetchSellerProducts = async () => {
        if (!sellerUrl) return;
        setSellerLoading(true);
        setError('');
        setSellerProducts([]);
        setSelectedProducts([]);

        try {
            const products = await fetchShopProducts(sellerUrl);
            setSellerProducts(products);
            // Auto-select all by default? No, let user choose.
        } catch (err: any) {
            setError(err.response?.data?.message || '無法抓取賣場商品。');
        } finally {
            setSellerLoading(false);
        }
    };

    const toggleProductSelection = (productUrl: string) => {
        if (selectedProducts.includes(productUrl)) {
            setSelectedProducts(selectedProducts.filter(u => u !== productUrl));
        } else {
            setSelectedProducts([...selectedProducts, productUrl]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedProducts.length === sellerProducts.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(sellerProducts.map(p => p.url));
        }
    };

    const handleImportSelected = async () => {
        if (selectedProducts.length === 0) return;
        setLoading(true); // Share loading state with bulk
        setBulkResults(null);

        // Use batch import logic
        try {
            const results = await batchImport(selectedProducts);
            setBulkResults(results);
            // Switch to bulk view to show results? OR show modal?
            // For now, let's just show results below
        } catch (err: any) {
            setError(err.response?.data?.message || '匯入失敗');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-8 py-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <h1 className="text-3xl font-bold flex items-center gap-3 relative z-10">
                            <Link className="w-8 h-8" />
                            匯入外部商品
                        </h1>
                        <p className="text-primary-100 mt-2 relative z-10 max-w-xl">
                            支援 Shopee、Yahoo 拍賣、露天拍賣。
                        </p>

                        {/* Tabs */}
                        <div className="flex flex-wrap gap-4 mt-6 relative z-10">
                            <button
                                onClick={() => setMode('single')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${mode === 'single' ? 'bg-white text-primary-900 shadow-sm' : 'bg-primary-700/50 text-white hover:bg-primary-700'}`}
                            >
                                <FileText className="w-4 h-4" /> 單筆匯入
                            </button>
                            <button
                                onClick={() => setMode('bulk')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${mode === 'bulk' ? 'bg-white text-primary-900 shadow-sm' : 'bg-primary-700/50 text-white hover:bg-primary-700'}`}
                            >
                                <Layers className="w-4 h-4" /> 批次匯入
                            </button>
                            <button
                                onClick={() => setMode('seller')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${mode === 'seller' ? 'bg-white text-primary-900 shadow-sm' : 'bg-primary-700/50 text-white hover:bg-primary-700'}`}
                            >
                                <ShoppingBag className="w-4 h-4" /> 賣場抓取
                            </button>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {mode === 'single' && (
                            <>
                                {/* URL Input */}
                                <div className="space-y-4">
                                    <label htmlFor="url" className="block text-sm font-semibold text-gray-700">
                                        商品網址
                                    </label>
                                    <div className="flex gap-3 shadow-sm rounded-xl overflow-hidden">
                                        <input
                                            type="url"
                                            id="url"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder="https://shopee.tw/product/..."
                                            className="flex-1 px-5 py-4 border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-gray-800"
                                        />
                                        <button
                                            onClick={handleParse}
                                            disabled={loading || !url}
                                            className="px-8 py-4 bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '抓取詳情'}
                                        </button>
                                    </div>
                                    {error && (
                                        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl text-sm border border-red-100 animate-in fade-in slide-in-from-top-2">
                                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                            {error}
                                        </div>
                                    )}
                                </div>

                                {/* Parsed Data Form (Single) */}
                                {parsedData && (
                                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 border-t border-gray-100 pt-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-bold text-gray-900">確認商品資訊</h2>
                                            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-500">
                                                來源: {parsedData.category}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                            <div className="md:col-span-4 space-y-4">
                                                <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden relative shadow-inner border border-gray-200 group">
                                                    {parsedData.image_url ? (
                                                        <img src={parsedData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                                            <ImageIcon className="w-12 h-12 mb-2" />
                                                            <span>找不到圖片</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="md:col-span-8 space-y-5">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">商品名稱</label>
                                                    <input
                                                        type="text"
                                                        value={parsedData.name}
                                                        onChange={(e) => setParsedData({ ...parsedData, name: e.target.value })}
                                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">價格</label>
                                                    <input
                                                        type="number"
                                                        value={parsedData.price}
                                                        onChange={(e) => setParsedData({ ...parsedData, price: Number(e.target.value) })}
                                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                                                    />
                                                </div>
                                                <div className="pt-4 flex justify-end">
                                                    <button
                                                        onClick={handleSave}
                                                        disabled={loading || success}
                                                        className={`px-8 py-4 rounded-xl font-bold text-white transition-all flex items-center gap-2.5 ${success ? 'bg-green-500' : 'bg-primary-600 hover:bg-primary-700'}`}
                                                    >
                                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : success ? '儲存成功' : '匯入商品'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {mode === 'bulk' && (
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="bulkUrls" className="block text-sm font-semibold text-gray-700 mb-2">
                                        批量網址 (每行一個)
                                    </label>
                                    <textarea
                                        id="bulkUrls"
                                        rows={10}
                                        value={bulkUrls}
                                        onChange={(e) => setBulkUrls(e.target.value)}
                                        placeholder={`https://shopee.tw/product/...\nhttps://shopee.tw/product/...`}
                                        className="w-full px-5 py-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none text-gray-800 font-mono text-sm leading-relaxed"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        onClick={handleBulkImport}
                                        disabled={loading || !bulkUrls.trim()}
                                        className="px-8 py-4 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : '開始批次匯入'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {mode === 'seller' && (
                            <div className="space-y-8">
                                {/* Seller Input */}
                                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 flex flex-col md:flex-row gap-4 items-end md:items-center">
                                    <div className="flex-1 w-full">
                                        <label htmlFor="sellerUrl" className="block text-sm font-semibold text-gray-700 mb-2">
                                            賣場網址
                                        </label>
                                        <input
                                            type="url"
                                            id="sellerUrl"
                                            value={sellerUrl}
                                            onChange={(e) => setSellerUrl(e.target.value)}
                                            placeholder="https://shopee.tw/shop/12345/search"
                                            className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={handleFetchSellerProducts}
                                        disabled={sellerLoading || !sellerUrl}
                                        className="w-full md:w-auto px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
                                    >
                                        {sellerLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : '抓取全部商品'}
                                    </button>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl text-sm border border-red-100">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        {error}
                                    </div>
                                )}

                                {/* Product Grid */}
                                {sellerProducts.length > 0 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8">
                                        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 sticky top-0 z-20 shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <button
                                                    onClick={toggleSelectAll}
                                                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-primary-600"
                                                >
                                                    {selectedProducts.length === sellerProducts.length ? (
                                                        <CheckSquare className="w-5 h-5 text-primary-600" />
                                                    ) : (
                                                        <Square className="w-5 h-5 text-gray-400" />
                                                    )}
                                                    全選 ({sellerProducts.length})
                                                </button>
                                                <span className="text-sm text-gray-500">
                                                    已選擇 {selectedProducts.length} 項
                                                </span>
                                            </div>

                                            <button
                                                onClick={handleImportSelected}
                                                disabled={selectedProducts.length === 0 || loading}
                                                className="px-6 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                            >
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '匯入選取項目'}
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {sellerProducts.map((p, i) => (
                                                <div
                                                    key={i}
                                                    className={`
                                                        group relative bg-white border rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-md
                                                        ${selectedProducts.includes(p.url) ? 'ring-2 ring-primary-500 border-transparent' : 'border-gray-200'}
                                                    `}
                                                    onClick={() => toggleProductSelection(p.url)}
                                                >
                                                    {/* Selection indicator */}
                                                    <div className="absolute top-2 right-2 z-10">
                                                        {selectedProducts.includes(p.url) ? (
                                                            <div className="bg-primary-600 text-white rounded-full p-1 shadow-sm">
                                                                <CheckSquare className="w-4 h-4" />
                                                            </div>
                                                        ) : (
                                                            <div className="bg-white/80 backdrop-blur text-gray-400 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Square className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="aspect-square bg-gray-50 relative">
                                                        {p.image ? (
                                                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="flex items-center justify-center h-full text-gray-300">
                                                                <ImageIcon className="w-8 h-8" />
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                                                    </div>

                                                    <div className="p-3">
                                                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[2.5em]" title={p.name}>
                                                            {p.name}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 mt-1 truncate font-mono">
                                                            {p.url.split('?')[0]}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Shared Bulk/Seller Results (Bottom) */}
                        {bulkResults && (mode === 'bulk' || mode === 'seller') && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 border-t border-gray-100 pt-8">
                                <h3 className="text-lg font-bold text-gray-900">匯入結果</h3>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <div>
                                            <p className="text-sm font-medium text-green-900">成功匯入</p>
                                            <p className="text-2xl font-bold text-green-700">{bulkResults.success.length}</p>
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                        <div>
                                            <p className="text-sm font-medium text-red-900">失敗</p>
                                            <p className="text-2xl font-bold text-red-700">{bulkResults.failed.length}</p>
                                        </div>
                                    </div>
                                </div>

                                {bulkResults.failed.length > 0 && (
                                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 text-sm font-medium text-gray-700">
                                            錯誤詳情
                                        </div>
                                        <div className="max-h-60 overflow-y-auto p-4 space-y-2">
                                            {bulkResults.failed.map((fail, i) => (
                                                <div key={i} className="text-sm text-red-600 flex gap-2">
                                                    <span className="font-mono text-gray-400 shrink-0">{i + 1}.</span>
                                                    <span className="truncate flex-1">{fail.url}</span>
                                                    <span className="font-medium">{fail.error}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
