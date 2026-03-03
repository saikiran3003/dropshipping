import { Package } from "lucide-react";

export default function ProductsPage() {
    return (
        <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 leading-tight tracking-tight">Products Inventory</h1>
                <p className="text-xs md:text-sm text-gray-500 font-medium">Manage and monitor your global product catalogue.</p>
            </div>

            {/* Placeholder for future product management features */}
            <div className="bg-white p-10 md:p-20 rounded-3xl md:rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 md:w-24 md:h-24 bg-blue-50 text-blue-200 rounded-full flex items-center justify-center mb-6">
                    <Package size={48} className="md:w-16 md:h-16" />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-2">Inventory Management Coming Soon</h2>
                <p className="text-xs md:text-sm text-gray-400 font-bold italic max-w-md">Our engineers are polishing the bulk upload and inventory tracking tools. Stay tuned for a premium experience.</p>
            </div>
        </div>
    );
}
