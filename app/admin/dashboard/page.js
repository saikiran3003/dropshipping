"use client";

import { useState, useEffect } from "react";
import {
    Users,
    Package,
    ShoppingCart,
    TrendingUp,
    Clock,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Eye,
    Bell,
    MessageSquare,
    Search
} from "lucide-react";

export default function DashboardPage() {
    const [counts, setCounts] = useState({
        totalDropshippers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingPayments: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/admin/stats?t=" + Date.now());
                if (res.ok) {
                    const data = await res.json();
                    setCounts(data);
                }
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
            }
        };
        fetchStats();
    }, []);

    const stats = [
        { label: "Total Dropshippers", value: counts.totalDropshippers.toLocaleString(), icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+ 0%" },
        { label: "Total Products", value: counts.totalProducts.toLocaleString(), icon: Package, color: "text-purple-600", bg: "bg-purple-50", trend: "+ 0%" },
        { label: "Total Orders", value: counts.totalOrders.toLocaleString(), icon: ShoppingCart, color: "text-orange-600", bg: "bg-orange-50", trend: "+ 0%" },
        { label: "Total Revenue", value: `₹${counts.totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-green-600", bg: "bg-green-50", trend: "+ 0%" },
        { label: "Pending Payments", value: counts.pendingPayments.toLocaleString(), icon: Clock, color: "text-red-600", bg: "bg-red-50", trend: "- 0%" },
    ];

    const recentOrders = [
        // Empty for initial state
    ];

    return (
        <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Top Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 leading-tight tracking-tight">Dashboard Overview</h1>
                    <p className="text-xs md:text-sm text-gray-500 font-medium">Welcome back, Admin. Here's what's happening today.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 md:gap-4">
                    <div className="relative group flex-1 min-w-[200px] lg:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Search data..."
                            className="w-full lg:w-64 bg-white border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 px-10 py-2.5 rounded-xl outline-none transition-all font-medium text-sm shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-600 relative shadow-sm active:scale-95">
                            <Bell size={18} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </button>
                        <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-600 shadow-sm active:scale-95">
                            <MessageSquare size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-5 md:p-7 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                        <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.bg} ${stat.color} rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform`}>
                            <stat.icon size={20} className="md:w-6 md:h-6" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-xl md:text-2xl font-black text-gray-900">{stat.value}</h3>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <span className={`text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full ${stat.trend.includes("+") ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
                                {stat.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 md:gap-10">
                {/* Revenue Chart Section */}
                <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-12">
                        <div className="space-y-1">
                            <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">Revenue Analytics</h2>
                            <p className="text-xs md:text-sm text-gray-500 font-medium">Monitoring gross sales performance</p>
                        </div>
                        <select className="w-full sm:w-auto bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold text-gray-600 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all">
                            <option>Last 7 Months</option>
                            <option>Last Year</option>
                        </select>
                    </div>

                    {/* Mock Chart Area */}
                    <div className="h-[250px] md:h-[350px] w-full flex flex-col justify-end relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/20 to-transparent rounded-3xl" />
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-center px-6">
                            <div className="w-16 h-16 bg-blue-50 text-blue-200 rounded-full flex items-center justify-center mb-4">
                                <TrendingUp size={32} />
                            </div>
                            <p className="text-xs md:text-sm font-bold italic max-w-xs">Data patterns will visualize here as transactions are processed across the platform.</p>
                        </div>
                        {/* Bottom Months Labels */}
                        <div className="flex justify-between mt-8 border-t border-gray-100 pt-6 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] overflow-x-auto scrollbar-hide">
                            <span className="min-w-[40px] text-center">Jan</span>
                            <span className="min-w-[40px] text-center">Feb</span>
                            <span className="min-w-[40px] text-center">Mar</span>
                            <span className="min-w-[40px] text-center">Apr</span>
                            <span className="min-w-[40px] text-center">May</span>
                            <span className="min-w-[40px] text-center">Jun</span>
                            <span className="min-w-[40px] text-center">Jul</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-3xl md:rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 md:p-10 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
                    <div className="space-y-1">
                        <h2 className="text-xl md:text-2xl font-black text-gray-900">Recent Orders</h2>
                        <p className="text-xs md:text-sm text-gray-500 font-medium">Manage latest customer acquisitions</p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button className="flex-1 sm:flex-none bg-blue-600 text-white px-5 md:px-7 py-2.5 rounded-xl text-xs md:text-sm font-black shadow-lg shadow-blue-100 active:scale-95 transition-all">Export All</button>
                        <button className="flex-1 sm:flex-none bg-gray-50 text-gray-600 px-5 md:px-7 py-2.5 rounded-xl text-xs md:text-sm font-black hover:bg-gray-100 transition-all border border-gray-200 active:scale-95">Filter</button>
                    </div>
                </div>
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 md:px-10 py-5 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</th>
                                <th className="px-6 md:px-10 py-5 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Partner</th>
                                <th className="px-6 md:px-10 py-5 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 md:px-10 py-5 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                                <th className="px-6 md:px-10 py-5 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Revenue</th>
                                <th className="px-6 md:px-10 py-5 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-10 py-24 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                                                <ShoppingCart size={32} />
                                            </div>
                                            <p className="text-sm md:text-base text-gray-400 font-bold italic">No active orders found in the system pipeline.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                recentOrders.map((order) => (
                                    null
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-6 bg-gray-50/30 text-center border-t border-gray-50">
                    <button className="text-blue-600 font-black hover:underline text-xs md:text-sm uppercase tracking-widest">View Detailed Ledger</button>
                </div>
            </div>
        </div>
    );
}
