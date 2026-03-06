"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Trash2,
    Pencil,
    Image as ImageIcon,
    Link as LinkIcon,
    ChevronUp,
    ChevronDown,
    Save,
    X,
    Upload,
    CheckCircle2,
    XCircle
} from "lucide-react";
import Swal from "sweetalert2";

export default function BannersPage() {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        link: "",
        imageUrl: "",
        bannerType: "big",
        isActive: true
    });

    const fetchBanners = async () => {
        try {
            const res = await fetch("/api/admin/banners");
            if (res.ok) {
                const data = await res.json();
                setBanners(data);
            }
        } catch (error) {
            console.error("Failed to fetch banners:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.imageUrl) {
            Swal.fire("Error", "Banner image is required", "error");
            return;
        }

        setLoading(true);
        const url = "/api/admin/banners";
        const method = isEditMode ? "PUT" : "POST";
        const body = isEditMode ? { ...formData, id: editingId } : formData;

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                Swal.fire("Success", isEditMode ? "Banner updated" : "Banner added", "success");
                resetForm();
                fetchBanners();
            } else {
                const err = await res.json();
                Swal.fire("Error", err.message, "error");
            }
        } catch (error) {
            Swal.fire("Error", "Operation failed", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (banner) => {
        setFormData({
            title: banner.title || "",
            description: banner.description || "",
            link: banner.link || "",
            imageUrl: banner.imageUrl,
            bannerType: banner.bannerType || "big",
            isActive: banner.isActive
        });
        setIsEditMode(true);
        setEditingId(banner._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This banner will be removed from the homepage.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            confirmButtonText: "Yes, delete it!"
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/admin/banners?id=${id}`, { method: "DELETE" });
                if (res.ok) {
                    Swal.fire("Deleted!", "Banner removed.", "success");
                    fetchBanners();
                }
            } catch (error) {
                Swal.fire("Error", "Deletion failed", "error");
            }
        }
    };

    const toggleStatus = async (banner) => {
        try {
            const res = await fetch("/api/admin/banners", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...banner, id: banner._id, isActive: !banner.isActive })
            });
            if (res.ok) fetchBanners();
        } catch (error) {
            console.error("Status toggle failed");
        }
    };

    const handleReorder = async (id, direction) => {
        try {
            const res = await fetch("/api/admin/banners", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, direction })
            });
            if (res.ok) fetchBanners();
        } catch (error) {
            console.error("Reorder failed", error);
        }
    };

    const resetForm = () => {
        setFormData({ title: "", description: "", link: "", imageUrl: "", bannerType: "big", isActive: true });
        setIsEditMode(false);
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className="space-y-10 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Banner Management</h1>
                    <p className="text-sm text-gray-500 font-medium">Create Blinkit-style promotional banners for your homepage.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`flex items-center gap-3 px-6 py-4 rounded-[20px] font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg ${showForm ? 'bg-gray-100 text-gray-500' : 'bg-blue-600 text-white shadow-blue-100'}`}
                >
                    {showForm ? <X size={18} /> : <Plus size={18} />}
                    {showForm ? "Close" : "Add Banner"}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 md:p-12 max-w-2xl animate-in slide-in-from-top duration-500">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black ml-2 text-gray-400 tracking-widest">Banner Image <span className="text-red-500">*</span></label>
                                <div className="relative group">
                                    {formData.imageUrl ? (
                                        <div className="relative aspect-[21/9] rounded-[32px] overflow-hidden border-2 border-blue-500/20 group">
                                            <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <label className="cursor-pointer p-4 bg-white rounded-2xl text-blue-600 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                                    <Upload size={16} /> Change Image
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                                </label>
                                            </div>
                                        </div>
                                    ) : (
                                        <label className="aspect-[21/9] rounded-[32px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-all cursor-pointer bg-gray-50/30 group">
                                            <ImageIcon size={48} className="mb-4 opacity-20 group-hover:scale-110 transition-transform" />
                                            <span className="font-black text-xs uppercase tracking-widest">Click to upload banner</span>
                                            <span className="text-[10px] mt-2 opacity-60">Recommended: 21:9 ratio (e.g. 1920x820)</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black ml-2 text-gray-400 tracking-widest">Title (Optional)</label>
                                    <input
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500/10 rounded-[20px] outline-none font-black text-sm"
                                        placeholder="e.g. Special Offer"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black ml-2 text-gray-400 tracking-widest">Link URL (Optional)</label>
                                    <div className="relative">
                                        <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                            value={formData.link}
                                            onChange={e => setFormData({ ...formData, link: e.target.value })}
                                            className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500/10 rounded-[20px] outline-none font-black text-sm"
                                            placeholder="/products/id or external link"
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] uppercase font-black ml-2 text-gray-400 tracking-widest">Description (Optional)</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500/10 rounded-[24px] outline-none font-black text-sm resize-none"
                                        rows={3}
                                        placeholder="Banner sub-text..."
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[10px] uppercase font-black ml-2 text-gray-400 tracking-widest">Banner Type</label>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, bannerType: 'big' })}
                                            className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${formData.bannerType === 'big' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-50 text-gray-400'}`}
                                        >
                                            Big (Wide)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, bannerType: 'small' })}
                                            className={`flex-1 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${formData.bannerType === 'small' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-50 text-gray-400'}`}
                                        >
                                            Small (Grid)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-5 bg-blue-600 text-white font-black rounded-[24px] shadow-lg shadow-blue-100 uppercase tracking-widest text-xs hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                <Save size={18} />
                                {isEditMode ? "Update" : "Publish"}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-10 py-5 bg-gray-100 text-gray-500 font-black rounded-[24px] uppercase tracking-widest text-xs hover:bg-gray-200 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loading && banners.length === 0 ? (
                    [1, 2, 3].map(i => <div key={i} className="aspect-[21/9] bg-gray-100 animate-pulse rounded-[32px]" />)
                ) : banners.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-[40px] border border-dashed border-gray-200">
                        <ImageIcon size={64} className="mx-auto text-gray-100 mb-6" />
                        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No banners published yet.</p>
                    </div>
                ) : (
                    banners.map((banner) => (
                        <div key={banner._id} className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-gray-100 transition-all">
                            <div className="relative aspect-[21/9] overflow-hidden">
                                <img src={banner.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={banner.title} />
                                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm ${banner.isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                                    {banner.isActive ? "Active" : "Hidden"}
                                </div>
                                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-blue-600/90 text-white text-[8px] font-black uppercase tracking-widest shadow-sm">
                                    {banner.bannerType || 'big'}
                                </div>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <h3 className="font-black text-gray-900 line-clamp-1">{banner.title || "Untitled Banner"}</h3>
                                    <p className="text-[10px] text-gray-400 font-bold mt-1 truncate">{banner.link || "No destination link"}</p>
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex gap-2">
                                        <button onClick={() => toggleStatus(banner)} className={`p-3 rounded-2xl transition-all ${banner.isActive ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                                            {banner.isActive ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                                        </button>
                                        <button onClick={() => handleEdit(banner)} className="p-3 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-100 transition-all">
                                            <Pencil size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(banner._id)} className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleReorder(banner._id, 'up')} className="p-2 text-gray-300 hover:text-blue-500 transition-colors"><ChevronUp size={16} /></button>
                                        <button onClick={() => handleReorder(banner._id, 'down')} className="p-2 text-gray-300 hover:text-blue-500 transition-colors"><ChevronDown size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
