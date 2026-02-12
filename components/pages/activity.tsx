import { useState, useEffect, useRef } from 'react';
import { Play, Pause, MapPin, Clock, Zap, Heart, Navigation, Plus, Flame, Footprints, Bike, Dumbbell, Building as Swimming, Share2, X, Camera, Check, Download, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActivityTemplateCard, TEMPLATES } from '@/components/activity-template-card';
import html2canvas from 'html2canvas';

export function ActivityPage() {
  const [activeTab, setActiveTab] = useState('history');
  const [isTracking, setIsTracking] = useState(false);
  const [activeActivity, setActiveActivity] = useState<string | null>(null);

  // Tracking State
  const [timer, setTimer] = useState(0);
  const [sessionData, setSessionData] = useState({
    calories: 0,
    distance: 0,
    heartRate: 0
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // History State
  const [activityHistory, setActivityHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Share Modal State
  const [showShareModal, setShowShareModal] = useState(false);
  const [activityToShare, setActivityToShare] = useState<any | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [sharePhoto, setSharePhoto] = useState<string>('https://images.unsplash.com/photo-1552674605-46d536d2bcce?auto=format&fit=crop&q=80&w=800'); // Default running photo
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const templateRef = useRef<HTMLDivElement>(null);

  // Fetch history from API on mount
  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setIsLoadingHistory(true);
      const res = await fetch('/api/activities');
      if (res.ok) {
        const data = await res.json();
        setActivityHistory(data);
      } else {
        console.error('Failed to fetch activities');
      }
    } catch (e) {
      console.error('Error fetching activities:', e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Timer & Simulation Logic
  useEffect(() => {
    if (isTracking) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);

        // Simulate metrics based on activity type (simplified)
        setSessionData((prev) => {
          let calRate = 0.15; // default calories per second
          let distRate = 0; // default km per second

          if (activeActivity === 'Jogging') { calRate = 0.2; distRate = 0.003; }
          else if (activeActivity === 'Cycling') { calRate = 0.15; distRate = 0.006; }
          else if (activeActivity === 'Gym') { calRate = 0.12; distRate = 0; }
          else if (activeActivity === 'Renang') { calRate = 0.25; distRate = 0.001; }

          return {
            calories: prev.calories + calRate,
            distance: prev.distance + distRate,
            heartRate: 80 + Math.random() * 40 + (activeActivity === 'Running' ? 20 : 0) // Sim HR variation
          };
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isTracking, activeActivity]);

  const startTracking = (type: string) => {
    setActiveActivity(type);
    setIsTracking(true);
    setTimer(0);
    setSessionData({ calories: 0, distance: 0, heartRate: 85 });
  };

  const stopTracking = async () => {
    setIsTracking(false);

    const newActivity = {
      type: activeActivity || 'Activity',
      duration: Math.ceil(timer / 60), // minutes
      calories: Math.floor(sessionData.calories),
      distance: Number(sessionData.distance.toFixed(1)),
      avgHR: Math.floor(sessionData.heartRate),
    };

    // Save to Database
    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newActivity),
      });

      if (res.ok) {
        const savedActivity = await res.json();
        // Optimistically update UI or re-fetch
        fetchActivities();
      } else {
        alert('Gagal menyimpan aktivitas ke database.');
      }
    } catch (e) {
      console.error('Error saving activity:', e);
      alert('Terjadi kesalahan koneksi.');
    }

    setActiveActivity(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper to map icon names back to components if needed, or just use a lookup
  const getIcon = (type: string) => {
    switch (type) {
      case 'Jogging': return Footprints;
      case 'Cycling': return Bike;
      case 'Gym': return Dumbbell;
      case 'Renang': return Swimming;
      default: return Zap;
    }
  };

  const openShareModal = (activity: any) => {
    setActivityToShare(activity);
    setShowShareModal(true);
    // Determine default photo based on activity type if we wanted to be fancy, but stick to generic for now
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSharePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportImage = async () => {
    if (!templateRef.current) return null;

    setIsGenerating(true);
    try {
      // Use html2canvas to capture the element
      const canvas = await html2canvas(templateRef.current, {
        useCORS: true, // Important for unsplash images
        scale: 2, // Better quality
        backgroundColor: null
      });

      const dataUrl = canvas.toDataURL('image/png');
      return dataUrl;
    } catch (err) {
      console.error('Export failed', err);
      alert('Gagal membuat gambar template. Pastikan koneksi internet stabil (untuk load gambar).');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareToWhatsapp = async () => {
    if (!activityToShare) return;

    // For WhatsApp, we can only share text/links easily via URL scheme. 
    // We can't attach an image blob programmatically via web URL scheme.
    // So we'll prompt user to download the image first, then share text.

    const image = await handleExportImage();
    if (image) {
      const link = document.createElement('a');
      link.download = `pathra-activity-${Date.now()}.png`;
      link.href = image;
      link.click();

      const text = `🔥 Saya baru saja menyelesaikan ${activityToShare.type} di PATHRA!\n\n🏁 Jarak: ${activityToShare.distance} km\n⏱️ Waktu: ${activityToShare.duration} menit\n🔥 Kalori: ${activityToShare.calories} cal\n\nAyo gabung di PATHRA App! #PATHRA #HealthyLifestyle`;

      setTimeout(() => {
        if (confirm('Gambar template telah didownload! Lanjut kirim pesan ke WhatsApp?')) {
          window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        }
      }, 500);
    }
  };

  const handleShareToInstagram = async () => {
    const image = await handleExportImage();
    if (image) {
      const link = document.createElement('a');
      link.download = `pathra-story-${Date.now()}.png`;
      link.href = image;
      link.click();
      alert('Gambar template tersimpan! Silakan upload ke Instagram Stories Anda.');
    }
  };

  // Calculate Totals
  const weeklyStats = activityHistory.reduce((acc, curr) => ({
    count: acc.count + 1,
    calories: acc.calories + curr.calories,
    distance: acc.distance + curr.distance
  }), { count: 0, calories: 0, distance: 0 });

  const quickActivities = [
    { name: 'Jogging', icon: Footprints, color: 'from-blue-500 to-cyan-500' },
    { name: 'Cycling', icon: Bike, color: 'from-green-500 to-emerald-500' },
    { name: 'Gym', icon: Dumbbell, color: 'from-purple-500 to-pink-500' },
    { name: 'Renang', icon: Swimming, color: 'from-cyan-500 to-blue-500' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20 md:pb-6">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-16 md:top-0 z-10 transition-all shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">Aktivitas</h1>
          <p className="text-muted-foreground mt-1">
            Track aktivitas fisik Anda secara real-time
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Live Tracking */}
        {isTracking && (
          <div className="bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl p-8 text-white shadow-lg border border-white/20 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm opacity-90">Sedang Tracking</p>
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-bold mt-1">{activeActivity}</h2>
                  <span className="animate-pulse w-2 h-2 rounded-full bg-red-400 block mt-2"></span>
                </div>
              </div>
              <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center animate-pulse">
                <Heart className="text-white" size={32} />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-sm opacity-80">Waktu</p>
                <p className="text-3xl font-mono font-bold tracking-wider">{formatTime(timer)}</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Jarak</p>
                <p className="text-2xl font-bold">{sessionData.distance.toFixed(2)} km</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Kalori</p>
                <p className="text-2xl font-bold">{Math.floor(sessionData.calories)} cal</p>
              </div>
              <div>
                <p className="text-sm opacity-80">Detak Jantung</p>
                <p className="text-2xl font-bold">{Math.floor(sessionData.heartRate)} BPM</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1 bg-white text-primary hover:bg-gray-100 h-12 font-bold"
                onClick={stopTracking}
              >
                <Pause size={20} className="mr-2 fill-current" />
                Hentikan Sesi
              </Button>
            </div>
          </div>
        )}

        {/* Quick Start Activities */}
        {!isTracking && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Mulai Aktivitas Cepat
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActivities.map((activity) => (
                <button
                  key={activity.name}
                  onClick={() => startTracking(activity.name)}
                  className="p-4 rounded-xl border-2 border-border hover:border-primary bg-white transition-all hover:shadow-md group active:scale-95"
                >
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${activity.color} flex items-center justify-center text-white mx-auto mb-3 group-hover:scale-110 transition-transform`}
                  >
                    <activity.icon size={24} />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    {activity.name}
                  </p>
                </button>
              ))}
            </div>
            <Button
              className="w-full mt-4 bg-gradient-to-r from-primary to-secondary hover:opacity-90 h-11"
              onClick={() => startTracking('Jogging')}
            >
              <Play size={18} className="mr-2" />
              Mulai Tracking Sekarang
            </Button>
          </div>
        )}

        {/* Activity History */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">
              Riwayat Aktivitas
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setActivityHistory([])} className="text-xs text-muted-foreground hover:text-destructive">
              Reset
            </Button>
          </div>

          <div className="space-y-3">
            {activityHistory.length > 0 ? (
              activityHistory.map((activity) => {
                const Icon = getIcon(activity.type);
                return (
                  <div
                    key={activity.id}
                    className="p-4 rounded-xl border border-border hover:border-primary hover:shadow-md transition-all bg-gradient-to-r from-white to-gray-50 flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white flex-shrink-0`}
                      >
                        <Icon size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground">
                          {activity.type}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.date}
                        </p>
                        <div className="flex flex-wrap gap-3 mt-3">
                          <div className="flex items-center gap-1 text-sm">
                            <Clock size={14} className="text-primary" />
                            <span>{activity.duration} min</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Navigation size={14} className="text-blue-500" />
                            <span>{activity.distance} km</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Flame size={14} className="text-orange-500" />
                            <span>{activity.calories} cal</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Heart size={14} className="text-red-500" />
                            <span>{activity.avgHR} BPM</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Share Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => openShareModal(activity)}
                    >
                      <Share2 size={18} />
                    </Button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-muted-foreground bg-gray-50 rounded-xl border border-dashed">
                <Footprints className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                <p>Belum ada aktivitas.</p>
                <p className="text-xs">Mulai bergerak sekarang!</p>
              </div>
            )}

          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
          <h2 className="text-xl font-bold text-foreground mb-6">
            Statistik Minggu Ini
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
              <p className="text-sm text-muted-foreground">Total Aktivitas</p>
              <p className="text-3xl font-bold text-foreground mt-2">{weeklyStats.count}</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
              <p className="text-sm text-muted-foreground">Total Kalori</p>
              <p className="text-3xl font-bold text-foreground mt-2">{weeklyStats.calories.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
              <p className="text-sm text-muted-foreground">Total Jarak</p>
              <p className="text-3xl font-bold text-foreground mt-2">{weeklyStats.distance.toFixed(1)} km</p>
            </div>
          </div>
        </div>
      </div>

      {/* ━━━ Share Modal ━━━ */}
      {showShareModal && activityToShare && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col md:flex-row max-h-[90vh]">

            {/* Left: Preview */}
            <div className="relative flex-1 bg-black flex items-center justify-center p-6 md:p-10 min-h-[400px]">
              <div ref={templateRef} className="w-full max-w-sm mx-auto shadow-2xl transform transition-transform hover:scale-[1.02]">
                <ActivityTemplateCard
                  imageDataUrl={sharePhoto}
                  template={selectedTemplate}
                  stats={{
                    type: activityToShare.type,
                    duration: formatTime(activityToShare.duration * 60),
                    distance: activityToShare.distance.toString(),
                    calories: activityToShare.calories,
                    pace: (activityToShare.duration / Math.max(activityToShare.distance, 0.1)).toFixed(1) + "'", // Simple pace calc
                    date: activityToShare.date,
                    userName: 'Saya' // Or fetch real user name
                  }}
                />
              </div>
            </div>

            {/* Right: Controls */}
            <div className="flex-1 flex flex-col bg-white">
              {/* Header */}
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Bagikan Aktivitas</h3>
                  <p className="text-xs text-muted-foreground">Pilih template dan bagikan pencapaianmu</p>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">

                {/* Template Selection */}
                <div>
                  <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <ImageIcon size={16} className="text-primary" /> Pilih Template
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplate(t)}
                        className={`relative rounded-lg overflow-hidden border-2 aspect-video group transition-all ${selectedTemplate.id === t.id ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-gray-300'
                          }`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${t.gradient || 'bg-gray-100'} opacity-80`} />
                        <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold ${t.textColor || 'text-gray-500'}`}>
                          {t.name}
                        </span>
                        {selectedTemplate.id === t.id && (
                          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center">
                            <Check size={10} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Photo Upload */}
                <div>
                  <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <Camera size={16} className="text-primary" /> Ganti Foto Background
                  </h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="w-full border-dashed"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Upload Foto
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-5 border-t border-border bg-gray-50 space-y-3">
                <Button
                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold"
                  onClick={handleShareToWhatsapp}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Share2 size={18} className="mr-2" />}
                  Bagikan ke WhatsApp
                </Button>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    className="flex-1 bg-gradient-to-br from-purple-600 to-pink-500 hover:opacity-90 text-white"
                    onClick={handleShareToInstagram}
                    disabled={isGenerating}
                  >
                    {isGenerating ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Share2 size={16} className="mr-2" />}
                    Instagram Stories
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleShareToInstagram} // Reusing download logic
                    disabled={isGenerating}
                  >
                    {isGenerating ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Download size={16} className="mr-2" />}
                    Simpan Gambar
                  </Button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
