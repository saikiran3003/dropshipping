"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShoppingCart, Tag, Info, ImageIcon, Plus, Minus, Layers, Share2 } from "lucide-react";
import Swal from "sweetalert2";

function ImageMagnifier({ src, alt }) {
    const [showMagnifier, setShowMagnifier] = useState(false);
    const [[x, y], setXY] = useState([0, 0]);
    const [[imgWidth, imgHeight], setSize] = useState([0, 0]);

    return (
        <div className="relative inline-block w-full overflow-hidden cursor-crosshair">
            <img
                src={src}
                className="w-full h-auto rounded-[32px] object-contain bg-gray-50"
                alt={alt}
                onMouseEnter={(e) => {
                    const elem = e.currentTarget;
                    const { width, height } = elem.getBoundingClientRect();
                    setSize([width, height]);
                    setShowMagnifier(true);
                }}
                onMouseMove={(e) => {
                    const elem = e.currentTarget;
                    const { top, left } = elem.getBoundingClientRect();
                    const x = e.pageX - left - window.pageXOffset;
                    const y = e.pageY - top - window.pageYOffset;
                    setXY([x, y]);
                }}
                onMouseLeave={() => setShowMagnifier(false)}
            />

            {showMagnifier && (
                <div
                    style={{
                        position: "absolute",
                        pointerEvents: "none",
                        height: "250px",
                        width: "250px",
                        top: `${y - 125}px`,
                        left: `${x - 125}px`,
                        border: "2px solid rgba(255, 255, 255, 0.8)",
                        boxShadow: "0 0 0 5000px rgba(0, 0, 0, 0.3)",
                        backgroundColor: "white",
                        backgroundImage: `url('${src}')`,
                        backgroundRepeat: "no-repeat",
                        backgroundSize: `${imgWidth * 2.5}px ${imgHeight * 2.5}px`,
                        backgroundPositionX: `${-x * 2.5 + 125}px`,
                        backgroundPositionY: `${-y * 2.5 + 125}px`,
                        zIndex: 50,
                    }}
                />
            )}
        </div>
    );
}

