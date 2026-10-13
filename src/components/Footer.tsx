'use client'

import Link from 'next/link'
import { Zap, Shield, ArrowUpRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative bg-[var(--apple-bg)] border-t border-[var(--apple-border)] pt-16 pb-12 text-[var(--apple-text)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Logo + Tagline */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-1.5">
              <Zap size={20} className="text-[#30d158] fill-[#30d158]" />
              <span className="font-bold text-2xl tracking-tight font-display text-[var(--apple-text)]">
                PickCourt
              </span>
            </div>
            <p className="text-sm text-[var(--apple-subtext)] leading-relaxed">
              Manila&apos;s premier 24/7 pickleball facility. Professional shock-absorbing surfaces, tournament lighting, and instant mobile reservations.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/[0.04] dark:bg-white/5 border border-[var(--apple-border)] text-xs text-[var(--apple-subtext)]">
              <span className="w-2 h-2 rounded-full bg-[#30d158] animate-pulse" />
              <span>4 Courts Operating 24/7</span>
            </div>
          </div>

          {/* Player Nav */}
          <div>
            <p className="text-xs font-semibold tracking-wider text-[var(--apple-muted)] uppercase mb-4">
              Player Services
            </p>
            <nav className="flex flex-col gap-2.5 text-sm text-[var(--apple-subtext)]">
              <Link href="/book" className="hover:text-[var(--apple-text)] transition-colors">
                Book a Court (24/7)
              </Link>
              <Link href="/schedule" className="hover:text-[var(--apple-text)] transition-colors">
                Live Timeline Schedule
              </Link>
              <Link href="/dashboard" className="hover:text-[var(--apple-text)] transition-colors">
                Digital Court Passes
              </Link>
              <Link href="/about" className="hover:text-[var(--apple-text)] transition-colors">
                Facility & Court Specs
              </Link>
            </nav>
          </div>

          {/* Facility & Policies */}
          <div>
            <p className="text-xs font-semibold tracking-wider text-[var(--apple-muted)] uppercase mb-4">
              Facility & Rules
            </p>
            <nav className="flex flex-col gap-2.5 text-sm text-[var(--apple-subtext)]">
              <Link href="/terms" className="hover:text-[var(--apple-text)] transition-colors">
                Court Rules & Footwear Policy
              </Link>
              <Link href="/terms" className="hover:text-[var(--apple-text)] transition-colors">
                24-Hour Cancellation Policy
              </Link>
              <Link href="/terms" className="hover:text-[var(--apple-text)] transition-colors">
                Rain Guarantee & Rescheduling
              </Link>
              <Link href="/privacy" className="hover:text-[var(--apple-text)] transition-colors">
                Privacy Policy
              </Link>
            </nav>
          </div>

          {/* Discrete Staff & Admin Access */}
          <div className="rounded-3xl p-5 border border-[var(--apple-border)] bg-[var(--apple-card)] space-y-3 shadow-sm">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-[#30d158]" />
              <span className="text-xs font-semibold tracking-wider uppercase text-[var(--apple-text)]">
                Staff & Management
              </span>
            </div>
            <p className="text-xs text-[var(--apple-subtext)] leading-relaxed">
              Authorized access for court marshals, timeline managers, and facility administrators.
            </p>
            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/admin"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/5 border border-[var(--apple-border)] text-xs font-medium text-[var(--apple-text)] hover:bg-black/[0.06] dark:hover:bg-white/10 transition-all group"
              >
                <span>Court Manager Portal</span>
                <ArrowUpRight size={13} className="text-[var(--apple-muted)] group-hover:text-[var(--apple-text)] transition-colors" />
              </Link>
              <Link
                href="/super-admin"
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/5 border border-[var(--apple-border)] text-xs font-medium text-[var(--apple-text)] hover:bg-black/[0.06] dark:hover:bg-white/10 transition-all group"
              >
                <span>Super Admin Console</span>
                <ArrowUpRight size={13} className="text-[var(--apple-muted)] group-hover:text-[var(--apple-text)] transition-colors" />
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-[var(--apple-border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--apple-muted)]">
          <p>© {new Date().getFullYear()} PickCourt Inc. All rates in Philippine Peso (PHP ₱). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-[var(--apple-text)] transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-[var(--apple-text)] transition-colors">Privacy Policy</Link>
            <Link href="/auth/login" className="hover:text-[var(--apple-text)] transition-colors">Account Sign In</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
