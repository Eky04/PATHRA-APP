'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Plus,
  Trophy,
  Users,
  TrendingUp,
  Calendar,
  Zap,
  Send,
  X,
  Image,
  ChevronDown,
  ChevronUp,
  Loader2,
  Check,
  Copy,
  Camera,
  MapPin,
  Clock,
  Flame,
  Route,
  Timer,
  CalendarPlus,
  Crown,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Interfaces ──────────────────────────────────────────────

interface Post {
  id: string | number;
  userName: string;
  avatar: string;
  content: string;
  imageUrl?: string | null;
  templateData?: TemplateData | null;
  timestamp: string;
  likes: number;
  liked: boolean;
  comments: number;
  badges?: string[];
}

interface Comment {
  id: number;
  userName: string;
  avatar: string;
  content: string;
  createdAt: string;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  icon: string;
  participants: number;
  endDate: string;
  progress: number;
  joined: boolean;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  points: number;
  streak: number;
}

// TemplateData and ActivityStats imported from components/activity-template-card.tsx

import { ActivityTemplateCard, TEMPLATES, type ActivityStats, type TemplateData } from '@/components/activity-template-card';

// ─── Interfaces ──────────────────────────────────────────────

interface Post {
  id: string | number;
  userName: string;
  avatar: string;
  content: string;
  imageUrl?: string | null;
  templateData?: TemplateData | null;
  timestamp: string;
  likes: number;
  liked: boolean;
  comments: number;
  badges?: string[];
}

// ─── Fallback Data ───────────────────────────────────────────

const FALLBACK_POSTS: Post[] = [
  {
    id: 'local-1',
    userName: 'Sarah Putri',
    avatar: '👩‍🦰',
    content: 'Berhasil capai target 10,000 langkah hari ini! 🎉 Terima kasih motivasi dari komunitas PATHRA, semangat terus!',
    timestamp: '2 jam lalu',
    likes: 127,
    liked: false,
    comments: 24,
    badges: ['🔥', '⭐'],
  },
  {
    id: 'local-2',
    userName: 'Ahmad Riyandi',
    avatar: '👨‍💼',
    content: 'Hari ke-15 diet sehat! Sudah turun 2kg. Resepnya: konsisten + sabar. Untuk teman-teman yang baru mulai, tidak perlu yang ekstrem, mulai dari kecil aja 💪',
    timestamp: '5 jam lalu',
    likes: 245,
    liked: false,
    comments: 67,
    badges: ['🔥', '🚀'],
  },
  {
    id: 'local-3',
    userName: 'Maya Dewi',
    avatar: '👩‍🌾',
    content: 'Just completed a 50km cycling challenge! Paling capek tapi paling senang. Ngajakin siapa yang mau join cycling challenge bulan depan? 🚴‍♀️',
    timestamp: '8 jam lalu',
    likes: 89,
    liked: true,
    comments: 34,
    badges: ['🏆'],
  },
];

const FALLBACK_CHALLENGES: Challenge[] = [
  { id: 1, title: '30 Hari Sehat', description: 'Konsumsi 5 porsi buah dan sayuran setiap hari selama 30 hari', participants: 3245, endDate: '15 Maret 2026', progress: 65, icon: '🥗', joined: false },
  { id: 2, title: 'Running Challenge', description: 'Jogging minimal 5km setiap hari atau 20km per minggu', participants: 5678, endDate: '22 Maret 2026', progress: 42, icon: '🏃', joined: true },
  { id: 3, title: 'Gym Warrior', description: 'Latihan gym 4 hari per minggu selama 2 bulan', participants: 2134, endDate: '30 April 2026', progress: 28, icon: '💪', joined: false },
];

const FALLBACK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Budi Santoso', points: 8540, streak: 45, avatar: '👨‍💻' },
  { rank: 2, name: 'Siti Nurhaliza', points: 7890, streak: 38, avatar: '👩‍🎓' },
  { rank: 3, name: 'Eka Prasetya', points: 7234, streak: 32, avatar: '👨‍🏫' },
  { rank: 4, name: 'Rini Cahaya', points: 6567, streak: 28, avatar: '👩‍⚕️' },
  { rank: 5, name: 'Doni Wijaya', points: 5890, streak: 25, avatar: '👨‍🍳' },
];

