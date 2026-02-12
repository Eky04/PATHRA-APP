# PATHRA - AI-Powered Health & Fitness Tracking App

PATHRA adalah aplikasi web modern untuk tracking diet, aktivitas fisik, dan mencapai target kesehatan dengan dukungan AI coaching dan komunitas yang supportif.

## Fitur Utama

### 1. **Beranda (Dashboard)**
- Ringkasan progress harian (kalori, langkah, air minum)
- Rekomendasi AI yang dipersonalisasi
- Timeline log makanan dengan breakdown nutrisi
- Quick action buttons untuk menambah log

### 2. **Hitung Makanan (Food Tracking)**
- Upload foto makanan dengan AI detection
- Database makanan populer
- Tracking nutrisi detail (kalori, protein, carbs, fat)
- Kategori waktu makan (Sarapan, Makan Siang, Makan Malam, Snack)

### 3. **Aktivitas (Activity Tracking)**
- Live GPS tracking untuk berbagai jenis aktivitas
- Quick start untuk jogging, cycling, gym, renang
- Riwayat aktivitas dengan metrics lengkap
- Tracking detak jantung dan kalori terbakar

### 4. **AI Coach**
- Chat AI contextual untuk rekomendasi kesehatan
- Saran actionable berdasarkan data user
- Jawaban otomatis untuk pertanyaan umum
- Rating dan feedback untuk setiap response

### 5. **Komunitas**
- Feed sosial untuk berbagi capaian
- Challenge dan kompetisi dengan rewards
- Leaderboard berdasarkan poin dan konsistensi
- Badge dan achievement system

### 6. **Progress Analytics**
- Grafik tren harian, mingguan, bulanan
- Metrik tubuh (berat badan, IMT, body fat, muscle)
- Achievement dan badge tracker
- Export data dalam format PDF

### 7. **Onboarding**
- Setup awal 7 langkah yang user-friendly
- Personalisasi target kesehatan
- Pemilihan olahraga favorit dan motivasi
- Progress indicator yang jelas

## Struktur Aplikasi

```
app/
  ├── page.tsx              # Main entry point dengan logic onboarding
  ├── layout.tsx            # Root layout dengan metadata
  └── globals.css           # Design tokens dan style global

components/
  ├── sidebar.tsx           # Navigation sidebar responsive
  ├── onboarding.tsx        # Onboarding flow
  └── pages/
      ├── dashboard.tsx     # Home page
      ├── food.tsx          # Food tracking
      ├── activity.tsx      # Activity tracking
      ├── coach.tsx         # AI Coach chat
      ├── community.tsx     # Community feed & challenges
      └── progress.tsx      # Analytics & progress

lib/
  └── store.ts              # Data structures dan localStorage utilities
```

## Teknologi

- **Frontend**: Next.js 16 dengan React 19
- **Styling**: Tailwind CSS dengan design tokens
- **Icons**: Lucide React
- **State Management**: React hooks + localStorage
- **Responsive**: Mobile-first design dengan breakpoints

## Design System

### Color Palette
- **Primary**: Vibrant Purple (260° 84% 58%)
- **Secondary**: Elegant Purple (280° 65% 60%)
- **Accent**: Bright Lavender (289° 75% 70%)
- **Neutral**: Grayscale untuk clean hierarchy

### Typography
- **Headings**: Geist Sans (bold)
- **Body**: Geist Sans (regular)
- **Line height**: 1.4-1.6 untuk readability

## Features Responsif

- **Desktop**: Full sidebar visible, content grid layouts
- **Tablet**: Collapsible sidebar dengan collapse toggle
- **Mobile**: Hamburger menu drawer, stacked layouts

## Local Storage

Aplikasi menggunakan localStorage untuk menyimpan:
- Status onboarding (`pathra_onboarded`)
- Data user preferences
- Food & activity logs
- Community interactions

## Cara Menggunakan

### Setup
```bash
pnpm install
pnpm dev
```

### First Time User
1. Halaman onboarding akan muncul otomatis
2. Lengkapi 7 langkah setup (target kalori, langkah, dll)
3. Tekan "Mulai Sekarang" untuk masuk ke dashboard

### Navigasi
- Klik menu di sidebar untuk berpindah halaman
- Pada mobile, gunakan hamburger menu
- Sidebar akan auto-collapse di tablet mode

## Demo Data

Aplikasi dilengkapi demo data untuk showcase:
- Food logs dengan berbagai kategori waktu
- Activity history dengan metrics lengkap
- Community posts dengan likes dan comments
- Challenges dengan progress indicators
- Leaderboard dengan ranking system

## Future Enhancements

- Integration dengan wearable devices (smartwatch, fitness tracker)
- Real-time GPS tracking dengan peta
- AI-powered meal recommendations
- Social features (friends, invitations)
- Payment integration untuk premium features
- Dark mode support
- Push notifications

## Notes

- Aplikasi ini adalah MVP (Minimum Viable Product) dengan client-side storage
- Untuk production, integrasi dengan database backend (Supabase, Firebase, dll) diperlukan
- AI responses saat ini menggunakan mock responses
- Untuk fitur foto food detection, integrasi dengan API seperti Nutritionix diperlukan

---

Built with ❤️ for healthier lifestyle 🎉
