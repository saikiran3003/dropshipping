"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ShieldCheck, Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";

export default function DropshipperLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/dropshipper/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                Swal.fire({
                    title: "Login Successful",
                    text: "Welcome back, Partner!",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false,
                    background: '#ffffff',
                    customClass: {
                        popup: 'rounded-[32px]',
                    }
                });
                setTimeout(() => {
                    router.push("/dropshipper/dashboard");
                }, 1500);
            } else {
                setError(data.error || "Login failed");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden p-8 border border-gray-100">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200 mb-4">
                        <ShieldCheck className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Partner Login</h1>
                    <p className="text-gray-500 text-sm italic">Secure access for Dropshippers</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                <Mail size={18} />
                            </span>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-gray-900"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                <Lock size={18} />
                            </span>
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-12 pr-14 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-gray-900"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-black active:scale-[0.98] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-200 disabled:opacity-70"
                    >
                        {loading ? "Authenticating..." : "Login to Portal"}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest opacity-60">
                        Secure Partner Access Only
                    </p>
                </div>
            </div>
        </div>
    );
}
