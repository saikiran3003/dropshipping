"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Package,
    LogOut,
    Truck,
    XCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import Link from "next/link";

export default function AdminLayout({ children }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "Want to logout?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                await fetch("/api/admin/logout", { method: "POST" });
                Swal.fire({
                    title: 'Logged out!',
                    text: 'Logout successfully',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false
                });
                setTimeout(() => {
                    router.push("/admin/login");
                }, 1500);
            } catch (err) {
                console.error("Logout failed", err);
            }
        }
    };

    const navItems = [
        { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
        { label: "Dropshippers", icon: Users, path: "/admin/dropshipping" },
        { label: "Products", icon: Package, path: "/admin/products" },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 lg:static z-50 bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0 w-64 md:w-72" : "-translate-x-full lg:translate-x-0 w-0 lg:w-24 overflow-hidden"
                    }`}
            >
                {/* Logo Section */}
                <div className="p-6 flex items-center justify-between lg:justify-start gap-3 border-b lg:border-none border-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl text-white">
                            <Truck size={24} />
                        </div>
                        <div className={`${!isSidebarOpen && "lg:hidden"}`}>
                            <h1 className="font-bold text-gray-900 leading-none">Dropship</h1>
                            <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Admin Portal</span>
                        </div>
                    </div>
                    {/* Close button for mobile */}
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
                    >
                        <XCircle size={24} />
                    </button>
                </div>

                {/* Navigation */}
                <div className="mt-8 flex-1 px-4 space-y-2 overflow-y-auto">
                    <p className={`${isSidebarOpen ? "block" : "hidden"} text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 ml-2`}>
                        Menu
                    </p>
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.path}
                            onClick={() => { if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === item.path
                                ? "bg-blue-50 text-blue-600 font-semibold shadow-sm shadow-blue-50"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <item.icon size={20} className="shrink-0" />
                            <span className={isSidebarOpen ? "block" : "lg:hidden"}>{item.label}</span>
                            {pathname === item.path && isSidebarOpen && (
                                <div className="ml-auto w-1 h-5 bg-blue-600 rounded-full" />
                            )}
                        </Link>
                    ))}
                </div>

                {/* Logout */}
                <div className="p-4 border-t border-gray-50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all group"
                    >
                        <LogOut size={20} className="shrink-0 group-hover:scale-110 transition-transform" />
                        <span className={`font-semibold ${isSidebarOpen ? "block" : "lg:hidden"}`}>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative h-screen">
                {/* Top Navbar for Mobile */}
                <header className="h-16 lg:h-0 bg-white lg:bg-transparent border-b lg:border-none border-gray-100 flex items-center px-4 lg:hidden shrink-0">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 text-gray-600"
                    >
                        <LayoutDashboard size={24} />
                    </button>
                    <div className="ml-4 flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                            <Truck size={18} />
                        </div>
                        <span className="font-bold text-gray-900">Dropship Admin</span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto w-full">
                    <div className="p-4 md:p-8 max-w-[1400px] mx-auto w-full">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
