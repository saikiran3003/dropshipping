"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ChevronLeft,
    Share2,
    ShoppingCart,
    Star,
    Truck,
    ShieldCheck,
    RotateCcw,
    Check
} from "lucide-react";
import Swal from "sweetalert2";
import ImageMagnifier from "../../../components/ImageMagnifier";

export default function ProductDetail() {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/admin/products`); // Reusing admin API for now as it handles GET all
                if (res.ok) {
                    const allProducts = await res.json();
                    const found = allProducts.find(p => p._id === id);
                    if (found) {
                        setProduct(found);
                    } else {
                        Swal.fire("Error", "Product not found", "error");
                        router.push("/");
                    }
                }
            } catch (error) {
                console.error("Fetch failed:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleWhatsAppShare = () => {
        if (!product) return;

        const message = `Check out this amazing product!\n\n*${product.name}*\nPrice: ₹${product.salePrice}\n\nView details: ${window.location.href}`;
        const encodedMessage = encodeURIComponent(message);

        // WhatsApp URL (Web or App)
        const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleAddToCart = () => {
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
        Swal.fire({
            title: "Added to Cart!",
            text: `${product.name} has been added.`,
            icon: "success",
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!product) return null;

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Header / Nav */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="p-3 hover:bg-gray-50 rounded-2xl transition-all text-gray-500"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleWhatsAppShare}
                            className="p-3 hover:bg-green-50 rounded-2xl transition-all text-green-600"
                        >
                            <Share2 size={24} />
                        </button>
                        <Link href="/" className="bg-blue-600 px-6 py-2.5 rounded-xl text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100">
                            Back to Store
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20">

                    {/* Left: Image Gallery */}
                    <div className="space-y-6">
                        <div className="aspect-square rounded-[48px] bg-gray-50 overflow-hidden shadow-2xl shadow-blue-50 border border-gray-100 relative group">
                            <ImageMagnifier
                                src={product.images[activeImage]}
                                alt={product.name}
                                className="w-full h-full"
                            />
                        </div>

                        {/* Thumbnails */}
                        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide">
                            {product.images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`w-20 h-20 md:w-28 md:h-28 rounded-[24px] md:rounded-[32px] overflow-hidden border-4 transition-all shrink-0 ${activeImage === i ? 'border-blue-600 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" alt="Thumbnail" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Product Content */}
                    <div className="flex flex-col">
                        <div className="space-y-6 md:space-y-10">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        {typeof product.category === 'string' ? product.category : String(product.category?.name || "Uncategorized")}
                                    </span>

                                </div>
                                <h1 className="text-3xl md:text-5xl font-black text-gray-900 leading-tight tracking-tight mb-4">
                                    {product.name}
                                </h1>
                                <p className="text-sm md:text-lg text-gray-500 font-medium leading-relaxed">
                                    {product.description}
                                </p>
                            </div>

                            <div className="p-8 bg-gray-50/50 rounded-[40px] border border-gray-100 space-y-6">
                                <div className="space-y-1">
                                    <div className="flex items-baseline gap-4">
                                        <span className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight">₹{(product.salePrice * quantity).toLocaleString()}</span>
                                        <span className="text-lg md:text-2xl font-bold text-gray-400 line-through">₹{(product.mrpPrice * quantity).toLocaleString()}</span>
                                        <span className="bg-green-100 text-green-600 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest">
                                            Save ₹{((product.mrpPrice - product.salePrice) * quantity).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inclusive of all taxes</p>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="flex items-center bg-white rounded-2xl p-1 border border-gray-100 shadow-inner">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-10 h-10 flex items-center justify-center font-black text-gray-400 hover:text-blue-600 transition-colors"
                                        >-</button>
                                        <span className="w-10 text-center font-black text-gray-900">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-10 h-10 flex items-center justify-center font-black text-gray-400 hover:text-blue-600 transition-colors"
                                        >+</button>
                                    </div>
                                    <p className="text-xs font-black text-green-600 uppercase tracking-widest">In Stock • Ready to ship</p>
                                </div>
                                {/* Commission Badge */}
                                <div className="px-2">
                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-2xl text-[11px] font-black uppercase tracking-widest border border-green-100 shadow-sm">
                                        You can earn {product.commissionType === 'Flat' ? `₹${(product.commissionValue * quantity).toLocaleString()}` : `${product.commissionValue}%`}
                                    </span>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={handleAddToCart}
                                        className={`flex-1 py-5 rounded-[24px] font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 ${isAdded ? 'bg-green-600 text-white shadow-green-100' : 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700'}`}
                                    >
                                        {isAdded ? <Check size={20} /> : <ShoppingCart size={20} />}
                                        {isAdded ? "Added!" : "Add to Cart"}
                                    </button>
                                    <button
                                        onClick={handleWhatsAppShare}
                                        className="px-8 py-5 bg-white text-green-600 border-2 border-green-50 rounded-[24px] font-black uppercase tracking-widest text-sm hover:bg-green-50 transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        <Share2 size={18} />
                                        Share
                                    </button>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
