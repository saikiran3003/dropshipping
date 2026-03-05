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
    Search,
    ChevronDown,
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
        images: [],
        bulkPricing: [],
        category: "Uncategorized"
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [categories, setCategories] = useState(["All", "Uncategorized"]);
    const [newTier, setNewTier] = useState({ packOf: "", price: "" });
    const [bulkTierEditIndex, setBulkTierEditIndex] = useState(null);
    const formRef = useRef(null);

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

    const addBulkTier = () => {
        if (!newTier.packOf || !newTier.price) return;

        setFormData(prev => {
            const updatedBulk = [...prev.bulkPricing];
            if (bulkTierEditIndex !== null) {
                // Update existing
                updatedBulk[bulkTierEditIndex] = { ...newTier, packOf: Number(newTier.packOf), price: Number(newTier.price) };
            } else {
                // Add new
                updatedBulk.push({ ...newTier, packOf: Number(newTier.packOf), price: Number(newTier.price) });
            }
            return { ...prev, bulkPricing: updatedBulk };
        });

        setNewTier({ packOf: "", price: "" });
        setBulkTierEditIndex(null);
    };

    const editBulkTier = (index) => {
        const tier = formData.bulkPricing[index];
        setNewTier({ packOf: tier.packOf, price: tier.price });
        setBulkTierEditIndex(index);
    };

    const removeBulkTier = (index) => {
        setFormData(prev => ({
            ...prev,
            bulkPricing: prev.bulkPricing.filter((_, i) => i !== index)
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
                setFormData({ name: "", description: "", mrpPrice: "", salePrice: "", images: [], bulkPricing: [], category: "Uncategorized" });
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
            images: product.images || [],
            bulkPricing: product.bulkPricing || [],
            category: product.category || "Uncategorized"
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
                            <div className="space-y-2 text-left">
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
                                <label className="text-[10px] uppercase font-black ml-2 text-gray-400 tracking-widest">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500/10 rounded-[24px] outline-none font-black text-sm text-gray-900 transition-all focus:bg-white shadow-sm appearance-none cursor-pointer"
                                >
                                    {categories.filter(c => c !== "All").map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
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

                            {/* Bulk Pricing Section */}
                            <div className="md:col-span-2 space-y-6 bg-gray-50/50 p-6 rounded-[32px] border border-gray-100/50">
                                <label className="text-[10px] uppercase font-black ml-2 text-gray-400 tracking-widest block">Bulk Pricing Tiers (Pack Of Pricing)</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                                    <div className="space-y-2">
                                        <label className="text-[9px] uppercase font-black ml-2 text-gray-400">Pack Of</label>
                                        <input
                                            type="number"
                                            value={newTier.packOf}
                                            onChange={e => setNewTier({ ...newTier, packOf: e.target.value })}
                                            className="w-full px-5 py-3 bg-white border border-gray-100 rounded-2xl outline-none font-bold text-sm text-gray-900"
                                            placeholder="e.g. 100"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[9px] uppercase font-black ml-2 text-gray-400">Price (₹)</label>
                                        <input
                                            type="number"
                                            value={newTier.price}
                                            onChange={e => setNewTier({ ...newTier, price: e.target.value })}
                                            className="w-full px-5 py-3 bg-white border border-gray-100 rounded-2xl outline-none font-bold text-sm text-gray-900"
                                            placeholder="e.g. 1069"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addBulkTier}
                                        className={`py-3 text-white font-black rounded-2xl uppercase tracking-widest text-[10px] transition-all active:scale-95 ${bulkTierEditIndex !== null ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'}`}
                                    >
                                        {bulkTierEditIndex !== null ? 'Update Tier' : 'Add Tier'}
                                    </button>
                                </div>

                                {formData.bulkPricing.length > 0 && (
                                    <div className="mt-6 flex flex-wrap gap-3">
                                        {formData.bulkPricing.map((tier, idx) => (
                                            <div key={idx} className={`flex items-center gap-3 px-4 py-2 rounded-xl border shadow-sm transition-all ${bulkTierEditIndex === idx ? 'bg-orange-50 border-orange-200 ring-2 ring-orange-100' : 'bg-white border-gray-100'}`}>
                                                <span className="text-xs font-black text-gray-900">Pack of {tier.packOf}: ₹{tier.price}</span>
                                                <div className="flex items-center gap-1 border-l border-gray-100 pl-2 ml-1">
                                                    <button type="button" onClick={() => editBulkTier(idx)} className="text-blue-400 hover:text-blue-600 p-1 transition-colors">
                                                        <Pencil size={12} />
                                                    </button>
                                                    <button type="button" onClick={() => removeBulkTier(idx)} className="text-red-400 hover:text-red-600 p-1 transition-colors">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
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
                                        setFormData({ name: "", description: "", mrpPrice: "", salePrice: "", images: [], bulkPricing: [], category: "Uncategorized" });
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
                                    onChange={(e) => {
                                        if (e.target.value === "ADD_NEW") {
                                            Swal.fire({
                                                title: 'Add New Category',
                                                input: 'text',
                                                inputPlaceholder: 'Enter category name...',
                                                showCancelButton: true,
                                                confirmButtonText: 'Add',
                                                confirmButtonColor: '#2563eb',
                                            }).then(async (result) => {
                                                if (result.isConfirmed && result.value) {
                                                    const newCatInput = result.value.trim();
                                                    if (newCatInput) {
                                                        try {
                                                            const res = await fetch("/api/categories", {
                                                                method: "POST",
                                                                headers: { "Content-Type": "application/json" },
                                                                body: JSON.stringify({ name: newCatInput })
                                                            });
                                                            if (res.ok) {
                                                                fetchCategories();
                                                                const data = await res.json();
                                                                setSelectedCategory(data.data.name);
                                                                setFormData(prev => ({ ...prev, category: data.data.name }));
                                                            } else {
                                                                const err = await res.json();
                                                                Swal.fire("Error", err.message, "error");
                                                            }
                                                        } catch (error) {
                                                            Swal.fire("Error", "Failed to add category", "error");
                                                        }
                                                    }
                                                }
                                            });
                                        } else if (e.target.value === "DELETE_CATEGORY") {
                                            const catsToDelete = categories.filter(c => c !== "All" && c !== "Uncategorized");
                                            Swal.fire({
                                                title: 'Delete Category',
                                                text: 'Select a category to delete. Warning: Products in this category will become Uncategorized.',
                                                input: 'select',
                                                inputOptions: catsToDelete.reduce((acc, curr) => ({ ...acc, [curr]: curr }), {}),
                                                inputPlaceholder: 'Select category',
                                                showCancelButton: true,
                                                confirmButtonText: 'Delete',
                                                confirmButtonColor: '#ef4444',
                                            }).then(async (result) => {
                                                if (result.isConfirmed && result.value) {
                                                    try {
                                                        const res = await fetch(`/api/categories?name=${result.value}`, {
                                                            method: "DELETE"
                                                        });
                                                        if (res.ok) {
                                                            Swal.fire("Deleted!", "Category removed, products updated.", "success");
                                                            fetchCategories();
                                                            fetchProducts();
                                                            if (selectedCategory === result.value) setSelectedCategory("All");
                                                            if (formData.category === result.value) setFormData(prev => ({ ...prev, category: "Uncategorized" }));
                                                        }
                                                    } catch (error) {
                                                        Swal.fire("Error", "Failed to delete category", "error");
                                                    }
                                                }
                                            });
                                        } else {
                                            setSelectedCategory(e.target.value);
                                        }
                                    }}
                                    className="w-full pl-6 pr-10 py-3 bg-white border border-gray-200 rounded-xl md:rounded-2xl appearance-none focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-xs md:text-sm cursor-pointer shadow-sm"
                                >
                                    <optgroup label="Filters">
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="Actions">
                                        <option value="ADD_NEW" className="text-blue-600 font-black">+ Add New Category</option>
                                        <option value="DELETE_CATEGORY" className="text-red-600 font-black">- Delete Category</option>
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
                                    <th className="px-6 md:px-8 py-4 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
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
                                                <Link href={`/admin/products/${product._id}`} className="w-14 h-14 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center block group/img">
                                                    {product.images && product.images.length > 0 ? (
                                                        <img src={product.images[0]} alt="" className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500" />
                                                    ) : (
                                                        <ImageIcon size={24} className="text-gray-200" />
                                                    )}
                                                </Link>
                                            </td>
                                            <td className="px-8 py-6">
                                                <Link href={`/admin/products/${product._id}`} className="max-w-xs block group/text">
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
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className="p-2.5 bg-orange-50 text-orange-500 rounded-xl hover:bg-orange-100 transition-all active:scale-90"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product._id)}
                                                        className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all active:scale-90"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
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
        </div>
    );
}
