"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    Clock,
    ShoppingCart,
    Search
} from "lucide-react";

export default function CategoryPage({ params }) {
    const { name: catName } = use(params);
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch("/api/admin/products");
                if (res.ok) {
                    const allProducts = await res.json();
                    const filtered = allProducts.filter(p =>
                        (typeof p.category === 'string' ? p.category : p.category?.name) === decodeURIComponent(catName)
                    );
                    setProducts(filtered);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [catName]);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 md:h-24 flex items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => router.back()}
                            className="p-3 hover:bg-gray-50 rounded-2xl transition-all text-gray-500"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="text-xl md:text-2xl font-black tracking-tight capitalize">{decodeURIComponent(catName)}</h1>
                    </div>

                    <div className="hidden md:flex flex-1 max-w-md relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder={`Search in ${decodeURIComponent(catName)}...`}
                            className="w-full pl-12 pr-6 py-3 bg-gray-50 border border-gray-50 rounded-2xl focus:bg-white focus:ring-1 focus:ring-blue-600/10 focus:border-blue-600/50 outline-none font-medium transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative p-2 md:p-3 text-gray-700 hover:bg-gray-50 rounded-2xl transition-all">
                            <ShoppingCart size={24} />
                            <span className="absolute top-0 right-0 w-5 h-5 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">0</span>
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 md:px-8 py-10">
                <div className="flex items-center justify-between mb-8">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{filteredProducts.length} Products Found</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8">
                    {filteredProducts.map((product) => (
                        <div
                            key={product._id}
                            onClick={() => router.push(`/products/${product._id}`)}
                            className="bg-white rounded-[32px] border border-gray-100 p-2 md:p-3 hover:shadow-2xl hover:shadow-blue-100/30 transition-all flex flex-col group cursor-pointer"
                        >
                            <div className="relative aspect-square rounded-[24px] overflow-hidden bg-gray-50 mb-4">
                                <img
                                    src={product.images[0]}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    alt={product.name}
                                />
                                {product.mrpPrice > product.salePrice && (
                                    <div className="absolute top-3 right-3 bg-blue-600/90 text-white px-2 py-1 rounded-lg text-[9px] font-black shadow-lg">
                                        {Math.round(((product.mrpPrice - product.salePrice) / product.mrpPrice) * 100)}% OFF
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 flex flex-col px-1 pb-2">
                                <h3 className="text-[13px] md:text-sm font-black text-gray-900 line-clamp-2 leading-snug h-10 mb-3 group-hover:text-blue-600 transition-colors">
                                    {product.name}
                                </h3>

                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md">1 unit</span>
                                </div>

                                <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-50">
                                    <div className="flex flex-col">
                                        <span className="text-sm md:text-md font-black text-gray-900 tracking-tight">₹{product.salePrice}</span>
                                        {product.mrpPrice > product.salePrice && (
                                            <span className="text-[11px] text-gray-400 line-through font-medium">₹{product.mrpPrice}</span>
                                        )}
                                    </div>

                                    <button
                                        className="px-6 py-2 border-2 border-green-600 text-green-600 bg-white hover:bg-green-600 hover:text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm active:shadow-none"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="py-20 text-center">
                        <p className="text-gray-400 font-bold italic">No products found in this category.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
