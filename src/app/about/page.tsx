'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, ChevronRight } from 'lucide-react'
import Footer from '@/components/Footer'

const COURT_FEATURES = [
  {
    title: 'Tournament Surface Engineering',
    desc: 'Multi-layer cushioned acrylic & competition synthetic courts designed to minimize joint stress while preserving true ball bounce.',
  },
  {
    title: 'Zero Shadow Tournament Lighting',
    desc: 'Floodlit 750-lux sports LED illumination engineered for high-velocity nighttime play without distracting glare.',
  },
  {
    title: 'Continuous Climate Control',
    desc: 'Courts 1 & 2 feature dedicated air-filtration systems keeping indoor courts at a crisp 20°C year-round.',
  },
  {
    title: 'Atomic 24/7 Digital Pass Access',
    desc: 'Lock in your court online and gain contactless door & court gate access via digital wallet QR passes on your mobile device.',
  },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--apple-bg)] text-[var(--apple-text)] pt-24 pb-20 font-body antialiased transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4 pt-6">

          <h1 className="font-display font-bold text-4xl sm:text-6xl text-[var(--apple-text)] tracking-tight leading-tight">
            The facility, perfected.
          </h1>
          <p className="text-base sm:text-lg text-[var(--apple-subtext)] leading-relaxed max-w-xl mx-auto">
            PickCourt combines precision athletic surface engineering, zero double-booking concurrency, and seamless 24/7 digital reservations.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {COURT_FEATURES.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="p-8 rounded-3xl bg-[var(--apple-card)] border border-[var(--apple-border)] hover:border-black/20 dark:hover:border-white/20 transition-all space-y-3 shadow-sm"
            >
              <div className="w-9 h-9 rounded-2xl bg-[#34c759]/10 border border-[#34c759]/20 flex items-center justify-center text-[#34c759]">
                <Check size={18} strokeWidth={2.5} />
              </div>
              <h3 className="font-display font-semibold text-lg text-[var(--apple-text)]">{feat.title}</h3>
              <p className="text-xs sm:text-sm text-[var(--apple-subtext)] leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Court Specifications */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[var(--apple-card)] border border-[var(--apple-border)] space-y-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#34c759]">
                Facility Specifications
              </p>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-[var(--apple-text)] mt-1">
                4 Championship Courts
              </h2>
            </div>
            <Link href="/book">
              <button className="px-6 py-3 rounded-full bg-[var(--apple-pill-bg)] text-[var(--apple-pill-text)] font-semibold text-xs tracking-wide inline-flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm active:scale-95 cursor-pointer">
                <span>Book Court</span>
                <ChevronRight size={14} strokeWidth={2.5} />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-[var(--apple-border)]">
              <p className="font-display font-bold text-2xl text-[var(--apple-text)]">44 × 20'</p>
              <p className="text-[11px] text-[var(--apple-subtext)] uppercase mt-1">Dimensions</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-[var(--apple-border)]">
              <p className="font-display font-bold text-2xl text-[var(--apple-text)]">34"</p>
              <p className="text-[11px] text-[var(--apple-subtext)] uppercase mt-1">Center Net</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-[var(--apple-border)]">
              <p className="font-display font-bold text-2xl text-[var(--apple-text)]">7'</p>
              <p className="text-[11px] text-[var(--apple-subtext)] uppercase mt-1">Kitchen</p>
            </div>
            <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-[var(--apple-border)]">
              <p className="font-display font-bold text-2xl text-[#34c759]">24 / 7</p>
              <p className="text-[11px] text-[var(--apple-subtext)] uppercase mt-1">Access</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
