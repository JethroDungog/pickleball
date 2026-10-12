'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  motion,
  useInView,
} from 'framer-motion'
import {
  ChevronRight,
  MapPin,
  Clock,
  Sparkles,
  Calendar,
  CreditCard,
} from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import CourtMapPicker from '@/components/CourtMapPicker'
import Footer from '@/components/Footer'
import type { Court } from '@/types'

// ─── Mock data for preview ────────────────────────────────────────────────────
const PREVIEW_COURTS: Court[] = [
  {
    id: '1',
    name: 'Court 1',
    description: 'Indoor pro-grade cushion hardcourt with tournament lighting',
    surface_type: 'hard',
    is_indoor: true,
    hourly_rate: 400,
    is_active: true,
    color_hex: '#30d158',
    created_at: '',
  },
  {
    id: '2',
    name: 'Court 2',
    description: 'Indoor competition synthetic surface for high-grip play',
    surface_type: 'synthetic',
    is_indoor: true,
    hourly_rate: 400,
    is_active: true,
    color_hex: '#0a84ff',
    created_at: '',
  },
  {
    id: '3',
    name: 'Court 3',
    description: 'Outdoor red clay court with low-impact cushioned comfort',
    surface_type: 'clay',
    is_indoor: false,
    hourly_rate: 400,
    is_active: true,
    color_hex: '#ff9f0a',
    created_at: '',
  },
  {
    id: '4',
    name: 'Court 4',
    description: 'Outdoor floodlit hard court, fully illuminated 24/7',
    surface_type: 'hard',
    is_indoor: false,
    hourly_rate: 550,
    is_active: true,
    color_hex: '#ff453a',
    created_at: '',
  },
]

