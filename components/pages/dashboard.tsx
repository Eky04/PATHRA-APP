'use client';

import { useEffect, useState } from 'react';
import {
  Flame,
  Footprints,
  Droplet,
  TrendingUp,
  Clock,
  Plus,
  Zap,
  CheckCircle,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardPage() {
  // Determine greeting based on time
  const [greeting, setGreeting] = useState('Pagi');
  const [currentDate, setCurrentDate] = useState('');

  const [stats, setStats] = useState({
    calories: 0, // Start at 0, update from logs
    calorieTarget: 2500,
    steps: 8234,
    stepsTarget: 10000,
    water: 1.5,
    waterTarget: 2,
  });

  const [todayLogs, setTodayLogs] = useState<any[]>([]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Pagi');
    else if (hour >= 12 && hour < 15) setGreeting('Siang');
    else if (hour >= 15 && hour < 18) setGreeting('Sore');
    else setGreeting('Malam');

    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setCurrentDate(new Date().toLocaleDateString('id-ID', options));
  }, []);

  // Load stats and logs from localStorage
  useEffect(() => {
    const savedLogs = localStorage.getItem('dailyLogs');
    if (savedLogs) {
      try {
        const parsedLogs = JSON.parse(savedLogs);

        // Transform to dashboard log format
        const dashboardLogs = parsedLogs.map((item: any, index: number) => ({
          id: item.id || index.toString(),
          time: new Date(Number(item.id)).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          type: item.category || 'Snack',
          items: item.name,
          calories: item.calories
        }));

        setTodayLogs(dashboardLogs.reverse().slice(0, 3)); // Show latest 3

        // Calculate total calories
        const totalCalories = parsedLogs.reduce((sum: number, item: any) => sum + (item.calories || 0), 0);

        setStats(prev => ({
          ...prev,
          calories: totalCalories
        }));

      } catch (e) {
        console.error('Failed to parse logs', e);
      }
    }
  }, []);

  const handleNavigateToFood = () => {
    window.dispatchEvent(new CustomEvent('navigateTo', { detail: 'food' }));
  };


  const progressBars = [
    {
      label: 'Kalori',
      current: stats.calories,
      target: stats.calorieTarget,
      icon: Flame,
      color: 'from-fuchsia-500 to-pink-500', // Updated color for aesthetic
      percent: Math.min(Math.round((stats.calories / stats.calorieTarget) * 100), 100),
    },
    {
      label: 'Langkah',
      current: stats.steps,
      target: stats.stepsTarget,
      icon: Footprints,
      color: 'from-blue-500 to-cyan-500',
      percent: Math.round((stats.steps / stats.stepsTarget) * 100),
    },
    {
      label: 'Air',
      current: stats.water,
      target: stats.waterTarget,
      icon: Droplet,
      color: 'from-cyan-500 to-blue-500',
      percent: Math.round((stats.water / stats.waterTarget) * 100),
    },
  ];

  const recommendations = [
    {
      id: '1',
      title: 'Mulai Aktivitas Pagi',
      description: 'Jogging 20 menit untuk meningkatkan energi',
      icon: Zap,
      color: 'bg-yellow-50 border-yellow-200',
    },
    {
      id: '2',
      title: 'Snack Sehat',
      description: 'Coba granola bar atau buah-buahan segar',
      icon: Target,
      color: 'bg-green-50 border-green-200',
    },
    {
      id: '3',
      title: 'Minum Air Putih',
      description: 'Anda sudah minum 1.5L, kurang 0.5L lagi',
      icon: Droplet,
      color: 'bg-blue-50 border-blue-200',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-16 md:top-0 z-10 transition-all shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
              Selamat {greeting}, User
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Clock size={16} />
              {currentDate} - Jangan lupa jaga kesehatan!
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Progress Bars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {progressBars.map((bar) => (
            <div
              key={bar.label}
              className="bg-white rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${bar.color} flex items-center justify-center text-white`}
                  >
                    <bar.icon size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{bar.label}</p>
                    <p className="text-2xl font-bold text-foreground">
                      {bar.current}
                      <span className="text-sm text-muted-foreground ml-1">
                        / {bar.target}
                      </span>
                    </p>
                  </div>
                </div>
                <span
                  className={`text-lg font-bold px-3 py-1 rounded-full ${bar.percent >= 100
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                    }`}
                >
                  {bar.percent}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${bar.color} transition-all duration-500`}
                  style={{
                    width: `${Math.min(bar.percent, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`rounded-2xl p-4 border-2 ${rec.color} hover:shadow-md transition-shadow cursor-pointer`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white flex-shrink-0">
                  <rec.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">
                    {rec.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {rec.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Log Makanan</h2>
            <Button
              size="sm"
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              onClick={handleNavigateToFood}
            >
              <Plus size={16} className="mr-2" />
              Tambah
            </Button>
          </div>

          <div className="space-y-3">
            {todayLogs.length > 0 ? (
              todayLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-transparent rounded-xl border border-border hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-center min-w-fit">
                      <Clock size={16} className="text-primary mx-auto mb-1" />
                      <p className="text-sm font-semibold">{log.time}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {log.type}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {log.items}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {log.calories}
                    </p>
                    <p className="text-xs text-muted-foreground">cal</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Belum ada log makanan hari ini.</p>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            className="w-full mt-4 text-primary border-primary hover:bg-primary/5 bg-transparent"
            onClick={handleNavigateToFood}
          >
            Lihat Semua Log
          </Button>
        </div>
      </div>
    </div>
  );
}
