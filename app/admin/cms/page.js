"use client";

import { useState, useEffect } from "react";
import {
    Plus,
    Trash2,
    Pencil,
    FileText,
    Save,
    X,
    Eye,
    CheckCircle2,
    Layout
} from "lucide-react";
import Swal from "sweetalert2";

export default function CMSPage() {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        content: ""
    });

    const fetchPages = async () => {
        try {
            const res = await fetch("/api/admin/cms");
            if (res.ok) {
                const data = await res.json();
                setPages(data);
            }
        } catch (error) {
            console.error("Failed to fetch CMS pages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPages();
    }, []);

    const resetForm = () => {
        setFormData({ title: "", slug: "", content: "" });
        setIsEditMode(false);
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (page) => {
        setFormData({
            title: page.title,
            slug: page.slug,
            content: page.content
        });
        setIsEditMode(true);
        setEditingId(page._id);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const url = "/api/admin/cms";
        const method = isEditMode ? "PUT" : "POST";
        const body = isEditMode ? { ...formData, id: editingId } : formData;

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                Swal.fire("Success", isEditMode ? "Page updated" : "Page added", "success");
                resetForm();
                fetchPages();
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

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete Page?",
            text: "This will remove the static page permanently.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            confirmButtonText: "Yes, delete"
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/admin/cms?id=${id}`, { method: "DELETE" });
                if (res.ok) {
                    Swal.fire("Deleted!", "Page removed.", "success");
                    fetchPages();
                }
            } catch (error) {
                Swal.fire("Error", "Deletion failed", "error");
            }
        }
    };

    return (
        <div className="space-y-10 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">CMS Management</h1>
                    <p className="text-sm text-gray-500 font-medium">Manage static pages like About Us, Privacy Policy, etc.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`flex items-center gap-3 px-6 py-4 rounded-[20px] font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg ${showForm ? 'bg-gray-100 text-gray-500' : 'bg-blue-600 text-white shadow-blue-100'}`}
                >
                    {showForm ? <X size={18} /> : <Plus size={18} />}
                    {showForm ? "Close" : "New Page"}
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 md:p-12 animate-in slide-in-from-top duration-500">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black ml-2 text-gray-400 tracking-widest">Page Title</label>
                                <input
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500/10 rounded-[20px] outline-none font-black text-sm"
                                    placeholder="e.g. About Us"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black ml-2 text-gray-400 tracking-widest">URL Slug</label>
                                <div className="relative">
                                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">/</span>
                                    <input
                                        required
                                        value={formData.slug}
                                        onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                        className="w-full pl-10 pr-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500/10 rounded-[20px] outline-none font-black text-sm"
                                        placeholder="about-us"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] uppercase font-black ml-2 text-gray-400 tracking-widest">Page Content (HTML/Markdown)</label>
                                <textarea
                                    required
                                    value={formData.content}
                                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-6 py-6 bg-gray-50 border-2 border-transparent focus:border-blue-500/10 rounded-[32px] outline-none font-black text-sm resize-none"
                                    rows={15}
                                    placeholder="Enter page content here..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-5 bg-blue-600 text-white font-black rounded-[24px] shadow-lg shadow-blue-100 uppercase tracking-widest text-xs hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                <Save size={18} />
                                {isEditMode ? "Update Page" : "Publish Page"}
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
                {loading && pages.length === 0 ? (
                    [1, 2, 3].map(i => <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-[40px]" />)
                ) : pages.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-[40px] border border-dashed border-gray-200">
                        <FileText size={64} className="mx-auto text-gray-100 mb-6" />
                        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No CMS pages created yet.</p>
                    </div>
                ) : (
                    pages.map((page) => (
                        <div key={page._id} className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 space-y-6 group hover:shadow-xl transition-all">
                            <div className="flex items-start justify-between">
                                <div className="p-4 bg-blue-50 text-blue-600 rounded-[24px] group-hover:scale-110 transition-transform">
                                    <FileText size={24} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">
                                    {new Date(page.updatedAt).toLocaleDateString()}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{page.title}</h3>
                                <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">/{page.slug}</p>
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <button onClick={() => handleEdit(page)} className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 text-gray-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest">
                                    <Pencil size={14} /> Edit
                                </button>
                                <button onClick={() => handleDelete(page._id)} className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
