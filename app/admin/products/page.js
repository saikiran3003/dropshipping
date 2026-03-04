"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Package,
    Plus,
    Trash2,
    Pencil,
    ArrowLeft,
    Upload,
    X,
    ImageIcon,
} from "lucide-react";
import Swal from "sweetalert2";

export default function ProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        mrpPrice: "",
        salePrice: "",
        images: []
    });
    const formRef = useRef(null);

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
    }, []);

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, reader.result]
                }));
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const url = "/api/admin/products";
        const method = isEditMode ? "PUT" : "POST";
        const body = isEditMode ? { ...formData, id: editingId } : formData;

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                Swal.fire({
                    title: "Success!",
                    text: isEditMode ? "Product updated" : "Product added",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });
                setFormData({ name: "", description: "", mrpPrice: "", salePrice: "", images: [] });
                setIsEditMode(false);
                setEditingId(null);
                fetchProducts();
            } else {
                const err = await res.json();
                Swal.fire("Error", err.message || "Operation failed", "error");
            }
        } catch (error) {
            Swal.fire("Error", "An unexpected error occurred", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product) => {
        setFormData({
            name: product.name,
            description: product.description,
            mrpPrice: product.mrpPrice,
            salePrice: product.salePrice,
            images: product.images || []
        });
        setIsEditMode(true);
        setEditingId(product._id);
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#EF4444",
            confirmButtonText: "Yes, delete it!"
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
                if (res.ok) {
                    Swal.fire("Deleted!", "Product has been deleted.", "success");
                    fetchProducts();
                }
            } catch (error) {
                Swal.fire("Error", "Deletion failed", "error");
            }
        }
    };

    return (
        <div className="p-4 md:p-10 space-y-10 animate-in fade-in duration-700 bg-gray-50/50 min-h-screen font-sans">
            {/* Header */}
            <div className="flex items-center gap-5">
                <button
                    onClick={() => router.push('/admin/dashboard')}
                    className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all active:scale-95 group shadow-sm"
                >
                    <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">Manage Products</h1>
                    <p className="text-sm text-gray-500 font-medium">Control your inventory and pricing strategy.</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-12">
                {/* Add/Edit Product Form */}
                <div ref={formRef} className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 md:p-12 max-w-3xl">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                            <Plus size={24} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                            {isEditMode ? "Edit Product" : "Add Product"}
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="md:col-span-2 space-y-2 text-left">
                                <label className="text-[10px] uppercase font-black ml-2 text-gray-400 tracking-widest">Product Name</label>
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500/10 rounded-[24px] outline-none font-black text-sm text-gray-900 transition-all focus:bg-white shadow-sm"
                                    placeholder="e.g. Premium Wireless Headphones"
                                />
                            </div>

                            <div className="space-y-2 text-left">
                                <label className="text-[10px] uppercase font-black ml-2 text-gray-400 tracking-widest">MRP Price (₹)</label>
                                <input
                                    required
                                    type="number"
                                    value={formData.mrpPrice}
                                    onChange={e => setFormData({ ...formData, mrpPrice: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500/10 rounded-[24px] outline-none font-black text-sm text-gray-900 transition-all focus:bg-white shadow-sm"
                                    placeholder="0"
                                />
                            </div>

                            <div className="space-y-2 text-left">
                                <label className="text-[10px] uppercase font-black ml-2 text-gray-400 tracking-widest">Sale Price (₹)</label>
                                <input
                                    required
                                    type="number"
                                    value={formData.salePrice}
                                    onChange={e => setFormData({ ...formData, salePrice: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500/10 rounded-[24px] outline-none font-black text-sm text-gray-900 transition-all focus:bg-white shadow-sm"
                                    placeholder="0"
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2 text-left">
                                <label className="text-[10px] uppercase font-black ml-2 text-gray-400 tracking-widest">Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500/10 rounded-[24px] outline-none font-black text-sm text-gray-900 transition-all focus:bg-white shadow-sm resize-none"
                                    placeholder="Describe the product features and benefits..."
                                />
                            </div>

                            <div className="md:col-span-2 space-y-4 text-left">
                                <label className="text-[10px] uppercase font-black ml-2 text-gray-400 tracking-widest block">Product Images</label>
                                <div className="flex flex-wrap gap-4">
                                    {formData.images.map((img, idx) => (
                                        <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-100 group shadow-sm bg-white">
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 p-1.5 bg-white/90 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-all cursor-pointer bg-white group">
                                        <Plus size={24} className="group-hover:scale-110 transition-transform" />
                                        <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-5 bg-green-600 text-white font-black rounded-[24px] shadow-lg shadow-green-100 uppercase tracking-widest text-sm hover:bg-green-700 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {isEditMode ? "Update Product" : "Save Product"}
                            </button>
                            {isEditMode && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditMode(false);
                                        setEditingId(null);
                                        setFormData({ name: "", description: "", mrpPrice: "", salePrice: "", images: [] });
                                    }}
                                    className="px-8 py-5 bg-gray-100 text-gray-500 font-black rounded-[24px] uppercase tracking-widest text-sm hover:bg-gray-200 transition-all active:scale-[0.98]"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Products List Grid */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Inventory Catalogue</h2>
                        <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                            {products.length} Products
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {loading && products.length === 0 ? (
                            <div className="col-span-full py-20 text-center animate-pulse text-gray-400 font-bold">Loading your inventory...</div>
                        ) : products.length === 0 ? (
                            <div className="col-span-full py-20 text-center bg-white rounded-[40px] border border-dashed border-gray-200">
                                <ImageIcon size={48} className="mx-auto text-gray-200 mb-4" />
                                <p className="text-gray-400 font-bold">No products found. Start adding some!</p>
                            </div>
                        ) : (
                            products.map((product) => (
                                <div key={product._id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer relative">
                                    <Link href={`/admin/products/${product._id}`} className="relative h-56 bg-gray-50 overflow-hidden block">
                                        {product.images && product.images.length > 0 ? (
                                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-200"><ImageIcon size={48} /></div>
                                        )}
                                    </Link>
                                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0 duration-300 z-10">
                                        <button
                                            onClick={(e) => { e.preventDefault(); handleEdit(product); }}
                                            className="p-3 bg-white/95 text-orange-500 rounded-2xl shadow-lg hover:bg-orange-50 transition-colors"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.preventDefault(); handleDelete(product._id); }}
                                            className="p-3 bg-white/95 text-red-500 rounded-2xl shadow-lg hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="mb-4">
                                            <h3 className="text-lg font-black text-gray-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{product.name}</h3>
                                            <p className="text-xs text-gray-400 font-bold line-clamp-2 leading-relaxed">{product.description}</p>
                                        </div>
                                        <div className="mt-auto flex items-end justify-between pt-4 border-t border-gray-50">
                                            <div>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Selling for</p>
                                                <p className="text-2xl font-black text-blue-600 tracking-tight">₹{product.salePrice.toLocaleString()}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1 line-through">₹{product.mrpPrice.toLocaleString()}</p>
                                                <p className="text-[10px] text-green-500 font-black uppercase tracking-widest">
                                                    {Math.round(((product.mrpPrice - product.salePrice) / product.mrpPrice) * 100)}% OFF
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
