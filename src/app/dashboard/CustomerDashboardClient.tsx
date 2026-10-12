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
  Zap,
  User,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, formatHour } from '@/lib/utils'
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
      className="relative overflow-hidden rounded-2xl bg-court-card border border-court-border p-5 flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-xl bg-court-surface">
          <Icon size={16} className={accent ?? 'text-slate-400'} />
        </div>
        <Zap size={12} className="text-slate-700" />
      </div>
      <div>
        <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">{label}</p>
        <p className={`font-display font-bold text-2xl mt-1 ${accent ?? 'text-white'}`}>{value}</p>
      </div>
      {/* Solid accent line */}
      <div
        className="absolute bottom-0 left-0 h-0.5 w-12 rounded-full"
        style={{
          backgroundColor: accent === 'text-neon-green' ? '#39ff14' : accent ? '#00f5ff' : '#242424',
        }}
      />
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
      const dt = new Date(`${b.booking_date}T${String(b.end_hour).padStart(2, '0')}:00:00`)
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
    const supabase = createClient()
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)

    if (error) {
      toast.error('Failed to cancel booking. Please try again.')
      return
    }

    setLocalBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' as const } : b)),
    )
    toast.success('Booking cancelled successfully.')
  }

  return (
    <div className="min-h-screen bg-court-dark text-slate-100">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16 space-y-10">
        {/* ── Header ── */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-widest mb-1">
              {greeting}, {firstName}
            </p>
            <h1 className="font-display font-extrabold text-5xl sm:text-6xl text-white tracking-tight leading-none">
              MY COURTS
            </h1>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-8 h-0.5 bg-neon-green" />
              <p className="text-slate-400 text-sm">Your pickleball command centre</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/book"
              className="btn-primary gap-2"
            >
              <PlusCircle size={16} />
              Quick Book
            </Link>
            <Link
              href="/auth/logout"
              className="btn-secondary text-xs px-4 py-2"
            >
              Sign Out
            </Link>
          </div>
        </motion.header>

        {/* ── Stats ── */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4" aria-label="Booking statistics">
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
            accent="text-neon-green"
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
            <h2 className="font-display font-bold text-2xl text-white">UPCOMING PASSES</h2>
            <span className="px-2 py-0.5 rounded-full bg-neon-green/10 border border-neon-green/30 text-neon-green text-xs font-bold">
              {upcoming.length}
            </span>
          </motion.div>

          {upcoming.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl border border-dashed border-court-border bg-court-card/50 p-10 text-center"
            >
              <CalendarDays size={32} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No upcoming bookings</p>
              <p className="text-slate-600 text-sm mt-1">Ready to hit the court?</p>
              <Link href="/book" className="btn-primary mt-5 mx-auto w-fit inline-flex">
                <PlusCircle size={15} />
                Book a Court
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
              className="font-display font-bold text-2xl text-white mb-5"
            >
              PAST SESSIONS
            </motion.h2>
            <div className="rounded-2xl border border-court-border bg-court-card overflow-hidden divide-y divide-court-border">
              {past.map((booking, i) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.55 + i * 0.04 }}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-court-surface/50 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-1.5 h-8 rounded-full shrink-0"
                      style={{ backgroundColor: booking.court.color_hex }}
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-white truncate">
                        {booking.court.name}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {format(parseISO(booking.booking_date), 'MMM d, yyyy')} ·{' '}
                        {formatHour(booking.start_hour)}–{formatHour(booking.end_hour)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span
                      className={`text-xs font-bold tracking-widest ${
                        booking.status === 'cancelled' ? 'text-neon-pink' : 'text-slate-500'
                      }`}
                    >
                      {booking.status.toUpperCase()}
                    </span>
                    <span className="text-slate-400 text-sm font-medium">
                      {formatCurrency(booking.total_price)}
                    </span>
                    <ChevronRight
                      size={14}
                      className="text-slate-700 group-hover:text-slate-400 transition-colors"
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
