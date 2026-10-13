'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO, isAfter } from 'date-fns'
import {
  CalendarDays,
  TrendingUp,
  CreditCard,
  Clock,
  PlusCircle,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cancelBooking } from '@/actions/bookings'
import { formatCurrency, formatHour } from '@/lib/utils'
import BookingCard from '@/components/BookingCard'
import Footer from '@/components/Footer'
import type { Booking, Court, Profile } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  profile: Profile | null
  bookings: (Booking & { court: Court })[]
  userEmail: string
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  index,
}: {
  icon: React.ElementType
  label: string
  value: string
  accent?: string
  index: number
}) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 + index * 0.05, duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl bg-[var(--apple-card)] border border-[var(--apple-border)] p-5 flex flex-col justify-between shadow-xs transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="p-2.5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] text-[var(--apple-text)]">
          <Icon size={16} className={accent ?? 'text-[var(--apple-text)]'} />
        </div>
      </div>
      <div className="mt-3">
        <p className="text-[var(--apple-subtext)] text-[10px] sm:text-xs font-semibold uppercase tracking-wider">{label}</p>
        <p className={`font-display font-bold text-2xl sm:text-3xl mt-1 text-[var(--apple-text)] tabular-nums`}>{value}</p>
      </div>
    </motion.div>
  )
}

// ── Main Client Component ─────────────────────────────────────────────────────

export default function CustomerDashboardClient({ profile, bookings, userEmail }: Props) {
  const [localBookings, setLocalBookings] = useState(bookings)

  const firstName = (profile?.full_name ?? userEmail).split(' ')[0]
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const upcoming = useMemo(() => {
    const now = new Date()
    return localBookings.filter((b) => {
      if (b.status !== 'confirmed') return false
      const dt = new Date(`${b.booking_date}T${String(b.start_hour).padStart(2, '0')}:00:00`)
      return isAfter(dt, now)
    })
  }, [localBookings])

  const past = useMemo(() => {
    const now = new Date()
    return localBookings.filter((b) => {
      const dt = new Date(`${b.booking_date}T00:00:00`)
      dt.setHours(b.end_hour)
      return !isAfter(dt, now) || b.status === 'cancelled'
    })
  }, [localBookings])

  const totalSpent = useMemo(
    () => localBookings.filter((b) => b.status === 'confirmed').reduce((s, b) => s + b.total_price, 0),
    [localBookings],
  )

  const memberSince = profile?.created_at
    ? format(parseISO(profile.created_at), 'MMM yyyy')
    : '—'

  // Optimistic cancel
  async function handleCancel(id: string) {
    const res = await cancelBooking(id)

    if (!res.success) {
      toast.error(res.error || 'Failed to cancel booking. Please try again.')
      return
    }

    setLocalBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' as const } : b)),
    )
    toast.success('Booking cancelled successfully.')
  }

  return (
    <div className="min-h-screen bg-[var(--apple-bg)] text-[var(--apple-text)] transition-colors">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16 space-y-10">
        {/* ── Header ── */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--apple-border)] pb-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-[var(--apple-border)] text-xs font-semibold text-[var(--apple-subtext)] mb-3">
              <User size={13} />
              <span>Player Pass Portal</span>
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[var(--apple-text)] tracking-tight">
              {greeting}, {firstName}
            </h1>
            <p className="text-[var(--apple-subtext)] text-xs sm:text-sm mt-1">
              Manage your confirmed court passes, view QR access tokens, and reserve session slots.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/book"
              className="btn-primary text-xs !py-2.5 !px-5 inline-flex items-center gap-2"
            >
              <PlusCircle size={15} />
              <span>Quick Book</span>
            </Link>
          </div>
        </motion.header>

        {/* ── Stats ── */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4" aria-label="Booking statistics">
          <StatCard
            index={0}
            icon={CalendarDays}
            label="Total Bookings"
            value={String(localBookings.length)}
          />
          <StatCard
            index={1}
            icon={Clock}
            label="Upcoming"
            value={String(upcoming.length)}
          />
          <StatCard
            index={2}
            icon={CreditCard}
            label="Total Spent"
            value={formatCurrency(totalSpent)}
          />
          <StatCard
            index={3}
            icon={TrendingUp}
            label="Member Since"
            value={memberSince}
          />
        </section>

        {/* ── Upcoming / Active bookings ── */}
        <section aria-label="Upcoming bookings">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3 mb-5"
          >
            <h2 className="font-display font-bold text-xl sm:text-2xl text-[var(--apple-text)] tracking-tight">
              UPCOMING PASSES
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              {upcoming.length} Active
            </span>
          </motion.div>

          {upcoming.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="rounded-3xl border border-dashed border-[var(--apple-border)] bg-[var(--apple-card)]/50 p-10 text-center"
            >
              <CalendarDays size={32} className="text-[var(--apple-muted)] mx-auto mb-3" />
              <p className="text-[var(--apple-text)] font-semibold text-base">No upcoming reservations</p>
              <p className="text-[var(--apple-subtext)] text-xs sm:text-sm mt-1">Ready to hit the court? Pick a time slot today.</p>
              <Link href="/book" className="btn-primary mt-5 mx-auto w-fit inline-flex items-center gap-2 text-xs !py-2 !px-4">
                <PlusCircle size={14} />
                <span>Book a Court</span>
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {upcoming.map((booking, i) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onCancel={handleCancel}
                    showActions
                    index={i}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

        {/* ── Past bookings ── */}
        {past.length > 0 && (
          <section aria-label="Past bookings">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="font-display font-bold text-xl sm:text-2xl text-[var(--apple-text)] tracking-tight mb-5"
            >
              PAST SESSIONS
            </motion.h2>
            <div className="rounded-3xl border border-[var(--apple-border)] bg-[var(--apple-card)] overflow-hidden divide-y divide-[var(--apple-border)] shadow-xs">
              {past.map((booking, i) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.04 }}
                  className="flex items-center justify-between px-5 py-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-2 h-8 rounded-full shrink-0"
                      style={{ backgroundColor: booking.court.color_hex }}
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-[var(--apple-text)] truncate">
                        {booking.court.name}
                      </p>
                      <p className="text-[var(--apple-subtext)] text-xs mt-0.5">
                        {format(parseISO(booking.booking_date), 'MMM d, yyyy')} ·{' '}
                        {formatHour(booking.start_hour)}–{formatHour(booking.end_hour)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span
                      className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        booking.status === 'cancelled'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : 'bg-black/[0.05] dark:bg-white/[0.06] text-[var(--apple-subtext)]'
                      }`}
                    >
                      {booking.status.toUpperCase()}
                    </span>
                    <span className="text-[var(--apple-text)] text-sm font-semibold tabular-nums">
                      {formatCurrency(booking.total_price)}
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-[var(--apple-muted)] group-hover:text-[var(--apple-text)] transition-colors"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}

      </div>

      <Footer />
    </div>
  )
}