// ─── Helpers ─────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const sec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (sec < 60) return 'Baru saja';
    if (sec < 3600) return `${Math.floor(sec / 60)} menit lalu`;
    if (sec < 86400) return `${Math.floor(sec / 3600)} jam lalu`;
    if (sec < 604800) return `${Math.floor(sec / 86400)} hari lalu`;
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

// ─── Activity Template Card removed (imported from components/activity-template-card.tsx)

// ─── Component ───────────────────────────────────────────────

export function CommunityPage() {
  const [activeTab, setActiveTab] = useState('feed');

  // ── Posts ──
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [newPostContent, setNewPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [showToast, setShowToast] = useState('');

  // ── Photo & Template ──
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [activityStats, setActivityStats] = useState<ActivityStats>({
    type: 'Jogging',
    duration: '32 min',
    distance: '5.2',
    calories: 320,
    pace: '6:09',
    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    userName: 'User',
  });
  const [editingStats, setEditingStats] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Comments ──
  const [expandedComments, setExpandedComments] = useState<string | number | null>(null);
  const [comments, setComments] = useState<Record<string | number, Comment[]>>({});
  const [loadingComments, setLoadingComments] = useState<string | number | null>(null);
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  // ── Challenges ──
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loadingChallenges, setLoadingChallenges] = useState(true);
  const [joiningChallenge, setJoiningChallenge] = useState<number | null>(null);

  // ── Leaderboard ──
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  // ── Agenda (Premium) ──
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [showAgendaModal, setShowAgendaModal] = useState(false);
  const [agendas, setAgendas] = useState<any[]>([]);
  const [agendaForm, setAgendaForm] = useState({
    title: '',
    groupName: '',
    activityType: 'Jogging',
    date: '',
    time: '',
    location: '',
    maxParticipants: 20,
    description: '',
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Load activity stats from localStorage ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem('activityHistory');
      if (raw) {
        const history = JSON.parse(raw);
        if (history.length > 0) {
          const latest = history[0];
          const duration = latest.duration || 0;
          const distance = latest.distance || 0;
          const pace = distance > 0 ? formatDuration(Math.round(duration / distance)) : '0:00';

          setActivityStats({
            type: latest.type || 'Jogging',
            duration: formatDuration(duration),
            distance: distance.toFixed(1),
            calories: latest.calories || 0,
            pace: pace,
            date: latest.date || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
            userName: 'User',
          });
        }
      }
    } catch { }
  }, []);

  // ── Check premium status ──
  useEffect(() => {
    const checkPremium = () => {
      try {
        const premiumData = JSON.parse(localStorage.getItem('premiumStatus') || '{}');
        const hasPremium = Object.values(premiumData).some((v: any) => v?.isPremium);
        setIsPremiumUser(hasPremium);
      } catch {
        setIsPremiumUser(false);
      }
    };
    checkPremium();
    window.addEventListener('premiumUpdated', checkPremium);
    return () => window.removeEventListener('premiumUpdated', checkPremium);
  }, []);

  // ── Load agendas from shared localStorage ──
  useEffect(() => {
    const loadAgendas = () => {
      try {
        const saved = localStorage.getItem('communityAgendas');
        if (saved) setAgendas(JSON.parse(saved));
      } catch { }
    };
    loadAgendas();
    window.addEventListener('agendaUpdated', loadAgendas);
    return () => window.removeEventListener('agendaUpdated', loadAgendas);
  }, []);

  const ACTIVITY_EMOJIS: Record<string, string> = {
    Jogging: '🏃', Cycling: '🚴', Yoga: '🧘', Gym: '💪', Renang: '🏊', Hiking: '🥾',
  };

  const handleCreateAgenda = () => {
    if (!agendaForm.title || !agendaForm.date || !agendaForm.time || !agendaForm.location) {
      setShowToast('Isi semua field yang wajib!');
      setTimeout(() => setShowToast(''), 2500);
      return;
    }

    const newAgenda = {
      id: Date.now(),
      ...agendaForm,
      creator: 'You',
      currentParticipants: 1,
      status: 'pending' as const,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = [newAgenda, ...agendas];
    setAgendas(updated);
    localStorage.setItem('communityAgendas', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('agendaUpdated'));

    setAgendaForm({ title: '', groupName: '', activityType: 'Jogging', date: '', time: '', location: '', maxParticipants: 20, description: '' });
    setShowAgendaModal(false);
    setShowToast('Agenda berhasil dibuat! Menunggu persetujuan admin. ✅');
    setTimeout(() => setShowToast(''), 2500);
  };

  // ── Fetch Posts ──
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/community/posts');
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setPosts(data.map((p: any) => ({
              ...p,
              timestamp: timeAgo(p.timestamp),
              badges: p.badges || [],
            })));
          } else {
            setPosts(FALLBACK_POSTS);
          }
        } else {
          throw new Error('API error');
        }
      } catch {
        // Load from localStorage
        try {
          const saved = localStorage.getItem('communityPosts');
          if (saved) {
            setPosts(JSON.parse(saved));
          } else {
            setPosts(FALLBACK_POSTS);
          }
        } catch {
          setPosts(FALLBACK_POSTS);
        }
      } finally {
        setLoadingPosts(false);
      }
    };
    fetchPosts();
  }, []);

  // ── Fetch Challenges ──
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await fetch('/api/challenges');
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setChallenges(data.map((ch: any) => ({
              ...ch,
              endDate: ch.endDate
                ? new Date(ch.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                : '',
            })));
          } else {
            setChallenges(FALLBACK_CHALLENGES);
          }
        } else throw new Error('err');
      } catch {
        try {
          const saved = localStorage.getItem('communityChallenges');
          if (saved) setChallenges(JSON.parse(saved));
          else setChallenges(FALLBACK_CHALLENGES);
        } catch { setChallenges(FALLBACK_CHALLENGES); }
      } finally {
        setLoadingChallenges(false);
      }
    };
    fetchChallenges();
  }, []);

  // ── Fetch Leaderboard ──
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/leaderboard');
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) setLeaderboard(data);
          else setLeaderboard(FALLBACK_LEADERBOARD);
        } else throw new Error('err');
      } catch {
        try {
          const saved = localStorage.getItem('communityLeaderboard');
          if (saved) setLeaderboard(JSON.parse(saved));
          else setLeaderboard(FALLBACK_LEADERBOARD);
        } catch { setLeaderboard(FALLBACK_LEADERBOARD); }
      } finally {
        setLoadingLeaderboard(false);
      }
    };
    fetchLeaderboard();
  }, []);

  // ── Handlers ──

  const toast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(''), 3000);
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast('Hanya file gambar yang diperbolehkan');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast('Ukuran file maksimal 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoDataUrl(reader.result as string);
      setShowTemplateModal(true);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleApplyTemplate = () => {
    setShowTemplateModal(false);
    toast('Foto siap diposting! 📸');
  };

  const handleRemovePhoto = () => {
    setPhotoDataUrl(null);
    setSelectedTemplate(TEMPLATES[0]);
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !photoDataUrl) return;
    setPosting(true);

    const templateData: TemplateData | null = photoDataUrl
      ? {
        imageDataUrl: photoDataUrl,
        templateId: selectedTemplate.id,
        stats: activityStats,
      }
      : null;

    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newPostContent.trim(),
          imageUrl: photoDataUrl || undefined,
        }),
      });

      const newPost: Post = {
        id: Date.now().toString(),
        userName: 'Anda',
        avatar: '👤',
        content: newPostContent.trim(),
        imageUrl: selectedTemplate.id === 'no-template' ? photoDataUrl : undefined,
        templateData: selectedTemplate.id !== 'no-template' ? templateData : undefined,
        timestamp: 'Baru saja',
        likes: 0,
        liked: false,
        comments: 0,
        badges: [],
      };
      setPosts([newPost, ...posts]);
      setNewPostContent('');
      setPhotoDataUrl(null);
      toast(res.ok ? 'Posting berhasil dibuat! 🎉' : 'Posting disimpan secara lokal');
    } catch {
      const newPost: Post = {
        id: Date.now().toString(),
        userName: 'Anda',
        avatar: '👤',
        content: newPostContent.trim(),
        imageUrl: selectedTemplate.id === 'no-template' ? photoDataUrl : undefined,
        templateData: selectedTemplate.id !== 'no-template' ? templateData : undefined,
        timestamp: 'Baru saja',
        likes: 0,
        liked: false,
        comments: 0,
        badges: [],
      };
      setPosts([newPost, ...posts]);
      setNewPostContent('');
      setPhotoDataUrl(null);
      toast('Posting disimpan secara lokal');
    } finally {
      setPosting(false);
    }
  };

  const handleLikePost = async (postId: string | number) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
          : post
      )
    );
    try {
      await fetch(`/api/community/posts/${postId}/like`, { method: 'POST' });
    } catch { }
  };

  const handleToggleComments = async (postId: string | number) => {
    if (expandedComments === postId) {
      setExpandedComments(null);
      return;
    }
    setExpandedComments(postId);
    if (!comments[postId]) {
      setLoadingComments(postId);
      try {
        const res = await fetch(`/api/community/posts/${postId}/comments`);
        if (res.ok) {
          const data = await res.json();
          setComments((prev) => ({ ...prev, [postId]: data }));
        } else {
          setComments((prev) => ({ ...prev, [postId]: [] }));
        }
      } catch {
        setComments((prev) => ({ ...prev, [postId]: [] }));
      } finally {
        setLoadingComments(null);
      }
    }
  };

  const handleAddComment = async (postId: string | number) => {
    if (!newComment.trim()) return;
    setSendingComment(true);
    try {
      await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });
    } catch { }

    const localComment: Comment = {
      id: Date.now(),
      userName: 'Anda',
      avatar: '👤',
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), localComment],
    }));
    setPosts(posts.map((p) => (p.id === postId ? { ...p, comments: p.comments + 1 } : p)));
    setNewComment('');
    setSendingComment(false);
  };

  const handleShare = async (post: Post) => {
    const shareData = {
      title: `Posting oleh ${post.userName} - PATHRA`,
      text: post.content,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${post.content}\n\n— ${post.userName} di PATHRA`);
        toast('Konten disalin ke clipboard! 📋');
      }
    } catch {
      try {
        await navigator.clipboard.writeText(`${post.content}\n\n— ${post.userName} di PATHRA`);
        toast('Konten disalin ke clipboard! 📋');
      } catch { toast('Gagal membagikan konten'); }
    }
  };

  const handleJoinChallenge = async (challengeId: number) => {
    setJoiningChallenge(challengeId);
    try {
      await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId }),
      });
    } catch { }
    setChallenges(challenges.map((ch) =>
      ch.id === challengeId ? { ...ch, joined: true, participants: ch.participants + 1 } : ch
    ));
    toast('Berhasil join challenge! 💪');
    setJoiningChallenge(null);
  };

  // ─── Render ────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-20 md:pb-6">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Toast */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[70] animate-in slide-in-from-top-5 fade-in duration-300 pointer-events-none">
          <div className="bg-black/80 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3">
            <div className="bg-green-500 rounded-full p-1"><Check size={12} /></div>
            <span className="font-medium text-sm">{showToast}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-border sticky top-16 md:top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground">Komunitas</h1>
          <p className="text-muted-foreground mt-1">
            Berbagi, belajar, dan saling motivasi dengan sesama member
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-border sticky top-[8.5rem] md:top-[4.5rem] z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-0 overflow-x-auto">
            {[
              { id: 'feed', label: 'Feed', icon: Users },
              { id: 'challenges', label: 'Challenges', icon: Zap },
              { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
              ...(isPremiumUser ? [{ id: 'agenda', label: 'Agenda', icon: CalendarPlus }] : []),
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 border-b-2 font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
              >
                <tab.icon className="inline mr-2" size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">

        {/* ━━━ Feed Tab ━━━ */}
        {activeTab === 'feed' && (
          <>
            {/* Create Post */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-lg flex-shrink-0">
                  👤
                </div>
                <div className="flex-1">
                  <textarea
                    ref={textareaRef}
                    placeholder="Bagikan capaianmu dengan komunitas..."
                    className="w-full p-4 border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
                    rows={3}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleCreatePost();
                    }}
                  />

                  {/* Photo Preview */}
                  {photoDataUrl && (
                    <div className="mt-3 relative">
                      {selectedTemplate.id !== 'no-template' ? (
                        <ActivityTemplateCard
                          imageDataUrl={photoDataUrl}
                          template={selectedTemplate}
                          stats={activityStats}
                        />
                      ) : (
                        <div className="relative rounded-2xl overflow-hidden">
                          <img src={photoDataUrl} alt="Upload preview" className="w-full h-64 object-cover" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3 flex gap-2">
                        <button
                          onClick={() => setShowTemplateModal(true)}
                          className="bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-sm flex items-center gap-1.5 transition-colors"
                        >
                          <Image size={12} />
                          Ganti Template
                        </button>
                        <button
                          onClick={handleRemovePhoto}
                          className="bg-black/50 hover:bg-red-600 text-white w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-sm transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-transparent text-muted-foreground hover:text-foreground hover:border-primary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Camera size={16} className="mr-2" />
                        Foto
                      </Button>
                    </div>
                    <div className="flex items-center gap-3">
                      {newPostContent.length > 0 && (
                        <span className={`text-xs ${newPostContent.length > 500 ? 'text-red-500' : 'text-muted-foreground'}`}>
                          {newPostContent.length}/500
                        </span>
                      )}
                      <Button
                        className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg shadow-primary/20"
                        onClick={handleCreatePost}
                        disabled={posting || (!newPostContent.trim() && !photoDataUrl) || newPostContent.length > 500}
                      >
                        {posting ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Plus size={16} className="mr-2" />}
                        Posting
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts */}
            {loadingPosts ? (
              <div className="text-center py-12">
                <Loader2 className="mx-auto h-8 w-8 text-primary animate-spin mb-3" />
                <p className="text-muted-foreground">Memuat feed komunitas...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="p-6">
                      {/* Post Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <span className="text-3xl">{post.avatar}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">{post.userName}</p>
                            {post.badges?.map((badge, idx) => (
                              <span key={idx} className="text-sm">{badge}</span>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                        </div>
                      </div>

                      {/* Post Content */}
                      {post.content && (
                        <p className="text-foreground mb-4 leading-relaxed">{post.content}</p>
                      )}

                      {/* Templated Image */}
                      {post.templateData && (
                        <div className="mb-4">
                          <ActivityTemplateCard
                            imageDataUrl={post.templateData.imageDataUrl}
                            template={TEMPLATES.find((t) => t.id === post.templateData!.templateId) || TEMPLATES[0]}
                            stats={post.templateData.stats}
                          />
                        </div>
                      )}

                      {/* Plain Image */}
                      {!post.templateData && post.imageUrl && (
                        <div className="mb-4 rounded-2xl overflow-hidden border border-border">
                          <img src={post.imageUrl} alt="Post" className="w-full h-64 object-cover" />
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4 border-t border-border">
                        <button
                          onClick={() => handleLikePost(post.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all active:scale-95 ${post.liked
                            ? 'bg-red-50 text-red-500 border border-red-200'
                            : 'bg-gray-50 text-muted-foreground hover:bg-gray-100 border border-transparent'
                            }`}
                        >
                          <Heart size={16} fill={post.liked ? 'currentColor' : 'none'} />
                          <span className="text-sm font-medium">{post.likes}</span>
                        </button>
                        <button
                          onClick={() => handleToggleComments(post.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all active:scale-95 ${expandedComments === post.id
                            ? 'bg-blue-50 text-blue-500 border border-blue-200'
                            : 'bg-gray-50 text-muted-foreground hover:bg-gray-100 border border-transparent'
                            }`}
                        >
                          <MessageCircle size={16} />
                          <span className="text-sm font-medium">{post.comments}</span>
                          {expandedComments === post.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        <button
                          onClick={() => handleShare(post)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 text-muted-foreground hover:bg-gray-100 transition-all active:scale-95 border border-transparent"
                        >
                          <Share2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Comments Section */}
                    {expandedComments === post.id && (
                      <div className="border-t border-border bg-gray-50/50 p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                        {loadingComments === post.id ? (
                          <div className="text-center py-4">
                            <Loader2 className="mx-auto h-5 w-5 text-primary animate-spin" />
                          </div>
                        ) : (
                          <>
                            {(comments[post.id] || []).length > 0 ? (
                              <div className="space-y-3 max-h-64 overflow-y-auto">
                                {(comments[post.id] || []).map((c) => (
                                  <div key={c.id} className="flex gap-3">
                                    <span className="text-xl flex-shrink-0">{c.avatar}</span>
                                    <div className="flex-1 bg-white rounded-xl p-3 border border-border">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-sm text-foreground">{c.userName}</span>
                                        <span className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</span>
                                      </div>
                                      <p className="text-sm text-foreground">{c.content}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-center text-sm text-muted-foreground py-2">
                                Belum ada komentar. Jadilah yang pertama!
                              </p>
                            )}
                            <div className="flex gap-2 pt-2">
                              <input
                                type="text"
                                placeholder="Tulis komentar..."
                                value={expandedComments === post.id ? newComment : ''}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddComment(post.id);
                                  }
                                }}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm transition-all bg-white"
                              />
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 h-10 px-4"
                                onClick={() => handleAddComment(post.id)}
                                disabled={sendingComment || !newComment.trim()}
                              >
                                {sendingComment ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ━━━ Challenges Tab ━━━ */}
        {activeTab === 'challenges' && (
          <div className="space-y-4">
            {loadingChallenges ? (
              <div className="text-center py-12">
                <Loader2 className="mx-auto h-8 w-8 text-primary animate-spin mb-3" />
                <p className="text-muted-foreground">Memuat challenges...</p>
              </div>
            ) : (
              challenges.map((challenge) => (
                <div key={challenge.id} className="bg-white rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-4xl">{challenge.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground text-lg">{challenge.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
                    </div>
                    <Button
                      className={`flex-shrink-0 transition-all ${challenge.joined
                        ? 'bg-green-100 text-green-700 border border-green-300 hover:bg-green-200'
                        : 'bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 shadow-lg shadow-primary/20'
                        }`}
                      onClick={() => !challenge.joined && handleJoinChallenge(challenge.id)}
                      disabled={challenge.joined || joiningChallenge === challenge.id}
                    >
                      {joiningChallenge === challenge.id ? <Loader2 size={16} className="mr-2 animate-spin" /> : challenge.joined ? <Check size={16} className="mr-2" /> : null}
                      {challenge.joined ? 'Joined' : 'Join'}
                    </Button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-sm font-semibold text-foreground">{challenge.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-700" style={{ width: `${challenge.progress}%` }} />
                      </div>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users size={16} />
                        <span>{challenge.participants.toLocaleString()} peserta</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar size={16} />
                        <span>Berakhir {challenge.endDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ━━━ Leaderboard Tab ━━━ */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            {loadingLeaderboard ? (
              <div className="text-center py-12">
                <Loader2 className="mx-auto h-8 w-8 text-primary animate-spin mb-3" />
                <p className="text-muted-foreground">Memuat leaderboard...</p>
              </div>
            ) : (
              <>
                {leaderboard.length >= 3 && (
                  <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-6 border border-primary/10">
                    <div className="flex items-end justify-center gap-4">
                      <div className="text-center flex-1">
                        <span className="text-4xl block mb-2">{leaderboard[1].avatar}</span>
                        <div className="bg-gradient-to-b from-gray-300 to-gray-400 rounded-t-xl h-20 flex flex-col items-center justify-end pb-2 text-white">
                          <span className="text-2xl font-bold">2</span>
                        </div>
                        <p className="font-semibold text-sm mt-2 text-foreground truncate">{leaderboard[1].name}</p>
                        <p className="text-xs text-muted-foreground">{leaderboard[1].points.toLocaleString()} poin</p>
                      </div>
                      <div className="text-center flex-1">
                        <span className="text-5xl block mb-1">👑</span>
                        <span className="text-4xl block mb-2">{leaderboard[0].avatar}</span>
                        <div className="bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-t-xl h-28 flex flex-col items-center justify-end pb-2 text-white">
                          <span className="text-3xl font-bold">1</span>
                        </div>
                        <p className="font-bold text-sm mt-2 text-foreground truncate">{leaderboard[0].name}</p>
                        <p className="text-xs text-primary font-semibold">{leaderboard[0].points.toLocaleString()} poin</p>
                      </div>
                      <div className="text-center flex-1">
                        <span className="text-4xl block mb-2">{leaderboard[2].avatar}</span>
                        <div className="bg-gradient-to-b from-orange-300 to-orange-400 rounded-t-xl h-16 flex flex-col items-center justify-end pb-2 text-white">
                          <span className="text-2xl font-bold">3</span>
                        </div>
                        <p className="font-semibold text-sm mt-2 text-foreground truncate">{leaderboard[2].name}</p>
                        <p className="text-xs text-muted-foreground">{leaderboard[2].points.toLocaleString()} poin</p>
                      </div>
                    </div>
                  </div>
                )}
                {leaderboard.slice(3).map((user) => (
                  <div key={user.rank} className="bg-white rounded-2xl p-5 shadow-sm border border-border hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-foreground flex-shrink-0 text-lg">{user.rank}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{user.avatar}</span>
                          <div>
                            <p className="font-bold text-foreground">{user.name}</p>
                            <span className="text-sm text-muted-foreground">🔥 {user.streak} hari</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{user.points.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">poin</p>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* ━━━ Agenda Tab ━━━ */}
      {activeTab === 'agenda' && (
        <>
          {/* Create Agenda Button */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <CalendarPlus size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Agenda Olahraga</h3>
                  <p className="text-xs text-muted-foreground">Buat jadwal olahraga bareng komunitas</p>
                </div>
              </div>
              <Button
                onClick={() => setShowAgendaModal(true)}
                className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 shadow-md shadow-amber-500/20"
              >
                <Plus size={16} className="mr-1" />
                Buat Agenda
              </Button>
            </div>
          </div>

          {/* Agenda List */}
          {agendas.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-border text-center">
              <CalendarPlus size={48} className="text-gray-300 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Belum ada agenda. Buat agenda pertamamu!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {agendas.map((agenda) => (
                <div
                  key={agenda.id}
                  className={`bg-white rounded-2xl p-5 shadow-sm border hover:shadow-md transition-all ${agenda.status === 'pending' ? 'border-yellow-200'
                    : agenda.status === 'approved' ? 'border-green-200'
                      : 'border-red-200'
                    }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${agenda.status === 'pending' ? 'bg-yellow-50' : agenda.status === 'approved' ? 'bg-green-50' : 'bg-red-50'
                      }`}>
                      {ACTIVITY_EMOJIS[agenda.activityType] || '📋'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-bold text-foreground">{agenda.title}</h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${agenda.status === 'pending' ? 'bg-yellow-100 text-yellow-700'
                          : agenda.status === 'approved' ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                          }`}>
                          {agenda.status === 'pending' ? '⏳ Menunggu Approval' : agenda.status === 'approved' ? '✅ Disetujui' : '❌ Ditolak'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                        {agenda.groupName && <span className="flex items-center gap-1"><Users size={11} /> {agenda.groupName}</span>}
                        <span className="flex items-center gap-1"><Calendar size={11} /> {agenda.date} • {agenda.time}</span>
                        <span className="flex items-center gap-1"><MapPin size={11} /> {agenda.location}</span>
                      </div>
                      {agenda.description && <p className="text-xs text-muted-foreground mt-2">{agenda.description}</p>}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-muted-foreground">👥 {agenda.currentParticipants}/{agenda.maxParticipants} peserta</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden max-w-[120px]">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${(agenda.currentParticipants / agenda.maxParticipants) * 100}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create Agenda Modal */}
          {showAgendaModal && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowAgendaModal(false)}>
              <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-5 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarPlus size={20} />
                      <h3 className="font-bold">Buat Agenda Baru</h3>
                    </div>
                    <button onClick={() => setShowAgendaModal(false)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30">
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1.5">Judul Agenda *</label>
                    <input
                      type="text"
                      placeholder="Mis: Morning Run Bareng"
                      value={agendaForm.title}
                      onChange={(e) => setAgendaForm({ ...agendaForm, title: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1.5">Nama Grup</label>
                    <input
                      type="text"
                      placeholder="Mis: Jakarta Runners"
                      value={agendaForm.groupName}
                      onChange={(e) => setAgendaForm({ ...agendaForm, groupName: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1.5">Jenis Aktivitas</label>
                    <select
                      value={agendaForm.activityType}
                      onChange={(e) => setAgendaForm({ ...agendaForm, activityType: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none bg-white"
                    >
                      {['Jogging', 'Cycling', 'Yoga', 'Gym', 'Renang', 'Hiking'].map((a) => (
                        <option key={a} value={a}>{ACTIVITY_EMOJIS[a] || '📋'} {a}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1.5">Tanggal *</label>
                      <input
                        type="date"
                        value={agendaForm.date}
                        onChange={(e) => setAgendaForm({ ...agendaForm, date: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1.5">Waktu *</label>
                      <input
                        type="time"
                        value={agendaForm.time}
                        onChange={(e) => setAgendaForm({ ...agendaForm, time: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1.5">Lokasi *</label>
                    <input
                      type="text"
                      placeholder="Mis: GBK Senayan, Jakarta"
                      value={agendaForm.location}
                      onChange={(e) => setAgendaForm({ ...agendaForm, location: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1.5">Maks. Peserta</label>
                    <input
                      type="number"
                      min={2}
                      max={100}
                      value={agendaForm.maxParticipants}
                      onChange={(e) => setAgendaForm({ ...agendaForm, maxParticipants: parseInt(e.target.value) || 20 })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1.5">Deskripsi</label>
                    <textarea
                      placeholder="Deskripsikan agenda ini..."
                      value={agendaForm.description}
                      onChange={(e) => setAgendaForm({ ...agendaForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                    />
                  </div>
                  <button
                    onClick={handleCreateAgenda}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                  >
                    <CalendarPlus size={16} />
                    Buat Agenda
                  </button>
                  <p className="text-[10px] text-center text-muted-foreground">Agenda akan ditinjau oleh admin sebelum dipublikasikan</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ━━━━━━ TEMPLATE SELECTION MODAL ━━━━━━ */}
      {showTemplateModal && photoDataUrl && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary to-secondary p-5 text-white flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold">Pilih Template Aktivitas</h3>
                <p className="text-white/80 text-sm mt-0.5">Buat foto aktivitas ala Strava</p>
              </div>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-5 space-y-5">
              {/* Live Preview */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">Preview</p>
                <ActivityTemplateCard
                  imageDataUrl={photoDataUrl}
                  template={selectedTemplate}
                  stats={activityStats}
                />
              </div>

              {/* Template Options */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">Template</p>
                <div className="grid grid-cols-5 gap-2">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(t)}
                      className={`relative rounded-xl overflow-hidden border-2 transition-all active:scale-95 ${selectedTemplate.id === t.id
                        ? 'border-primary ring-2 ring-primary/30 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      {t.id === 'no-template' ? (
                        <div className="h-20 bg-gray-100 flex items-center justify-center">
                          <Image size={20} className="text-muted-foreground" />
                        </div>
                      ) : (
                        <ActivityTemplateCard
                          imageDataUrl={photoDataUrl}
                          template={t}
                          stats={activityStats}
                          size="thumb"
                        />
                      )}
                      <p className="text-[10px] font-medium text-center py-1.5 bg-white truncate px-1">
                        {t.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable Stats */}
              {selectedTemplate.id !== 'no-template' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-foreground">Data Aktivitas</p>
                    <button
                      onClick={() => setEditingStats(!editingStats)}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      {editingStats ? 'Selesai Edit' : 'Edit Data'}
                    </button>
                  </div>

                  {editingStats ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Tipe Aktivitas</label>
                        <select
                          value={activityStats.type}
                          onChange={(e) => setActivityStats({ ...activityStats, type: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none"
                        >
                          <option value="Jogging">🏃 Jogging</option>
                          <option value="Cycling">🚴 Cycling</option>
                          <option value="Gym">💪 Gym</option>
                          <option value="Renang">🏊 Renang</option>
                          <option value="Hiking">🥾 Hiking</option>
                          <option value="Yoga">🧘 Yoga</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Jarak (km)</label>
                        <input
                          type="text"
                          value={activityStats.distance}
                          onChange={(e) => setActivityStats({ ...activityStats, distance: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Durasi</label>
                        <input
                          type="text"
                          value={activityStats.duration}
                          onChange={(e) => setActivityStats({ ...activityStats, duration: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none"
                          placeholder="32 min"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Kalori</label>
                        <input
                          type="number"
                          value={activityStats.calories}
                          onChange={(e) => setActivityStats({ ...activityStats, calories: Number(e.target.value) })}
                          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Pace</label>
                        <input
                          type="text"
                          value={activityStats.pace}
                          onChange={(e) => setActivityStats({ ...activityStats, pace: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none"
                          placeholder="6:09"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Nama</label>
                        <input
                          type="text"
                          value={activityStats.userName}
                          onChange={(e) => setActivityStats({ ...activityStats, userName: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-border text-sm focus:border-primary outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-3">
                      <div className="text-center p-3 bg-gray-50 rounded-xl border border-border">
                        <p className="text-lg font-bold text-foreground">{activityStats.distance}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">KM</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-xl border border-border">
                        <p className="text-lg font-bold text-foreground">{activityStats.duration}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">DURASI</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-xl border border-border">
                        <p className="text-lg font-bold text-foreground">{activityStats.pace}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">PACE</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-xl border border-border">
                        <p className="text-lg font-bold text-foreground">{activityStats.calories}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">CAL</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-5 border-t border-border flex gap-3 flex-shrink-0">
              <Button
                variant="outline"
                className="flex-1 border-border text-muted-foreground"
                onClick={() => setShowTemplateModal(false)}
              >
                Batal
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg shadow-primary/20"
                onClick={handleApplyTemplate}
              >
                <Check size={16} className="mr-2" />
                Gunakan Template
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

