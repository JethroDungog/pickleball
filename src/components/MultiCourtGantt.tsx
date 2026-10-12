'use client'

import { useRef, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { cn, formatHour, formatCurrency } from '@/lib/utils'
import type { Court, Booking } from '@/types'

// ── Constants ─────────────────────────────────────────────────────────────────

const START_HOUR = 0   // 12 AM (24/7)
const END_HOUR = 24    // 12 AM next day
const HOUR_WIDTH = 70  // px per hour column

// ── Types ─────────────────────────────────────────────────────────────────────

interface MultiCourtGanttProps {
  courts: Court[]
  bookings: Booking[]
  selectedDate: string
  onSlotClick?: (courtId: string, hour: number) => void
  isAdmin?: boolean
}

// ── Hour range helper ─────────────────────────────────────────────────────────

const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)

// ── Main Component ────────────────────────────────────────────────────────────

export default function MultiCourtGantt({
  courts,
  bookings,
  selectedDate,
  onSlotClick,
  isAdmin = false,
}: MultiCourtGanttProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const nowLineRef = useRef<HTMLDivElement>(null)

  // Scroll "now" indicator into view on mount
  useEffect(() => {
    const now = new Date()
    const currentHour = now.getHours()
    if (currentHour >= START_HOUR && currentHour <= END_HOUR && scrollRef.current) {
      const offset = (currentHour - START_HOUR) * HOUR_WIDTH - 120
      scrollRef.current.scrollLeft = Math.max(0, offset)
    }
  }, [])

  // Today's current hour for "now" indicator
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const isToday = selectedDate === todayStr
  const currentHour = new Date().getHours()
  const currentMinutes = new Date().getMinutes()
  const nowOffset = isToday
    ? (currentHour - START_HOUR + currentMinutes / 60) * HOUR_WIDTH
    : null

  // Group bookings by court for fast lookup
  const bookingsByCourt = useMemo(() => {
    const map: Record<string, Booking[]> = {}
    for (const b of bookings) {
      if (b.status === 'cancelled') continue
      if (!map[b.court_id]) map[b.court_id] = []
      map[b.court_id].push(b)
    }
    return map
  }, [bookings])

  const totalWidth = HOURS.length * HOUR_WIDTH

  return (
    <div className="relative rounded-3xl overflow-hidden border border-[var(--apple-border)] w-full max-w-full min-w-0 bg-[var(--apple-card)] shadow-sm transition-colors">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-[var(--apple-border)] flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
        <h3 className="text-xs sm:text-sm font-semibold tracking-tight text-[var(--apple-text)]">
          All Courts — {format(parseISO(selectedDate), 'EEEE, MMMM d')}
        </h3>
        {isAdmin && (
          <span className="text-[10px] px-2.5 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold tracking-wider">
            ADMIN CONSOLE
          </span>
        )}
      </div>

      {/* Layout: sticky court column + scrollable timeline */}
      <div className="flex w-full min-w-0 overflow-hidden">
        {/* Sticky court name column */}
        <div className="flex-shrink-0 w-28 sm:w-36 border-r border-[var(--apple-border)] bg-[var(--apple-card)] z-20">
          {/* Spacer row for hour header */}
          <div className="h-10 border-b border-[var(--apple-border)] flex items-center px-3.5 bg-black/[0.02] dark:bg-white/[0.02]">
            <span className="text-[10px] font-semibold text-[var(--apple-subtext)] uppercase tracking-wider">
              Court
            </span>
          </div>
          {courts.map((court, idx) => (
            <div
              key={court.id}
              className={cn(
                'h-16 flex items-center px-3 sm:px-3.5 gap-2 border-b border-[var(--apple-border)]',
                idx % 2 === 0 ? 'bg-black/[0.01] dark:bg-white/[0.01]' : 'bg-transparent',
              )}
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
                style={{ background: court.color_hex }}
              />
              <span className="text-xs font-semibold text-[var(--apple-text)] leading-tight truncate">
                {court.name}
              </span>
            </div>
          ))}
        </div>

        {/* Scrollable timeline */}
        <div
          ref={scrollRef}
          className="flex-1 min-w-0 overflow-x-auto relative scrollbar-none"
        >
          <div style={{ width: totalWidth, minWidth: '100%', position: 'relative' }}>
            {/* Hour header row */}
            <div className="h-10 border-b border-[var(--apple-border)] flex sticky top-0 z-10 bg-[var(--apple-card)]">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="flex-shrink-0 flex items-center justify-start pl-2.5 border-r border-[var(--apple-border)]"
                  style={{ width: HOUR_WIDTH }}
                >
                  <span className="text-[11px] font-mono font-medium text-[var(--apple-subtext)]">
                    {formatHour(hour).replace(':00', '')}
                  </span>
                </div>
              ))}
            </div>

            {/* Court rows */}
            {courts.map((court, idx) => (
              <CourtRow
                key={court.id}
                court={court}
                bookings={bookingsByCourt[court.id] ?? []}
                isAdmin={isAdmin}
                idx={idx}
                onSlotClick={onSlotClick}
                totalWidth={totalWidth}
              />
            ))}

            {/* "Now" vertical line */}
            {nowOffset !== null && nowOffset >= 0 && nowOffset <= totalWidth && (
              <div
                ref={nowLineRef}
                className="absolute top-0 bottom-0 w-[2px] z-20 pointer-events-none"
                style={{
                  left: nowOffset,
                  background: '#ff3b30',
                }}
              >
                <div
                  className="absolute -top-1 -left-[3px] w-2 h-2 rounded-full shadow-sm"
                  style={{ background: '#ff3b30' }}
                />
                <span
                  className="absolute top-1 left-1.5 text-[9px] font-bold uppercase tracking-wider px-1 py-0.2 rounded bg-[#ff3b30] text-white"
                >
                  NOW
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── CourtRow ──────────────────────────────────────────────────────────────────

interface CourtRowProps {
  court: Court
  bookings: Booking[]
  isAdmin: boolean
  idx: number
  onSlotClick?: (courtId: string, hour: number) => void
  totalWidth: number
}

function CourtRow({ court, bookings, isAdmin, idx, onSlotClick, totalWidth }: CourtRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={rowRef}
      className={cn(
        'h-16 relative border-b border-[var(--apple-border)] group',
        idx % 2 === 0 ? 'bg-black/[0.01] dark:bg-white/[0.01]' : 'bg-transparent',
        'hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors',
      )}
      style={{ width: totalWidth }}
    >
      {/* Hour grid lines */}
      {HOURS.map((hour) => (
        <button
          key={hour}
          onClick={() => onSlotClick?.(court.id, hour)}
          className="absolute top-0 h-full border-r border-[var(--apple-border)] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
          style={{ left: (hour - START_HOUR) * HOUR_WIDTH, width: HOUR_WIDTH }}
          aria-label={`Book ${court.name} at ${formatHour(hour)}`}
        />
      ))}

      {/* Booking blocks */}
      {bookings.map((booking) => (
        <BookingBlock
          key={booking.id}
          booking={booking}
          court={court}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  )
}

// ── BookingBlock ──────────────────────────────────────────────────────────────

interface BookingBlockProps {
  booking: Booking
  court: Court
  isAdmin: boolean
}

function BookingBlock({ booking, court, isAdmin }: BookingBlockProps) {
  const left = (booking.start_hour - START_HOUR) * HOUR_WIDTH
  const width = (booking.end_hour - booking.start_hour) * HOUR_WIDTH - 4

  const isMaintenance = booking.status === 'maintenance'
  const initials = booking.profile?.full_name
    ? booking.profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '??'

  return (
    <motion.div
      className="absolute top-1.5 bottom-1.5 rounded-xl overflow-hidden group/block z-10 cursor-default shadow-xs"
      style={{
        left: left + 2,
        width,
        background: isMaintenance
          ? 'rgba(255,149,0,0.14)'
          : `${court.color_hex}18`,
        border: `1px solid ${isMaintenance ? 'rgba(255,149,0,0.4)' : court.color_hex + '40'}`,
      }}
      initial={{ scaleY: 0.6, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      title={`${formatHour(booking.start_hour)}–${formatHour(booking.end_hour)}`}
    >
      {/* Fill indicator bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ background: isMaintenance ? '#ff9500' : court.color_hex }}
      />

      {/* Content */}
      <div className="flex items-center h-full pl-3 pr-2 gap-2">
        {isAdmin && !isMaintenance && (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
            style={{ background: court.color_hex, color: '#ffffff' }}
          >
            {initials}
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span
            className="text-[10px] font-semibold leading-tight truncate"
            style={{ color: isMaintenance ? '#ff9500' : court.color_hex }}
          >
            {isMaintenance ? 'Maintenance' : isAdmin ? (booking.profile?.full_name ?? 'Booked') : 'Reserved'}
          </span>
          <span className="text-[9px] text-[var(--apple-subtext)] leading-tight">
            {formatHour(booking.start_hour)}–{formatHour(booking.end_hour)}
          </span>
        </div>
      </div>

      {/* Hover tooltip for admin */}
      {isAdmin && (
        <div className="absolute bottom-full left-0 mb-2 z-30 opacity-0 group-hover/block:opacity-100 transition-opacity pointer-events-none">
          <div
            className="rounded-2xl p-3 text-xs shadow-xl border border-[var(--apple-border)] bg-[var(--apple-card)] min-w-[180px]"
          >
            <p className="font-semibold text-[var(--apple-text)] mb-1">
              {booking.profile?.full_name ?? 'Customer'}
            </p>
            <p className="text-[var(--apple-subtext)] text-[11px]">{booking.profile?.email}</p>
            <div className="mt-2 pt-2 border-t border-[var(--apple-border)] flex items-center justify-between">
              <span className="text-[var(--apple-subtext)]">
                {formatHour(booking.start_hour)} – {formatHour(booking.end_hour)}
              </span>
              <span className="font-bold text-[var(--apple-text)]">
                {formatCurrency(booking.total_price)}
              </span>
            </div>
            {booking.notes && (
              <p className="mt-1.5 text-[var(--apple-subtext)] italic text-[10px]">&ldquo;{booking.notes}&rdquo;</p>
            )}
          </div>
          {/* Arrow */}
          <div
            className="w-2 h-2 rotate-45 border-r border-b border-[var(--apple-border)] bg-[var(--apple-card)] ml-4"
            style={{ marginTop: -5 }}
          />
        </div>
      )}
    </motion.div>
  )
}
