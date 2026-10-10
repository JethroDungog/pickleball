'use client'

import { useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { cn, formatHour, formatCurrency } from '@/lib/utils'
import type { Court, Booking } from '@/types'

// ── Constants ─────────────────────────────────────────────────────────────────

const START_HOUR = 6   // 6 AM
const END_HOUR = 22    // 10 PM
const HOUR_WIDTH = 80  // px per hour column

// ── Types ─────────────────────────────────────────────────────────────────────

interface MultiCourtGanttProps {
  courts: Court[]
  bookings: Booking[]
  selectedDate: string
  onSlotClick?: (courtId: string, hour: number) => void
  isAdmin?: boolean
}

interface TooltipState {
  booking: Booking
  x: number
  y: number
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
    <div className="relative rounded-2xl overflow-hidden border border-white/10" style={{ background: '#0d0d0d' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide text-white/80" style={{ fontFamily: 'Syne, sans-serif' }}>
          All Courts — {format(parseISO(selectedDate), 'EEEE, MMMM d')}
        </h3>
        {isAdmin && (
          <span className="text-xs px-2 py-0.5 rounded-full border border-[#39ff14]/30 text-[#39ff14] font-mono tracking-widest">
            ADMIN VIEW
          </span>
        )}
      </div>

      {/* Layout: sticky court column + scrollable timeline */}
      <div className="flex">
        {/* Sticky court name column */}
        <div className="flex-shrink-0 w-36 border-r border-white/10">
          {/* Spacer row for hour header */}
          <div className="h-10 border-b border-white/10 flex items-center px-3">
            <span className="text-xs text-white/30 font-mono">COURT</span>
          </div>
          {courts.map((court, idx) => (
            <div
              key={court.id}
              className={cn(
                'h-16 flex items-center px-3 gap-2 border-b border-white/5',
                idx % 2 === 0 ? 'bg-white/[0.02]' : '',
              )}
            >
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: court.color_hex }}
              />
              <span className="text-xs font-semibold text-white/80 leading-tight truncate">
                {court.name}
              </span>
            </div>
          ))}
        </div>

        {/* Scrollable timeline */}
        <div ref={scrollRef} className="flex-1 overflow-x-auto relative" style={{ scrollbarWidth: 'thin' }}>
          <div style={{ width: totalWidth, minWidth: '100%', position: 'relative' }}>
            {/* Hour header row */}
            <div className="h-10 border-b border-white/10 flex sticky top-0 z-10" style={{ background: '#0d0d0d' }}>
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="flex-shrink-0 flex items-center justify-start pl-2 border-r border-white/5"
                  style={{ width: HOUR_WIDTH }}
                >
                  <span className="text-xs font-mono text-white/30">
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
                className="absolute top-0 bottom-0 w-px z-20 pointer-events-none"
                style={{
                  left: nowOffset,
                  background: 'rgba(0,245,255,0.8)',
                  boxShadow: '0 0 8px rgba(0,245,255,0.6)',
                }}
              >
                <div
                  className="absolute -top-0.5 -left-1.5 w-3 h-3 rounded-full"
                  style={{ background: '#00f5ff', boxShadow: '0 0 8px #00f5ff' }}
                />
                <span
                  className="absolute top-1 left-2 text-[10px] font-mono whitespace-nowrap"
                  style={{ color: '#00f5ff' }}
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
        'h-16 relative border-b border-white/5 group',
        idx % 2 === 0 ? 'bg-white/[0.02]' : '',
        'hover:bg-white/[0.04] transition-colors',
      )}
      style={{ width: totalWidth }}
    >
      {/* Hour grid lines */}
      {HOURS.map((hour) => (
        <button
          key={hour}
          onClick={() => onSlotClick?.(court.id, hour)}
          className="absolute top-0 h-full border-r border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
          style={{ left: (hour - START_HOUR) * HOUR_WIDTH, width: HOUR_WIDTH }}
          aria-label={`Book ${court.name} at ${formatHour(hour)}`}
        >
          {/* Dotted available pattern */}
          <div
            className="absolute inset-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)`,
              backgroundSize: '8px 8px',
            }}
          />
        </button>
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
      className="absolute top-1 bottom-1 rounded-lg overflow-hidden group/block z-10 cursor-default"
      style={{
        left: left + 2,
        width,
        background: isMaintenance
          ? 'repeating-linear-gradient(45deg, rgba(255,200,0,0.15), rgba(255,200,0,0.15) 4px, transparent 4px, transparent 10px)'
          : `${court.color_hex}22`,
        border: `1px solid ${isMaintenance ? 'rgba(255,200,0,0.4)' : court.color_hex + '55'}`,
      }}
      initial={{ scaleY: 0.6, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      title={`${formatHour(booking.start_hour)}–${formatHour(booking.end_hour)}`}
    >
      {/* Fill indicator bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ background: isMaintenance ? '#ffc800' : court.color_hex }}
      />

      {/* Content */}
      <div className="flex items-center h-full pl-3 pr-2 gap-2">
        {isAdmin && !isMaintenance && (
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
            style={{ background: court.color_hex, color: '#0d0d0d' }}
          >
            {initials}
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span
            className="text-[10px] font-semibold leading-tight truncate"
            style={{ color: isMaintenance ? '#ffc800' : court.color_hex }}
          >
            {isMaintenance ? 'Maintenance' : isAdmin ? (booking.profile?.full_name ?? 'Booked') : 'Reserved'}
          </span>
          <span className="text-[9px] text-white/40 leading-tight">
            {formatHour(booking.start_hour)}–{formatHour(booking.end_hour)}
          </span>
        </div>
      </div>

      {/* Hover tooltip for admin */}
      {isAdmin && (
        <div className="absolute bottom-full left-0 mb-2 z-30 opacity-0 group-hover/block:opacity-100 transition-opacity pointer-events-none">
          <div
            className="rounded-xl p-3 text-xs shadow-2xl border border-white/10 min-w-[180px]"
            style={{ background: '#1a1a1a' }}
          >
            <p className="font-semibold text-white mb-1">
              {booking.profile?.full_name ?? 'Customer'}
            </p>
            <p className="text-white/50">{booking.profile?.email}</p>
            <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-white/40">
                {formatHour(booking.start_hour)} – {formatHour(booking.end_hour)}
              </span>
              <span className="font-bold" style={{ color: '#39ff14' }}>
                {formatCurrency(booking.total_price)}
              </span>
            </div>
            {booking.notes && (
              <p className="mt-1.5 text-white/40 italic text-[10px]">&ldquo;{booking.notes}&rdquo;</p>
            )}
          </div>
          {/* Arrow */}
          <div
            className="w-2 h-2 rotate-45 border-r border-b border-white/10 ml-4"
            style={{ background: '#1a1a1a', marginTop: -5 }}
          />
        </div>
      )}
    </motion.div>
  )
}
