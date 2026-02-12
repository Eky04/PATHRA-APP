'use client';

import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Users,
    Crown,
    ClipboardCheck,
    Search,
    CheckCircle2,
    XCircle,
    Clock,
    TrendingUp,
    Shield,
    UserCheck,
    CalendarDays,
    Eye,
    ChevronDown,
    MapPin,
    User,
    Mail,
    UtensilsCrossed
} from 'lucide-react';

interface UserData {
    id: number;
    name: string;
    email: string;
    username: string;
    role: string;
    isPremium: boolean;
    premiumSince?: string;
    joinedAt: string;
    points?: number;
}

interface AgendaData {
    id: number;
    title: string;
    groupName: string;
    creator: string;
    activityType: string;
    date: string;
    time: string;
    location: string;
    maxParticipants: number;
    currentParticipants: number;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    description: string;
}

const SEED_AGENDAS: AgendaData[] = [
    {
        id: 1, title: 'Morning Run Bareng', groupName: 'Jakarta Runners', creator: 'Rina Setiawan',
        activityType: 'Jogging', date: '2026-02-20', time: '06:00', location: 'GBK Senayan, Jakarta',
        maxParticipants: 20, currentParticipants: 8, status: 'pending', createdAt: '2026-02-12',
        description: 'Lari pagi bersama di GBK, 5km santai. Cocok untuk pemula dan intermediate.'
    },
    {
        id: 2, title: 'Yoga Sunset Session', groupName: 'Bali Fitness Club', creator: 'Sari Dewi',
        activityType: 'Yoga', date: '2026-02-22', time: '17:00', location: 'Pantai Kuta, Bali',
        maxParticipants: 15, currentParticipants: 5, status: 'pending', createdAt: '2026-02-11',
        description: 'Sesi yoga menyaksikan sunset di pantai. Bawa matras dan air minum.'
    },
    {
        id: 3, title: 'Weekend Cycling Tour', groupName: 'Bandung Cyclist', creator: 'Rizky Fauzan',
        activityType: 'Cycling', date: '2026-02-23', time: '07:00', location: 'Lembang, Bandung',
        maxParticipants: 30, currentParticipants: 12, status: 'approved', createdAt: '2026-02-10',
        description: 'Gowes weekend ke Lembang, rute 25km, pemandangan indah.'
    },
    {
        id: 4, title: 'Gym Challenge Day', groupName: 'Jakarta Runners', creator: 'Rina Setiawan',
        activityType: 'Gym', date: '2026-02-25', time: '18:00', location: 'Gold Gym Sudirman, Jakarta',
        maxParticipants: 10, currentParticipants: 3, status: 'rejected', createdAt: '2026-02-09',
        description: 'Challenge angkat beban antar anggota grup. Ada hadiah untuk pemenang!'
    },
    {
        id: 5, title: 'Renang Pagi Bareng', groupName: 'Surabaya Active', creator: 'Dian Lestari',
        activityType: 'Renang', date: '2026-02-28', time: '06:30', location: 'Kolam Renang Kenjeran, Surabaya',
        maxParticipants: 12, currentParticipants: 4, status: 'pending', createdAt: '2026-02-12',
        description: 'Renang pagi di kolam Olympic. Setelah renang bisa sarapan bareng.'
    },
];

type TabId = 'overview' | 'premium' | 'agendas';

