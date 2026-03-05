"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ImageIcon,
    Search,
    ChevronDown,
    ArrowLeft,
} from "lucide-react";
import Swal from "sweetalert2";

export default function DropshipperProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [categories, setCategories] = useState(["All"]);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            if (res.ok) {
                const data = await res.json();
                const catNames = data.map(c => c.name);
                setCategories(["All", ...catNames, "Uncategorized"]);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/admin/products");
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    return (
        <div className="p-4 md:p-10 space-y-10 animate-in fade-in duration-700 bg-gray-50/50 min-h-screen font-sans">
            {/* Header Section */}
            <div className="flex items-center gap-5">
                <button
                    onClick={() => router.push('/dropshipper/products')}
                    className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all active:scale-95 group shadow-sm"
                >
                    <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">Product Catalogue</h1>
                    <p className="text-sm text-gray-500 font-medium">Browse our inventory and explore pricing.</p>
                </div>
            </div>

            {/* Products List Grid */}
            <div className="bg-white rounded-3xl md:rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/20">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 flex-1">
                        <div className="relative w-full md:w-72 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-xs md:text-sm placeholder:font-medium shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="relative w-full md:w-64 group">
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full pl-6 pr-10 py-3 bg-white border border-gray-200 rounded-xl md:rounded-2xl appearance-none focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-xs md:text-sm cursor-pointer shadow-sm"
                            >
                                <optgroup label="Filters">
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 self-end md:self-auto">
                        <h2 className="hidden md:block text-xl font-black text-gray-900 tracking-tight">Catalogue</h2>
                        <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                            {products.length} Items
                        </span>
                    </div>
                </div>

                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50/30">
                                <th className="px-6 md:px-8 py-4 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                                <th className="px-6 md:px-8 py-4 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Image</th>
                                <th className="px-6 md:px-8 py-4 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Product Details</th>
                                <th className="px-6 md:px-8 py-4 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Pricing (₹)</th>
                                <th className="px-6 md:px-8 py-4 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Commission (₹)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading && products.length === 0 ? (
                                <tr><td colSpan="5" className="px-8 py-20 text-center animate-pulse text-gray-400 font-bold italic">Loading inventory...</td></tr>
                            ) : products.filter(p => {
                                const searchLower = searchQuery.toLowerCase();
                                const matchesSearch = p.name.toLowerCase().includes(searchLower) ||
                                    (p.description && p.description.toLowerCase().includes(searchLower));
                                const matchesCategory = selectedCategory === "All" ||
                                    (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase()) ||
                                    ((!p.category || p.category.toLowerCase() === "uncategorized") && p.name.toLowerCase().includes(selectedCategory.toLowerCase()));
                                return matchesSearch && matchesCategory;
                            }).length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <ImageIcon size={40} className="mx-auto text-gray-200 mb-3" />
                                        <p className="text-gray-400 font-bold italic">No matching products found.</p>
                                    </td>
                                </tr>
                            ) : (
                                products.filter(p => {
                                    const searchLower = searchQuery.toLowerCase();
                                    const matchesSearch = p.name.toLowerCase().includes(searchLower) ||
                                        (p.description && p.description.toLowerCase().includes(searchLower));
                                    const matchesCategory = selectedCategory === "All" ||
                                        (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase()) ||
                                        ((!p.category || p.category.toLowerCase() === "uncategorized") && p.name.toLowerCase().includes(selectedCategory.toLowerCase()));
                                    return matchesSearch && matchesCategory;
                                }).map((product, index) => (
                                    <tr key={product._id} className="hover:bg-gray-50/50 transition-all font-bold group">
                                        <td className="px-8 py-6 text-xs text-gray-400 font-black">#{index + 1}</td>
                                        <td className="px-8 py-6">
                                            <Link href={`/dropshipper/products/${product._id}`} className="w-14 h-14 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center block group/img">
                                                {product.images && product.images.length > 0 ? (
                                                    <img src={product.images[0]} alt="" className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500" />
                                                ) : (
                                                    <ImageIcon size={24} className="text-gray-200" />
                                                )}
                                            </Link>
                                        </td>
                                        <td className="px-8 py-6">
                                            <Link href={`/dropshipper/products/${product._id}`} className="max-w-xs block group/text">
                                                <p className="text-sm text-gray-900 group-hover/text:text-blue-600 transition-colors line-clamp-1">{product.name}</p>
                                                <p className="text-[10px] text-gray-400 mt-1.5 line-clamp-1 font-medium">{product.description}</p>
                                            </Link>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex flex-col items-end">
                                                <p className="text-sm text-blue-600 font-black">₹{product.salePrice.toLocaleString()}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-[9px] text-gray-400 line-through font-bold">₹{product.mrpPrice.toLocaleString()}</p>
                                                    <p className="text-[9px] text-green-500 font-black">
                                                        {Math.round(((product.mrpPrice - product.salePrice) / product.mrpPrice) * 100)}% OFF
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex flex-col items-end">
                                                <p className="text-sm text-green-600 font-black">
                                                    ₹{((product.salePrice * (product.commissionPercentage || 20)) / 100).toLocaleString()}
                                                </p>
                                                <p className="text-[9px] text-gray-400 font-bold">
                                                    ({product.commissionPercentage || 20}%)
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
