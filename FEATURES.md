# PATHRA - Dokumentasi Fitur Lengkap

## 1. BERANDA (DASHBOARD)

### Komponen Utama
- **Header Greeting**: Salam personal berdasarkan waktu (Pagi/Siang/Malam)
- **Progress Bars**: 3 metric utama dengan visual progress
  - Kalori (target 2,500 cal)
  - Langkah (target 10,000)
  - Air minum (target 2 liter)

### Rekomendasi AI
- 3 rekomendasi yang dipersonalisasi untuk user
- Interactive cards dengan icon dan deskripsi
- Berdasarkan aktivitas dan pola makan user

### Log Timeline
- Timeline makanan yang dimakan selama hari
- Waktu log, jenis makanan, dan kalori
- Quick action untuk menambah atau edit log

---

## 2. HITUNG MAKANAN (FOOD TRACKING)

### Upload Foto
- Camera/Gallery upload untuk food detection
- Interface yang user-friendly
- Guidance text untuk foto yang optimal

### Database Makanan
- Library populer dengan 4+ kategori
- Detail nutrisi lengkap (kalori, protein, carbs, fat)
- Porsi yang fleksibel

### Food Modal
- Detailed view saat food dipilih
- Breakdown 4 macronutrients
- Quick add to log button

### Nutrisi Summary
- Grid view: Kalori, Protein, Carbs, Fat
- Comparison dengan target harian
- Visual progress bars

---

## 3. AKTIVITAS (ACTIVITY TRACKING)

### Live Tracking
- Real-time timer saat aktivitas berlangsung
- 4 metrics: Waktu, Jarak, Kalori, Detak Jantung
- Pause/Stop controls
- Map view option

### Quick Start
- 4 quick buttons untuk aktivitas populer
- Jogging, Cycling, Gym, Renang
- One-click to start tracking

### Activity History
- Daftar aktivitas dengan semua metrics
- Chronological order terbaru di atas
- Detail button untuk expanded view
- 5+ metric: tipe, durasi, jarak, kalori, detak jantung

### Weekly Stats
- Summary stats minggu ini
- Total aktivitas, kalori, dan jarak
- Visual overview

---

## 4. AI COACH

### Chat Interface
- Clean messaging UI
- User messages: right-aligned, purple gradient
- AI responses: left-aligned, white with border
- Timestamp untuk setiap message

### Smart Suggestions
- 4 suggestion cards saat conversation mulai
- Quick-select untuk topik umum
- Contextual berdasarkan user data

### AI Response Features
- Liking/rating system untuk responses
- Copy button untuk save responses
- Regenerate option untuk alternative answers

### Contextual Intelligence
- Response berdasarkan kondisi user (capek, nafsu makan, dll)
- Rekomendasi actionable dan specific
- Supportive tone untuk motivasi

---

## 5. KOMUNITAS

### 3 Tab Utama

#### a) FEED SOSIAL
- User dapat membuat posts
- Share capaian dengan emoji & badges
- Like, comment, share functionality
- Achievement badges (🔥, ⭐, 🏆)

#### b) CHALLENGES
- List challenges yang bisa diikuti
- Progress bar untuk setiap challenge
- Participant count dan end date
- Join/Leave functionality
- Challenges include:
  - 30 Hari Sehat (buah & sayuran)
  - Running Challenge (5km minimum)
  - Gym Warrior (4x per minggu)

#### c) LEADERBOARD
- Top 5 ranking
- Ranking badges (Gold, Silver, Bronze)
- Points dan streak counter
- User avatar dan stats

### Achievement System
- Badges untuk milestone
- Unlock conditions yang jelas
- Display unlock date
- Motivational icons

---

## 6. PROGRESS ANALYTICS

### Time Range Selector
- Week, Month, Year tabs
- Dynamic data refresh

### Chart Visualization
- Bar chart untuk calories
- Bar chart untuk steps
- Hover tooltips dengan detail
- Color-coded (orange untuk calorie, blue untuk steps)

### Monthly Metrics Grid
- 4 key metrics dengan progress
- Visual progress bars
- Target comparison
- Daily average

### Body Metrics
- 4 body measurements
  - Berat badan
  - IMT
  - Body Fat %
  - Muscle kg
- Up/Down indicators dengan value change
- Progress bars vs target

### Achievement Section
- Visual badges dengan lock status
- Unlock date untuk achievements
- 4 achievement types

