'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Utensils,
  X,
  Plus,
  Check,
  Flame,
  Dumbbell,
  Wheat,
  Droplets,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FoodScanner } from '@/components/food-scanner';
import { FoodItem } from '@/types/food';



export function FoodPage() {
  const [activeTab, setActiveTab] = useState('log');
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);

  const foodItems = [
    {
      id: '1',
      name: 'Nasi Goreng Sayuran',
      calories: 450,
      protein: 15,
      carbs: 65,
      fat: 12,
      portion: '1 piring',
      image: '🍚',
      category: 'Sarapan',
    },
    {
      id: '2',
      name: 'Ayam Grilled',
      calories: 250,
      protein: 35,
      carbs: 0,
      fat: 8,
      portion: '150g',
      image: '🍗',
      category: 'Makan Siang',
    },
    {
      id: '3',
      name: 'Salad Sayuran Segar',
      calories: 120,
      protein: 8,
      carbs: 18,
      fat: 3,
      portion: '1 mangkuk',
      image: '🥗',
      category: 'Makan Malam',
    },
    {
      id: '4',
      name: 'Apel Merah',
      calories: 95,
      protein: 0,
      carbs: 25,
      fat: 0,
      portion: '1 buah',
      image: '🍎',
      category: 'Snack',
    },
    {
      id: '5',
      name: 'Telur Rebus',
      calories: 78,
      protein: 6,
      carbs: 0.6,
      fat: 5,
      portion: '1 butir besar',
      image: '🥚',
      category: 'Sarapan',
    },
    {
      id: '6',
      name: 'Roti Gandum',
      calories: 69,
      protein: 3.6,
      carbs: 11.6,
      fat: 0.9,
      portion: '1 lembar',
      image: '🍞',
      category: 'Sarapan',
    },
    {
      id: '7',
      name: 'Pisang',
      calories: 105,
      protein: 1.3,
      carbs: 27,
      fat: 0.3,
      portion: '1 buah sedang',
      image: '🍌',
      category: 'Snack',
    },
    {
      id: '8',
      name: 'Jus Jeruk',
      calories: 112,
      protein: 2,
      carbs: 26,
      fat: 0.5,
      portion: '1 gelas (250ml)',
      image: '🍊',
      category: 'Sarapan',
    },
    {
      id: '9',
      name: 'Gado-Gado',
      calories: 320,
      protein: 18,
      carbs: 45,
      fat: 10,
      portion: '1 piring',
      image: '🥬',
      category: 'Makan Siang',
    },
    {
      id: '10',
      name: 'Sate Ayam',
      calories: 350,
      protein: 30,
      carbs: 15,
      fat: 16,
      portion: '5 tusuk + lontong',
      image: '🍡',
      category: 'Makan Malam',
    },
    {
      id: '11',
      name: 'Bakso Sapi',
      calories: 400,
      protein: 25,
      carbs: 50,
      fat: 20,
      portion: '1 mangkuk',
      image: '🍲',
      category: 'Makan_Siang',
    },
  ];

  const mealCategories = [
    { id: 'sarapan', label: 'Sarapan', icon: '🍳', color: 'from-orange-400 to-amber-400' },
    { id: 'makan_siang', label: 'Makan Siang', icon: '🍗', color: 'from-red-500 to-orange-500' },
    { id: 'makan_malam', label: 'Makan Malam', icon: '🥗', color: 'from-green-500 to-emerald-500' },
    { id: 'snack', label: 'Snack', icon: '🥪', color: 'from-purple-500 to-pink-500' },
  ];

  // State for daily logs
  const [dailyLogs, setDailyLogs] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('sarapan');
  const [showToast, setShowToast] = useState(false);
  const [showAllFood, setShowAllFood] = useState(false); // Toggle state
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  // Filter food items based on selected category (for suggestion list)
  const filteredFoodItems = foodItems; // Show all or filter if needed. Currently showing popular.

  // Fetch logs on mount
  useEffect(() => {
    fetchFoodLogs();
  }, []);

  const fetchFoodLogs = async () => {
    try {
      setIsLoadingLogs(true);
      const res = await fetch('/api/food/logs');
      if (res.ok) {
        const data = await res.json();
        // Map API response to frontend structure
        const mappedLogs = data.map((log: any) => ({
          id: log.id.toString(),
          name: log.foodName,
          calories: log.calories,
          protein: log.protein,
          carbs: log.carbs,
          fat: log.fat,
          category: log.mealCategory,
          portion: log.portion,
          image: log.photoUrl || (getCameraIcon(log.mealCategory)), // Fallback icon
          date: log.loggedAt
        }));
        setDailyLogs(mappedLogs);
      }
    } catch (e) {
      console.error('Error fetching food logs:', e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const getCameraIcon = (category: string) => {
    switch (category) {
      case 'sarapan': return '🍳';
      case 'makan_siang': return '🍗';
      case 'makan_malam': return '🥗';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  const handleAddFood = async () => {
    if (!selectedFood) return;

    const newLog = {
      foodName: selectedFood.name,
      mealCategory: selectedCategory,
      calories: selectedFood.calories,
      protein: selectedFood.protein,
      carbs: selectedFood.carbs,
      fat: selectedFood.fat,
      portion: selectedFood.portion,
      photoUrl: selectedFood.image
    };

    try {
      const res = await fetch('/api/food/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });

      if (res.ok) {
        fetchFoodLogs(); // Refresh list
        setActiveTab('log');
        setSelectedFood(null);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        alert('Gagal menyimpan makanan.');
      }
    } catch (e) {
      console.error('Error saving food log:', e);
      alert('Terjadi kesalahan koneksi.');
    }
  };

  const quickAdd = async (food: FoodItem) => {
    const newLog = {
      foodName: food.name,
      mealCategory: selectedCategory,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      portion: food.portion,
      photoUrl: food.image
    };

    try {
      const res = await fetch('/api/food/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLog),
      });

      if (res.ok) {
        fetchFoodLogs();
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (e) {
      console.error('Error saving quick log:', e);
    }
  };

  // Calculate totals
  const totals = dailyLogs.reduce((acc, item) => ({
    calories: acc.calories + item.calories,
    protein: acc.protein + item.protein,
    carbs: acc.carbs + item.carbs,
    fat: acc.fat + item.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // console.log('File selected:', file.name, file.type, file.size);
    setIsAnalyzing(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        // console.log('Base64 generated, sending to API...');

        const response = await fetch('/api/ai/analyze-food', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64String }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API Error:', errorData);
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        // console.log('Analysis result:', data);

        const foodItem: FoodItem = {
          id: Date.now().toString(),
          name: data.name || 'Unknown Food',
          calories: data.calories || 0,
          protein: data.protein || 0,
          carbs: data.carbs || 0,
          fat: data.fat || 0,
          portion: data.portion || '1 porsi',
          image: base64String,
          category: selectedCategory, // Auto-assign current category
        };

        setSelectedFood(foodItem);
      };

      reader.onerror = () => {
        throw new Error('Failed to read file');
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(`Gagal memproses gambar: ${error.message}. Pastikan koneksi internet stabil.`);
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Removed duplicate addToLog and old quickAdd

  if (showScanner) {
    return (
      <FoodScanner
        onClose={() => setShowScanner(false)}
        onCheck={(food) => {
          setShowScanner(false);
          if (typeof food !== 'string') {
            // Use API for scanner result
            quickAdd(food);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative pb-20">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-5 fade-in duration-300 pointer-events-none">
          <div className="bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3">
            <div className="bg-green-500 rounded-full p-1"><Check size={12} /></div>
            <span className="font-medium text-sm">Berhasil ditambahkan ke Log</span>
          </div>
        </div>
      )}

      {isAnalyzing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl flex flex-col items-center shadow-2xl animate-in zoom-in-95 max-w-xs text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 border-4 border-primary/30 rounded-full"></div>
              <div className="absolute top-0 left-0 w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" size={24} />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Menganalisa Makanan</h3>
            <p className="text-sm text-muted-foreground">AI sedang menghitung kalori dan nutrisi dari foto Anda...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-border sticky top-16 md:top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Hitung Makanan</h1>
            <p className="text-sm text-muted-foreground mt-1 hidden md:block">
              Pantau asupan nutrisi harian Anda
            </p>
          </div>
          <div className="bg-primary/10 text-primary px-4 py-2 rounded-full font-semibold text-sm">
            🔥 {totals.calories} / 2500 cal
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">

        {/* Nutrition Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div className="p-4 rounded-2xl bg-white border border-orange-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Flame size={48} className="text-orange-500" />
            </div>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Kalori</p>
            <div className="flex items-end gap-1">
              <span className="text-2xl md:text-3xl font-bold text-foreground">{totals.calories}</span>
              <span className="text-sm text-muted-foreground mb-1">cal</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min((totals.calories / 2500) * 100, 100)}%` }}></div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-blue-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Dumbbell size={48} className="text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Protein</p>
            <div className="flex items-end gap-1">
              <span className="text-2xl md:text-3xl font-bold text-foreground">{totals.protein}g</span>
              <span className="text-sm text-muted-foreground mb-1">/ 100g</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((totals.protein / 100) * 100, 100)}%` }}></div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-amber-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Wheat size={48} className="text-amber-500" />
            </div>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Karbo</p>
            <div className="flex items-end gap-1">
              <span className="text-2xl md:text-3xl font-bold text-foreground">{totals.carbs}g</span>
              <span className="text-sm text-muted-foreground mb-1">/ 300g</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min((totals.carbs / 300) * 100, 100)}%` }}></div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-yellow-100 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Droplets size={48} className="text-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">Lemak</p>
            <div className="flex items-end gap-1">
              <span className="text-2xl md:text-3xl font-bold text-foreground">{totals.fat}g</span>
              <span className="text-sm text-muted-foreground mb-1">/ 80g</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${Math.min((totals.fat / 80) * 100, 100)}%` }}></div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setShowScanner(true)}
            className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary to-purple-600 rounded-2xl text-white shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95 cursor-pointer"
          >
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3">
              <Camera size={24} />
            </div>
            <h3 className="font-bold text-lg">Scan Makanan</h3>
            <p className="text-white/80 text-sm">Gunakan kamera untuk deteksi otomatis</p>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-primary/10">
              <Plus size={24} />
            </div>
            <h3 className="font-bold text-lg">Upload Galeri</h3>
            <p className="text-sm opacity-70">Pilih foto dari penyimpanan perangkat</p>
          </button>
        </div>

        {/* Daily Log List */}
        {dailyLogs.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Utensils size={20} className="text-primary" />
              Log Hari Ini
            </h2>
            <div className="space-y-3">
              {dailyLogs.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="flex items-center p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                  <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden mr-4">
                    {item.image.startsWith('data:') ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-3xl">{item.image}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.portion}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{item.calories} cal</p>
                    <p className="text-xs text-muted-foreground">{item.protein}g P • {item.carbs}g C</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Log */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Pilih Kategori Waktu
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {mealCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${selectedCategory === category.id
                  ? 'border-primary bg-primary/5 shadow-md scale-[1.02]'
                  : 'border-border bg-white hover:border-gray-300'
                  }`}
              >
                <span className="text-3xl block mb-2">{category.icon}</span>
                <p className={`text-sm font-semibold transition-colors ${selectedCategory === category.id ? 'text-primary' : 'text-foreground'
                  }`}>
                  {category.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Food Search/List */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">
              Makanan Populer ({selectedCategory})
            </h2>
            <Button
              variant="outline"
              className="text-primary border-primary hover:bg-primary/5 bg-transparent"
              onClick={() => setShowAllFood(!showAllFood)}
            >
              {showAllFood ? 'Tutup' : 'Lihat Semua'}
            </Button>
          </div>

          <div className="space-y-3">
            {filteredFoodItems.slice(0, showAllFood ? undefined : 4).map((food) => (
              <div
                key={food.id}
                className="p-4 rounded-xl border border-border hover:border-primary hover:shadow-md transition-all cursor-pointer bg-gradient-to-r from-white to-gray-50 group"
              >
                <div className="flex items-center justify-between">
                  {/* Clickable Area for Details */}
                  <div
                    className="flex items-center gap-4 flex-1"
                    onClick={() => setSelectedFood({ ...food, category: selectedCategory })}
                  >
                    <span className="text-4xl">{food.image}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">
                        {food.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {food.portion}
                      </p>
                      <div className="flex gap-4 mt-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1 text-sm">
                          <Flame size={14} className="text-orange-500" />
                          <span>{food.calories}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Dumbbell size={14} className="text-blue-500" />
                          <span>{food.protein}g</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Add Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      quickAdd(food);
                    }}
                    className="bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors h-10 w-10 p-0 rounded-full shadow-sm"
                    size="sm"
                    title="Quick Add"
                  >
                    <Plus size={20} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Result Modal - PRETTY VERSION */}
      {selectedFood && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl overflow-hidden max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Image Header */}
            <div className="relative h-48 bg-gray-100">
              {selectedFood.image.startsWith('data:') ? (
                <img src={selectedFood.image} alt={selectedFood.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 text-6xl">
                  {selectedFood.image}
                </div>
              )}
              <button
                onClick={() => setSelectedFood(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-foreground leading-tight mb-1">
                  {selectedFood.name}
                </h3>
                <p className="text-muted-foreground font-medium">
                  {selectedFood.portion}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="p-3 bg-orange-50 rounded-2xl border border-orange-100 text-center">
                  <p className="text-orange-500 font-bold text-xl">{selectedFood.calories}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Kalori</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                  <p className="text-blue-500 font-bold text-xl">{selectedFood.protein}g</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Protein</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-center">
                  <p className="text-amber-500 font-bold text-xl">{selectedFood.carbs}g</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Karbo</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-2xl border border-yellow-100 text-center">
                  <p className="text-yellow-500 font-bold text-xl">{selectedFood.fat}g</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Lemak</p>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 h-12 text-lg rounded-xl shadow-lg shadow-primary/20"
                  onClick={handleAddFood}
                >
                  <Check size={20} className="mr-2" />
                  Tambahkan ke Log
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground hover:bg-gray-100 rounded-xl"
                  onClick={() => setSelectedFood(null)}
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
