'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import {
  Activity,
  CreditCard,
  Grid3X3,
  BarChart3,
  CheckCircle,
  Search,
  Wrench,
  Users,
  RefreshCw,
  Clock,
  PlusCircle,
  Zap,
  Calendar,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatHour } from '@/lib/utils'
import type { Booking, Court, Profile } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  bookings: (Booking & { court: Court; profile: Profile })[]
  courts: Court[]
  today: string
}

// ── Live Clock ────────────────────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="text-right">
      <p className="font-display font-bold text-3xl text-neon-green tabular-nums">
        {format(time, 'HH:mm:ss')}
      </p>
      <p className="text-slate-500 text-xs">{format(time, 'EEEE, MMMM d, yyyy')}</p>
    </div>
  )
}

// ── Metric Card ───────────────────────────────────────────────────────────────

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  index,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  accent?: string
  index: number
}) {
  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1 + index * 0.06 }}
      className="bg-court-card border border-court-border rounded-2xl p-5 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-xl bg-court-surface">
          <Icon size={15} className={accent ?? 'text-slate-400'} />
        </div>
        <Zap size={11} className="text-slate-800" />
      </div>
      <div>
        <p className="text-slate-500 text-[10px] uppercase tracking-widest font-medium">{label}</p>
        <p className={`font-display font-extrabold text-3xl mt-0.5 ${accent ?? 'text-white'}`}>
          {value}
        </p>
        {sub && <p className="text-slate-600 text-xs mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  )
}

// ── Multi-Court Gantt (inline, since @/components/MultiCourtGantt might not exist yet) ──────────