// ─── Minimal Apple Court Line Background ──────────────────────────────────────
function CourtLineBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] max-w-[1100px] opacity-[0.06] dark:opacity-[0.04]"
        viewBox="0 0 880 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="40" y="40" width="800" height="320" rx="4" stroke="currentColor" strokeWidth="1.5" className="text-[var(--apple-text)]" />
        <line x1="440" y1="40" x2="440" y2="360" stroke="currentColor" strokeWidth="2.5" className="text-[var(--apple-text)]" />
        <line x1="298" y1="40" x2="298" y2="360" stroke="currentColor" strokeWidth="1" className="text-[var(--apple-text)]" />
        <line x1="582" y1="40" x2="582" y2="360" stroke="currentColor" strokeWidth="1" className="text-[var(--apple-text)]" />
        <line x1="40" y1="200" x2="298" y2="200" stroke="currentColor" strokeWidth="1" className="text-[var(--apple-text)]" />
        <line x1="582" y1="200" x2="840" y2="200" stroke="currentColor" strokeWidth="1" className="text-[var(--apple-text)]" />
        <circle cx="440" cy="40" r="5" fill="currentColor" className="text-[var(--apple-text)]" />
        <circle cx="440" cy="360" r="5" fill="currentColor" className="text-[var(--apple-text)]" />
      </svg>
    </div>
  )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-[var(--apple-bg)] pt-24 pb-16 transition-colors">
      <CourtLineBg />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">


        {/* Clean Apple editorial headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display font-bold text-4xl sm:text-6xl md:text-7xl tracking-tight text-[var(--apple-text)] mb-6 leading-[1.08]"
        >
          Pickleball, <br className="hidden sm:inline" />
          <span className="text-[var(--apple-subtext)]">perfected.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-xl text-[var(--apple-subtext)] max-w-xl mx-auto mb-10 font-normal leading-relaxed"
        >
          Instant 24-hour court reservations. Select your court visually, choose your time interval, and receive a digital pass to your phone.
        </motion.p>

        {/* Apple style CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14"
        >
          <Link href="/book" className="w-full sm:w-auto">
            <button
              type="button"
              className="btn-primary w-full sm:w-auto text-sm !px-8 !py-3.5"
            >
              <span>Book a Court</span>
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </Link>
          <a href="#courts-preview" className="w-full sm:w-auto">
            <button
              type="button"
              className="btn-secondary w-full sm:w-auto text-sm !px-7 !py-3.5"
            >
              <Calendar size={15} />
              <span>View Courts & Rates</span>
            </button>
          </a>
        </motion.div>

        {/* Minimalist stat pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3"
        >
          {[
            { icon: <MapPin size={13} />, value: '4 Courts', label: 'Indoor & Outdoor' },
            { icon: <Clock size={13} />, value: '24/7 Access', label: 'All Hours' },
            { icon: <CreditCard size={13} />, value: 'From ₱400/hr', label: 'Direct Rates' },
          ].map(({ icon, value, label }) => (
            <div
              key={value}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[var(--apple-card)] border border-[var(--apple-border)] shadow-sm"
            >
              <span className="text-[#30d158]">{icon}</span>
              <div className="text-left">
                <span className="text-xs font-semibold text-[var(--apple-text)] block">{value}</span>
                <span className="text-[10px] text-[var(--apple-subtext)] block leading-tight">{label}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Courts Preview Section ───────────────────────────────────────────────────
function CourtsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="courts-preview" ref={ref} className="relative py-20 bg-[var(--apple-bg)] border-t border-[var(--apple-border)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center sm:text-left"
        >
          <p className="text-xs font-semibold text-[#30d158] uppercase tracking-wider mb-2">
            Facility Overview
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--apple-text)] tracking-tight">
            Championship Courts
          </h2>
          <p className="text-sm text-[var(--apple-subtext)] mt-1 max-w-xl">
            Choose from pro cushioned indoor courts or open-air floodlit courts. All courts feature regulation tournament net heights.
          </p>
        </motion.div>

        {/* Interactive court map preview */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-8"
        >
          <CourtMapPicker
            selectedCourtId={null}
            onSelectCourt={() => {}}
            courts={PREVIEW_COURTS}
            bookings={[]}
            selectedDate={new Date().toISOString().split('T')[0]}
            mode="preview"
          />
        </motion.div>

        {/* Apple squircle court cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PREVIEW_COURTS.map((court, i) => (
            <motion.div
              key={court.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
              className="relative rounded-3xl bg-[var(--apple-card)] border border-[var(--apple-border)] hover:border-[var(--apple-subtext)]/30 p-5 flex flex-col justify-between transition-all shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: court.color_hex }}
                    />
                    <h3 className="font-display font-semibold text-base text-[var(--apple-text)]">
                      {court.name}
                    </h3>
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-medium px-2 py-0.5 rounded-full',
                      court.is_indoor
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
                    )}
                  >
                    {court.is_indoor ? 'Indoor' : 'Outdoor'}
                  </span>
                </div>

                <p className="text-xs text-[var(--apple-subtext)] leading-relaxed mb-4">
                  {court.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[var(--apple-border)] flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-[var(--apple-text)]">
                    {formatCurrency(court.hourly_rate)}
                  </span>
                  <span className="text-xs text-[var(--apple-subtext)] ml-1">/ hour</span>
                </div>
                <Link href={`/book?court=${court.id}`}>
                  <button
                    type="button"
                    className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-black/[0.05] dark:bg-white/10 hover:bg-black/[0.1] dark:hover:bg-white/20 text-[var(--apple-text)] transition-colors"
                  >
                    Select
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Live slot counter ─────────────────────────────────────────────────────────
function SlotCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = Math.ceil(target / 30)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 40)
    return () => clearInterval(timer)
  }, [inView, target])

  return (
    <span ref={ref} className="tabular-nums">
      {count}
    </span>
  )
}

// ─── Apple Bento Grid ─────────────────────────────────────────────────────────
const BENTO_ITEMS = [
  {
    id: 'equipment',
    title: 'Equipment Rental',
    description: 'Pro-grade carbon fiber paddles & Franklin X-40 tournament balls ready at the reception desk.',
    icon: '🏓',
    large: true,
  },
  {
    id: 'proshop',
    title: 'Pro Shop',
    description: 'Curated accessories, court grips, footwear, and performance hydration.',
    icon: '🛍️',
  },
  {
    id: 'lighting',
    title: 'Tournament Lighting',
    description: 'Glare-free LED court illumination calibrated for nighttime competitive matches.',
    icon: '💡',
  },
  {
    id: 'lockers',
    title: 'Private Amenities',
    description: 'Full locker rooms, modern rain showers, and air-conditioned athlete lounge.',
    icon: '🚿',
  },
  {
    id: 'booking',
    title: 'Live 24-Hour Availability',
    description: 'Immediate slot confirmation. Reserve seamlessly with atomic double-booking prevention.',
    icon: '⚡',
    large: true,
    isCounter: true,
  },
]

function BentoSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} className="relative py-20 bg-[var(--apple-bg)] border-t border-[var(--apple-border)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center sm:text-left"
        >
          <p className="text-xs font-semibold text-[var(--apple-subtext)] uppercase tracking-wider mb-2">
            Facility Features
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--apple-text)] tracking-tight">
            Designed for Players
          </h2>
          <p className="text-sm text-[var(--apple-subtext)] mt-1 max-w-xl">
            Every amenity is built to support competitive and casual play around the clock.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BENTO_ITEMS.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
              className={cn(
                'rounded-3xl p-6 bg-[var(--apple-card)] border border-[var(--apple-border)] hover:border-[var(--apple-subtext)]/30 transition-all flex flex-col justify-between shadow-sm',
                item.large && i === 0 ? 'md:row-span-2 min-h-[320px]' : 'min-h-[200px]',
                item.large && i === 4 ? 'md:col-span-2' : '',
              )}
            >
              <div>
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-display font-semibold text-lg text-[var(--apple-text)] mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[var(--apple-subtext)] leading-relaxed">
                  {item.description}
                </p>
              </div>

              {item.isCounter && (
                <div className="mt-6 pt-4 border-t border-[var(--apple-border)]">
                  <div className="text-4xl sm:text-5xl font-bold font-display text-[#30d158]">
                    <SlotCounter target={48} />
                  </div>
                  <p className="text-xs text-[var(--apple-subtext)] mt-1 font-medium">
                    Open slots available today across 4 courts
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────
const HOW_STEPS = [
  {
    num: '1',
    title: 'Choose Court',
    description: 'Select your preferred surface on our visual court layout or list view.',
    icon: <MapPin size={20} />,
  },
  {
    num: '2',
    title: 'Select 1h Intervals',
    description: 'Pick convenient hour blocks (e.g. 8–9, 9–10) across 24 available hours.',
    icon: <Clock size={20} />,
  },
  {
    num: '3',
    title: 'Digital Court Pass',
    description: 'Get an instant QR-code pass saved to your dashboard for easy gate check-in.',
    icon: <Sparkles size={20} />,
  },
]

function HowItWorksSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section ref={ref} className="relative py-20 bg-[var(--apple-bg)] border-t border-[var(--apple-border)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p className="text-xs font-semibold text-[#30d158] uppercase tracking-wider mb-2">
            Effortless Booking
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--apple-text)] tracking-tight">
            How It Works
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW_STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}
              className="rounded-3xl bg-[var(--apple-card)] border border-[var(--apple-border)] p-6 flex flex-col items-center text-center shadow-sm"
            >
              <div className="w-12 h-12 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-center text-[var(--apple-text)] mb-4">
                {step.icon}
              </div>
              <div className="w-6 h-6 rounded-full bg-[#30d158]/15 text-[#30d158] text-xs font-bold flex items-center justify-center mb-2">
                {step.num}
              </div>
              <h3 className="font-display font-semibold text-base text-[var(--apple-text)] mb-2">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--apple-subtext)] leading-relaxed max-w-xs">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link href="/book">
            <button
              type="button"
              className="btn-primary inline-flex text-sm !px-8 !py-3.5"
            >
              <span>Reserve a Court</span>
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Page Root ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[var(--apple-bg)] text-[var(--apple-text)] font-body antialiased transition-colors">
      <HeroSection />
      <CourtsSection />
      <BentoSection />
      <HowItWorksSection />
      <Footer />
    </main>
  )
}