export function AdminPage() {
    const [activeTab, setActiveTab] = useState<TabId>('overview');
    const [users, setUsers] = useState<UserData[]>([]);
    const [agendas, setAgendas] = useState<AgendaData[]>([]);
    const [searchUser, setSearchUser] = useState('');
    const [filterPremium, setFilterPremium] = useState<'all' | 'premium' | 'free'>('all');
    const [filterAgendaStatus, setFilterAgendaStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [showToast, setShowToast] = useState('');
    const [expandedAgenda, setExpandedAgenda] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    // Load real users from API + merge with localStorage premium status
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/admin/users');
                if (res.ok) {
                    const dbUsers = await res.json();

                    // Load premium status from localStorage
                    const premiumData = JSON.parse(localStorage.getItem('premiumStatus') || '{}') as Record<string, { isPremium: boolean; premiumSince?: string }>;

                    // Merge: DB users + localStorage premium status
                    const merged: UserData[] = dbUsers.map((u: any) => ({
                        id: u.id,
                        name: u.name,
                        email: u.email,
                        username: u.username,
                        role: u.role,
                        joinedAt: u.joinedAt,
                        points: u.points || 0,
                        // Admin is always premium; for others check localStorage
                        isPremium: u.role === 'admin' ? true : (premiumData[u.id]?.isPremium ?? false),
                        premiumSince: u.role === 'admin' ? u.joinedAt : premiumData[u.id]?.premiumSince,
                    }));

                    setUsers(merged);
                } else {
                    // Fallback to localStorage seed data
                    loadFallbackUsers();
                }
            } catch {
                loadFallbackUsers();
            }
            setLoading(false);
        };

        const loadFallbackUsers = () => {
            const saved = localStorage.getItem('adminUsers');
            if (saved) {
                setUsers(JSON.parse(saved));
            }
        };

        fetchUsers();

        // Load agendas from shared localStorage
        const savedAgendas = localStorage.getItem('communityAgendas');
        if (savedAgendas) {
            setAgendas(JSON.parse(savedAgendas));
        } else {
            setAgendas(SEED_AGENDAS);
            localStorage.setItem('communityAgendas', JSON.stringify(SEED_AGENDAS));
        }

        // Listen for new agendas created from community page
        const handleAgendaUpdate = () => {
            const updated = localStorage.getItem('communityAgendas');
            if (updated) setAgendas(JSON.parse(updated));
        };
        window.addEventListener('agendaUpdated', handleAgendaUpdate);
        return () => window.removeEventListener('agendaUpdated', handleAgendaUpdate);
    }, []);

    const toast = (msg: string) => {
        setShowToast(msg);
        setTimeout(() => setShowToast(''), 2500);
    };

    const togglePremium = (userId: number) => {
        const user = users.find((u) => u.id === userId);
        if (!user) return;

        const newPremiumState = !user.isPremium;

        // Update users state
        const updated = users.map((u) =>
            u.id === userId
                ? {
                    ...u,
                    isPremium: newPremiumState,
                    premiumSince: newPremiumState ? new Date().toISOString().split('T')[0] : undefined,
                }
                : u
        );
        setUsers(updated);

        // Save premium status to shared localStorage key
        const premiumData = JSON.parse(localStorage.getItem('premiumStatus') || '{}');
        premiumData[userId] = {
            isPremium: newPremiumState,
            premiumSince: newPremiumState ? new Date().toISOString().split('T')[0] : null,
        };
        localStorage.setItem('premiumStatus', JSON.stringify(premiumData));

        // Also keep legacy adminUsers key in sync
        localStorage.setItem('adminUsers', JSON.stringify(updated));

        // Notify sidebar about premium change
        window.dispatchEvent(new CustomEvent('premiumUpdated'));

        toast(`${user.name} ${newPremiumState ? 'diaktifkan' : 'dicabut'} Premium ✅`);
    };

    const updateAgendaStatus = (agendaId: number, status: 'approved' | 'rejected') => {
        const updated = agendas.map((a) =>
            a.id === agendaId ? { ...a, status } : a
        );
        setAgendas(updated);
        localStorage.setItem('communityAgendas', JSON.stringify(updated));

        // Notify community page
        window.dispatchEvent(new CustomEvent('agendaUpdated'));

        const agenda = updated.find((a) => a.id === agendaId);
        toast(`Agenda "${agenda?.title}" ${status === 'approved' ? 'disetujui' : 'ditolak'} ✅`);
    };

    // Filtered data
    const filteredUsers = users.filter((u) => {
        const matchesSearch =
            u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
            u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
            u.username.toLowerCase().includes(searchUser.toLowerCase());
        const matchesFilter =
            filterPremium === 'all' ||
            (filterPremium === 'premium' && u.isPremium) ||
            (filterPremium === 'free' && !u.isPremium);
        return matchesSearch && matchesFilter;
    });

    const filteredAgendas = agendas.filter((a) =>
        filterAgendaStatus === 'all' || a.status === filterAgendaStatus
    );

    // Stats
    const totalUsers = users.length;
    const premiumUsers = users.filter((u) => u.isPremium).length;
    const pendingAgendas = agendas.filter((a) => a.status === 'pending').length;
    const approvedAgendas = agendas.filter((a) => a.status === 'approved').length;

    const tabs: { id: TabId; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'premium', label: 'Kelola Premium', icon: Crown },
        { id: 'agendas', label: 'Approval Agenda', icon: ClipboardCheck, badge: pendingAgendas },
    ];

    const ACTIVITY_EMOJIS: Record<string, string> = {
        Jogging: '🏃', Cycling: '🚴', Yoga: '🧘', Gym: '💪', Renang: '🏊',
    };

    // Detail Modal State
    const [selectedUserDetail, setSelectedUserDetail] = useState<any | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailTab, setDetailTab] = useState<'profile' | 'activity' | 'food'>('profile');

    const fetchUserDetail = async (userId: number) => {
        setDetailLoading(true);
        setShowDetailModal(true);
        try {
            const res = await fetch(`/api/admin/users/${userId}`);
            if (res.ok) {
                const data = await res.json();
                setSelectedUserDetail(data);
            } else {
                toast('Gagal mengambil data user ❌');
                setShowDetailModal(false);
            }
        } catch (error) {
            console.error(error);
            toast('Terjadi kesalahan koneksi ❌');
            setShowDetailModal(false);
        }
        setDetailLoading(false);
    };

    // Helper to parse profile JSON
    const getProfileExtras = (jsonString: string | null) => {
        if (!jsonString) return { dietary: [], health: [], activity: '-' };
        try {
            return JSON.parse(jsonString);
        } catch {
            return { dietary: [], health: [], activity: '-' };
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
            {/* Toast */}
            {showToast && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] pointer-events-none">
                    <div className="bg-black/80 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 animate-in slide-in-from-top-5 fade-in duration-300">
                        <CheckCircle2 size={14} className="text-green-400" />
                        <span className="font-medium text-sm">{showToast}</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <Shield size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
                        <p className="text-sm text-muted-foreground">Kelola pengguna dan konten PATHRA</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white rounded-xl p-1.5 mb-6 shadow-sm border border-gray-100 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                            : 'text-muted-foreground hover:bg-gray-100'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                        {tab.badge !== undefined && tab.badge > 0 && (
                            <span className={`ml-1 min-w-[20px] h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${activeTab === tab.id ? 'bg-white text-primary' : 'bg-red-500 text-white'
                                }`}>
                                {tab.badge}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
            )}

            {/* ─── OVERVIEW TAB ──────────────────────────────────────── */}
            {!loading && activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Total User', value: totalUsers, icon: Users, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
                            { label: 'User Premium', value: premiumUsers, icon: Crown, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50' },
                            { label: 'Pending Approval', value: pendingAgendas, icon: Clock, color: 'from-yellow-500 to-yellow-600', bg: 'bg-yellow-50' },
                            { label: 'Agenda Approved', value: approvedAgendas, icon: CheckCircle2, color: 'from-green-500 to-green-600', bg: 'bg-green-50' },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                        <stat.icon size={20} className="text-white" />
                                    </div>
                                    <TrendingUp size={14} className="text-green-500" />
                                </div>
                                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions + Recent Activity */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Recent Premium Users */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
                                <Crown size={16} className="text-amber-500" />
                                User Premium Terbaru
                            </h3>
                            <div className="space-y-3">
                                {users
                                    .filter((u) => u.isPremium)
                                    .slice(0, 4)
                                    .map((u) => (
                                        <div key={u.id} className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                                                {u.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground truncate">{u.name}</p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    {u.role === 'admin' ? 'Admin · Auto Premium' : `Premium sejak ${u.premiumSince}`}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => fetchUserDetail(u.id)}
                                                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                title="Lihat Detail"
                                            >
                                                <Eye size={14} />
                                            </button>
                                        </div>
                                    ))}
                                {premiumUsers === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">Belum ada user premium</p>
                                )}
                            </div>
                            <button
                                onClick={() => setActiveTab('premium')}
                                className="w-full mt-4 text-xs font-semibold text-primary hover:text-primary/80 transition-colors py-2 border border-gray-100 rounded-lg hover:bg-gray-50"
                            >
                                Lihat Semua User →
                            </button>
                        </div>

                        {/* Pending Agendas */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-foreground text-sm mb-4 flex items-center gap-2">
                                <Clock size={16} className="text-yellow-500" />
                                Agenda Menunggu Persetujuan
                            </h3>
                            <div className="space-y-3">
                                {agendas
                                    .filter((a) => a.status === 'pending')
                                    .slice(0, 4)
                                    .map((a) => (
                                        <div key={a.id} className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center text-lg">
                                                {ACTIVITY_EMOJIS[a.activityType] || '📋'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-foreground truncate">{a.title}</p>
                                                <p className="text-[10px] text-muted-foreground">{a.groupName} • {a.date}</p>
                                            </div>
                                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-full">Pending</span>
                                        </div>
                                    ))}
                                {pendingAgendas === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">Tidak ada agenda pending 🎉</p>
                                )}
                            </div>
                            <button
                                onClick={() => setActiveTab('agendas')}
                                className="w-full mt-4 text-xs font-semibold text-primary hover:text-primary/80 transition-colors py-2 border border-gray-100 rounded-lg hover:bg-gray-50"
                            >
                                Lihat Semua Agenda →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── KELOLA PREMIUM TAB ────────────────────────────────── */}
            {!loading && activeTab === 'premium' && (
                <div className="space-y-4">
                    {/* Search & Filter Bar */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Cari nama, email, atau username..."
                                value={searchUser}
                                onChange={(e) => setSearchUser(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                        </div>
                        <div className="flex gap-2">
                            {(['all', 'premium', 'free'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilterPremium(f)}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border ${filterPremium === f
                                        ? 'bg-primary text-white border-primary'
                                        : 'bg-gray-50 text-foreground border-gray-200 hover:border-primary/40'
                                        }`}
                                >
                                    {f === 'all' ? 'Semua' : f === 'premium' ? '👑 Premium' : 'Free'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* User count */}
                    <p className="text-xs text-muted-foreground px-1">
                        Menampilkan {filteredUsers.length} dari {users.length} pengguna
                    </p>

                    {/* User Cards */}
                    <div className="space-y-3">
                        {filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                className={`bg-white rounded-2xl p-5 border shadow-sm hover:shadow-md transition-all ${user.isPremium ? 'border-amber-200' : 'border-gray-100'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Avatar */}
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0 ${user.isPremium
                                        ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                                        : 'bg-gradient-to-br from-gray-400 to-gray-500'
                                        }`}>
                                        {user.name.charAt(0)}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                            <h4 className="font-bold text-foreground text-sm truncate">{user.name}</h4>
                                            {user.isPremium && (
                                                <span className="px-2 py-0.5 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 text-[10px] font-bold rounded-full flex items-center gap-1">
                                                    <Crown size={10} /> Premium
                                                </span>
                                            )}
                                            {user.role === 'admin' && (
                                                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">Admin</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                            <span className="flex items-center gap-1"><User size={10} /> @{user.username}</span>
                                            <span className="flex items-center gap-1"><Mail size={10} /> {user.email}</span>
                                        </div>
                                        {user.isPremium && user.premiumSince && (
                                            <p className="text-[10px] text-amber-600 mt-1">
                                                {user.role === 'admin' ? 'Auto Premium · Admin' : `Premium sejak ${user.premiumSince}`}
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => fetchUserDetail(user.id)}
                                            className="px-3 py-2 rounded-xl text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1"
                                        >
                                            <Eye size={14} /> Detail
                                        </button>
                                        {user.role !== 'admin' && (
                                            <button
                                                onClick={() => togglePremium(user.id)}
                                                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${user.isPremium
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 shadow-md shadow-amber-500/20'
                                                    }`}
                                            >
                                                {user.isPremium ? 'Cabut' : '👑 Upgrade'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                            <Search size={40} className="text-gray-300 mx-auto mb-3" />
                            <p className="text-muted-foreground text-sm">Tidak ada user ditemukan</p>
                        </div>
                    )}
                </div>
            )}

            {/* ─── APPROVAL AGENDA TAB ──────────────────────────────── */}
            {!loading && activeTab === 'agendas' && (
                <div className="space-y-4">
                    {/* Filter Bar */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex gap-2 overflow-x-auto">
                        {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => {
                            const count = f === 'all' ? agendas.length : agendas.filter((a) => a.status === f).length;
                            const colors: Record<string, string> = {
                                all: filterAgendaStatus === 'all' ? 'bg-primary text-white border-primary' : '',
                                pending: filterAgendaStatus === 'pending' ? 'bg-yellow-500 text-white border-yellow-500' : '',
                                approved: filterAgendaStatus === 'approved' ? 'bg-green-500 text-white border-green-500' : '',
                                rejected: filterAgendaStatus === 'rejected' ? 'bg-red-500 text-white border-red-500' : '',
                            };
                            return (
                                <button
                                    key={f}
                                    onClick={() => setFilterAgendaStatus(f)}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border whitespace-nowrap ${colors[f] || 'bg-gray-50 text-foreground border-gray-200 hover:border-primary/40'
                                        }`}
                                >
                                    {f === 'all' ? 'Semua' : f === 'pending' ? '⏳ Pending' : f === 'approved' ? '✅ Approved' : '❌ Rejected'}
                                    <span className="ml-1.5 opacity-70">({count})</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Agenda Cards */}
                    <div className="space-y-4">
                        {filteredAgendas.map((agenda) => (
                            <div
                                key={agenda.id}
                                className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${agenda.status === 'pending'
                                    ? 'border-yellow-200'
                                    : agenda.status === 'approved'
                                        ? 'border-green-200'
                                        : 'border-red-200'
                                    }`}
                            >
                                {/* Card Header */}
                                <div className="p-5">
                                    <div className="flex items-start gap-4">
                                        {/* Activity Emoji */}
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${agenda.status === 'pending' ? 'bg-yellow-50' : agenda.status === 'approved' ? 'bg-green-50' : 'bg-red-50'
                                            }`}>
                                            {ACTIVITY_EMOJIS[agenda.activityType] || '📋'}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <h4 className="font-bold text-foreground truncate">{agenda.title}</h4>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${agenda.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : agenda.status === 'approved'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {agenda.status === 'pending' ? '⏳ Pending' : agenda.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                                                <span className="flex items-center gap-1"><Users size={11} /> {agenda.groupName}</span>
                                                <span className="flex items-center gap-1"><User size={11} /> {agenda.creator}</span>
                                                <span className="flex items-center gap-1"><CalendarDays size={11} /> {agenda.date} • {agenda.time}</span>
                                                <span className="flex items-center gap-1"><MapPin size={11} /> {agenda.location}</span>
                                            </div>

                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-xs text-muted-foreground">
                                                    👥 {agenda.currentParticipants}/{agenda.maxParticipants} peserta
                                                </span>
                                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[120px]">
                                                    <div
                                                        className="h-full bg-primary rounded-full"
                                                        style={{ width: `${(agenda.currentParticipants / agenda.maxParticipants) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expand Button */}
                                    <button
                                        onClick={() => setExpandedAgenda(expandedAgenda === agenda.id ? null : agenda.id)}
                                        className="mt-3 text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
                                    >
                                        <Eye size={12} />
                                        {expandedAgenda === agenda.id ? 'Sembunyikan Detail' : 'Lihat Detail'}
                                        <ChevronDown size={12} className={`transition-transform ${expandedAgenda === agenda.id ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Expanded Detail */}
                                    {expandedAgenda === agenda.id && (
                                        <div className="mt-3 p-4 bg-gray-50 rounded-xl text-sm text-foreground">
                                            <p className="mb-2">{agenda.description}</p>
                                            <div className="text-xs text-muted-foreground">
                                                Dibuat pada: {agenda.createdAt}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons — only for pending */}
                                {agenda.status === 'pending' && (
                                    <div className="border-t border-gray-100 px-5 py-3 flex gap-2 bg-gray-50/50">
                                        <button
                                            onClick={() => updateAgendaStatus(agenda.id, 'approved')}
                                            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-xs hover:opacity-90 transition-opacity shadow-md shadow-green-500/20 flex items-center justify-center gap-1.5"
                                        >
                                            <CheckCircle2 size={14} />
                                            Setujui Agenda
                                        </button>
                                        <button
                                            onClick={() => updateAgendaStatus(agenda.id, 'rejected')}
                                            className="flex-1 py-2.5 rounded-xl bg-red-50 text-red-600 font-bold text-xs hover:bg-red-100 transition-colors border border-red-200 flex items-center justify-center gap-1.5"
                                        >
                                            <XCircle size={14} />
                                            Tolak
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {filteredAgendas.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                            <ClipboardCheck size={40} className="text-gray-300 mx-auto mb-3" />
                            <p className="text-muted-foreground text-sm">
                                {filterAgendaStatus === 'pending'
                                    ? 'Tidak ada agenda yang menunggu persetujuan 🎉'
                                    : 'Tidak ada agenda ditemukan'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* ─── USER DETAIL MODAL ─────────────────────────────────── */}
            {showDetailModal && (
                <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <h3 className="font-bold text-lg">Detail User</h3>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                            >
                                <XCircle size={20} className="text-gray-600" />
                            </button>
                        </div>

                        {detailLoading ? (
                            <div className="p-10 flex flex-col items-center justify-center text-muted-foreground gap-3">
                                <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                <span className="text-sm font-medium">Mengambil data user...</span>
                            </div>
                        ) : selectedUserDetail ? (
                            <div className="flex-1 overflow-y-auto">
                                {/* Profile Header */}
                                <div className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-b border-gray-100 flex items-center gap-5">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                                        {selectedUserDetail.name?.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-2xl font-bold text-foreground">{selectedUserDetail.name}</h2>
                                            {selectedUserDetail.role === 'admin' && (
                                                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">Admin</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">@{selectedUserDetail.username} • {selectedUserDetail.email}</p>
                                        <div className="flex gap-3 mt-3">
                                            <div className="text-xs bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                                Bergabung: <b>{selectedUserDetail.created_at ? new Date(selectedUserDetail.created_at).toLocaleDateString('id-ID') : '-'}</b>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex border-b border-gray-100 px-6">
                                    {(['profile', 'activity', 'food'] as const).map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setDetailTab(t)}
                                            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${detailTab === t
                                                ? 'border-primary text-primary'
                                                : 'border-transparent text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            {t === 'profile' ? 'Profil Kesehatan' : t === 'activity' ? 'Riwayat Latihan' : 'Log Makanan'}
                                        </button>
                                    ))}
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    {detailTab === 'profile' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            {selectedUserDetail.user_profiles ? (
                                                <>
                                                    <div className="col-span-2 grid grid-cols-3 gap-3 mb-2">
                                                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100 text-center">
                                                            <div className="text-xs text-blue-600 font-bold uppercase mb-1">Tinggi</div>
                                                            <div className="text-xl font-bold text-foreground">{selectedUserDetail.user_profiles.height} cm</div>
                                                        </div>
                                                        <div className="bg-green-50 p-3 rounded-xl border border-green-100 text-center">
                                                            <div className="text-xs text-green-600 font-bold uppercase mb-1">Berat</div>
                                                            <div className="text-xl font-bold text-foreground">{selectedUserDetail.user_profiles.weight} kg</div>
                                                        </div>
                                                        <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 text-center">
                                                            <div className="text-xs text-purple-600 font-bold uppercase mb-1">Gender</div>
                                                            <div className="text-xl font-bold text-foreground capitalize">{selectedUserDetail.user_profiles.gender}</div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                                                        <h4 className="font-bold text-sm mb-2">Kondisi Kesehatan</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {getProfileExtras(selectedUserDetail.user_profiles.health_motivation).health.map((h: string) => (
                                                                <span key={h} className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-md font-medium">{h}</span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                                                        <h4 className="font-bold text-sm mb-2">Pantangan Makanan</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {getProfileExtras(selectedUserDetail.user_profiles.health_motivation).dietary.map((d: string) => (
                                                                <span key={d} className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-md font-medium">{d}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="col-span-2 text-center py-10 text-muted-foreground text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                    User belum melengkapi profil onboarding.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {detailTab === 'activity' && (
                                        <div className="space-y-3">
                                            {selectedUserDetail.activity_logs && selectedUserDetail.activity_logs.length > 0 ? (
                                                selectedUserDetail.activity_logs.map((act: any) => (
                                                    <div key={act.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                                        <div className="w-10 h-10 rounded-lg bg-orange-100 text-2xl flex items-center justify-center">
                                                            {ACTIVITY_EMOJIS[act.activity_type] || '🏃'}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-sm text-foreground">{act.activity_type}</h4>
                                                            <p className="text-xs text-muted-foreground">{new Date(act.created_at).toLocaleDateString()} • {new Date(act.created_at).toLocaleTimeString()}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-sm font-bold text-orange-600">{act.calories_burned} cal</div>
                                                            <div className="text-xs text-muted-foreground">{act.duration_minutes} min</div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-10 text-muted-foreground text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                    Belum ada riwayat aktivitas.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {detailTab === 'food' && (
                                        <div className="space-y-3">
                                            {selectedUserDetail.food_logs && selectedUserDetail.food_logs.length > 0 ? (
                                                selectedUserDetail.food_logs.map((food: any) => (
                                                    <div key={food.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                                                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                                            <UtensilsCrossed size={18} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-bold text-sm text-foreground">{food.food_name}</h4>
                                                            <p className="text-xs text-muted-foreground capitalize">{food.meal_category} • {new Date(food.created_at).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-sm font-bold text-green-600">{food.calories} kcal</div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-10 text-muted-foreground text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                    Belum ada catatan makanan.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="p-10 text-center text-red-500">Data gagal dimuat.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
