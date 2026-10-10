'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  motion,
  useInView,
  useAnimation,
  AnimatePresence,
} from 'framer-motion'
import {
  ChevronRight,
  MapPin,
  Clock,
  Star,
  Users,
  Zap,
  Calendar,
  BarChart3,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import CourtMapPicker from '@/components/CourtMapPicker'
import type { Court } from '@/types'

// ─── Mock data for preview ────────────────────────────────────────────────────
const PREVIEW_COURTS: Court[] = [
  {
    id: '1',
    name: 'Court 1',
    description: 'Premium hardcourt with pro-grade surface',
    surface_type: 'hard',
    is_indoor: true,
    hourly_rate: 25,
    is_active: true,
    color_hex: '#22c55e',
    created_at: '',
  },
  {
    id: '2',
    name: 'Court 2',
    description: 'Competition-grade synthetic surface',
    surface_type: 'synthetic',
    is_indoor: true,
    hourly_rate: 25,
    is_active: true,
    color_hex: '#3b82f6',
    created_at: '',
  },
  {
    id: '3',
    name: 'Court 3',
    description: 'Outdoor clay with natural feel',
    surface_type: 'clay',
    is_indoor: false,
    hourly_rate: 25,
    is_active: true,
    color_hex: '#f59e0b',
    created_at: '',
  },
  {
    id: '4',
    name: 'Court 4',
    description: 'Open-air hard court, floodlit 24/7',
    surface_type: 'hard',
    is_indoor: false,
    hourly_rate: 25,
    is_active: true,
    color_hex: '#ef4444',
    created_at: '',
  },
]

// ─── Animated SVG Pickleball Court Background ─────────────────────────────────
function CourtLineBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] max-w-[1200px] opacity-[0.07]"
        viewBox="0 0 880 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer court rectangle */}
        <motion.rect
          x="40" y="40" width="800" height="320" rx="2"
          stroke="#39ff14" strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 2.5, ease: 'easeInOut', delay: 0.2 }}
        />
        {/* Net (center vertical) */}
        <motion.line
          x1="440" y1="40" x2="440" y2="360"
          stroke="#39ff14" strokeWidth="4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, delay: 1.2 }}
        />
        {/* Left kitchen line */}
        <motion.line
          x1="298" y1="40" x2="298" y2="360"
          stroke="#39ff14" strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
        />
        {/* Right kitchen line */}
        <motion.line
          x1="582" y1="40" x2="582" y2="360"
          stroke="#39ff14" strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
        />
        {/* Left center service line */}
        <motion.line
          x1="40" y1="200" x2="298" y2="200"
          stroke="#39ff14" strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 2 }}
        />
        {/* Right center service line */}
        <motion.line
          x1="582" y1="200" x2="840" y2="200"
          stroke="#39ff14" strokeWidth="1"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, delay: 2 }}
        />
        {/* Net posts */}
        <motion.circle cx="440" cy="40" r="6" fill="#39ff14"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2.4 }}
        />
        <motion.circle cx="440" cy="360" r="6" fill="#39ff14"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2.4 }}
        />
      </svg>

      {/* Dot matrix overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, #39ff1410 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
const HEADLINE = 'DOMINATE THE COURT.'

function HeroSection() {
  const letters = HEADLINE.split('')

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0d0d0d]">
      <CourtLineBg />

      {/* Radial spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(57,255,20,0.08) 0%, transparent 65%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-16">

        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neon-green/30 bg-neon-green/5 mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
          <span className="text-xs font-semibold text-neon-green tracking-[2px] uppercase">
            Courts Available Now
          </span>
        </motion.div>

        {/* Kinetic headline */}
        <h1 className="font-display font-black text-[clamp(3rem,10vw,8rem)] leading-[0.9] tracking-tighter mb-6">
          <div className="overflow-hidden">
            <div className="flex flex-wrap justify-center">
              {letters.map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ y: '110%', opacity: 0, rotateX: -60 }}
                  animate={{ y: 0, opacity: 1, rotateX: 0 }}
                  transition={{
                    delay: 0.4 + i * 0.035,
                    duration: 0.55,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={cn(
                    'inline-block',
                    char === ' ' ? 'mx-[0.18em]' : '',
                  )}
                  style={{
                    color: char === '.' ? '#39ff14' : 'white',
                    textShadow: char === '.' ? '0 0 30px #39ff14' : undefined,
                  }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </div>
          </div>
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="text-lg sm:text-xl text-white/50 max-w-xl mx-auto mb-10 font-body leading-relaxed"
        >
          Reserve your court in seconds.{' '}
          <span className="text-white/80 font-medium">4 premium courts,</span>{' '}
          open 24/7.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
        >
          <Link href="/book">
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 32px rgba(57,255,20,0.5)' }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-neon-green text-black font-bold text-base tracking-wide transition-all"
            >
              Book a Court
              <ChevronRight size={18} />
            </motion.button>
          </Link>
          <Link href="/schedule">
            <motion.button
              whileHover={{ scale: 1.03, borderColor: 'rgba(57,255,20,0.5)' }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-8 py-4 rounded-xl border border-white/20 text-white/80 hover:text-white font-semibold text-base transition-all"
            >
              <Calendar size={16} />
              View Schedule
            </motion.button>
          </Link>
        </motion.div>

        {/* Floating stat badges */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.9, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {[
            { icon: <MapPin size={14} />, value: '4 Courts', color: '#22c55e' },
            { icon: <Clock size={14} />, value: '24/7 Access', color: '#00f5ff' },
            { icon: <Star size={14} />, value: '$25/hr', color: '#f59e0b' },
          ].map(({ icon, value, color }, i) => (
            <motion.div
              key={value}
              whileHover={{ scale: 1.07, y: -3 }}
              transition={{ type: 'spring', stiffness: 400 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm cursor-default"
            >
              <span style={{ color }}>{icon}</span>
              <span className="text-sm font-semibold text-white/80">{value}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-[3px] text-white/30 uppercase font-medium">Scroll</span>
        <motion.div
          className="w-px h-10 bg-gradient-to-b from-neon-green/60 to-transparent"
          animate={{ scaleY: [0, 1, 0], y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  )
}

// ─── Courts Preview Section ───────────────────────────────────────────────────
function CourtsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="relative py-24 bg-[#0d0d0d]">
      {/* Section separator */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-green/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="text-xs tracking-[4px] text-neon-green/60 uppercase font-semibold mb-3">
            Live Status
          </p>
          <h2 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight">
            COURTS AVAILABLE NOW
          </h2>
        </motion.div>

        {/* Court map */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mb-10"
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

        {/* Court cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PREVIEW_COURTS.map((court, i) => (
            <motion.div
              key={court.id}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="relative rounded-2xl bg-[#111] border border-white/8 overflow-hidden group cursor-default"
              style={{
                boxShadow: `0 0 0 0 ${court.color_hex}00`,
              }}
            >
              {/* Top color bar */}
              <div
                className="h-1 w-full"
                style={{ backgroundColor: court.color_hex, boxShadow: `0 0 12px ${court.color_hex}80` }}
              />

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display font-bold text-lg text-white tracking-wide">
                      {court.name.toUpperCase()}
                    </h3>
                    <p className="text-xs text-white/40 mt-0.5 capitalize">
                      {court.surface_type} surface
                    </p>
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide',
                      court.is_indoor
                        ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
                    )}
                  >
                    {court.is_indoor ? 'Indoor' : 'Outdoor'}
                  </span>
                </div>

                <p className="text-xs text-white/40 leading-relaxed mb-4">
                  {court.description}
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <span
                      className="text-2xl font-black font-display"
                      style={{ color: court.color_hex }}
                    >
                      ${court.hourly_rate}
                    </span>
                    <span className="text-xs text-white/30 ml-1">/hr</span>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors"
                    style={{
                      borderColor: `${court.color_hex}40`,
                      color: court.color_hex,
                    }}
                  >
                    <Zap size={10} className="fill-current" />
                    Available
                  </motion.div>
                </div>
              </div>

              {/* Hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                style={{ boxShadow: `inset 0 0 40px ${court.color_hex}10` }}
              />
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
    const step = Math.ceil(target / 40)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 35)
    return () => clearInterval(timer)
  }, [inView, target])

  return (
    <span ref={ref} className="tabular-nums">
      {count}
    </span>
  )
}

// ─── Bento Grid ───────────────────────────────────────────────────────────────
const BENTO_ITEMS = [
  {
    id: 'equipment',
    title: 'Equipment Rental',
    description: 'Pro-grade paddles & balls available on demand. Borrow or demo before you buy.',
    icon: '🏓',
    accent: '#39ff14',
    large: true,
    row: 'row-span-2',
  },
  {
    id: 'proshop',
    title: 'Pro Shop',
    description: 'Curated gear from the top brands in pickleball.',
    icon: '🛍️',
    accent: '#00f5ff',
  },
  {
    id: 'coaching',
    title: 'Coaching',
    description: 'One-on-one and group lessons with certified pros.',
    icon: '🎯',
    accent: '#f59e0b',
  },
  {
    id: 'lockers',
    title: 'Locker Rooms',
    description: 'Premium facilities with showers, lockers & towel service.',
    icon: '🚿',
    accent: '#a78bfa',
  },
  {
    id: 'booking',
    title: 'Real-Time Booking',
    description: 'Instant slot visibility. Reserve and get your digital pass in seconds.',
    icon: '⚡',
    accent: '#39ff14',
    large: true,
    isCounter: true,
  },
]

function BentoSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="relative py-24 bg-[#0a0a0a]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="text-xs tracking-[4px] text-neon-cyan/60 uppercase font-semibold mb-3">
            Everything You Need
          </p>
          <h2 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight">
            WORLD-CLASS <span className="text-neon-cyan">AMENITIES</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[200px]">
          {BENTO_ITEMS.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.45 }}
              whileHover={{ y: -4, scale: 1.015 }}
              className={cn(
                'relative rounded-2xl p-6 border overflow-hidden group flex flex-col justify-between',
                'bg-[#111] border-white/8',
                item.row,
                item.large && i === 0 ? 'md:row-span-2' : '',
                item.large && i === 4 ? 'md:col-span-2' : '',
              )}
              style={{
                background: `linear-gradient(135deg, #111 60%, ${item.accent}06)`,
              }}
            >
              {/* Glow blob */}
              <div
                className="absolute -top-12 -right-12 w-36 h-36 rounded-full opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-3xl pointer-events-none"
                style={{ backgroundColor: item.accent }}
              />

              <div>
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3
                  className="font-display font-bold text-xl text-white tracking-wide mb-2"
                  style={{ textShadow: `0 0 20px ${item.accent}30` }}
                >
                  {item.title}
                </h3>
                <p className="text-sm text-white/40 leading-relaxed">{item.description}</p>
              </div>

              {item.isCounter && (
                <div className="mt-4">
                  <div
                    className="text-5xl font-black font-display"
                    style={{ color: item.accent, textShadow: `0 0 30px ${item.accent}60` }}
                  >
                    <SlotCounter target={47} />
                  </div>
                  <p className="text-xs text-white/30 mt-1 font-medium tracking-wide">
                    SLOTS AVAILABLE RIGHT NOW
                  </p>
                </div>
              )}

              <div
                className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ backgroundColor: item.accent, boxShadow: `0 0 8px ${item.accent}` }}
              />
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
    num: '01',
    title: 'Pick Your Court',
    description: 'Browse our interactive 2D facility map and select your preferred court with real-time availability.',
    icon: <MapPin size={22} />,
    color: '#22c55e',
  },
  {
    num: '02',
    title: 'Choose Your Time',
    description: 'Drag across the timeline to select your session window. See pricing update instantly.',
    icon: <Clock size={22} />,
    color: '#00f5ff',
  },
  {
    num: '03',
    title: 'Get Your Digital Pass',
    description: 'Confirm your booking and receive an instant QR-code access pass to your phone.',
    icon: <Zap size={22} />,
    color: '#39ff14',
  },
]

function HowItWorksSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="relative py-24 bg-[#0d0d0d]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-xs tracking-[4px] text-neon-green/60 uppercase font-semibold mb-3">
            Simple Process
          </p>
          <h2 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight">
            HOW IT <span className="text-neon-green">WORKS</span>
          </h2>
        </motion.div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Connector lines */}
          <div className="hidden md:block absolute top-[4.5rem] left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px pointer-events-none z-0">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
              className="h-full origin-left"
              style={{
                background: 'linear-gradient(90deg, #22c55e, #00f5ff, #39ff14)',
                boxShadow: '0 0 8px rgba(57,255,20,0.3)',
              }}
            />
          </div>

          {HOW_STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.18, duration: 0.55 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              {/* Icon circle */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 relative"
                style={{
                  backgroundColor: `${step.color}12`,
                  border: `1.5px solid ${step.color}40`,
                  boxShadow: `0 0 20px ${step.color}20`,
                }}
              >
                <span style={{ color: step.color }}>{step.icon}</span>
                <div
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                  style={{
                    backgroundColor: step.color,
                    color: '#000',
                    boxShadow: `0 0 12px ${step.color}80`,
                  }}
                >
                  {i + 1}
                </div>
              </motion.div>

              <h3 className="font-display font-bold text-xl text-white mb-3 tracking-wide">
                {step.title}
              </h3>
              <p className="text-sm text-white/40 leading-relaxed max-w-xs">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.9 }}
          className="mt-16 text-center"
        >
          <Link href="/book">
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: '0 0 32px rgba(57,255,20,0.4)' }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-neon-green text-black font-bold text-base tracking-wide transition-all"
            >
              Start Booking
              <ChevronRight size={18} />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="relative bg-black border-t border-white/8 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Logo + tagline */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-1.5 mb-4">
              <Zap size={20} className="text-neon-green fill-neon-green drop-shadow-[0_0_6px_#39ff14]" />
              <span className="font-display font-black text-2xl tracking-tight">
                <span className="text-neon-green">PICK</span>
                <span className="text-white">COURT</span>
              </span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              Premium pickleball courts available 24/7. Book online, play instantly.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {['𝕏', 'in', 'ig', 'yt'].map((s) => (
                <motion.button
                  key={s}
                  whileHover={{ scale: 1.15, color: '#39ff14' }}
                  className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-sm text-white/50 hover:border-neon-green/30 transition-colors"
                >
                  {s}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-bold tracking-[3px] text-white/30 uppercase mb-4">
              Facility
            </p>
            <nav className="flex flex-col gap-2">
              {['Courts', 'Schedule', 'Pricing', 'Amenities', 'About Us'].map((l) => (
                <Link
                  key={l}
                  href="#"
                  className="text-sm text-white/50 hover:text-white transition-colors"
                >
                  {l}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <p className="text-xs font-bold tracking-[3px] text-white/30 uppercase mb-4">
              Account
            </p>
            <nav className="flex flex-col gap-2">
              {['Sign Up', 'Login', 'My Bookings', 'Dashboard', 'Support'].map((l) => (
                <Link
                  key={l}
                  href="#"
                  className="text-sm text-white/50 hover:text-white transition-colors"
                >
                  {l}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        <div className="pt-6 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} PickCourt. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((l) => (
              <Link
                key={l}
                href="#"
                className="text-xs text-white/25 hover:text-white/50 transition-colors"
              >
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Page Root ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0d0d0d] text-white font-body antialiased">
      <HeroSection />
      <CourtsSection />
      <BentoSection />
      <HowItWorksSection />
      <Footer />
    </main>
  )
}
