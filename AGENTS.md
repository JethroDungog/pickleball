# PickCourt Engineering & Design Guidelines 

This file defines the core architecture, design philosophy, and asset standards for the **PickCourt** booking platform. Any AI agent or developer working on this codebase must adhere strictly to these standards.

---

## 1. Visual Identity & Apple Minimalist Standards

- **Core Aesthetic**: Apple Human Interface Guidelines (clean, confident, understated, tactile).
- **Default Theme**: Apple Light Mode (`#fbfbfd` canvas, elevated `#ffffff` squircle cards, `#e5e5ea` borders, `#1d1d1f` typography).
- **Dark Mode**: Space Gray / Deep Obsidian (`#000000` canvas, `#1c1c1e` cards, `#f5f5f7` text).
- **Strict Prohibitions**:
  - **NO gradients**: Never use garish purple-to-blue neon gradients.
  - **NO AI-looking artifacts**: Never add generic glowing badges, pulsing green dots (`animate-pulse`), or robotic tagline chips.
  - **NO clutter**: Whitespace and typography must drive hierarchy.
- **Buttons**:
  - Light mode primary: Solid black pill button with white text (`bg-black text-white hover:bg-neutral-800`).
  - Dark mode primary: Solid white pill button with black text (`bg-white text-black hover:bg-neutral-200`).
  - Secondary: Subtle translucent pill (`bg-black/[0.04] dark:bg-white/[0.06]`).

---

## 2. Currency & Localization

- **Currency**: Always use **Philippine Peso (PHP ₱)**. Never display US Dollar (`$`).
- **Rates**: Standard Outdoor: `₱350 - ₱400/hr`, Indoor Climate-Controlled: `₱500 - ₱550/hr`.
- **Time Slots**: 24-hour facility. Time blocks are structured in 1-hour intervals (e.g. `8:00 AM – 9:00 AM`, `9:00 AM – 10:00 AM`).

---

## 3. Real Court Photography Pipeline

When physical court photos are uploaded, place them in `public/images/courts/` using this standardized naming:

| File Name | Placement | Recommended Specs |
| :--- | :--- | :--- |
| `court-1-indoor.jpg` | Court 1 Selector Card & Modal | Landscape (16:9 or 4:3), minimum 1600×900, WebP/JPG (< 400KB) |
| `court-2-indoor.jpg` | Court 2 Selector Card & Modal | Landscape (16:9 or 4:3), minimum 1600×900, WebP/JPG (< 400KB) |
| `court-3-outdoor.jpg` | Court 3 Selector Card & Modal | Landscape (16:9 or 4:3), minimum 1600×900, WebP/JPG (< 400KB) |
| `court-4-outdoor.jpg` | Court 4 Selector Card & Modal | Landscape (16:9 or 4:3), minimum 1600×900, WebP/JPG (< 400KB) |
| `facility-hero.jpg` | Homepage Hero / About header | Wide angle (16:9), clean natural daylight, minimum 1920×1080 |
| `facility-lounge.jpg` | About Page Facility Highlights | Interior spectator bench / lounge shot |

### Integration Rules for Photos:
- Use Next.js `<Image />` component with `priority` on above-the-fold assets.
- Apply subtle Apple rounded squircle corners (`rounded-3xl` or `rounded-2xl`).
- Add delicate top/bottom gradient scrim overlays only where white text needs high legibility over photos.
- Provide a smooth fullscreen zoom lightbox when a player taps to inspect court conditions.

---

## 4. Architecture & Security

- **Database**: Supabase PostgreSQL with Row Level Security (RLS).
- **Authentication**: Supabase Auth with Google OAuth (`prompt: 'select_account'`) and email sign-in.
- **Roles**:
  - `customer`: Public court booking and digital pass wallet.
  - `admin`: Court manager console, live multi-court Gantt timeline, walk-in reservations.
  - `super_admin`: Pricing adjustments in PHP, staff role delegation, audit logging.
