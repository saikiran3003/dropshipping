"use client";

import { useState, useEffect, use } from "react";
import { FileText, Loader2, Home, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CMSPage({ params }) {
    const { slug } = use(params);
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                const res = await fetch(`/api/cms/${slug}`);
                if (res.ok) {
                    const data = await res.json();
                    setPage(data);
                }
            } catch (error) {
                console.error("Failed to fetch page:", error);
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchPage();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <FileText className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600/20" size={24} />
                </div>
                <p className="mt-6 text-gray-400 font-black uppercase tracking-[0.2em] text-[10px]">Preparing Content</p>
            </div>
        );
    }

    if (!page) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white p-8">
                <div className="w-24 h-24 bg-red-50 text-red-600 rounded-[32px] flex items-center justify-center mb-8 animate-bounce">
                    <FileText size={48} />
                </div>
                <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">Content Not Found</h1>
                <p className="text-gray-500 font-medium mb-10 text-center max-w-sm leading-relaxed">The page you're looking for might have been moved or deleted.</p>
                <Link href="/" className="group flex items-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-[20px] font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-gray-200">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100">
            {/* Premium Sticky Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-gray-100/50">
                <div className="max-w-5xl mx-auto px-6 h-20 md:h-24 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="bg-blue-600 p-2 rounded-xl text-white group-hover:scale-110 transition-transform shadow-lg shadow-blue-200">
                            <Home size={20} />
                        </div>
                        <span className="text-xl md:text-2xl font-black tracking-tight">Dropship</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100">
                        <Link href="/" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-600 transition-colors">Home</Link>
                        <ChevronRight size={12} className="text-gray-300" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">{page.title}</span>
                    </nav>

                    <Link href="/dropshipper/login" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:underline">
                        Partner Login
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <div className="relative py-20 md:py-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-50/50 via-white to-white opacity-70"></div>
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full text-blue-600 text-[10px] font-black uppercase tracking-widest mb-8 border border-blue-100/50">
                        <FileText size={12} />
                        Official Information
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight mb-6 leading-[1.1]">
                        {page.title}
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-[10px]">
                        Last Updated: {new Date(page.updatedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="max-w-4xl mx-auto px-6 pb-32 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                <div className="bg-white rounded-[48px] md:rounded-[64px] p-8 md:p-20 border border-gray-100 shadow-2xl shadow-gray-100/30 ring-1 ring-gray-50">
                    <article className="prose prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:text-gray-600 prose-p:leading-relaxed">
                        <div
                            dangerouslySetInnerHTML={{ __html: page.content }}
                            className="cms-content-raw"
                        />
                    </article>

                    {/* Share / Action bar */}
                    <div className="mt-20 pt-12 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h4 className="font-black text-gray-900 mb-1">Was this helpful?</h4>
                            <p className="text-sm text-gray-400 font-medium tracking-tight">Help us improve by giving feedback.</p>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-6 py-3 bg-gray-50 text-gray-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95 border border-gray-100">Yes</button>
                            <button className="px-6 py-3 bg-gray-50 text-gray-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95 border border-gray-100">No</button>
                        </div>
                    </div>
                </div>

                {/* Footer Link */}
                <div className="mt-20 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-blue-600 transition-colors group">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Return to Homepage
                    </Link>
                </div>
            </main>

            <style jsx global>{`
                .cms-content-raw {
                    font-size: 1.125rem;
                    line-height: 1.8;
                    color: #4b5563;
                }
                .cms-content-raw h2 {
                    font-size: 2rem;
                    font-weight: 900;
                    margin-top: 3rem;
                    margin-bottom: 1.5rem;
                    color: #111827;
                    letter-spacing: -0.025em;
                }
                .cms-content-raw h3 {
                    font-size: 1.5rem;
                    font-weight: 800;
                    margin-top: 2.5rem;
                    margin-bottom: 1rem;
                    color: #1f2937;
                    letter-spacing: -0.01em;
                }
                .cms-content-raw p {
                    margin-bottom: 1.5rem;
                }
                .cms-content-raw ul, .cms-content-raw ol {
                    margin-bottom: 1.5rem;
                    padding-left: 1.5rem;
                }
                .cms-content-raw li {
                    margin-bottom: 0.5rem;
                }
                .cms-content-raw a {
                    color: #2563eb;
                    text-decoration: underline;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
}
