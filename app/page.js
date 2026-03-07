"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Search,
    ShoppingCart,
    Menu,
    X,
    ChevronRight,
    Star,
    Truck,
    ShieldCheck,
    Clock,
    Share2,
    Heart
} from "lucide-react";

export default function HomePage() {
    const router = useRouter();
    const [banners, setBanners] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [cmsPages, setCmsPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentBanner, setCurrentBanner] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [locationSearchQuery, setLocationSearchQuery] = useState("");
    const [locationSuggestions, setLocationSuggestions] = useState([]);

    // New States for Blinkit Features
    const [address, setAddress] = useState("Fetching location...");
    const [searchIndex, setSearchIndex] = useState(0);
    const placeholders = ["Search 'bread'", "Search 'milk'", "Search 'butter'", "Search 'chips'", "Search 'fruits'"];

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if ('scrollRestoration' in window.history) {
                window.history.scrollRestoration = 'manual';
            }
            // Execute immediately
            window.scrollTo(0, 0);

            // Execute after a tiny delay to override any Next.js router scroll restoration
            const timer = setTimeout(() => {
                window.scrollTo(0, 0);
            }, 10);

            return () => clearTimeout(timer);
        }
    }, []);

    useEffect(() => {
        // Initial Mock Geolocation - Only if not already set or it's the initial "Fetching location..."
        if ("geolocation" in navigator && (address === "Fetching location..." || !address)) {
            navigator.geolocation.getCurrentPosition((position) => {
                // Only update if current value is default/empty
                setAddress(prev => (prev === "Fetching location..." || !prev) ? "B62, Pocket B, South City I, Sector 41" : prev);
            }, (error) => {
                setAddress(prev => (prev === "Fetching location..." || !prev) ? "Set location to see arrival time" : prev);
            });
        }
    }, []);

    useEffect(() => {
        if (locationSearchQuery.length >= 4) {
            const mockSuggestions = [
                { id: 1, name: "Madhuranagar", area: "Hyderabad, Telangana" },
                { id: 2, name: "South City I, Sector 41", area: "Gurugram, Haryana" },
                { id: 3, name: "Banjara Hills", area: "Hyderabad, Telangana" },
                { id: 4, name: "Indiranagar", area: "Indiranagar, Bengaluru, Karnataka" },
                { id: 5, name: "Powai", area: "Powai, Mumbai, Maharashtra" },
                { id: 6, name: "Ameerpet", area: "Ameerpet, Hyderabad, Telangana" },
                { id: 7, name: "Kukatpally", area: "Kukatpally, Hyderabad, Telangana" },
                { id: 8, name: "Anna Nagar", area: "Anna Nagar, Chennai, Tamil Nadu" },
                { id: 9, name: "Salt Lake", area: "Salt Lake, Kolkata, West Bengal" },
                { id: 10, name: "Connaught Place", area: "Connaught Place, New Delhi, Delhi" }
            ].filter(s => s.name.toLowerCase().includes(locationSearchQuery.toLowerCase()) || s.area.toLowerCase().includes(locationSearchQuery.toLowerCase()));
            setLocationSuggestions(mockSuggestions);
        } else {
            setLocationSuggestions([]);
        }
    }, [locationSearchQuery]);

    const handleDetectLocation = () => {
        setAddress("Detecting...");
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                const { latitude, longitude } = position.coords;
                // In a real app, use reverse geocoding here
                // For now, providing a realistic detected address
                setTimeout(() => {
                    const detected = "Madhuranagar, Hyderabad";
                    setAddress(detected);
                    setIsLocationModalOpen(false);
                }, 1500);
            }, (error) => {
                setAddress("Location access denied");
            });
        } else {
            setAddress("Geolocation not supported");
        }
    };

    // Rotating Search Placeholder
    useEffect(() => {
        const interval = setInterval(() => {
            setSearchIndex((prev) => (prev + 1) % placeholders.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bannerRes, productRes, categoryRes, cmsRes] = await Promise.all([
                    fetch("/api/admin/banners"),
                    fetch("/api/admin/products"),
                    fetch("/api/categories"),
                    fetch("/api/cms")
                ]);

                if (bannerRes.ok) setBanners(await bannerRes.json());
                if (productRes.ok) setProducts(await productRes.json());
                if (categoryRes.ok) {
                    const data = await categoryRes.json();
                    setCategories(data);
                }
                if (cmsRes.ok) setCmsPages(await cmsRes.json());
            } catch (error) {
                console.error("Failed to fetch homepage data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Banner Carousel Auto-play
    useEffect(() => {
        const activeBigBanners = banners.filter(b => b.isActive && (b.bannerType === 'big' || !b.bannerType));
        if (activeBigBanners.length > 1) {
            const timer = setInterval(() => {
                setCurrentBanner((prev) => (prev + 1) % activeBigBanners.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [banners]);

    const bigBanners = banners.filter(b => b.isActive && (b.bannerType === 'big' || !b.bannerType));
    const smallBanners = banners.filter(b => b.isActive && b.bannerType === 'small');

    const filteredSearchProducts = searchQuery.trim() !== ""
        ? products.filter(p => {
            let query = searchQuery.toLowerCase();
            let maxPrice = Infinity;

            const priceMatch = query.match(/(?:under|below)\s+(\d+)/);
            if (priceMatch) {
                maxPrice = parseInt(priceMatch[1], 10);
                query = query.replace(/(?:under|below)\s+(\d+)/, '').trim();
            }

            let textMatch = true;
            if (query.length > 0) {
                const nameMatch = p.name?.toLowerCase().includes(query);
                const descMatch = p.description?.toLowerCase().includes(query);
                const catMatch = (typeof p.category === 'string' ? p.category : p.category?.name)?.toLowerCase().includes(query);
                textMatch = nameMatch || descMatch || catMatch;
            }

            return textMatch && p.salePrice <= maxPrice;
        })
        : [];

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 md:h-24 flex items-center justify-between gap-8">
                    {/* Logo & Location */}
                    <div className="flex items-center gap-6 shrink-0">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="bg-blue-600 p-2 rounded-xl text-white">
                                <Truck size={24} />
                            </div>
                            <span className="text-xl md:text-2xl font-black tracking-tight">Dropship</span>
                        </Link>

                    </div>

                    {/* Search Bar - Desktop */}
                    <div className="hidden md:flex flex-1 max-w-2xl relative">
                        <div className="relative w-full group z-[60] overflow-visible">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder={placeholders[searchIndex]}
                                className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-50 rounded-2xl focus:bg-white focus:ring-1 focus:ring-blue-600/10 focus:border-blue-600/50 outline-none font-medium transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {/* Search Dropdown Desktop */}
                            {searchQuery.trim().length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[110] max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                    {filteredSearchProducts.length > 0 ? (
                                        filteredSearchProducts.map(product => (
                                            <Link
                                                key={`desktop-search-${product._id}`}
                                                href={`/products/${product._id}`}
                                                onClick={() => setSearchQuery("")}
                                                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                                            >
                                                <div className="w-12 h-12 rounded-lg bg-gray-50 overflow-hidden shrink-0">
                                                    <img src={product.images?.[0] || 'https://via.placeholder.com/150'} alt={product.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-bold text-gray-900 text-sm line-clamp-1">{product.name}</div>
                                                    <div className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mt-0.5 line-clamp-1">{typeof product.category === 'string' ? product.category : product.category?.name}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-black text-gray-900 text-sm">₹{product.salePrice}</div>
                                                    {product.mrpPrice > product.salePrice && <div className="text-[10px] text-gray-400 line-through">₹{product.mrpPrice}</div>}
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="p-6 text-center text-sm font-bold text-gray-500">No products found for "{searchQuery}"</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4 md:gap-6">
                        <Link href="/dropshipper/login" className="hidden sm:block text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors uppercase tracking-widest">
                            Become a Partner
                        </Link>
                        <button className="relative p-2 md:p-3 text-gray-700 hover:bg-gray-50 rounded-2xl transition-all">
                            <ShoppingCart size={24} />
                            <span className="absolute top-0 right-0 w-5 h-5 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">0</span>
                        </button>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 text-gray-700"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Search */}
                <div className="md:hidden px-4 pb-4">
                    <div className="relative group z-[60] overflow-visible">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder={placeholders[searchIndex]}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl outline-none font-medium text-sm transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {/* Search Dropdown Mobile */}
                        {searchQuery.trim().length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[110] max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                                {filteredSearchProducts.length > 0 ? (
                                    filteredSearchProducts.map(product => (
                                        <Link
                                            key={`mobile-search-${product._id}`}
                                            href={`/products/${product._id}`}
                                            onClick={() => setSearchQuery("")}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden shrink-0">
                                                <img src={product.images?.[0] || 'https://via.placeholder.com/150'} alt={product.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <div className="font-bold text-gray-900 text-xs line-clamp-1">{product.name}</div>
                                                <div className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{typeof product.category === 'string' ? product.category : product.category?.name}</div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="font-black text-gray-900 text-xs">₹{product.salePrice}</div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-xs font-bold text-gray-500">No products found</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-12 md:space-y-20">

                {/* Banners Layout */}
                <section className="space-y-6 md:space-y-8">
                    {/* Big Banner Carousel */}
                    {bigBanners.length > 0 && (
                        <div className="relative group">
                            <div className="relative aspect-[21/9] md:aspect-[25/9] rounded-[32px] md:rounded-[48px] overflow-hidden shadow-2xl shadow-blue-100/50">
                                <div
                                    className="flex transition-transform duration-1000 ease-in-out h-full"
                                    style={{ transform: `translateX(-${currentBanner * 100}%)` }}
                                >
                                    {bigBanners.map((banner) => (
                                        <Link
                                            key={banner._id}
                                            href={banner.link || "#"}
                                            className="min-w-full h-full relative"
                                        >
                                            <img
                                                src={banner.imageUrl}
                                                className="w-full h-full object-cover"
                                                alt={banner.title || "Promotion"}
                                            />
                                            {(banner.title || banner.description) && (
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8 md:p-16 text-white">
                                                    <h2 className="text-3xl md:text-5xl font-black mb-2 md:mb-4 tracking-tight">{banner.title}</h2>
                                                    <p className="text-sm md:text-lg font-medium opacity-90 max-w-xl mb-6">{banner.description}</p>
                                                    <div className="inline-flex items-center justify-center bg-white text-black px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs w-fit hover:bg-gray-100 transition-colors shadow-lg">
                                                        Shop Now
                                                    </div>
                                                </div>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            {/* Dot Indicators */}
                            {bigBanners.length > 1 && (
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                                    {bigBanners.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentBanner(i)}
                                            className={`h-1.5 rounded-full transition-all ${i === currentBanner ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Small Banners Grid (3 images under big banner) */}
                    {smallBanners.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            {smallBanners.slice(0, 3).map((banner) => (
                                <Link
                                    key={banner._id}
                                    href={banner.link || "#"}
                                    className="relative aspect-[4/3] rounded-[32px] md:rounded-[40px] overflow-hidden shadow-lg transition-all duration-500 group"
                                >
                                    <img
                                        src={banner.imageUrl}
                                        className="w-full h-full object-cover transition-transform duration-700"
                                        alt={banner.title || "Promotion"}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                                        {banner.title && <h3 className="text-sm md:text-lg font-black tracking-tight mb-1">{banner.title}</h3>}
                                        {banner.description && <p className="text-[8px] md:text-[10px] font-medium opacity-80 mb-3 line-clamp-2">{banner.description}</p>}
                                        <div className="bg-white text-black px-4 py-2 rounded-lg font-black uppercase tracking-widest text-[8px] md:text-[10px] w-fit shadow-lg transition-transform">
                                            Shop Now
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* Categories Grid - Banner Row Style */}
                <section className="space-y-6">
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-3 md:gap-4">
                        {categories.map((cat, i) => (
                            <Link
                                key={i}
                                href={cat.link || `/categories/${cat.name}`}
                                className="group flex flex-col items-center gap-3 transition-all"
                            >
                                <div className="w-16 h-16 md:w-24 md:h-24 bg-[#EAF5E9] rounded-2xl md:rounded-[32px] flex items-center justify-center group-hover:shadow-md transition-all overflow-hidden p-3 border border-transparent hover:border-green-100">
                                    <img
                                        src={cat.imageUrl || `https://ui-avatars.com/api/?name=${cat.name}&background=EAF5E9&color=2E7D32&bold=true&font-size=0.3`}
                                        className="w-full h-full object-contain rounded-lg transition-transform duration-500"
                                        alt={cat.name}
                                    />
                                </div>
                                <span className="text-[10px] md:text-[13px] font-bold text-gray-800 text-center leading-tight group-hover:text-green-700 transition-colors">
                                    {cat.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Categorized Product Sections - Blinkit Style Grid */}
                {!loading && categories.map((cat) => {
                    const catName = typeof cat === 'string' ? cat : cat.name;
                    const catProducts = products.filter(p => (typeof p.category === 'string' ? p.category : p.category?.name) === catName);

                    if (catProducts.length === 0) return null;

                    return (
                        <section id={`cat-${catName}`} key={catName} className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">{catName}</h2>
                                <Link href={`/categories/${catName}`} className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-widest px-4 py-2 hover:bg-blue-50 rounded-xl">
                                    see all
                                </Link>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-8">
                                {catProducts.slice(0, 5).map((product) => (
                                    <div
                                        key={product._id}
                                        onClick={() => router.push(`/products/${product._id}`)}
                                        className="bg-white rounded-[32px] border border-gray-100 p-2 md:p-3 hover:shadow-2xl hover:shadow-blue-100/30 transition-all flex flex-col group cursor-pointer"
                                    >
                                        <div className="relative aspect-square rounded-[24px] overflow-hidden bg-gray-50 mb-4">
                                            <img
                                                src={product.images[0]}
                                                className="w-full h-full object-cover transition-transform duration-700"
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

                                            <div className="flex flex-col gap-2 mb-4">
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md line-clamp-1">{product.description}</span>
                                                <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-md w-fit">
                                                    You can earn {product.commissionType === 'Flat' ? `₹${product.commissionValue}` : `${product.commissionValue}%`}
                                                </span>
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
                        </section>
                    );
                })}

            </main>

            {/* Footer */}
            <footer className="bg-gray-50 border-t border-gray-100 pt-20">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
                        <div className="col-span-1 md:col-span-2 space-y-8">
                            <Link href="/" className="flex items-center gap-2 w-fit">
                                <div className="bg-blue-600 p-2 rounded-xl text-white">
                                    <Truck size={24} />
                                </div>
                                <span className="text-xl md:text-2xl font-black tracking-tight">Dropship</span>
                            </Link>
                            <p className="text-gray-500 font-medium max-w-md leading-relaxed">
                                Empowering entrepreneurs to start their own e-commerce business with zero inventory and high margins. Join our community of 10,000+ happy partners.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs mb-6">Company</h4>
                            <ul className="space-y-4">
                                {['About Us', 'Terms of Service', 'Privacy Policy'].map(item => (
                                    <li key={item}>
                                        <Link href="#" className="text-gray-500 hover:text-blue-600 font-bold text-sm transition-colors">{item}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-black text-gray-900 uppercase tracking-widest text-xs mb-6">Support</h4>
                            <ul className="space-y-4">
                                {['Contact Us', 'FAQs', 'Shipping Policy'].map(item => (
                                    <li key={item}>
                                        <Link href="#" className="text-gray-500 hover:text-blue-600 font-bold text-sm transition-colors">{item}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="bg-red-600 py-5">
                    <div className="max-w-7xl mx-auto px-4 md:px-8">
                        <p className="text-[10px] md:text-xs font-black text-black uppercase tracking-widest text-center">
                            © 2026 DROPSHIPPING PLATFORM. ALL RIGHTS RESERVED.
                        </p>
                    </div>
                </div>
            </footer>
            {/* Location Modal */}
            {isLocationModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsLocationModalOpen(false)}
                    />
                    <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xl font-black text-gray-900">Change Location</h2>
                                <button
                                    onClick={() => setIsLocationModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <button
                                    onClick={handleDetectLocation}
                                    className="w-full md:w-auto flex items-center justify-center gap-3 bg-green-700 hover:bg-green-800 text-white px-8 py-4 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-green-100"
                                >
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin hidden group-active:block" />
                                    Detect my location
                                </button>

                                <div className="hidden md:flex items-center gap-4 text-gray-300 font-bold uppercase text-[10px] tracking-widest whitespace-nowrap">
                                    <div className="w-8 h-px bg-gray-100" />
                                    OR
                                    <div className="w-8 h-px bg-gray-100" />
                                </div>

                                <div className="flex-1 w-full relative group">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                        <input
                                            type="text"
                                            value={locationSearchQuery}
                                            onChange={(e) => setLocationSearchQuery(e.target.value)}
                                            placeholder="search delivery location"
                                            className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-1 focus:ring-blue-600/20 focus:border-blue-600 outline-none font-medium transition-all"
                                        />
                                    </div>

                                    {/* Suggestions List */}
                                    {locationSuggestions.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[110] animate-in fade-in slide-in-from-top-2 duration-200">
                                            {locationSuggestions.map((s) => (
                                                <button
                                                    key={s.id}
                                                    onClick={() => {
                                                        setAddress(s.name);
                                                        setIsLocationModalOpen(false);
                                                        setLocationSearchQuery("");
                                                    }}
                                                    className="w-full flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                                                >
                                                    <div className="mt-1 p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                        <Truck size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 text-sm">{s.name}</div>
                                                        <div className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mt-0.5">{s.area}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-6 border-t border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                                Select a saved address or enter a new one to continue
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