export default function ProductDetailPage({ params }) {
    const router = useRouter();
    const unwrappedParams = React.use(params);
    const id = unwrappedParams.id;

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState("");
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch("/api/admin/products");
                if (res.ok) {
                    const products = await res.json();
                    const found = products.find((p) => p._id === id);
                    if (found) {
                        setProduct(found);
                        setActiveImage(found.images?.[0] || "");
                    }
                }
            } catch (error) {
                console.error("Failed to fetch product:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    const handleShare = async () => {
        const tier = product.bulkPricing?.find(t => t.packOf === quantity);
        const currentPrice = tier ? tier.price : (product.salePrice * quantity);
        const shareText = `Check out this product: ${product.name}\nPrice: ₹${currentPrice.toLocaleString()}\nDescription: ${product.description}`;

        try {
            if (navigator.share) {
                const filesArray = [];
                if (activeImage) {
                    try {
                        const response = await fetch(activeImage);
                        const blob = await response.blob();
                        const file = new File([blob], "product-image.jpg", { type: blob.type });
                        filesArray.push(file);
                    } catch (imageError) {
                        console.error("Failed to fetch image for sharing:", imageError);
                    }
                }

                const shareData = {
                    title: product.name,
                    text: shareText,
                    url: window.location.href,
                    ...(filesArray.length > 0 && navigator.canShare?.({ files: filesArray }) ? { files: filesArray } : {})
                };

                await navigator.share(shareData);
            } else {
                throw new Error("Share API not supported");
            }
        } catch (error) {
            console.warn("Native share failed, falling back to clipboard:", error);
            try {
                await navigator.clipboard.writeText(`${shareText}\nLink: ${window.location.href}`);
                Swal.fire({
                    icon: "success",
                    title: "Copied to Clipboard!",
                    text: "Product details have been copied for sharing.",
                    timer: 2000,
                    showConfirmButton: false,
                    position: "top-end",
                    toast: true
                });
            } catch (clipboardError) {
                Swal.fire({
                    icon: "error",
                    title: "Share Failed",
                    text: "Could not share or copy details."
                });
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-400 font-black animate-pulse uppercase tracking-widest">Loading Product...</div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">Product Not Found</h1>
                <button
                    onClick={() => router.push("/admin/products")}
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
                >
                    Back to Products
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-10 space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center gap-5">
                <button
                    onClick={() => router.push("/admin/products")}
                    className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all active:scale-95 group shadow-sm"
                >
                    <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                </button>
                <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">{product.name}</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 md:p-12">
                {/* Left: Image Gallery */}
                <div className="lg:col-span-7 space-y-8">
                    <div className="relative rounded-[32px] overflow-hidden bg-gray-50 border border-gray-100 shadow-inner group">
                        {activeImage ? (
                            <ImageMagnifier src={activeImage} alt={product.name} />
                        ) : (
                            <div className="h-[500px] flex items-center justify-center text-gray-200">
                                <ImageIcon size={80} />
                            </div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {product.images?.length > 1 && (
                        <div className="flex flex-wrap gap-4 pt-4">
                            {product.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(img)}
                                    className={`relative w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all p-1 shadow-sm ${activeImage === img ? "border-blue-500 bg-blue-50" : "border-transparent bg-white hover:border-gray-200"
                                        }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover rounded-xl" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Product Details */}
                <div className="lg:col-span-5 space-y-10 flex flex-col justify-start">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-50 text-green-600 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                <Tag size={14} /> Global Catalogue
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <h2 className="text-4xl font-black text-gray-900 tracking-tight">Pricing & Sales</h2>
                                <button
                                    onClick={handleShare}
                                    className="p-4 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50/50 rounded-2xl transition-all active:scale-95 group border border-transparent hover:border-blue-100"
                                    title="Share Product"
                                >
                                    <Share2 size={24} className="group-hover:rotate-12 transition-transform" />
                                </button>
                            </div>
                            <div className="flex flex-wrap items-center gap-6 mt-4">
                                <div className="space-y-1">
                                    {(() => {
                                        const tier = product.bulkPricing?.find(t => t.packOf === quantity);
                                        const currentPrice = tier ? tier.price : (product.salePrice * quantity);
                                        return (
                                            <span className="text-5xl font-black text-blue-600 tracking-tighter">
                                                ₹{currentPrice.toLocaleString()}
                                            </span>
                                        );
                                    })()}
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl text-gray-400 line-through font-bold">₹{(product.mrpPrice * quantity).toLocaleString()}</span>
                                        <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-xl text-xs font-black">
                                            {Math.round(((product.mrpPrice - product.salePrice) / product.mrpPrice) * 100)}% DISCOUNT
                                        </span>
                                    </div>
                                </div>

                                {/* Quantity Selector */}
                                <div className="flex items-center bg-gray-100 p-2 rounded-[24px] border border-gray-200">
                                    <button
                                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                        className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-gray-600 hover:text-blue-600 shadow-sm transition-all active:scale-95"
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <span className="px-6 text-xl font-black text-gray-900 min-w-[60px] text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(prev => prev + 1)}
                                        className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-gray-600 hover:text-blue-600 shadow-sm transition-all active:scale-95"
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Bulk Pricing Table */}
                        {product.bulkPricing && product.bulkPricing.length > 0 && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 text-gray-900">
                                    <Layers size={20} className="text-blue-500" />
                                    <h3 className="text-lg font-black uppercase tracking-widest text-xs">Bulk Pricing (Save More)</h3>
                                </div>
                                <div className="overflow-hidden rounded-[32px] border border-gray-100 shadow-sm bg-white">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50/50">
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Pack Of</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Price</th>
                                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Per Pcs Rate</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {product.bulkPricing.sort((a, b) => a.packOf - b.packOf).map((tier, idx) => (
                                                <tr
                                                    key={idx}
                                                    onClick={() => setQuantity(tier.packOf)}
                                                    className={`cursor-pointer transition-colors hover:bg-blue-50/30 ${quantity === tier.packOf ? "bg-blue-50/50" : ""}`}
                                                >
                                                    <td className="px-6 py-4 font-black text-gray-900 border-b border-gray-50">{tier.packOf}</td>
                                                    <td className="px-6 py-4 font-black text-blue-600 border-b border-gray-50">₹{tier.price.toLocaleString()}</td>
                                                    <td className="px-6 py-4 font-bold text-gray-500 border-b border-gray-50">₹{(tier.price / tier.packOf).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-gray-900">
                            <Info size={20} className="text-blue-500" />
                            <h3 className="text-lg font-black uppercase tracking-widest text-xs">Description</h3>
                        </div>
                        <p className="text-gray-500 font-medium leading-relaxed bg-gray-50/50 p-6 rounded-3xl border border-gray-100/50">
                            {product.description}
                        </p>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Stock Status</p>
                                <p className="text-lg font-black text-green-600">In Inventory</p>
                            </div>
                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Catalogued</p>
                                <p className="text-lg font-black text-gray-900">{new Date(product.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    <button className="w-full py-6 bg-gray-900 text-white font-black rounded-[32px] uppercase tracking-widest text-sm hover:bg-black transition-all active:scale-[0.98] shadow-2xl flex items-center justify-center gap-3 mt-auto">
                        <ShoppingCart size={20} /> Preview in Store
                    </button>
                </div>
            </div>
        </div>
    );
}
