'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Calendar,
  Download,
  Flame,
  Footprints,
  Droplet,
  Target,
  Award,
  X,
  Save,
  Edit3,
  Dumbbell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

// ─── Interfaces ──────────────────────────────────────────────

interface Achievement {
  id: number;
  title: string;
  description: string | null;
  icon: string | null;
  unlocked: boolean;
  date: string | null;
}

interface BodyMetrics {
  weight: number;
  height: number;
  bodyFat: number;
  muscle: number;
}

interface UserGoals {
  calorieTarget: number;
  stepsTarget: number;
  waterTarget: number;
  activityTarget: number;
}

interface DailyLog {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category?: string;
  portion?: string;
  image?: string;
}

interface ActivityEntry {
  id: string;
  type: string;
  duration: number;
  calories: number;
  distance: number;
  date: string;
  avgHR?: number;
}

// ─── Helpers ─────────────────────────────────────────────────

const DAYS_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function getWeekDates(): Date[] {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7)); // shift to Monday
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

const DEFAULT_GOALS: UserGoals = {
  calorieTarget: 2500,
  stepsTarget: 10000,
  waterTarget: 2,
  activityTarget: 16,
};

const DEFAULT_BODY: BodyMetrics = {
  weight: 65,
  height: 170,
  bodyFat: 24,
  muscle: 32.5,
};

// ─── Custom Tooltip ──────────────────────────────────────────

function CustomTooltip({ active, payload, label, unit }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-gray-700">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>
          {p.value.toLocaleString()} {unit || ''}
        </p>
      ))}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────