function MultiCourtGantt({
  bookings,
  courts,
  maintenanceCourts,
}: {
  bookings: (Booking & { court: Court })[]
  courts: Court[]
  maintenanceCourts: Set<string>
}) {
  const hours = Array.from({ length: 14 }, (_, i) => i + 7) // 7 AM – 8 PM

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Hour labels */}
        <div className="flex ml-28 mb-1">
          {hours.map((h) => (
            <div key={h} className="flex-1 text-center text-[10px] text-slate-600 font-mono">
              {h % 12 === 0 ? 12 : h % 12}
              {h < 12 ? 'a' : 'p'}
            </div>
          ))}
        </div>
        {/* Court rows */}
        {courts.map((court) => {
          const courtBookings = bookings.filter((b) => b.court_id === court.id && b.status !== 'cancelled')
          const isMaint = maintenanceCourts.has(court.id)

          return (
            <div key={court.id} className="flex items-center mb-2">
              {/* Court label */}
              <div className="w-28 shrink-0 flex items-center gap-2 pr-2">
                <div className="w-2 h-6 rounded-full" style={{ backgroundColor: court.color_hex }} />
                <span className="text-xs font-medium text-slate-300 truncate">{court.name}</span>
              </div>

              {/* Time grid */}
              <div className="relative flex-1 h-9 bg-court-surface rounded-lg overflow-hidden">
                {/* Hour grid lines */}
                {hours.map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 border-l border-court-border/40"
                    style={{ left: `${(i / hours.length) * 100}%` }}
                  />
                ))}

                {/* Maintenance overlay */}
                {isMaint && (
                  <div className="absolute inset-0 bg-neon-yellow/10 border border-neon-yellow/30 rounded-lg flex items-center justify-center">
                    <span className="text-[9px] text-neon-yellow font-bold tracking-widest">MAINTENANCE</span>
                  </div>
                )}

                {/* Booking blocks */}
                {!isMaint &&
                  courtBookings.map((b) => {
                    const startFrac = (b.start_hour - 7) / hours.length
                    const widthFrac = (b.end_hour - b.start_hour) / hours.length
                    if (startFrac < 0 || startFrac > 1) return null
                    return (
                      <div
                        key={b.id}
                        className="absolute top-1 bottom-1 rounded flex items-center px-1.5 overflow-hidden"
                        style={{
                          left: `${startFrac * 100}%`,
                          width: `${widthFrac * 100}%`,
                          backgroundColor: `${court.color_hex}30`,
                          borderLeft: `3px solid ${court.color_hex}`,
                        }}
                        title={`${b.profile?.full_name ?? 'Unknown'} · ${formatHour(b.start_hour)}–${formatHour(b.end_hour)}`}
                      >
                        <span className="text-[9px] font-semibold truncate" style={{ color: court.color_hex }}>
                          {b.profile?.full_name?.split(' ')[0] ?? '—'}
                        </span>
                      </div>
                    )
                  })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Admin Client Component ───────────────────────────────────────────────

export default function AdminDashboardClient({ bookings: initialBookings, courts, today }: Props) {
  const [bookings, setBookings] = useState(initialBookings)
  const [search, setSearch] = useState('')
  const [maintenanceCourts, setMaintenanceCourts] = useState<Set<string>>(new Set())
  const [checkedIn, setCheckedIn] = useState<Set<string>>(new Set())
  const [isRefreshing, setIsRefreshing] = useState(false)

  // ── Metrics ──
  const revenue = useMemo(
    () => bookings.filter((b) => b.status === 'confirmed').reduce((s, b) => s + b.total_price, 0),
    [bookings],
  )

  const confirmedCount = bookings.filter((b) => b.status === 'confirmed').length
  const activeCourts = courts.filter((c) => !maintenanceCourts.has(c.id)).length
  const utilization =
    courts.length > 0 ? Math.round((confirmedCount / (courts.length * 14)) * 100) : 0

  // ── Search filter ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return bookings
    return bookings.filter(
      (b) =>
        b.profile?.full_name?.toLowerCase().includes(q) ||
        b.profile?.email?.toLowerCase().includes(q) ||
        b.court?.name?.toLowerCase().includes(q),
    )
  }, [bookings, search])

  // ── Refresh ──
  async function refresh() {
    setIsRefreshing(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('bookings')
      .select('*, court:courts(*), profile:profiles(*)')
      .eq('booking_date', today)
      .order('start_hour')
    if (data) setBookings(data as typeof initialBookings)
    setIsRefreshing(false)
    toast.success('Data refreshed')
  }

  // ── Check-in ──
  function handleCheckIn(id: string) {
    setCheckedIn((prev) => {
      const next = new Set(prev)
      next.add(id)
      return next
    })
    toast.success('Customer checked in ✓')
  }

  // ── Maintenance toggle ──
  function toggleMaintenance(courtId: string) {
    setMaintenanceCourts((prev) => {
      const next = new Set(prev)
      if (next.has(courtId)) {
        next.delete(courtId)
        toast(`Court removed from maintenance`)
      } else {
        next.add(courtId)
        toast(`Court marked for maintenance`, { icon: '🔧' })
      }
      return next
    })
  }

  return (
    <div className="min-h-screen bg-court-dark text-slate-100">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16 space-y-8">
        {/* ── Header ── */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-8 bg-neon-green rounded-full" />
              <span className="text-[10px] text-neon-green font-bold tracking-widest uppercase">
                Admin Access
              </span>
            </div>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white tracking-tight leading-none">
              COURT COMMAND<br />CENTER
            </h1>
          </div>
          <div className="flex flex-col items-end gap-2">
            <LiveClock />
            <button
              onClick={refresh}
              disabled={isRefreshing}
              className="btn-secondary text-xs px-3 py-1.5 gap-1.5"
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </motion.header>

        {/* ── Metrics ── */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard index={0} icon={Activity} label="Today's Bookings" value={confirmedCount} />
          <MetricCard
            index={1}
            icon={CreditCard}
            label="Revenue Today"
            value={formatCurrency(revenue)}
            accent="text-neon-green"
          />
          <MetricCard
            index={2}
            icon={Grid3X3}
            label="Active Courts"
            value={activeCourts}
            sub={`of ${courts.length} total`}
          />
          <MetricCard
            index={3}
            icon={BarChart3}
            label="Utilization"
            value={`${utilization}%`}
            accent={utilization > 70 ? 'text-neon-green' : 'text-slate-300'}
          />
        </section>

        {/* ── Gantt + Booking list ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Gantt */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="xl:col-span-2 bg-court-card border border-court-border rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-xl text-white">TODAY&apos;S SCHEDULE</h2>
              <span className="text-xs text-slate-500">{format(parseISO(today), 'MMM d, yyyy')}</span>
            </div>
            <MultiCourtGantt
              bookings={bookings}
              courts={courts}
              maintenanceCourts={maintenanceCourts}
            />
          </motion.div>

          {/* Booking list */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-court-card border border-court-border rounded-2xl p-5 space-y-4 overflow-hidden"
          >
            <div className="flex items-center gap-2">
              <Users size={15} className="text-slate-400" />
              <h2 className="font-display font-bold text-lg text-white">TODAY&apos;S BOOKINGS</h2>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-8 text-sm py-2"
              />
            </div>

            {/* List */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              <AnimatePresence>
                {filtered.length === 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-slate-600 text-sm text-center py-8"
                  >
                    No bookings found
                  </motion.p>
                )}
                {filtered.map((b, i) => (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between gap-2 p-3 rounded-xl bg-court-surface border border-court-border hover:border-court-border/80 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-1 h-8 rounded-full shrink-0"
                        style={{ backgroundColor: b.court?.color_hex }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {b.profile?.full_name ?? '—'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {b.court?.name} · {formatHour(b.start_hour)}–{formatHour(b.end_hour)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleCheckIn(b.id)}
                      disabled={checkedIn.has(b.id)}
                      className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        checkedIn.has(b.id)
                          ? 'bg-neon-green/10 text-neon-green border border-neon-green/30'
                          : 'bg-court-card border border-court-border text-slate-400 hover:border-neon-green/40 hover:text-neon-green'
                      }`}
                    >
                      <CheckCircle size={10} />
                      {checkedIn.has(b.id) ? 'IN' : 'CHECK'}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Maintenance toggles */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-court-card border border-court-border rounded-2xl p-6 space-y-4"
          >
            <div className="flex items-center gap-2">
              <Wrench size={15} className="text-neon-yellow" />
              <h2 className="font-display font-bold text-lg text-white">COURT MAINTENANCE</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {courts.map((court) => {
                const isMaint = maintenanceCourts.has(court.id)
                return (
                  <button
                    key={court.id}
                    onClick={() => toggleMaintenance(court.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                      isMaint
                        ? 'bg-neon-yellow/10 border-neon-yellow/40 text-neon-yellow'
                        : 'bg-court-surface border-court-border text-slate-400 hover:border-court-border/60'
                    }`}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: court.color_hex }}
                    />
                    <span className="text-xs font-semibold truncate">{court.name}</span>
                    {isMaint && (
                      <Wrench size={10} className="ml-auto shrink-0 text-neon-yellow" />
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Staff Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="rounded-3xl bg-[#1c1c1e] border border-white/[0.08] p-6 space-y-4"
          >
            <div className="flex items-center gap-2">
              <PlusCircle size={16} className="text-[#30d158]" />
              <h2 className="font-display font-semibold text-lg text-white">Manager Quick Actions</h2>
            </div>
            <div className="space-y-3">
              <a
                href="/book"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:border-white/20 hover:bg-white/[0.08] transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <PlusCircle size={15} className="text-[#30d158]" />
                  <span className="text-sm font-medium text-white">Walk-in Player Booking</span>
                </div>
                <span className="text-white/40 group-hover:text-white transition-colors text-xs">→</span>
              </a>
              <a
                href="/schedule"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:border-white/20 hover:bg-white/[0.08] transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Calendar size={15} className="text-blue-400" />
                  <span className="text-sm font-medium text-white">Live Facility Schedule</span>
                </div>
                <span className="text-white/40 group-hover:text-white transition-colors text-xs">→</span>
              </a>
              <a
                href="/super-admin"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:border-white/20 hover:bg-white/[0.08] transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <Wrench size={15} className="text-amber-400" />
                  <span className="text-sm font-medium text-white">Facility Rates & Super Admin</span>
                </div>
                <span className="text-white/40 group-hover:text-white transition-colors text-xs">→</span>
              </a>
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                <div className="flex items-center gap-2 mb-1.5">
                  <Activity size={13} className="text-white/40" />
                  <span className="text-xs text-white/50 font-medium">Today&apos;s Revenue</span>
                </div>
                <p className="font-display font-bold text-2xl text-[#30d158]">
                  {formatCurrency(revenue)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
