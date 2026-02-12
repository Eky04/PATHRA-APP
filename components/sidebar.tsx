'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  Home,
  Apple,
  Activity,
  MessageCircle,
  Users,
  TrendingUp,
  Settings,
  LogOut,
  User,
  Ruler,
  Scale,
  Calendar,
  Heart,
  UtensilsCrossed,
  Zap,
  ChevronRight,
  Edit3,
  Save,
  Check,
  Crown,
  Star,
  CalendarPlus,
  UsersRound,
  Shield,
  Sparkles,
  ArrowRight,
  LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logout, AuthUser } from '@/lib/auth';

interface SidebarProps {
  currentUser?: AuthUser | null;
}

interface OnboardingProfile {
  gender: string;
  height: number;
  age: number;
  activityLevel: string;
  weight: number;
  weightUnit: string;
  dietaryRestrictions: string[];
  healthConditions: string[];
  bmi: string;
  savedAt: string;
}

const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Sedentari',
  light: 'Sedikit Aktif',
  moderate: 'Cukup Aktif',
  active: 'Sangat Aktif',
};

const ACTIVITY_DESC: Record<string, string> = {
  sedentary: 'Banyak duduk, sedikit olahraga',
  light: 'Olahraga ringan 1-3 hari/minggu',
  moderate: 'Olahraga sedang 3-5 hari/minggu',
  active: 'Olahraga berat 6-7 hari/minggu',
};

const DIETARY_LABELS: Record<string, string> = {
  none: 'Tidak ada',
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  gluten_free: 'Bebas Gluten',
  dairy_free: 'Bebas Susu',
  no_red_meat: 'Tidak suka daging merah',
  nut_allergy: 'Alergi kacang',
};

const HEALTH_LABELS: Record<string, string> = {
  none: 'Tidak ada',
  high_blood_pressure: 'Tekanan darah tinggi',
  diabetes: 'Diabetes',
  high_cholesterol: 'Kolesterol tinggi',
  other: 'Lainnya',
};