export function ProgressPage() {
  const [timeRange, setTimeRange] = useState('week');

  // ── Data from localStorage ──
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [activityHistory, setActivityHistory] = useState<ActivityEntry[]>([]);

  // ── Body Metrics ──
  const [bodyMetrics, setBodyMetrics] = useState<BodyMetrics>(DEFAULT_BODY);
  const [editingMetric, setEditingMetric] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // ── Goals ──
  const [goals, setGoals] = useState<UserGoals>(DEFAULT_GOALS);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalDraft, setGoalDraft] = useState<UserGoals>(DEFAULT_GOALS);

  // ── Achievements ──
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loadingAch, setLoadingAch] = useState(true);

  // ── Load everything on mount ──
  useEffect(() => {
    // Daily logs
    try {
      const raw = localStorage.getItem('dailyLogs');
      if (raw) setDailyLogs(JSON.parse(raw));
    } catch { }

    // Activity history
    try {
      const raw = localStorage.getItem('activityHistory');
      if (raw) setActivityHistory(JSON.parse(raw));
    } catch { }

    // Body metrics
    try {
      const raw = localStorage.getItem('bodyMetrics');
      if (raw) setBodyMetrics(JSON.parse(raw));
    } catch { }

    // Goals
    try {
      const raw = localStorage.getItem('userGoals');
      if (raw) {
        const parsed = JSON.parse(raw);
        setGoals(parsed);
        setGoalDraft(parsed);
      }
    } catch { }

    // Achievements
    const fetchAch = async () => {
      try {
        const res = await fetch('/api/achievements');
        if (res.ok) {
          const data = await res.json();
          setAchievements(
            data.map((item: any) => ({
              ...item,
              date: item.date
                ? new Date(item.date).toLocaleDateString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
                : null,
            }))
          );
        }
      } catch {
        // fallback local achievements
        setAchievements([
          { id: 1, title: 'Langkah Pertama', description: 'Selesaikan aktivitas pertama', icon: '🏃', unlocked: activityHistory.length > 0, date: null },
          { id: 2, title: 'Pencatat Makanan', description: 'Log 10 makanan', icon: '🍽️', unlocked: dailyLogs.length >= 10, date: null },
          { id: 3, title: 'Konsisten 7 Hari', description: 'Aktif 7 hari berturut-turut', icon: '🔥', unlocked: false, date: null },
          { id: 4, title: 'Target Master', description: 'Capai semua target harian', icon: '🎯', unlocked: false, date: null },
        ]);
      } finally {
        setLoadingAch(false);
      }
    };
    fetchAch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Compute weekly chart data ──
  const weekDates = useMemo(() => getWeekDates(), []);

  const weeklyCalorieData = useMemo(() => {
    return weekDates.map((date) => {
      const dayLogs = dailyLogs.filter((log) => {
        // id is Date.now() timestamp string
        const logDate = new Date(Number(log.id));
        return isSameDay(logDate, date);
      });
      const totalCal = dayLogs.reduce((s, l) => s + (l.calories || 0), 0);

      const dayIdx = date.getDay(); // 0=Sun
      return {
        day: DAYS_ID[dayIdx],
        calories: totalCal,
        target: goals.calorieTarget,
      };
    });
  }, [dailyLogs, weekDates, goals.calorieTarget]);

  const weeklyActivityData = useMemo(() => {
    return weekDates.map((date) => {
      const dayActivities = activityHistory.filter((a) => {
        const actDate = new Date(Number(a.id));
        return isSameDay(actDate, date);
      });
      const totalCal = dayActivities.reduce((s, a) => s + (a.calories || 0), 0);

      const dayIdx = date.getDay();
      return {
        day: DAYS_ID[dayIdx],
        calories: totalCal,
      };
    });
  }, [activityHistory, weekDates]);

  // ── Monthly summary ──
  const monthlyMetrics = useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const monthLogs = dailyLogs.filter((l) => {
      const d = new Date(Number(l.id));
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });
    const monthActivities = activityHistory.filter((a) => {
      const d = new Date(Number(a.id));
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    const totalCalories = monthLogs.reduce((s, l) => s + (l.calories || 0), 0);
    const totalActivityCal = monthActivities.reduce((s, a) => s + (a.calories || 0), 0);
    const totalSessions = monthActivities.length;
    const totalDistance = monthActivities.reduce((s, a) => s + (a.distance || 0), 0);

    return [
      { label: 'Kalori Masuk', value: totalCalories, unit: 'cal', target: goals.calorieTarget * 30, icon: Flame, color: 'from-orange-500 to-amber-400' },
      { label: 'Kalori Terbakar', value: totalActivityCal, unit: 'cal', target: goals.calorieTarget * 15, icon: Dumbbell, color: 'from-red-500 to-pink-400' },
      { label: 'Total Aktivitas', value: totalSessions, unit: 'sesi', target: goals.activityTarget, icon: Target, color: 'from-purple-500 to-indigo-400' },
      { label: 'Total Jarak', value: Number(totalDistance.toFixed(1)), unit: 'km', target: 50, icon: Footprints, color: 'from-blue-500 to-cyan-400' },
    ];
  }, [dailyLogs, activityHistory, goals]);

  // ── Avg calories ──
  const avgCalories = useMemo(() => {
    const filled = weeklyCalorieData.filter((d) => d.calories > 0);
    if (filled.length === 0) return 0;
    return Math.round(filled.reduce((s, d) => s + d.calories, 0) / filled.length);
  }, [weeklyCalorieData]);

  const avgActivity = useMemo(() => {
    const filled = weeklyActivityData.filter((d) => d.calories > 0);
    if (filled.length === 0) return 0;
    return Math.round(filled.reduce((s, d) => s + d.calories, 0) / filled.length);
  }, [weeklyActivityData]);

  // ── BMI calculation ──
  const bmi = useMemo(() => {
    const hm = bodyMetrics.height / 100;
    if (hm <= 0) return 0;
    return Number((bodyMetrics.weight / (hm * hm)).toFixed(1));
  }, [bodyMetrics.weight, bodyMetrics.height]);

  // ── Body metrics display data ──
  const bodyMetricCards = useMemo(
    () => [
      { key: 'weight', label: 'Berat Badan', value: bodyMetrics.weight, unit: 'kg', target: 62 },
      { key: 'bmi', label: 'IMT (BMI)', value: bmi, unit: '', target: 22.5, readonly: true },
      { key: 'bodyFat', label: 'Body Fat', value: bodyMetrics.bodyFat, unit: '%', target: 20 },
      { key: 'muscle', label: 'Muscle', value: bodyMetrics.muscle, unit: 'kg', target: 35 },
      { key: 'height', label: 'Tinggi Badan', value: bodyMetrics.height, unit: 'cm', target: 0, hideProgress: true },
    ],
    [bodyMetrics, bmi]
  );

  // ── Handlers ──
  const startEdit = (key: string, value: number) => {
    setEditingMetric(key);
    setEditValue(String(value));
  };

  const saveEdit = (key: string) => {
    const num = parseFloat(editValue);
    if (isNaN(num) || num <= 0) {
      setEditingMetric(null);
      return;
    }
    const updated = { ...bodyMetrics, [key]: num };
    setBodyMetrics(updated);
    localStorage.setItem('bodyMetrics', JSON.stringify(updated));
    setEditingMetric(null);
  };

  const saveGoals = () => {
    setGoals(goalDraft);
    localStorage.setItem('userGoals', JSON.stringify(goalDraft));
    setShowGoalModal(false);
  };

  const handleExportPDF = () => {
    window.print();
  };

  // ─── Render ────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 print:bg-white">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-16 md:top-0 z-10 print:static">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">Progress Saya</h1>
          <p className="text-muted-foreground mt-1">
            Analisa lengkap perkembangan kesehatan dan fitness Anda
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Time Range Selector */}
        <div className="flex gap-2 flex-wrap print:hidden">
          {['week', 'month', 'year'].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              className={
                timeRange === range
                  ? 'bg-gradient-to-r from-primary to-secondary text-white'
                  : 'border-primary text-primary hover:bg-primary/5'
              }
              onClick={() => setTimeRange(range)}
            >
              <Calendar size={16} className="mr-2" />
              {range === 'week' && 'Minggu Ini'}
              {range === 'month' && 'Bulan Ini'}
              {range === 'year' && 'Tahun Ini'}
            </Button>
          ))}
        </div>

        {/* ━━━ Charts Section ━━━ */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
          <h2 className="text-xl font-bold text-foreground mb-6">
            Tren Harian Minggu Ini
          </h2>

          <div className="space-y-8">
            {/* Calorie Chart */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Flame size={18} className="text-orange-500" />
                  Kalori Masuk
                </h3>
                <span className="text-sm text-muted-foreground">
                  Rata-rata {avgCalories.toLocaleString()} cal/hari
                </span>
              </div>
              <div className="h-52 bg-gradient-to-b from-orange-50/50 to-transparent rounded-lg border border-orange-100 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyCalorieData} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip content={<CustomTooltip unit="cal" />} cursor={{ fill: 'rgba(251,146,60,0.08)' }} />
                    <ReferenceLine y={goals.calorieTarget} stroke="#f97316" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: `Target ${goals.calorieTarget}`, position: 'insideTopRight', fontSize: 10, fill: '#f97316' }} />
                    <Bar dataKey="calories" fill="url(#orangeGrad)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                    <defs>
                      <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#fb923c" />
                        <stop offset="100%" stopColor="#f97316" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Activity Chart */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Dumbbell size={18} className="text-blue-500" />
                  Kalori Terbakar (Aktivitas)
                </h3>
                <span className="text-sm text-muted-foreground">
                  Rata-rata {avgActivity.toLocaleString()} cal/hari
                </span>
              </div>
              <div className="h-52 bg-gradient-to-b from-blue-50/50 to-transparent rounded-lg border border-blue-100 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyActivityData} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={40} />
                    <Tooltip content={<CustomTooltip unit="cal" />} cursor={{ fill: 'rgba(59,130,246,0.08)' }} />
                    <Bar dataKey="calories" fill="url(#blueGrad)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                    <defs>
                      <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* ━━━ Monthly Summary ━━━ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {monthlyMetrics.map((metric) => (
            <div
              key={metric.label}
              className="bg-white rounded-2xl p-4 shadow-sm border border-border relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                <metric.icon size={48} />
              </div>
              <p className="text-sm text-muted-foreground mb-2">{metric.label}</p>
              <p className="text-2xl font-bold text-foreground">
                {metric.value.toLocaleString()}
                <span className="text-sm text-muted-foreground ml-1">
                  {metric.unit}
                </span>
              </p>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${metric.color} transition-all duration-700`}
                  style={{
                    width: `${Math.min(metric.target > 0 ? (metric.value / metric.target) * 100 : 0, 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Target: {metric.target.toLocaleString()} {metric.unit}
              </p>
            </div>
          ))}
        </div>

        {/* ━━━ Body Metrics ━━━ */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Metrik Tubuh</h2>
            <span className="text-xs text-muted-foreground bg-gray-100 px-3 py-1 rounded-full">
              Klik nilai untuk mengedit
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bodyMetricCards.map((metric) => (
              <div
                key={metric.key}
                className="p-4 rounded-xl border border-border bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{metric.label}</p>

                    {editingMetric === metric.key ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(metric.key);
                            if (e.key === 'Escape') setEditingMetric(null);
                          }}
                          onBlur={() => saveEdit(metric.key)}
                          autoFocus
                          className="w-24 text-2xl font-bold text-foreground border-b-2 border-primary outline-none bg-transparent"
                          step="0.1"
                        />
                        <span className="text-sm text-muted-foreground">{metric.unit}</span>
                        <button
                          onClick={() => saveEdit(metric.key)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Save size={16} />
                        </button>
                      </div>
                    ) : (
                      <div
                        className={`flex items-center gap-2 mt-1 group/val ${metric.readonly ? '' : 'cursor-pointer'
                          }`}
                        onClick={() => !metric.readonly && startEdit(metric.key, metric.value)}
                      >
                        <p className="text-2xl font-bold text-foreground">
                          {metric.value}
                          <span className="text-sm text-muted-foreground ml-1">
                            {metric.unit}
                          </span>
                        </p>
                        {!metric.readonly && (
                          <Edit3
                            size={14}
                            className="text-muted-foreground opacity-0 group-hover/val:opacity-100 transition-opacity"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {!metric.hideProgress && metric.target > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Saat ini</span>
                      <span>
                        Target: {metric.target} {metric.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                        style={{
                          width: `${Math.min((metric.value / metric.target) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ━━━ Achievements ━━━ */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
          <h2 className="text-xl font-bold text-foreground mb-6">Pencapaian</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loadingAch ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                Memuat pencapaian...
              </div>
            ) : achievements.length > 0 ? (
              achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${achievement.unlocked
                      ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-sm'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                >
                  <p className="text-3xl mb-2">{achievement.icon || '🏆'}</p>
                  <p className="font-semibold text-foreground text-sm">
                    {achievement.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 mb-2">
                    {achievement.description}
                  </p>
                  {achievement.unlocked && (
                    <p className="text-xs text-green-600 font-medium">
                      ✓ {achievement.date || 'Unlocked'}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                Belum ada pencapaian.
              </div>
            )}
          </div>
        </div>

        {/* ━━━ Action Buttons ━━━ */}
        <div className="flex gap-3 justify-center pb-6 print:hidden">
          <Button
            variant="outline"
            className="border-primary text-primary hover:bg-primary/5 bg-transparent"
            onClick={handleExportPDF}
          >
            <Download size={16} className="mr-2" />
            Export PDF
          </Button>
          <Button
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            onClick={() => {
              setGoalDraft(goals);
              setShowGoalModal(true);
            }}
          >
            <TrendingUp size={16} className="mr-2" />
            Buat Goal Baru
          </Button>
        </div>
      </div>

      {/* ━━━ Goal Setting Modal ━━━ */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200 print:hidden">
          <div className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Atur Target Harian</h3>
                <p className="text-white/80 text-sm mt-1">Sesuaikan goal kesehatan Anda</p>
              </div>
              <button
                onClick={() => setShowGoalModal(false)}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Calorie Target */}
              <div>
                <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                  <Flame size={16} className="text-orange-500" />
                  Target Kalori Harian
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={goalDraft.calorieTarget}
                    onChange={(e) =>
                      setGoalDraft({ ...goalDraft, calorieTarget: Number(e.target.value) })
                    }
                    className="flex-1 px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                    min={500}
                    max={10000}
                  />
                  <span className="text-sm text-muted-foreground w-8">cal</span>
                </div>
              </div>

              {/* Steps Target */}
              <div>
                <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                  <Footprints size={16} className="text-blue-500" />
                  Target Langkah Harian
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={goalDraft.stepsTarget}
                    onChange={(e) =>
                      setGoalDraft({ ...goalDraft, stepsTarget: Number(e.target.value) })
                    }
                    className="flex-1 px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                    min={1000}
                    max={100000}
                    step={1000}
                  />
                  <span className="text-sm text-muted-foreground w-12">steps</span>
                </div>
              </div>

              {/* Water Target */}
              <div>
                <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                  <Droplet size={16} className="text-cyan-500" />
                  Target Air Minum Harian
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={goalDraft.waterTarget}
                    onChange={(e) =>
                      setGoalDraft({ ...goalDraft, waterTarget: Number(e.target.value) })
                    }
                    className="flex-1 px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                    min={0.5}
                    max={10}
                    step={0.5}
                  />
                  <span className="text-sm text-muted-foreground w-8">L</span>
                </div>
              </div>

              {/* Activity Target */}
              <div>
                <label className="text-sm font-semibold text-foreground flex items-center gap-2 mb-2">
                  <Target size={16} className="text-purple-500" />
                  Target Sesi Aktivitas / Bulan
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={goalDraft.activityTarget}
                    onChange={(e) =>
                      setGoalDraft({ ...goalDraft, activityTarget: Number(e.target.value) })
                    }
                    className="flex-1 px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                    min={1}
                    max={100}
                  />
                  <span className="text-sm text-muted-foreground w-8">sesi</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-border text-muted-foreground hover:bg-gray-50"
                  onClick={() => setShowGoalModal(false)}
                >
                  Batal
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg shadow-primary/20"
                  onClick={saveGoals}
                >
                  <Save size={16} className="mr-2" />
                  Simpan Target
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          nav, .sidebar, header, .print\\:hidden {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .print\\:static {
            position: static !important;
          }
          .print\\:bg-white {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