### Export
- Export PDF button untuk analytics
- Create new goal button

---

## 7. ONBOARDING

### 7-Step Flow

1. **Welcome Screen**
   - Introduction PATHRA
   - Visual appeal dengan emoji
   - Skip option

2. **Daily Calorie Target**
   - Input field dengan default 2500
   - Number validation
   - Clear unit label

3. **Daily Steps Target**
   - Input field dengan default 10000
   - Step-based progression

4. **Daily Water Target**
   - Input field dengan default 2000ml
   - Hydration focus

5. **Favorite Sports**
   - 6 option buttons
   - Single selection
   - Popular sports list

6. **Health Motivation**
   - 4 motivation reasons
   - Single selection
   - Personalization purpose

7. **Ready to Start**
   - Confirmation screen
   - CTA "Mulai Sekarang"
   - Visual celebration

### Progress Indicators
- Visual progress bar
- Step counter (1 dari 7, dll)
- Next/Back buttons
- Skip option availability

---

## 8. NAVIGASI SIDEBAR

### Responsive Behavior

**Desktop (>1024px)**
- Full width sidebar (256px)
- Logo, user profile, menu items visible
- Smooth transitions

**Tablet (768-1023px)**
- Collapsible sidebar
- Toggle button untuk expand/collapse
- Icons-only mode compact
- Smooth animation

**Mobile (<768px)**
- Hamburger menu drawer
- Fixed header dengan toggle
- Full-screen overlay
- Auto-close saat navigate

### Menu Items (6 utama)
1. Beranda (Home)
2. Makanan (Food)
3. Aktivitas (Activity)
4. AI Coach (Coach)
5. Komunitas (Community)
6. Progress (Analytics)

### Bottom Menu
- Pengaturan (Settings)
- Keluar (Logout)

### User Section
- Avatar placeholder
- Username display
- Level/Badge indicator

---

## 9. DESIGN SYSTEM

### Color Tokens
- **Primary**: #7B4FF5 (Purple)
- **Secondary**: #8B5CF6 (Purple lighter)
- **Accent**: #A78BFA (Lavender)
- **Grayscale**: White, light gray, dark gray, black

### Typography
- **Headings**: Bold, sizes from h1 (text-3xl) to h6
- **Body**: Regular weight, 14-16px
- **Metadata**: Small text-xs/text-sm untuk secondary info

### Spacing & Radius
- **Spacing**: 4px increment system
- **Border Radius**: 12px (0.75rem) for cards
- **Gaps**: 16px standard for layouts

### Interactive Elements
- Hover states dengan color/shadow transitions
- Focus states dengan ring indicators
- Active states dengan color changes
- Smooth transitions (duration-300)

---

## 10. DATA STRUCTURES

### User Model
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  dailyCalorieTarget: number;
  dailyStepsTarget: number;
}
```

### Food Log
```typescript
interface FoodLog {
  id: string;
  date: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}
```

### Activity Log
```typescript
interface ActivityLog {
  id: string;
  date: string;
  type: string;
  duration: number;
  calories: number;
  distance?: number;
}
```

### Community Post
```typescript
interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  content: string;
  likes: number;
  comments: number;
  timestamp: string;
}
```

---

## 11. USER FLOWS

### First-Time User
1. Land on onboarding
2. Complete 7-step setup
3. Redirect to dashboard
4. View today's empty logs
5. Encouraged to start logging

### Daily User
1. Check dashboard greeting
2. Review daily progress
3. Log makanan yang dimakan
4. Log aktivitas
5. Chat dengan AI Coach
6. Lihat komunitas untuk motivasi
7. Check progress analytics

### Social User
1. View community feed
2. Like posts dari teman
3. Create achievement post
4. Join challenges
5. Check leaderboard position
6. Unlock new badges

---

## 12. INTERAKTIVITAS

### Hover Effects
- Button opacity changes
- Card shadow increases
- Border color highlights
- Background subtle color change

### Click Actions
- Tab switching untuk different views
- Modal popups untuk detail views
- Toast notifications (planned)
- Loading states (UI ready)

### Input Interactions
- Number input validation
- Focus ring indicators
- Placeholder text guidance
- Real-time feedback

### Navigation
- Smooth page transitions
- Scroll to top on page change
- Active tab highlighting
- Breadcrumb or back buttons

---

Dokumentasi ini mencakup semua fitur PATHRA v1.0. Untuk pertanyaan lebih detail, lihat file source code di components/ folder.