export function Sidebar({ currentUser }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState('');
  const [showPremiumDetail, setShowPremiumDetail] = useState(false);
  const [isCurrentUserPremium, setIsCurrentUserPremium] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Edit form state
  const [editGender, setEditGender] = useState('male');
  const [editHeight, setEditHeight] = useState(170);
  const [editWeight, setEditWeight] = useState(65);
  const [editAge, setEditAge] = useState(25);
  const [editActivity, setEditActivity] = useState('sedentary');
  const [editDietary, setEditDietary] = useState<string[]>(['none']);
  const [editHealth, setEditHealth] = useState<string[]>(['none']);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load onboarding profile from API (with localStorage fallback)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const dbProfile = await res.json();
          // Parse JSON from health_motivation
          let extraData = { dietary: ['none'], health: ['none'], activity: 'sedentary' };
          try {
            if (dbProfile.health_motivation && dbProfile.health_motivation.startsWith('{')) {
              extraData = JSON.parse(dbProfile.health_motivation);
            }
          } catch (e) { console.error('Error parsing profile extras', e); }

          const mappedProfile: OnboardingProfile = {
            gender: dbProfile.gender || 'male',
            height: parseFloat(dbProfile.height) || 170,
            age: dbProfile.age || 25,
            weight: parseFloat(dbProfile.weight) || 65,
            weightUnit: 'kg', // default
            activityLevel: extraData.activity || 'sedentary',
            dietaryRestrictions: extraData.dietary || ['none'],
            healthConditions: extraData.health || ['none'],
            bmi: dbProfile.weight && dbProfile.height
              ? (Number(dbProfile.weight) / ((Number(dbProfile.height) / 100) ** 2)).toFixed(1)
              : '22.5',
            savedAt: dbProfile.updated_at || new Date().toISOString(),
          };

          setProfile(mappedProfile);
          populateEditForm(mappedProfile);
          // Sync to local storage as backup
          localStorage.setItem('onboardingProfile', JSON.stringify(mappedProfile));
        } else {
          // Fallback to localStorage if API fails or no profile yet
          const saved = localStorage.getItem('onboardingProfile');
          if (saved) {
            const parsed = JSON.parse(saved);
            setProfile(parsed);
            populateEditForm(parsed);
          }
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }
    };

    if (currentUser) {
      fetchProfile();
    }
  }, [currentUser]);

  // Check premium status from shared localStorage
  useEffect(() => {
    const checkPremium = () => {
      if (currentUser?.role === 'admin') {
        setIsCurrentUserPremium(true);
        return;
      }
      try {
        const premiumData = JSON.parse(localStorage.getItem('premiumStatus') || '{}');
        if (currentUser?.id && premiumData[currentUser.id]?.isPremium) {
          setIsCurrentUserPremium(true);
        } else {
          setIsCurrentUserPremium(false);
        }
      } catch {
        setIsCurrentUserPremium(false);
      }
    };

    checkPremium();

    // Listen for premium updates from admin panel
    window.addEventListener('premiumUpdated', checkPremium);
    return () => window.removeEventListener('premiumUpdated', checkPremium);
  }, [currentUser]);

  const populateEditForm = (p: OnboardingProfile) => {
    setEditGender(p.gender || 'male');
    setEditHeight(p.height || 170);
    setEditWeight(p.weight || 65);
    setEditAge(p.age || 25);
    setEditActivity(p.activityLevel || 'sedentary');
    setEditDietary(p.dietaryRestrictions || ['none']);
    setEditHealth(p.healthConditions || ['none']);
  };

  const toast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(''), 2500);
  };

  const saveProfile = async () => {
    const heightM = editHeight / 100;
    const bmi = (editWeight / (heightM * heightM)).toFixed(1);

    const newProfile: OnboardingProfile = {
      gender: editGender,
      height: editHeight,
      age: editAge,
      activityLevel: editActivity,
      weight: editWeight,
      weightUnit: 'kg',
      dietaryRestrictions: editDietary,
      healthConditions: editHealth,
      bmi,
      savedAt: new Date().toISOString(),
    };

    // calculate target calories (simplified BMR)
    const bmr = 10 * editWeight + 6.25 * editHeight - 5 * editAge + (editGender === 'male' ? 5 : -161);
    const activityMultipliers: Record<string, number> = { 'sedentary': 1.2, 'light': 1.375, 'moderate': 1.55, 'active': 1.725 };
    const tdee = Math.round(bmr * (activityMultipliers[editActivity] || 1.2));

    try {
      const apiPayload = {
        age: editAge,
        gender: editGender,
        height: editHeight,
        weight: editWeight,
        daily_calorie_target: tdee,
        health_motivation: JSON.stringify({
          dietary: editDietary,
          health: editHealth,
          activity: editActivity
        }),
      };

      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload)
      });

      if (res.ok) {
        toast('Profil berhasil disimpan ke Database! ✅');
        localStorage.setItem('onboardingProfile', JSON.stringify(newProfile));
        setProfile(newProfile);
        setIsEditing(false);
      } else {
        toast('Gagal menyimpan ke database ❌');
      }
    } catch (e) {
      console.error(e);
      toast('Error koneksi ❌');
    }
  };

  const startEditing = () => {
    if (profile) populateEditForm(profile);
    setIsEditing(true);
  };

  const toggleDietary = (value: string) => {
    if (value === 'none') {
      setEditDietary(['none']);
    } else {
      let updated = editDietary.filter((d) => d !== 'none');
      if (updated.includes(value)) {
        updated = updated.filter((d) => d !== value);
      } else {
        updated.push(value);
      }
      setEditDietary(updated.length === 0 ? ['none'] : updated);
    }
  };

  const toggleHealth = (value: string) => {
    if (value === 'none') {
      setEditHealth(['none']);
    } else {
      let updated = editHealth.filter((h) => h !== 'none');
      if (updated.includes(value)) {
        updated = updated.filter((h) => h !== value);
      } else {
        updated.push(value);
      }
      setEditHealth(updated.length === 0 ? ['none'] : updated);
    }
  };

  // Close profile panel on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
        setIsEditing(false);
      }
    };
    if (showProfile) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfile]);

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Kurus', color: 'text-blue-500', bg: 'bg-blue-100' };
    if (bmi < 25) return { label: 'Normal', color: 'text-green-500', bg: 'bg-green-100' };
    if (bmi < 30) return { label: 'Kelebihan BB', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { label: 'Obesitas', color: 'text-red-500', bg: 'bg-red-100' };
  };

  const menuItems = [
    { id: 'dashboard', label: 'Beranda', icon: Home },
    { id: 'food', label: 'Makanan', icon: Apple },
    { id: 'activity', label: 'Aktivitas', icon: Activity },
    { id: 'coach', label: 'AI Coach', icon: MessageCircle },
    { id: 'community', label: 'Komunitas', icon: Users },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
  ];

  const adminMenuItems = [
    { id: 'admin', label: 'Admin Panel', icon: LayoutDashboard },
  ];

  // ─── Edit Form UI ──────────────────────────────────────────
  const renderEditForm = () => (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-foreground">Isi Data Diri</h4>
        <button
          onClick={() => { setIsEditing(false); }}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Batal
        </button>
      </div>

      {/* Gender */}
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Jenis Kelamin</label>
        <div className="grid grid-cols-2 gap-2">
          {[{ v: 'male', l: '👨 Laki-laki' }, { v: 'female', l: '👩 Perempuan' }].map((g) => (
            <button
              key={g.v}
              onClick={() => setEditGender(g.v)}
              className={`py-2.5 rounded-xl text-sm font-semibold transition-all border ${editGender === g.v
                ? 'bg-primary text-white border-primary'
                : 'bg-gray-50 text-foreground border-gray-200 hover:border-primary/40'
                }`}
            >
              {g.l}
            </button>
          ))}
        </div>
      </div>

      {/* Height + Weight + Age */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1.5">Tinggi (cm)</label>
          <input
            type="number"
            value={editHeight}
            onChange={(e) => setEditHeight(Number(e.target.value))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-center font-bold text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1.5">Berat (kg)</label>
          <input
            type="number"
            step="0.5"
            value={editWeight}
            onChange={(e) => setEditWeight(Number(e.target.value))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-center font-bold text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1.5">Usia</label>
          <input
            type="number"
            value={editAge}
            onChange={(e) => setEditAge(Number(e.target.value))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-center font-bold text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
      </div>

      {/* Activity Level */}
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Tingkat Aktivitas</label>
        <div className="space-y-2">
          {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
            <button
              key={value}
              onClick={() => setEditActivity(value)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all border ${editActivity === value
                ? 'bg-primary text-white border-primary'
                : 'bg-gray-50 text-foreground border-gray-200 hover:border-primary/40'
                }`}
            >
              <span className="font-semibold">{label}</span>
              <span className={`block text-[10px] mt-0.5 ${editActivity === value ? 'text-white/70' : 'text-muted-foreground'}`}>
                {ACTIVITY_DESC[value]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Dietary Restrictions */}
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Pembatasan Diet</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(DIETARY_LABELS).map(([value, label]) => (
            <button
              key={value}
              onClick={() => toggleDietary(value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${editDietary.includes(value)
                ? 'bg-primary text-white border-primary'
                : 'bg-gray-50 text-foreground border-gray-200 hover:border-primary/40'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Health Conditions */}
      <div>
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">Kondisi Kesehatan</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(HEALTH_LABELS).map(([value, label]) => (
            <button
              key={value}
              onClick={() => toggleHealth(value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${editHealth.includes(value)
                ? 'bg-primary text-white border-primary'
                : 'bg-gray-50 text-foreground border-gray-200 hover:border-primary/40'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={saveProfile}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
      >
        <Save size={16} />
        Simpan Profil
      </button>
    </div>
  );

  // ─── Profile View UI ──────────────────────────────────────
  const renderProfileView = () => (
    <div className="p-5 space-y-5">
      {profile ? (
        <>
          {/* Edit button */}
          <div className="flex justify-end">
            <button
              onClick={startEditing}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              <Edit3 size={12} /> Edit Profil
            </button>
          </div>

          {/* BMI Card */}
          {profile.bmi && (
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Indeks Massa Tubuh</h4>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-bold text-foreground">{profile.bmi.replace('.', ',')}</span>
                  <span className={`ml-2 text-sm font-semibold ${getBMICategory(parseFloat(profile.bmi)).color}`}>
                    {getBMICategory(parseFloat(profile.bmi)).label}
                  </span>
                </div>
                <div className={`w-10 h-10 rounded-full ${getBMICategory(parseFloat(profile.bmi)).bg} flex items-center justify-center`}>
                  <Scale size={20} className={getBMICategory(parseFloat(profile.bmi)).color} />
                </div>
              </div>
              <div className="mt-3 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden flex">
                <div className="flex-1 bg-blue-400"></div>
                <div className="flex-1 bg-green-500"></div>
                <div className="flex-1 bg-yellow-400"></div>
                <div className="flex-1 bg-red-500"></div>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>18.5</span><span>25</span><span>30</span><span>35+</span>
              </div>
            </div>
          )}

          {/* Physical Data */}
          <div>
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Data Fisik</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <Ruler size={14} className="text-primary" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Tinggi</span>
                </div>
                <p className="text-lg font-bold text-foreground">{profile.height} <span className="text-sm text-muted-foreground font-normal">cm</span></p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <Scale size={14} className="text-primary" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Berat</span>
                </div>
                <p className="text-lg font-bold text-foreground">{typeof profile.weight === 'number' ? profile.weight.toFixed(1) : profile.weight} <span className="text-sm text-muted-foreground font-normal">{profile.weightUnit || 'kg'}</span></p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={14} className="text-primary" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Usia</span>
                </div>
                <p className="text-lg font-bold text-foreground">{profile.age} <span className="text-sm text-muted-foreground font-normal">tahun</span></p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <User size={14} className="text-primary" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Gender</span>
                </div>
                <p className="text-lg font-bold text-foreground">{profile.gender === 'male' ? 'Pria' : profile.gender === 'female' ? 'Wanita' : '-'}</p>
              </div>
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Tingkat Aktivitas</h4>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Zap size={20} className="text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground">{ACTIVITY_LABELS[profile.activityLevel] || profile.activityLevel}</p>
                <p className="text-xs text-muted-foreground">{ACTIVITY_DESC[profile.activityLevel] || ''}</p>
              </div>
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div>
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Pembatasan Diet</h4>
            <div className="flex flex-wrap gap-2">
              {profile.dietaryRestrictions.map((d) => (
                <span
                  key={d}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold ${d === 'none' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}
                >
                  <UtensilsCrossed size={10} className="inline mr-1" />
                  {DIETARY_LABELS[d] || d}
                </span>
              ))}
            </div>
          </div>

          {/* Health Conditions */}
          <div>
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Kondisi Kesehatan</h4>
            <div className="flex flex-wrap gap-2">
              {profile.healthConditions.map((h) => (
                <span
                  key={h}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold ${h === 'none' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                >
                  <Heart size={10} className="inline mr-1" />
                  {HEALTH_LABELS[h] || h}
                </span>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* No profile — show form directly */
        renderEditForm()
      )}

      {/* Logout Button (only when viewing, not editing) */}
      {profile && !isEditing && (
        <button
          onClick={async () => {
            await logout();
            window.location.reload();
          }}
          className="w-full mt-4 py-3 px-4 rounded-xl bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          <LogOut size={16} />
          Keluar dari Akun
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Toast */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[80] pointer-events-none">
          <div className="bg-black/80 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 animate-in slide-in-from-top-5 fade-in duration-300">
            <div className="bg-green-500 rounded-full p-0.5"><Check size={10} /></div>
            <span className="font-medium text-sm">{showToast}</span>
          </div>
        </div>
      )}

      {/* Mobile Toggle */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-border md:hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <h1 className="text-lg font-bold text-foreground">PATHRA</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-bold md:hidden"
            >
              {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden"
            >
              {isOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Panel */}
      {showProfile && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => { setShowProfile(false); setIsEditing(false); }}>
          <div
            ref={profileRef}
            className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Profile Header */}
            <div className="bg-gradient-to-br from-primary via-secondary to-accent text-white p-6 pb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Profil Saya</h2>
                <button
                  onClick={() => { setShowProfile(false); setIsEditing(false); }}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center text-3xl border-2 border-white/40">
                  {profile?.gender === 'female' ? '👩' : profile?.gender === 'male' ? '👨' : '👤'}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{currentUser?.name || 'User'}</h3>
                  <p className="text-white/75 text-sm">@{currentUser?.username || 'user'}</p>
                  <p className="text-white/60 text-xs mt-0.5">{currentUser?.email || ''}</p>
                </div>
              </div>

              {/* Premium Section */}
              {isCurrentUserPremium ? (
                /* Premium Active */
                <div className="mt-5 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 rounded-2xl p-4 shadow-lg relative overflow-hidden">
                  <div className="absolute -top-3 -right-3 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                  <div className="relative flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center">
                      <Crown size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">PATHRA Premium</p>
                      <p className="text-white/70 text-xs">Aktif {currentUser?.role === 'admin' ? '· Administrator' : '· Member'}</p>
                    </div>
                    <div className="ml-auto bg-white/25 px-2.5 py-1 rounded-full">
                      <span className="text-white text-[10px] font-bold">✓ AKTIF</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Regular User = Upgrade Card */
                <div className="mt-5 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 rounded-2xl p-4 shadow-lg relative overflow-hidden">
                  <div className="absolute -top-3 -right-3 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full blur-lg"></div>
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown size={18} className="text-white" />
                      <span className="text-white font-bold text-sm">PATHRA Premium</span>
                    </div>
                    <p className="text-white/80 text-xs mb-3">Buat grup & agenda olahraga bersama teman!</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toast('Upgrade Premium segera hadir! 🚀')}
                        className="flex-1 bg-white text-amber-600 font-bold text-xs py-2 px-3 rounded-xl hover:bg-white/90 transition-colors shadow-md flex items-center justify-center gap-1"
                      >
                        <Crown size={12} />
                        Upgrade
                      </button>
                      <button
                        onClick={() => setShowPremiumDetail(true)}
                        className="flex-1 bg-white/20 text-white font-bold text-xs py-2 px-3 rounded-xl hover:bg-white/30 transition-colors border border-white/30 flex items-center justify-center gap-1"
                      >
                        Lihat Detail
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Premium Detail Modal */}
            {showPremiumDetail && (
              <div className="absolute inset-0 z-10 bg-white overflow-y-auto animate-in slide-in-from-bottom duration-300">
                {/* Premium Hero */}
                <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 text-white p-6 pb-10 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                  <button
                    onClick={() => setShowPremiumDetail(false)}
                    className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors mb-6"
                  >
                    <X size={18} />
                  </button>
                  <div className="relative">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md">
                      <Crown size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-1">PATHRA Premium</h2>
                    <p className="text-white/80 text-sm">Tingkatkan pengalaman fitness Anda</p>
                  </div>
                </div>

                {/* Premium Features */}
                <div className="p-5 space-y-4 -mt-4">
                  {/* Feature 1: Create Groups */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/5 rounded-full"></div>
                    <div className="relative">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                        <UsersRound size={24} className="text-primary" />
                      </div>
                      <h3 className="font-bold text-foreground text-base mb-1">Buat Grup Komunitas</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Buat dan kelola grup komunitas olahraga Anda sendiri. Undang teman dan user lain untuk bergabung, berbagi progress, dan saling memotivasi.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full">Unlimited Grup</span>
                        <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full">Custom Nama & Logo</span>
                        <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full">Kelola Anggota</span>
                      </div>
                    </div>
                  </div>

                  {/* Feature 2: Schedule Agendas */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 relative overflow-hidden">
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-secondary/5 rounded-full"></div>
                    <div className="relative">
                      <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-3">
                        <CalendarPlus size={24} className="text-secondary" />
                      </div>
                      <h3 className="font-bold text-foreground text-base mb-1">Agenda Olahraga Bareng</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        Buat agenda aktivitas olahraga di dalam grup. Atur jadwal, lokasi, dan jenis olahraga. Anggota grup bisa mendaftar dan ikut olahraga bersama.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="px-2.5 py-1 bg-secondary/10 text-secondary text-[10px] font-bold rounded-full">Tanggal & Waktu</span>
                        <span className="px-2.5 py-1 bg-secondary/10 text-secondary text-[10px] font-bold rounded-full">Lokasi GPS</span>
                        <span className="px-2.5 py-1 bg-secondary/10 text-secondary text-[10px] font-bold rounded-full">RSVP Peserta</span>
                      </div>
                    </div>
                  </div>

                  {/* More Premium Benefits */}
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <h4 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
                      <Star size={16} className="text-amber-500" />
                      Keuntungan Lainnya
                    </h4>
                    <div className="space-y-3">
                      {[
                        { icon: Shield, text: 'Badge Premium eksklusif di profil', color: 'text-amber-500' },
                        { icon: Sparkles, text: 'AI Coach tanpa batas pesan', color: 'text-purple-500' },
                        { icon: TrendingUp, text: 'Statistik & analitik canggih', color: 'text-blue-500' },
                        { icon: Users, text: 'Prioritas di leaderboard komunitas', color: 'text-green-500' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm`}>
                            <item.icon size={16} className={item.color} />
                          </div>
                          <span className="text-sm text-foreground">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200">
                    <div className="text-center mb-4">
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Harga Spesial</p>
                      <div className="flex items-baseline justify-center gap-1 mt-2">
                        <span className="text-3xl font-bold text-foreground">Rp49.000</span>
                        <span className="text-sm text-muted-foreground">/bulan</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">atau Rp 399.000/tahun (hemat 32%)</p>
                    </div>
                    <button
                      onClick={() => { toast('Upgrade Premium segera hadir! 🚀'); setShowPremiumDetail(false); }}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
                    >
                      <Crown size={18} />
                      Upgrade ke Premium Sekarang
                    </button>
                    <p className="text-[10px] text-center text-muted-foreground mt-3">Bisa dibatalkan kapan saja • Uji coba 7 hari gratis</p>
                  </div>
                </div>
              </div>
            )}

            {/* Content: View or Edit */}
            {isEditing ? renderEditForm() : renderProfileView()}
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-30 bg-gradient-to-b from-primary to-secondary text-white transition-all duration-300 ${isOpen ? 'w-64' : 'w-0 md:w-20'
          } ${isMobile && !isOpen && 'hidden'} md:relative md:z-auto`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/20 flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold">P</span>
          </div>
          {isOpen && (
            <div>
              <h1 className="text-xl font-bold">PATHRA</h1>
              <p className="text-xs opacity-80">Health & Fitness</p>
            </div>
          )}
        </div>

        {/* User Profile — Clickable */}
        {isOpen && (
          <div className="p-4 border-b border-white/20">
            <button
              onClick={() => setShowProfile(true)}
              className="w-full flex items-center gap-3 text-left hover:bg-white/10 rounded-lg p-1 -m-1 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-lg">
                {currentUser?.avatar || '👤'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">Halo, {currentUser?.name || 'User'}</p>
                <p className="text-xs opacity-75 capitalize">{currentUser?.role || 'user'}</p>
              </div>
              <ChevronRight size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        )}

        {/* Collapsed user icon */}
        {!isOpen && (
          <div className="p-4 flex justify-center border-b border-white/20">
            <button
              onClick={() => setShowProfile(true)}
              className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-lg hover:bg-white/40 transition-colors"
              title="Profil"
            >
              {currentUser?.avatar || '👤'}
            </button>
          </div>
        )}

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                if (isMobile) setIsOpen(false);
                window.dispatchEvent(
                  new CustomEvent('navigateTo', { detail: item.id })
                );
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${currentPage === item.id
                ? 'bg-white/30 font-semibold'
                : 'hover:bg-white/10'
                }`}
              title={!isOpen ? item.label : ''}
            >
              <item.icon size={20} />
              {isOpen && <span className="text-sm">{item.label}</span>}
            </button>
          ))}

          {/* Admin Menu Section */}
          {currentUser?.role === 'admin' && (
            <>
              {isOpen && (
                <div className="pt-3 pb-1 px-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Admin</p>
                </div>
              )}
              {!isOpen && <div className="border-t border-white/20 my-2" />}
              {adminMenuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id);
                    if (isMobile) setIsOpen(false);
                    window.dispatchEvent(
                      new CustomEvent('navigateTo', { detail: item.id })
                    );
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${currentPage === item.id
                    ? 'bg-white/30 font-semibold'
                    : 'hover:bg-white/10'
                    }`}
                  title={!isOpen ? item.label : ''}
                >
                  <item.icon size={20} />
                  {isOpen && <span className="text-sm">{item.label}</span>}
                </button>
              ))}
            </>
          )}
        </nav>

        {/* Bottom Menu */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20 space-y-2">
          <button
            onClick={() => setShowProfile(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all"
          >
            <Settings size={20} />
            {isOpen && <span className="text-sm">Pengaturan</span>}
          </button>
          <button
            onClick={async () => {
              await logout();
              window.location.reload();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-all"
          >
            <LogOut size={20} />
            {isOpen && <span className="text-sm">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
