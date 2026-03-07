"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Layers, Search, Loader2, Pencil, Upload, Image as ImageIcon, X, ArrowLeft } from "lucide-react";
import Swal from "sweetalert2";

export default function CategoriesPage() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form States
    const [showForm, setShowForm] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingOldName, setEditingOldName] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        imageUrl: "",
        link: ""
    });

    // Search State
    const [searchQuery, setSearchQuery] = useState("");
    const formRef = useRef(null);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            if (res.ok) {
                const data = await res.json();
                const sanitizedData = data.map(cat => ({
                    ...cat,
                    name: typeof cat.name === 'string' ? cat.name : (cat.name?.name || String(cat.name || ""))
                }));
                setCategories(sanitizedData);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, imageUrl: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, imageUrl: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        setLoading(true);
        const url = "/api/categories";
        const method = isEditMode ? "PUT" : "POST";

        const body = isEditMode
            ? { oldName: editingOldName, newName: formData.name.trim(), imageUrl: formData.imageUrl, link: formData.link.trim() }
            : { name: formData.name.trim(), imageUrl: formData.imageUrl, link: formData.link.trim() };

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    title: isEditMode ? 'Updated!' : 'Created!',
                    text: isEditMode ? 'Category updated successfully' : 'Category added successfully',
                    timer: 1500,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
                setFormData({ name: "", imageUrl: "", link: "" });
                setIsEditMode(false);
                setEditingOldName(null);
                setShowForm(false);
                fetchCategories();
            } else {
                const error = await res.json();
                Swal.fire("Error", error.message || `Failed to ${isEditMode ? 'update' : 'add'} category`, "error");
            }
        } catch (error) {
            Swal.fire("Error", "Server error occurred", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (cat) => {
        setFormData({
            name: typeof cat.name === 'string' ? cat.name : String(cat.name || ""),
            imageUrl: cat.imageUrl || "",
            link: cat.link || ""
        });
        setIsEditMode(true);
        setEditingOldName(typeof cat.name === 'string' ? cat.name : String(cat.name || ""));
        setShowForm(true);
        setTimeout(() => {
            formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
    };

    const handleDelete = async (name) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `Want to delete "${name}"? Products in this category will be moved to Uncategorized.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/categories?name=${encodeURIComponent(name)}`, {
                    method: "DELETE"
                });
                if (res.ok) {
                    Swal.fire('Deleted!', 'Category has been removed.', 'success');
                    fetchCategories();
                }
            } catch (error) {
                Swal.fire("Error", "Failed to delete category", "error");
            }
        }
    };

    const filteredCategories = categories.filter(cat => {
        const name = typeof cat.name === 'string' ? cat.name : "";
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="p-4 md:p-10 space-y-10 animate-in fade-in duration-700 bg-gray-50/50 min-h-screen font-sans">
            {/* Header */}
            <div className="flex items-center justify-between gap-5">
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => router.push('/admin/dashboard')}
                        className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all active:scale-95 group shadow-sm"
                    >
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="space-y-1">
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">Manage Categories</h1>
                        <p className="text-sm text-gray-500 font-medium">Control your product classifications.</p>
                    </div>
                </div>

                <button
                    onClick={() => {
                        if (showForm && isEditMode) {
                            setIsEditMode(false);
                            setEditingOldName(null);
                            setFormData({ name: "", imageUrl: "", link: "" });
                        }
                        setShowForm(!showForm);
                    }}
                    className={`flex items-center gap-3 px-6 py-4 rounded-[24px] font-black uppercase tracking-widest text-sm transition-all active:scale-95 shadow-lg ${showForm ? 'bg-gray-100 text-gray-500 hover:bg-gray-200 shadow-gray-100' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'}`}
                >
                    {showForm ? <X size={20} /> : <Plus size={20} />}
                    <span className="hidden md:block">{showForm ? "Close Form" : "Add Category"}</span>
                </button>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-12">
                {/* Add/Edit Category Form */}
                {showForm && (
                    <div ref={formRef} className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 md:p-12 max-w-3xl animate-in slide-in-from-top duration-500">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                                <Plus size={24} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                {isEditMode ? "Edit Category" : "Add Category"}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2 text-left md:col-span-2">
                                    <label className="text-[10px] uppercase font-black ml-2 text-gray-400 tracking-widest">Category Name</label>
                                    <input
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500/10 rounded-[24px] outline-none font-black text-sm text-gray-900 transition-all focus:bg-white shadow-sm"
                                        placeholder="e.g. Electronics"
                                    />
                                </div>

                                <div className="space-y-2 text-left md:col-span-2">
                                    <label className="text-[10px] uppercase font-black ml-2 text-gray-400 tracking-widest block">Category Image</label>
                                    <div className="flex items-start gap-6">
                                        <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-2 border-dashed border-gray-200 group bg-gray-50 flex items-center justify-center transition-all hover:bg-blue-50 hover:border-blue-400">
                                            {formData.imageUrl ? (
                                                <>
                                                    <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            removeImage();
                                                        }}
                                                        className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </>
                                            ) : (
                                                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                                                    <ImageIcon size={32} className="text-gray-300 group-hover:text-blue-400 transition-colors mb-2" />
                                                    <span className="text-[10px] uppercase font-black text-gray-400 group-hover:text-blue-500">Upload</span>
                                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                                </label>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-2 text-left">
                                            <label className="text-[10px] uppercase font-black ml-2 text-gray-400 tracking-widest">Custom Link (Optional)</label>
                                            <input
                                                value={formData.link}
                                                onChange={e => setFormData(prev => ({ ...prev, link: e.target.value }))}
                                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500/10 rounded-[24px] outline-none font-black text-sm text-gray-900 transition-all focus:bg-white shadow-sm"
                                                placeholder="/custom-link"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-5 bg-blue-600 text-white font-black rounded-[24px] shadow-lg shadow-blue-100 uppercase tracking-widest text-sm hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isEditMode ? "Update Category" : "Save Category"}
                                </button>
                                {isEditMode && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditMode(false);
                                            setEditingOldName(null);
                                            setFormData({ name: "", imageUrl: "", link: "" });
                                            setShowForm(false);
                                        }}
                                        className="px-8 py-5 bg-gray-100 text-gray-500 font-black rounded-[24px] uppercase tracking-widest text-sm hover:bg-gray-200 transition-all active:scale-[0.98]"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}

                {/* Categories List Grid */}
                <div className="bg-white rounded-3xl md:rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/20">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 flex-1">
                            <div className="relative w-full md:w-72 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search categories..."
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-xs md:text-sm placeholder:font-medium shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 self-end md:self-auto">
                            <h2 className="hidden md:block text-xl font-black text-gray-900 tracking-tight">Catalogue</h2>
                            <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                {categories.length} Items
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto scrollbar-hide">
                        <table className="w-full text-left min-w-[800px]">
                            <thead>
                                <tr className="bg-gray-50/30">
                                    <th className="px-6 md:px-8 py-4 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                                    <th className="px-6 md:px-8 py-4 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Image</th>
                                    <th className="px-6 md:px-8 py-4 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Category Details</th>
                                    <th className="px-6 md:px-8 py-4 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading && categories.length === 0 ? (
                                    <tr><td colSpan="4" className="px-8 py-20 text-center animate-pulse text-gray-400 font-bold italic">Loading categories...</td></tr>
                                ) : filteredCategories.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center">
                                            <Layers size={40} className="mx-auto text-gray-200 mb-3" />
                                            <p className="text-gray-400 font-bold italic">No matching categories found.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCategories.map((cat, idx) => (
                                        <tr key={cat._id} className="hover:bg-gray-50/50 transition-all font-bold group">
                                            <td className="px-8 py-6 text-xs text-black-500 font-black">#{idx + 1}</td>
                                            <td className="px-8 py-6">
                                                <div className="w-14 h-14 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex items-center justify-center group/img">
                                                    {cat.imageUrl ? (
                                                        <img src={cat.imageUrl} alt={cat.name} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500" />
                                                    ) : (
                                                        <ImageIcon size={24} className="text-gray-200" />
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="max-w-xs group/text">
                                                    <p className="text-sm text-black-900 group-hover/text:text-blue-600 transition-colors line-clamp-1">
                                                        {typeof cat.name === 'string' ? cat.name : String(cat.name || "")}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <p className="text-[10px] text-gray-400 line-clamp-1 font-medium italic">
                                                            {cat.link ? `Link: ${cat.link}` : 'No custom link'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button
                                                        onClick={() => handleEdit(cat)}
                                                        className="p-2.5 bg-orange-50 text-orange-500 rounded-xl hover:bg-orange-100 transition-all active:scale-90"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(cat.name)}
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
