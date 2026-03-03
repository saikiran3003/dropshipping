"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Users,
    UserPlus,
    Download,
    Search,
    Filter,
    Eye,
    Pencil,
    Trash2,
    ShieldCheck,
    CheckCircle2,
    XCircle,
    ArrowUpRight,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    X,
    MapPin,
    Phone,
    Mail,
    UserCircle,
    MoreHorizontal
} from "lucide-react";
import Swal from "sweetalert2";

const STATE_CITY_DATA = {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Kakinada", "Rajahmundry", "Kadapa", "Tirupati", "Anantapur", "Vizianagaram", "Eluru", "Ongole", "Nandyal", "Machilipatnam", "Adoni", "Tenali", "Proddatur", "Chittoor", "Hindupur", "Bhimavaram", "Madanapalle", "Guntakal", "Dharmavaram", "Gudivada", "Srikakulam", "Narasaraopet", "Rajampet", "Tadipatri", "Tadepalligudem", "Chilakaluripet", "Amalapuram", "Bapatla", "Kadiri", "Mangalagiri", "Narasapuram", "Palakollu", "Ponnur", "Rayachoti", "Tanuku", "Kavali", "Gudur", "Vinukonda", "Nuzvid", "Markapur", "Tuni", "Kandukur", "Samalkot", "Bobbili", "Rayadurg", "Ranigunta", "Srikalahasti", "Nagari", "Puttur", "Palasa-Kasibugga", "Ichapuram", "Parvathipuram", "Salur", "Jaggayyapet", "Pedana", "Mandapeta", "Pithapuram", "Ramachandrapuram", "Peddapuram", "Sattenapalle", "Macherla", "Piduguralla", "Repalle", "Jaggaiahpet", "Kovvur", "Nidadavole", "Palacole", "Akividu", "Jangareddygudem", "Palakonda", "Tekkali", "Etcherla", "Rajam", "Addanki", "Chirala", "Darsi", "Giddalur", "Kanigiri", "Podili", "Dhone", "Yemmiganur", "Nandikotkur", "Atmakur", "Banaganapalle", "Bethamcherla", "Allagadda", "Panyam", "Nagalapuram", "Satyavedu", "Vayalpadu", "Pileru", "Sodal", "Punganur", "Kuppam", "Palamener", "Venkatagiri", "Naidupeta", "Sullurpeta", "Venkateswarapuram", "Udayagiri", "Pamuru", "Bestavaripeta", "Kambham", "Cumbum", "Ardhavidu", "Donakonda", "Kurichedu", "Tripurantakam", "Yerragondapalem", "Pullalacheruvu", "Pedadarpanapalle", "Mundlamuru", "Parchur", "Panguluru", "Ballikurava", "Santhamaguluru", "Martur", "Yeddanapudi", "Vetapalem", "Karavadi", "Nagalappalapadu", "Chinkaganjam", "Kottapatnam", "Tangutur", "Kondapi", "Jarugumalli", "Zarugumilli", "Singarayakonda", "Lingasamudram", "Gudluru", "Voletivaripalem", "Ulavapadu", "Ponnaluru", "Veligandla", "Santhanuthalapadu", "Naguluppalapadu", "Korisapadu", "Pulivendula", "Badvel", "Jammalamadugu", "Mydukur", "Kamalapuram", "Koduru", "Vempalli", "Chakrayapet", "Lakkireddipalli", "Rayachoty", "Galiveedu", "Sambepalli", "Chinnamandem", "Renigunta", "Yerravaripalem", "Chandragiri", "Thottambedu", "Buchaiah Naidu Kandriga", "Varadaiahpalem", "Pichatur", "Narayanavanam", "K.V.B.Puram", "Karvetinagar", "Vedurukuppam", "Srirangarajapuram", "Palasamudram", "Gangadhara Nellore", "Penumuru", "Puthalapattu", "Irala", "Thavanampalle", "Gudipala", "Yadamarri", "Bangarupalem", "Palamaner", "Gangavaram", "Peddapanjani", "Baireddipalle", "Venkatagirikota", "Ramakuppam", "Shanthipuram", "Gudupalle", "Ibrahimpatnam", "G.Konduru", "Mylavaram", "Nandigama", "Kanchikacherla", "Veerullapadu"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Ramagundam", "Khammam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet", "Miryalaguda", "Siddipet", "Jagtial", "Mancherial", "Kothagudem", "Bodhan", "Sangareddy", "Kamareddy", "Tandur", "Koratla", "Sircilla", "Wanaparthy", "Kagaznagar", "Gadwal"],
    "Karnataka": ["Bengaluru", "Hubballi-Dharwad", "Mysuru", "Kalaburagi", "Mangaluru", "Belagavi", "Davanagere", "Ballari", "Vijayapura", "Shivamogga", "Tumakuru", "Raichur", "Bidar", "Hosapete", "Gadag-Betageri", "Hassan", "Bhadravati", "Chitradurga", "Udupi", "Kolar", "Mandya", "Chikkamagaluru", "Bagalkot", "Ranibennur", "Gangavati"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tiruppur", "Erode", "Vellore", "Thoothukudi", "Nagercoil"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Pimpri-Chinchwad", "Nashik", "Kalyan-Dombivli", "Vasai-Virar", "Aurangabad", "Navi Mumbai"],
    "Delhi": ["New Delhi", "North Delhi", "South Delhi", "West Delhi", "East Delhi", "Rohini", "Dwarka", "Janakpuri", "Vasant Kunj"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi", "Prayagraj", "Bareilly", "Aligarh", "Moradabad"],
    "West Bengal": ["Kolkata", "Howrah", "Asansol", "Siliguri", "Durgapur", "Bardhaman", "Malda", "Baharampur", "Habra", "Kharagpur"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Bharatpur", "Sikar"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Kollam", "Thrissur", "Alappuzha", "Palakkad", "Malappuram", "Ponnani", "Vatakara"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Batala", "Pathankot", "Moga"],
    "Haryana": ["Faridabad", "Gurugram", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula"],
    "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", "Arrah", "Begusarai", "Katihar"]
};

const INDIAN_STATES = Object.keys(STATE_CITY_DATA).sort();

export default function DropshipperManagement() {
    const router = useRouter();
    const [dropshippers, setDropshippers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentDropshipper, setCurrentDropshipper] = useState(null);
    const [formData, setFormData] = useState({
        name: "", email: "", mobile: "", status: "Active", state: "Andhra Pradesh", city: ""
    });

    const fetchDropshippers = async () => {
        try {
            const res = await fetch("/api/admin/dropshippers?t=" + Date.now(), { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setDropshippers(data);
                if (currentDropshipper) {
                    const latest = data.find(d => d._id === currentDropshipper._id);
                    if (latest) setCurrentDropshipper(latest);
                }
            } else {
                const errData = await res.json();
                console.error("Fetch failed:", errData);
                Swal.fire({
                    title: 'System Error',
                    text: errData.error || errData.message || 'Failed to sync data.',
                    icon: 'error'
                });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({ title: 'Connection Issue', text: err.message, icon: 'error' });
        }
    };

    useEffect(() => { fetchDropshippers(); }, []);

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        const url = "/api/admin/dropshippers";
        const method = isEditMode ? "PUT" : "POST";
        const payload = isEditMode ? { ...formData, id: currentDropshipper._id } : formData;

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                Swal.fire({ title: 'Saved!', icon: 'success', timer: 1000, showConfirmButton: false });
                closeModal();
                fetchDropshippers();
            } else {
                const err = await res.json();
                Swal.fire({ title: 'Error', text: err.message, icon: 'error' });
            }
        } catch (err) { Swal.fire({ title: 'Connection Error', icon: 'error' }); }
    };

    const handleEdit = (ds) => {
        setCurrentDropshipper(ds);
        setFormData({
            name: ds.name || "",
            email: ds.email || "",
            mobile: ds.mobile || "",
            status: ds.status || "Active",
            state: ds.state || "Andhra Pradesh",
            city: ds.city || ""
        });
        setIsEditMode(true);
        setIsAddModalOpen(true);
    };

    const handleView = (ds) => {
        setCurrentDropshipper(ds);
        setIsViewModalOpen(true);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You want to delete this partner?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });
        if (result.isConfirmed) {
            try {
                const res = await fetch(`/api/admin/dropshippers?id=${id}`, { method: 'DELETE' });
                if (res.ok) {
                    Swal.fire('Deleted!', '', 'success');
                    fetchDropshippers();
                }
            } catch (err) { Swal.fire('Error!', '', 'error'); }
        }
    };

    const closeModal = () => {
        setIsAddModalOpen(false);
        setIsViewModalOpen(false);
        setIsEditMode(false);
        setCurrentDropshipper(null);
        setFormData({ name: "", email: "", mobile: "", status: "Active", state: "Andhra Pradesh", city: "" });
    };

    const onStateChange = (stateName) => {
        const cities = STATE_CITY_DATA[stateName] || [];
        setFormData({ ...formData, state: stateName, city: cities[0] || "" });
    };

    const filtered = dropshippers.filter(ds =>
        ds.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ds.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 md:p-10 space-y-6 md:space-y-10 animate-in fade-in duration-700 bg-gray-50/50 min-h-screen font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-3 md:gap-5">
                    <button
                        onClick={() => router.push('/admin/dashboard')}
                        className="p-2 md:p-3 bg-white border border-gray-200 rounded-xl md:rounded-2xl text-gray-400 hover:text-blue-600 hover:bg-blue-50/50 hover:border-blue-100 transition-all active:scale-95 group"
                    >
                        <ArrowLeft size={20} className="md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="space-y-1">
                        <h1 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight">Dropshipper Management</h1>
                        <p className="text-xs md:text-sm text-gray-500 font-medium">Oversee partner performance and access.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-xs md:text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                        <Download size={16} /> <span className="hidden sm:inline">Export</span>
                    </button>
                    <button
                        onClick={() => { setIsEditMode(false); setIsAddModalOpen(true); }}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 bg-blue-600 rounded-xl text-xs md:text-sm font-black text-white shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                    >
                        <UserPlus size={16} /> <span className="whitespace-nowrap">Add Partner</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[
                    { label: "Total Dropshippers", val: dropshippers.length.toLocaleString(), trend: "+12% this month", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Pending Requests", val: dropshippers.filter(d => d.status === 'Pending Approval').length, desc: "Requiring review", icon: UserPlus, color: "text-orange-600", bg: "bg-orange-50" },
                    { label: "Total Sales (MTD)", val: "0.00", trend: "+5.4%", icon: ArrowUpRight, color: "text-green-600", bg: "bg-green-50" },
                    { label: "Active Partners", val: dropshippers.filter(d => d.status === 'Active').length, progress: 75, icon: CheckCircle2, color: "text-blue-500", bg: "bg-blue-50" },
                ].map((s, i) => (
                    <div key={i} className="bg-white p-5 md:p-7 rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="flex justify-between items-start mb-3 md:mb-4 relative z-10">
                            <div className={`${s.bg} ${s.color} p-2.5 md:p-3.5 rounded-xl md:rounded-2xl`}>
                                <s.icon size={20} className="md:w-[22px] md:h-[22px]" />
                            </div>
                        </div>
                        <div className="space-y-1 relative z-10">
                            <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
                            <h3 className="text-2xl md:text-3xl font-black text-gray-900">{s.val}</h3>
                        </div>
                        {s.trend && <p className="mt-3 md:mt-4 text-[10px] md:text-xs font-bold text-green-500 flex items-center gap-1"><ArrowUpRight size={12} className="md:w-3.5 md:h-3.5" /> {s.trend}</p>}
                        {s.desc && <p className="mt-3 md:mt-4 text-[10px] md:text-xs font-bold text-orange-500">{s.desc}</p>}
                    </div>
                ))}
            </div>

            {/* Main Table Area */}
            <div className="bg-white rounded-3xl md:rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                {/* Table Filters */}
                <div className="p-4 md:p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 bg-gray-50/20">
                    <div className="relative flex-1 max-w-md w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search partners..."
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl md:rounded-2xl focus:ring-4 focus:ring-blue-500/5 outline-none transition-all font-bold text-xs md:text-sm placeholder:font-medium shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <select className="flex-1 md:flex-none px-4 md:px-5 py-3 bg-white border border-gray-200 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold text-gray-600 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all cursor-pointer">
                            <option>All Statuses</option>
                            <option>Active</option>
                            <option>Pending</option>
                            <option>Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50/30">
                                <th className="px-5 md:px-8 py-4 md:py-5 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Dropshipper</th>
                                <th className="px-5 md:px-8 py-4 md:py-5 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-5 md:px-8 py-4 md:py-5 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Total Sales</th>
                                <th className="px-5 md:px-8 py-4 md:py-5 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Total Earnings</th>
                                <th className="px-5 md:px-8 py-4 md:py-5 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Subscription</th>
                                <th className="px-5 md:px-8 py-4 md:py-5 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Joined Date</th>
                                <th className="px-5 md:px-8 py-4 md:py-5 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.length === 0 ? (
                                <tr><td colSpan="7" className="px-8 py-32 text-center text-gray-400 font-bold italic">No partners found matching your search.</td></tr>
                            ) : (
                                filtered.map((ds) => (
                                    <tr key={ds._id} className="hover:bg-gray-50/50 transition-all font-bold group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-xs uppercase shadow-inner">{ds.name.charAt(0)}</div>
                                                <div>
                                                    <p className="text-sm text-gray-900 leading-none">{ds.name}</p>
                                                    <p className="text-[10px] text-gray-400 mt-1.5">{ds.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${ds.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${ds.status === 'Active' ? 'bg-green-600 animate-pulse' : 'bg-gray-500'}`} /> {ds.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-sm text-gray-900 font-black text-center">{ds.totalSales || 0}</td>
                                        <td className="px-8 py-6 text-sm text-blue-600 font-black text-center">₹{ds.totalEarnings || 0}</td>
                                        <td className="px-8 py-6 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${ds.subscriptionStatus === 'Added' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${ds.subscriptionStatus === 'Added' ? 'bg-green-600' : 'bg-red-600'}`} /> {ds.subscriptionStatus || 'Not-added'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-[11px] text-gray-400 uppercase font-bold text-center">
                                            {ds.createdAt ? new Date(ds.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Oct 12, 2023'}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-center gap-3">
                                                <button onClick={() => handleView(ds)} className="p-2 text-gray-400 hover:text-blue-600 transition-all"><Eye size={18} /></button>
                                                <button onClick={() => handleEdit(ds)} className="p-2 text-gray-400 hover:text-green-600 transition-all"><Pencil size={18} /></button>
                                                <button onClick={() => handleDelete(ds._id)} className="p-2 text-gray-400 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-5 md:p-8 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/10">
                    <p className="text-[10px] md:text-xs font-bold text-gray-400">Showing 1- {filtered.length} of {filtered.length} partners</p>
                    <div className="flex items-center gap-2">
                        <button className="p-2 bg-gray-100 rounded-lg text-gray-400"><ChevronLeft size={14} /></button>
                        <button className="w-7 h-7 md:w-8 md:h-8 bg-blue-600 rounded-lg text-white font-black text-[10px] md:text-xs">1</button>
                        <button className="w-7 h-7 md:w-8 md:h-8 bg-white border border-gray-100 rounded-lg text-gray-500 font-black text-[10px] md:text-xs">2</button>
                        <button className="p-2 bg-white border border-gray-100 rounded-lg text-gray-400"><ChevronRight size={14} /></button>
                    </div>
                </div>
            </div>

            {/* Bottom Insight Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 pb-10">
                <div className="bg-white p-6 md:p-10 rounded-3xl md:rounded-[44px] border border-gray-50 shadow-sm">
                    <div className="flex items-center justify-between mb-6 md:mb-8">
                        <h2 className="text-lg md:text-xl font-black text-gray-900 tracking-tight">Newest Applicants</h2>
                        <button className="text-[10px] md:text-xs font-black text-blue-600 hover:underline">View All</button>
                    </div>
                    <div className="space-y-4 md:space-y-6">
                        {dropshippers.slice(0, 2).map((app, i) => (
                            <div key={i} className="flex items-center justify-between p-4 md:p-6 bg-gray-50/50 border border-gray-100 rounded-2xl md:rounded-[32px] group hover:bg-white hover:shadow-lg transition-all">
                                <div className="flex items-center gap-3 md:gap-5">
                                    <div className="w-10 h-10 md:w-14 md:h-14 bg-white rounded-xl md:rounded-2xl flex items-center justify-center text-blue-600 font-black shadow-sm ring-4 ring-gray-100 group-hover:ring-blue-50 transition-all">{app.name.charAt(0)}</div>
                                    <div>
                                        <p className="text-sm md:text-base font-black text-gray-900 leading-tight">{app.name}</p>
                                        <p className="text-[8px] md:text-[10px] font-black text-gray-400 mt-1 uppercase tracking-widest">{app.city || 'Partner'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 md:gap-3">
                                    <button className="p-2 md:p-3 bg-white text-green-500 rounded-xl md:rounded-2xl shadow-sm border border-gray-100"><CheckCircle2 size={16} className="md:w-5 md:h-5" /></button>
                                    <button className="p-2 md:p-3 bg-white text-red-400 rounded-xl md:rounded-2xl shadow-sm border border-gray-100"><XCircle size={16} className="md:w-5 md:h-5" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Announcements Section - Optimized for mobile */}
                <div className="bg-blue-600 p-8 md:p-12 rounded-3xl md:rounded-[50px] text-white relative overflow-hidden shadow-2xl shadow-blue-100 group">
                    <div className="absolute -right-20 -top-20 w-48 md:w-64 h-48 md:h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="relative z-10 space-y-4 md:space-y-6">
                        <h2 className="text-xl md:text-3xl font-black italic tracking-tight text-center md:text-left">Announcements</h2>
                        <p className="text-blue-100 text-xs md:text-sm font-medium leading-relaxed max-w-sm text-center md:text-left mx-auto md:mx-0">Keep your partners updated with the latest policies and product drops.</p>
                        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 md:gap-4">
                            <button className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-white text-blue-700 font-black rounded-xl md:rounded-2xl shadow-2xl text-[10px] md:text-xs uppercase tracking-widest active:scale-95">Broadcast</button>
                            <button className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 bg-blue-500/50 text-white font-black rounded-xl md:rounded-2xl border border-blue-400 text-[10px] md:text-xs uppercase tracking-widest">Policies</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Modal */}
            {isViewModalOpen && currentDropshipper && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[48px] w-full max-w-md p-10 relative shadow-2xl animate-in zoom-in-95">
                        <button onClick={closeModal} className="absolute right-8 top-8 p-3 hover:bg-gray-100 rounded-2xl text-gray-400 hover:text-red-500 transition-all"><X size={20} /></button>
                        <div className="flex flex-col items-center text-center mb-10">
                            <div className="w-24 h-24 bg-blue-50 text-blue-700 rounded-[34px] flex items-center justify-center mb-5 shadow-inner ring-[12px] ring-blue-50/20"><UserCircle size={48} /></div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none">{currentDropshipper.name}</h2>
                            <p className="text-[11px] font-black text-blue-500 uppercase tracking-[0.3em] mt-3 bg-blue-50 px-5 py-1.5 rounded-full">{currentDropshipper.status}</p>
                        </div>
                        <div className="space-y-3">
                            {[
                                { icon: Phone, label: "Mobile Contact", val: currentDropshipper.mobile },
                                { icon: Mail, label: "Official Email", val: currentDropshipper.email },
                                { icon: MapPin, label: "Assigned City", val: currentDropshipper.city },
                                { icon: ShieldCheck, label: "Home State", val: currentDropshipper.state },
                                { icon: CheckCircle2, label: "Subscription Status", val: currentDropshipper.subscriptionStatus || 'Not-added' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-5 p-5 bg-gray-50/60 rounded-[32px] border border-gray-100 transition-all hover:bg-white hover:shadow-md group">
                                    <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm group-hover:scale-110 transition-transform"><item.icon size={20} /></div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">{item.label}</p>
                                        <p className="text-sm font-black text-gray-900">{item.val || 'Not Provided'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {/* Edit/Register Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] md:rounded-[50px] w-full max-w-2xl p-6 md:p-12 relative shadow-2xl animate-in slide-in-from-bottom-10 max-h-[90vh] overflow-y-auto scrollbar-hide">
                        <button onClick={closeModal} className="absolute right-4 md:right-8 top-4 md:top-8 p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-red-500 transition-all"><X size={20} /></button>
                        <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-50 text-blue-600 rounded-2xl md:rounded-[28px] flex items-center justify-center shadow-inner"><UserPlus size={24} className="md:w-8 md:h-8" /></div>
                            <div>
                                <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight leading-none">{isEditMode ? "Modify Partner" : "Register Partner"}</h2>
                                <p className="text-[10px] md:text-xs font-black text-gray-400 mt-1 md:mt-2 uppercase tracking-widest opacity-60">Complete all required fields</p>
                            </div>
                        </div>
                        <form onSubmit={handleCreateAccount} className="space-y-6 md:space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 text-left">
                                <div className="sm:col-span-2 space-y-1.5 md:space-y-2">
                                    <label className="text-[9px] md:text-[10px] uppercase font-black ml-2 text-gray-500 tracking-widest">Full Name <span className="text-red-500">*</span></label>
                                    <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-5 py-3.5 md:px-6 md:py-4.5 bg-gray-50 border-2 border-transparent focus:border-blue-500/10 rounded-xl md:rounded-[24px] outline-none font-black text-xs md:text-sm text-gray-900 transition-all focus:bg-white shadow-sm" placeholder="Alex Johnson" />
                                </div>
                                <div className="space-y-1.5 md:space-y-2">
                                    <label className="text-[9px] md:text-[10px] uppercase font-black ml-2 text-gray-500 tracking-widest">Email Address <span className="text-red-500">*</span></label>
                                    <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-5 py-3.5 md:px-6 md:py-4.5 bg-gray-50 border-2 border-transparent focus:border-blue-500/10 rounded-xl md:rounded-[24px] outline-none font-black text-xs md:text-sm text-gray-900 transition-all focus:bg-white shadow-sm" placeholder="alex@gmail.com" />
                                </div>
                                <div className="space-y-1.5 md:space-y-2">
                                    <label className="text-[9px] md:text-[10px] uppercase font-black ml-2 text-gray-500 tracking-widest">Mobile Contact <span className="text-red-500">*</span></label>
                                    <input required maxLength={10} value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })} className="w-full px-5 py-3.5 md:px-6 md:py-4.5 bg-gray-50 border-2 border-transparent focus:border-blue-500/10 rounded-xl md:rounded-[24px] outline-none font-black text-xs md:text-sm text-gray-900 transition-all focus:bg-white shadow-sm" placeholder="10 Digits Only" />
                                </div>
                                <div className="space-y-1.5 md:space-y-2">
                                    <label className="text-[9px] md:text-[10px] uppercase font-black ml-2 text-gray-500 tracking-widest">Partner State <span className="text-red-500">*</span></label>
                                    <select value={formData.state} onChange={e => onStateChange(e.target.value)} className="w-full px-5 py-3.5 md:px-6 md:py-4.5 bg-gray-50 border-2 border-transparent focus:border-blue-500/10 rounded-xl md:rounded-[24px] outline-none font-black text-xs md:text-sm text-gray-900 transition-all focus:bg-white shadow-sm cursor-pointer appearance-none">
                                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5 md:space-y-2">
                                    <label className="text-[9px] md:text-[10px] uppercase font-black ml-2 text-gray-500 tracking-widest">Select City <span className="text-red-500">*</span></label>
                                    <select required value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full px-5 py-3.5 md:px-6 md:py-4.5 bg-gray-50 border-2 border-transparent focus:border-blue-500/10 rounded-xl md:rounded-[24px] outline-none font-black text-xs md:text-sm text-gray-900 transition-all focus:bg-white shadow-sm cursor-pointer appearance-none">
                                        <option value="" disabled>Select Location</option>
                                        {([...new Set(STATE_CITY_DATA[formData.state] || [])]).sort().map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="sm:col-span-2 space-y-1.5 md:space-y-2">
                                    <label className="text-[9px] md:text-[10px] uppercase font-black ml-2 text-gray-500 tracking-widest">Account Status</label>
                                    <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full px-5 py-3.5 md:px-6 md:py-4.5 bg-gray-50 border-2 border-transparent focus:border-blue-500/10 rounded-xl md:rounded-[24px] outline-none font-black text-xs md:text-sm text-gray-900 transition-all focus:bg-white shadow-sm cursor-pointer appearance-none">
                                        <option value="Active">Authorized (Active)</option>
                                        <option value="Pending Approval">Review (Pending)</option>
                                        <option value="Inactive">Restricted (Inactive)</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="w-full py-4 md:py-6 bg-blue-600 text-white font-black rounded-2xl md:rounded-3xl shadow-2xl shadow-blue-100 uppercase tracking-widest text-sm md:text-base hover:bg-blue-700 transition-all active:scale-[0.98] mt-2">Save Partner</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
