'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Send,
  MessageCircle,
  Sparkles,
  ThumbsUp,
  Copy,
  RotateCw,
  Check,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string | number;
  type: 'user' | 'ai';
  content: string;
  timestamp?: string;
  created_at?: string;
  liked?: boolean;
  copied?: boolean;
}

interface DailyStats {
  calories: number;
  calorieTarget: number;
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}

const WELCOME_MSG: Message = {
  id: 'welcome',
  type: 'ai',
  content: 'Halo! 👋 Saya PATHRA Coach, asisten kesehatan dan kebugaran Anda. Saya bisa membantu Anda soal nutrisi, olahraga, diet, dan tips hidup sehat lainnya. Ada yang bisa saya bantu hari ini?',
  timestamp: new Date().toISOString(),
};

export function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [showToast, setShowToast] = useState('');
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    calories: 0, calorieTarget: 2100, protein: 0, carbs: 0, fat: 0, water: 0,
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = [
    { icon: '💪', text: 'Saya capek setelah olahraga' },
    { icon: '🥗', text: 'Menu makan sehat apa yang cocok?' },
    { icon: '🧠', text: 'Bagaimana cara menahan nafsu makan?' },
    { icon: '⚖️', text: 'Tips menurunkan berat badan sehat' },
  ];

  // Load daily stats from localStorage
  useEffect(() => {
    try {
      // Calorie data from food logs
      const savedLogs = localStorage.getItem('dailyLogs');
      if (savedLogs) {
        const logs = JSON.parse(savedLogs);
        const today = new Date().toISOString().split('T')[0];
        const todayLogs = logs.filter((l: any) => {
          const logDate = l.date || l.timestamp?.split('T')[0] || '';
          return logDate === today;
        });

        const totals = todayLogs.reduce(
          (acc: any, item: any) => ({
            calories: acc.calories + (item.calories || 0),
            protein: acc.protein + (item.protein || 0),
            carbs: acc.carbs + (item.carbs || 0),
            fat: acc.fat + (item.fat || 0),
          }),
          { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );

        // Water from localStorage
        let water = 0;
        try {
          const waterData = localStorage.getItem('waterIntake');
          if (waterData) water = JSON.parse(waterData)?.today || 0;
        } catch { }

        // Goals
        let calorieTarget = 2100;
        try {
          const goals = localStorage.getItem('userGoals');
          if (goals) calorieTarget = JSON.parse(goals)?.calorieTarget || 2100;
        } catch { }

        setDailyStats({
          calories: totals.calories,
          calorieTarget,
          protein: totals.protein,
          carbs: totals.carbs,
          fat: totals.fat,
          water,
        });
      }
    } catch { }
  }, []);

  // Load messages on mount
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/coach');
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages.map((m: any) => ({ ...m, liked: false, copied: false })));
          setConversationId(data.conversationId);
          setIsOffline(false);
        } else if (res.status === 401) {
          // Not logged in — use localStorage fallback
          loadLocalMessages();
          setIsOffline(true);
        } else {
          throw new Error('API error');
        }
      } catch {
        loadLocalMessages();
        setIsOffline(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const loadLocalMessages = () => {
    try {
      const saved = localStorage.getItem('coachMessages');
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([WELCOME_MSG]);
      }
    } catch {
      setMessages([WELCOME_MSG]);
    }
  };

  const saveLocalMessages = (msgs: Message[]) => {
    try {
      localStorage.setItem('coachMessages', JSON.stringify(msgs));
    } catch { }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const toast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(''), 2500);
  };

  const handleSendMessage = async (text: string = inputValue) => {
    if (!text.trim() || isSending) return;

    const userMsgContent = text.trim();
    setInputValue('');
    setIsSending(true);

    const tempId = `temp-${Date.now()}`;
    const userMsg: Message = {
      id: tempId,
      type: 'user',
      content: userMsgContent,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);

    if (!isOffline && conversationId) {
      // Online mode — call API
      try {
        const res = await fetch('/api/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId, content: userMsgContent }),
        });

        if (res.ok) {
          const data = await res.json();
          setMessages((prev) => {
            const updated = [
              ...prev.filter((m) => m.id !== tempId),
              { ...userMsg, id: `user-${Date.now()}` },
              { ...data.aiMessage, liked: false, copied: false },
            ];
            return updated;
          });
        } else {
          throw new Error('API error');
        }
      } catch {
        // Fallback to local
        const fallbackResponse = generateLocalResponse(userMsgContent);
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: fallbackResponse,
          timestamp: new Date().toISOString(),
          liked: false,
          copied: false,
        };
        setMessages((prev) => {
          const updated = [...prev, aiMsg];
          saveLocalMessages(updated);
          return updated;
        });
      }
    } else {
      // Offline mode — generate local response
      // Small delay to simulate "thinking"
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));
      const fallbackResponse = generateLocalResponse(userMsgContent);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: fallbackResponse,
        timestamp: new Date().toISOString(),
        liked: false,
        copied: false,
      };
      setMessages((prev) => {
        const updated = [...prev, aiMsg];
        saveLocalMessages(updated);
        return updated;
      });
    }

    setIsSending(false);
    inputRef.current?.focus();
  };

  const handleCopy = async (msgId: string | number, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, copied: true } : m))
      );
      toast('Pesan disalin! 📋');
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === msgId ? { ...m, copied: false } : m))
        );
      }, 2000);
    } catch {
      toast('Gagal menyalin pesan');
    }
  };

  const handleLike = (msgId: string | number) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, liked: !m.liked } : m))
    );
    toast('Terima kasih atas feedback! 👍');
  };

  const handleRegenerate = async (msgId: string | number) => {
    // Find the user message before this AI message
    const idx = messages.findIndex((m) => m.id === msgId);
    if (idx <= 0) return;

    // Look backward for the most recent user message
    let userMsg: Message | null = null;
    for (let i = idx - 1; i >= 0; i--) {
      if (messages[i].type === 'user') {
        userMsg = messages[i];
        break;
      }
    }
    if (!userMsg) return;

    // Remove the AI message and re-send
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    await handleSendMessage(userMsg.content);
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      return new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const caloriePercent = dailyStats.calorieTarget > 0
    ? Math.min(100, Math.round((dailyStats.calories / dailyStats.calorieTarget) * 100))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col h-screen overflow-hidden">
      {/* Toast */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[70] animate-in slide-in-from-top-5 fade-in duration-300 pointer-events-none">
          <div className="bg-black/80 backdrop-blur-md text-white px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2">
            <div className="bg-green-500 rounded-full p-0.5"><Check size={10} /></div>
            <span className="font-medium text-sm">{showToast}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-border z-10 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white">
              <Sparkles size={20} />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">AI Coach</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                {isOffline ? (
                  <>
                    <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                    Mode lokal
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Terhubung • Gemini AI
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden max-w-7xl mx-auto w-full">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col relative h-full">
          <div id="chat-container" className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="space-y-4 pb-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.type === 'ai' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white mr-3 flex-shrink-0 mt-1">
                          <Sparkles size={14} />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] lg:max-w-lg px-4 py-3 rounded-2xl ${msg.type === 'user'
                            ? 'bg-gradient-to-r from-primary to-secondary text-white rounded-br-sm'
                            : 'bg-white border border-border text-foreground rounded-bl-sm shadow-sm'
                          }`}
                      >
                        <div className="text-sm md:text-base whitespace-pre-wrap leading-relaxed prose-strong:font-bold">
                          {msg.content.split('\n').map((line, i) => {
                            // Basic markdown bold rendering
                            const parts = line.split(/(\*\*.*?\*\*)/g);
                            return (
                              <span key={i}>
                                {parts.map((part, j) => {
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={j}>{part.slice(2, -2)}</strong>;
                                  }
                                  return <span key={j}>{part}</span>;
                                })}
                                {i < msg.content.split('\n').length - 1 && <br />}
                              </span>
                            );
                          })}
                        </div>
                        <p
                          className={`text-[10px] mt-2 text-right ${msg.type === 'user' ? 'text-white/70' : 'text-muted-foreground'
                            }`}
                        >
                          {formatTime(msg.timestamp || msg.created_at)}
                        </p>

                        {msg.type === 'ai' && msg.id !== 'welcome' && (
                          <div className="flex gap-1 mt-2 pt-2 border-t border-gray-100">
                            <button
                              onClick={() => handleLike(msg.id)}
                              className={`p-1.5 rounded-lg transition-all active:scale-90 ${msg.liked
                                  ? 'bg-primary/10 text-primary'
                                  : 'hover:bg-gray-100 text-muted-foreground hover:text-foreground'
                                }`}
                              title="Suka"
                            >
                              <ThumbsUp size={14} fill={msg.liked ? 'currentColor' : 'none'} />
                            </button>
                            <button
                              onClick={() => handleCopy(msg.id, msg.content)}
                              className={`p-1.5 rounded-lg transition-all active:scale-90 ${msg.copied
                                  ? 'bg-green-100 text-green-600'
                                  : 'hover:bg-gray-100 text-muted-foreground hover:text-foreground'
                                }`}
                              title="Salin"
                            >
                              {msg.copied ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                            <button
                              onClick={() => handleRegenerate(msg.id)}
                              className="p-1.5 hover:bg-gray-100 rounded-lg text-muted-foreground hover:text-foreground transition-all active:scale-90"
                              title="Regenerate"
                            >
                              <RotateCw size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isSending && (
                    <div className="flex justify-start">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white mr-3 flex-shrink-0">
                        <Sparkles size={14} />
                      </div>
                      <div className="bg-white border border-border px-5 py-4 rounded-2xl rounded-bl-sm flex gap-1.5 items-center shadow-sm">
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Suggestions */}
                {messages.length <= 1 && !isLoading && (
                  <div className="mt-8 space-y-4">
                    <p className="text-sm text-center text-muted-foreground font-medium">
                      Apa yang ingin Anda tanyakan?
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                      {suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(suggestion.text)}
                          className="p-4 rounded-xl border border-border bg-white hover:border-primary hover:shadow-md transition-all text-left group active:scale-[0.98]"
                        >
                          <span className="text-2xl block mb-2 group-hover:scale-110 transition-transform">
                            {suggestion.icon}
                          </span>
                          <p className="text-foreground text-sm font-medium">{suggestion.text}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-border p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-2 flex items-center gap-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ketik pesan Anda di sini..."
                  disabled={isSending || isLoading}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm md:text-base placeholder:text-muted-foreground outline-none px-2"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={isSending || isLoading || !inputValue.trim()}
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 disabled:opacity-50 rounded-xl w-10 h-10 p-0 shadow-lg shadow-primary/20"
                >
                  {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </Button>
              </div>
              <p className="text-[10px] text-center text-muted-foreground mt-3 uppercase tracking-widest font-bold">
                Diberdayakan oleh {isOffline ? 'PATHRA Coach' : 'Gemini AI'} • PATHRA Wellness
              </p>
            </div>
          </div>
        </div>

        {/* Right Sidebar (Desktop) */}
        <aside className="hidden xl:flex w-80 bg-white border-l border-border flex-col p-6 gap-6 overflow-y-auto">
          <h3 className="font-bold text-foreground">Status Harian</h3>

          {/* Calories */}
          <div className="bg-gray-50 p-5 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Kalori</span>
              <span className="text-xs font-bold text-primary">
                {dailyStats.calories.toLocaleString()} / {dailyStats.calorieTarget.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                style={{ width: `${caloriePercent}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground text-center">
              {caloriePercent > 0 ? `${caloriePercent}% dari target harian` : 'Belum ada data hari ini'}
            </p>
          </div>

          {/* Macros */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold">Rangkuman Nutrisi</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Protein</p>
                <p className="text-lg font-bold text-primary">{dailyStats.protein}g</p>
              </div>
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Karbo</p>
                <p className="text-lg font-bold text-primary">{dailyStats.carbs}g</p>
              </div>
              <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Lemak</p>
                <p className="text-lg font-bold text-primary">{dailyStats.fat}g</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Air</p>
                <p className="text-lg font-bold text-blue-600">{dailyStats.water} gl</p>
              </div>
            </div>
          </div>

          {/* Quick Topics */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold">Topik Populer</h4>
            <div className="space-y-2">
              {[
                { emoji: '🥗', text: 'Menu diet sehat' },
                { emoji: '🏋️', text: 'Program latihan' },
                { emoji: '😴', text: 'Tips tidur berkualitas' },
                { emoji: '💊', text: 'Panduan suplemen' },
              ].map((topic, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputValue(topic.text);
                    inputRef.current?.focus();
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 border border-border hover:border-primary/30 transition-all text-sm flex items-center gap-3 active:scale-[0.98]"
                >
                  <span className="text-lg">{topic.emoji}</span>
                  <span className="text-foreground font-medium">{topic.text}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto">
            <div className="relative rounded-2xl overflow-hidden aspect-video group cursor-pointer shadow-md hover:shadow-xl transition-all">
              <img
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="Yoga Wellness"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-4">
                <p className="text-white text-xs font-bold">Latihan Fokus</p>
                <p className="text-white/70 text-[10px]">15 Menit • Meditasi</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── Local Fallback Response Generator ──────────────────────

function generateLocalResponse(message: string): string {
  const msg = message.toLowerCase();

  const responses: { keywords: string[]; response: string }[] = [
    {
      keywords: ['capek', 'lelah', 'pegal', 'recovery', 'istirahat'],
      response: 'Kelelahan setelah olahraga itu normal! 💪 Beberapa tips recovery:\n\n1. **Tidur 7-8 jam** per malam untuk pemulihan otot\n2. **Minum air putih** minimal 2-3 liter/hari\n3. **Konsumsi protein** (telur, ayam, ikan) dalam 30 menit setelah olahraga\n4. **Stretching ringan** sebelum tidur\n\nJika kelelahan berlanjut lebih dari 2-3 hari, pertimbangkan untuk menurunkan intensitas latihan.',
    },
    {
      keywords: ['menu', 'makan', 'makanan', 'sarapan', 'makan siang', 'makan malam', 'resep'],
      response: 'Berikut contoh menu sehat sehari! 🥗\n\n**Sarapan (±400 cal):** Oatmeal + pisang + madu + kacang almond\n**Snack pagi:** Buah apel + yoghurt\n**Makan siang (±500 cal):** Nasi merah + ayam panggang + tumis brokoli\n**Snack sore:** Smoothie buah atau protein bar\n**Makan malam (±400 cal):** Ikan salmon + sayur bayam + kentang rebus\n\nTotal: ±1,500-1,800 cal. Sesuaikan porsi dengan kebutuhan kalori harian Anda!',
    },
    {
      keywords: ['nafsu', 'lapar', 'ngemil', 'craving', 'ngidam'],
      response: 'Tips mengendalikan nafsu makan berlebih: 🧠\n\n1. **Minum air putih** 1 gelas sebelum makan — mengurangi porsi hingga 20%\n2. **Makan berserat tinggi** (sayur, buah, oat) agar kenyang lebih lama\n3. **Hindari makanan ultra-processed** — ganti crackers dengan kacang rebus\n4. **Atur jadwal makan teratur** setiap 3-4 jam\n5. **Tidur cukup** — kurang tidur meningkatkan hormon lapar\n\nKalau masih craving, coba makan buah yang manis seperti mangga atau semangka! 🍉',
    },
    {
      keywords: ['berat badan', 'turun', 'diet', 'kurus', 'langsing', 'gemuk', 'berat'],
      response: 'Untuk menurunkan berat badan secara sehat: ⚖️\n\n1. **Target deficit 500 cal/hari** = turun ±0.5kg per minggu\n2. **Hitung TDEE** (Total Daily Energy Expenditure) Anda dulu\n3. **Prioritaskan protein** — 1.6-2.2g per kg berat badan\n4. **Olahraga 3-4x/minggu** — kombinasi cardio + angkat beban\n5. **Jangan skip makan** — lebih baik porsi kecil tapi sering\n\n⚠️ Jangan diet ekstrem (< 1,200 cal/hari) karena bisa memperlambat metabolisme!',
    },
    {
      keywords: ['olahraga', 'latihan', 'gym', 'fitness', 'lari', 'jogging', 'cardio'],
      response: 'Rekomendasi program olahraga mingguan: 🏋️\n\n**Senin:** Upper body (push-up, dumbbell press)\n**Selasa:** Cardio 30 menit (jogging/cycling)\n**Rabu:** Lower body (squat, lunges, deadlift)\n**Kamis:** Rest / stretching / yoga\n**Jumat:** Full body circuit training\n**Sabtu:** Cardio 30-45 menit\n**Minggu:** Active recovery (jalan santai)\n\nTips: Mulai dengan intensitas rendah, naikkan bertahap setiap 1-2 minggu. Selalu pemanasan 5-10 menit! 🔥',
    },
    {
      keywords: ['protein', 'nutrisi', 'vitamin', 'mineral', 'suplemen'],
      response: 'Panduan nutrisi dasar: 🍎\n\n**Makronutrien harian:**\n- Protein: 1.6-2.2g/kg BB (ayam, ikan, telur, tempe, tahu)\n- Karbohidrat: 45-65% dari total kalori (nasi merah, oat, ubi)\n- Lemak sehat: 20-35% (alpukat, kacang, minyak zaitun)\n\n**Mikronutrien penting:**\n- Vitamin D: 15 menit berjemur pagi\n- Zat besi: Bayam, daging merah\n- Kalsium: Susu, yoghurt, brokoli\n\nSuplemen hanya diperlukan jika asupan dari makanan kurang. Konsultasikan ke dokter! 💊',
    },
    {
      keywords: ['tidur', 'insomnia', 'susah tidur', 'begadang', 'ngantuk'],
      response: 'Tips tidur berkualitas: 😴\n\n1. **Jadwal konsisten** — tidur dan bangun di jam yang sama\n2. **Hindari layar** 1 jam sebelum tidur (blue light mengganggu melatonin)\n3. **Suhu ruangan** ideal 18-22°C\n4. **Hindari kafein** setelah jam 2 siang\n5. **Olahraga minimal 4 jam** sebelum tidur\n6. **Teknik relaksasi** — coba 4-7-8 breathing\n\nTidur 7-9 jam sangat penting untuk recovery otot dan produksi growth hormone! 💤',
    },
    {
      keywords: ['halo', 'hai', 'hi', 'hey', 'apa kabar', 'selamat'],
      response: 'Halo! 👋 Senang bertemu Anda! Saya PATHRA Coach siap membantu. Mau tanya tentang apa hari ini?\n\n• 🥗 Nutrisi & diet\n• 🏋️ Program olahraga\n• ⚖️ Manajemen berat badan\n• 😴 Tips tidur & recovery\n\nSilakan tanya apa saja seputar kesehatan!',
    },
  ];

  for (const r of responses) {
    if (r.keywords.some((k) => msg.includes(k))) {
      return r.response;
    }
  }

  return 'Pertanyaan yang menarik! 🤔 Sebagai AI Coach PATHRA, saya fokus membantu Anda dalam:\n\n• 🥗 **Nutrisi & diet** — menu sehat, kalori, makronutrien\n• 🏋️ **Olahraga** — program latihan, tips fitness\n• ⚖️ **Manajemen berat badan** — strategi penurunan/penambahan BB\n• 😴 **Recovery** — tips tidur, pemulihan otot\n\nCoba tanyakan salah satu topik di atas! 💪';
}
