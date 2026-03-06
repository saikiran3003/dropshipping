"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Layers, Search, Loader2, Pencil, Upload, Image as ImageIcon, X } from "lucide-react";
import Swal from "sweetalert2";

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState("");
    const [newImageUrl, setNewImageUrl] = useState("");
    const [newLink, setNewLink] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

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

    const handleImageUpload = (e, callback) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                callback(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: newCategory.trim(),
                    imageUrl: newImageUrl.trim(),
                    link: newLink.trim()
                })
            });

            if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Created!',
                    text: 'Category added successfully',
                    timer: 1500,
                    showConfirmButton: false,
                    toast: true,
                    position: 'top-end'
                });
                setNewCategory("");
                setNewImageUrl("");
                setNewLink("");
                fetchCategories();
            } else {
                const error = await res.json();
                Swal.fire("Error", error.message || "Failed to add category", "error");
            }
        } catch (error) {
            Swal.fire("Error", "Server error occurred", "error");
        }
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

    const handleEdit = async (cat) => {
        // We'll use a custom state for the Swal editor if needed, but Swal handles HTML.
        // For image upload inside Swal, we need to handle the change event.
        const { value: formValues } = await Swal.fire({
            title: 'Edit Category',
            html: `
                <div class="space-y-4 text-left p-4">
                    <div>
                        <label class="block text-xs font-black uppercase text-gray-400 mb-1 ml-1">Category Name</label>
                        <input id="swal-name" class="swal2-input !m-0 !w-full !rounded-2xl !border-gray-100" placeholder="Name" value="${cat.name}">
                    </div>
                    <div>
                        <label class="block text-xs font-black uppercase text-gray-400 mb-1 ml-1">Category Image</label>
                        <div class="mt-2 flex items-center gap-4">
                            <div id="swal-preview-container" class="w-16 h-16 rounded-xl border border-gray-100 overflow-hidden bg-gray-50 flex items-center justify-center">
                                ${cat.imageUrl ? `<img src="${cat.imageUrl}" class="w-full h-full object-cover">` : '<i data-lucide="image" class="text-gray-300"></i>'}
                            </div>
                            <label class="cursor-pointer px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all">
                                Change Image
                                <input type="file" id="swal-file" class="hidden" accept="image/*">
                            </label>
                        </div>
                        <input type="hidden" id="swal-image-base64" value="${cat.imageUrl || ''}">
                    </div>
                    <div>
                        <label class="block text-xs font-black uppercase text-gray-400 mb-1 ml-1">Custom Link (Optional)</label>
                        <input id="swal-link" class="swal2-input !m-0 !w-full !rounded-2xl !border-gray-100" placeholder="Link" value="${cat.link || ''}">
                    </div>
                </div>
            `,
            didOpen: () => {
                const fileInput = document.getElementById('swal-file');
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            document.getElementById('swal-preview-container').innerHTML = `<img src="${reader.result}" class="w-full h-full object-cover">`;
                            document.getElementById('swal-image-base64').value = reader.result;
                        };
                        reader.readAsDataURL(file);
                    }
                });
            },
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Update',
            confirmButtonColor: '#2563eb',
            preConfirm: () => {
                return {
                    newName: document.getElementById('swal-name').value,
                    imageUrl: document.getElementById('swal-image-base64').value,
                    link: document.getElementById('swal-link').value
                }
            }
        });

        if (formValues && formValues.newName.trim()) {
            try {
                const res = await fetch("/api/categories", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        oldName: cat.name,
                        newName: formValues.newName.trim(),
                        imageUrl: formValues.imageUrl,
                        link: formValues.link.trim()
                    })
                });
                if (res.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Updated!',
                        text: 'Category updated successfully',
                        timer: 1500,
                        showConfirmButton: false,
                        toast: true,
                        position: 'top-end'
                    });
                    fetchCategories();
                } else {
                    const error = await res.json();
                    Swal.fire("Error", error.message || "Failed to update category", "error");
                }
            } catch (error) {
                Swal.fire("Error", "Server error occurred", "error");
            }
        }
    };

    const filteredCategories = categories.filter(cat => {
        const name = typeof cat.name === 'string' ? cat.name : "";
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                        <Layers size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">Categories</h1>
                        <p className="text-sm text-gray-500 font-medium">Manage your product classifications.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Add Category Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 sticky top-8">
                        <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                            <Plus size={20} className="text-blue-600" />
                            New Category
                        </h2>
                        <form onSubmit={handleAddCategory} className="space-y-6">
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] uppercase font-black ml-2 text-gray-400 tracking-widest">Category Name</label>
                                <input
                                    required
                                    value={newCategory}
                                    onChange={e => setNewCategory(e.target.value)}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500/10 rounded-[24px] outline-none font-black text-sm text-gray-900 transition-all focus:bg-white shadow-sm"
                                    placeholder="e.g. Electronics"
                                />
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] uppercase font-black ml-2 text-gray-400 tracking-widest">Category Image</label>
                                {newImageUrl ? (
                                    <div className="relative group aspect-square w-32 mx-auto rounded-3xl overflow-hidden border-2 border-blue-500/20">
                                        <img src={newImageUrl} className="w-full h-full object-cover" alt="Preview" />
                                        <button
                                            type="button"
                                            onClick={() => setNewImageUrl("")}
                                            className="absolute top-2 right-2 p-1 bg-white rounded-full text-red-500 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full aspect-square bg-gray-50 border-2 border-dashed border-gray-200 rounded-[32px] cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group">
                                        <ImageIcon size={32} className="text-gray-300 group-hover:text-blue-400 transition-colors mb-2" />
                                        <span className="text-[10px] uppercase font-black text-gray-400 group-hover:text-blue-500">Click to Upload</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, setNewImageUrl)} />
                                    </label>
                                )}
                            </div>
                            <div className="space-y-2 text-left">
                                <label className="text-[10px] uppercase font-black ml-2 text-gray-400 tracking-widest">Custom Link (Optional)</label>
                                <input
                                    value={newLink}
                                    onChange={e => setNewLink(e.target.value)}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-blue-500/10 rounded-[24px] outline-none font-black text-sm text-gray-900 transition-all focus:bg-white shadow-sm"
                                    placeholder="/custom-link"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-5 bg-blue-600 text-white font-black rounded-[24px] shadow-lg shadow-blue-100 uppercase tracking-widest text-sm hover:bg-blue-700 transition-all active:scale-[0.98]"
                            >
                                Create Category
                            </button>
                        </form>
                    </div>
                </div>

                {/* List Categories Card */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex items-center gap-4 bg-gray-50/20">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search categories..."
                                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-sm shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="p-4">
                            {loading ? (
                                <div className="py-20 flex flex-col items-center justify-center text-gray-400 gap-4">
                                    <Loader2 className="animate-spin" size={32} />
                                    <p className="font-bold italic">Loading categories...</p>
                                </div>
                            ) : filteredCategories.length === 0 ? (
                                <div className="py-20 text-center text-gray-400">
                                    <Layers size={40} className="mx-auto mb-4 opacity-20" />
                                    <p className="font-bold italic">No categories found.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredCategories.map((cat, idx) => (
                                        <div
                                            key={cat._id}
                                            className="group flex items-center justify-between p-6 bg-gray-50/50 hover:bg-white border border-transparent hover:border-gray-100 rounded-[32px] transition-all hover:shadow-xl hover:shadow-gray-100/50"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm font-black text-xs">
                                                    {idx + 1}
                                                </div>
                                                <span className="font-black text-gray-900 tracking-tight">
                                                    {typeof cat.name === 'string' ? cat.name : String(cat.name || "")}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(cat)}
                                                    className="p-3 bg-white text-orange-500 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-orange-50 transition-all active:scale-90 shadow-sm"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat.name)}
                                                    className="p-3 bg-white text-red-500 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all active:scale-90 shadow-sm"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
