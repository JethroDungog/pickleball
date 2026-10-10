# PickCourt — Premium Pickleball Court Booking

> Athletic-grade, editorial web app built with Next.js 14, Supabase, and Framer Motion.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Animation | Framer Motion, canvas-confetti |
| Icons | Lucide React |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + @supabase/ssr |
| Fonts | Syne (display), Inter (body) via next/font |

---

## Project Structure

```
pickleball website/
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql    # Full schema, RLS, triggers, seed data
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout with fonts + providers
│   │   ├── globals.css               # Global styles + CSS variables
│   │   ├── page.tsx                  # Landing page (kinetic hero, court preview, bento)
│   │   ├── book/
│   │   │   └── page.tsx              # Interactive booking experience
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Customer dashboard (digital court passes)
│   │   ├── admin/
│   │   │   └── page.tsx              # Admin command center (Gantt board)
│   │   ├── super-admin/
│   │   │   ├── page.tsx              # Master facility metrics + controls
│   │   │   ├── CourtEditor.tsx       # Interactive court management widget
│   │   │   └── MetricsChart.tsx      # SVG revenue chart
│   │   ├── auth/
│   │   │   ├── login/page.tsx        # Split-layout login/signup
│   │   │   ├── callback/route.ts     # OAuth callback handler
│   │   │   └── logout/route.ts       # Sign out handler
│   │   ├── terms/page.tsx            # Complete terms of service
│   │   ├── privacy/page.tsx          # Privacy policy
│   │   └── unauthorized/page.tsx     # 403 page
│   ├── components/
│   │   ├── Navbar.tsx                # Glassmorphic navigation
│   │   ├── CourtMapPicker.tsx        # Interactive 2D SVG court map ⭐
│   │   ├── BookingTimeline.tsx       # 24-hour slot timeline
│   │   ├── MultiCourtGantt.tsx       # All-courts Gantt view
│   │   ├── ReservationDock.tsx       # Floating booking dock
│   │   └── BookingCard.tsx           # Digital court pass ticket
│   ├── actions/
│   │   ├── bookings.ts               # Atomic booking server actions
│   │   ├── courts.ts                 # Court management server actions
│   │   └── admin.ts                  # Super admin server actions
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Browser Supabase client
│   │   │   ├── server.ts             # Server Supabase client
│   │   │   └── middleware.ts         # Middleware Supabase client
│   │   └── utils.ts                  # cn(), formatCurrency(), formatHour() etc.
│   ├── types/
│   │   └── index.ts                  # All TypeScript interfaces
│   └── middleware.ts                 # Edge middleware for RBAC route protection
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── postcss.config.js
└── .env.local                        # Environment variables (gitignored)
```

---

## Quick Start

### 1. Clone & Install

```bash
cd "pickleball website"
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to **SQL Editor** and run the migration:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
3. Enable **Google OAuth** (optional) in Authentication → Providers → Google

### 3. Configure Environment

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

Find these in: Supabase Dashboard → Settings → API

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Role Setup

To grant admin or super_admin access to a user:

1. User must first sign up via the app
2. In Supabase Dashboard → Table Editor → `profiles`
3. Find the user and update their `role` column to `admin` or `super_admin`

Or via SQL:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'manager@example.com';
UPDATE profiles SET role = 'super_admin' WHERE email = 'owner@example.com';
```

---

## Protected Routes

| Route | Required Role |
|---|---|
| `/dashboard` | Any authenticated user |
| `/admin` | `admin` or `super_admin` |
| `/super-admin` | `super_admin` only |

---

## Database Schema Summary

### Concurrency Protection

The `bookings` table has a **database-level UNIQUE constraint**:

```sql
CONSTRAINT no_double_booking UNIQUE(court_id, booking_date, start_hour)
```

This makes double-bookings physically impossible at the engine level, regardless of application logic.

### RLS Security Model

- All tables have Row Level Security (RLS) **enabled and forced**
- Users can only read/write their own data
- Admins have full read access
- Super Admins have full read/write access
- Audit logs are immutable (trigger-only writes, super_admin read-only)

---

## Key Features

### 🎾 Interactive Court Map
An SVG-based 2D top-down view of all 4 courts with:
- Realistic pickleball court lines (kitchen zones, net, baselines)
- Live availability color-coding (green = free, amber = partial, red = full)
- Spring-physics hover animations
- Click-to-select with neon glow ring

### 📅 Dual Booking Views
- **Court Map Mode**: Click court → select time slots visually
- **Gantt Mode**: All 4 courts side-by-side on a 24h timeline

### 🎫 Digital Court Pass
Bookings rendered as physical ticket stubs with:
- Court color accent strip
- QR code placeholder
- Perforated divider
- Booking ID short code

### 🎊 Animated Confirmation
- Canvas confetti burst
- Animated SVG checkmark
- Ticket-style booking summary

---

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel Dashboard
# NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
```

Add your Vercel domain to Supabase:
- Authentication → URL Configuration → Site URL: `https://your-app.vercel.app`
- Authentication → URL Configuration → Redirect URLs: `https://your-app.vercel.app/auth/callback`

---

## License

MIT — built for PickCourt Facility Management.
