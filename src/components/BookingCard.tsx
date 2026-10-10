'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO, differenceInHours } from 'date-fns'
import { X, CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react'
import { cn, formatHour, formatCurrency } from '@/lib/utils'
import type { Booking, Court } from '@/types'

// ── QR Code placeholder SVG ───────────────────────────────────────────────────
function QRPlaceholder({ id }: { id: string }) {
  // Derive a deterministic 6×6 bit grid from the booking ID
  const bits: boolean[] = Array.from({ length: 36 }, (_, i) => {
    const charCode = id.charCodeAt(i % id.length) ?? 65
    return (charCode + i * 7) % 3 !== 0
  })

  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Booking QR code"
      className="opacity-80"
    >
      {/* Corner squares */}
      <rect x="4" y="4" width="18" height="18" rx="2" fill="none" stroke="#39ff14" strokeWidth="2" />
      <rect x="7" y="7" width="12" height="12" rx="1" fill="#39ff14" opacity="0.9" />
      <rect x="50" y="4" width="18" height="18" rx="2" fill="none" stroke="#39ff14" strokeWidth="2" />
      <rect x="53" y="7" width="12" height="12" rx="1" fill="#39ff14" opacity="0.9" />
      <rect x="4" y="50" width="18" height="18" rx="2" fill="none" stroke="#39ff14" strokeWidth="2" />
      <rect x="7" y="53" width="12" height="12" rx="1" fill="#39ff14" opacity="0.9" />

      {/* Data modules */}
      {bits.map((filled, i) => {
        const col = i % 6
        const row = Math.floor(i / 6)
        const x = 27 + col * 7
        const y = 27 + row * 7
        return filled ? (
          <rect key={i} x={x} y={y} width="5" height="5" rx="0.5" fill="#39ff14" opacity="0.7" />
        ) : null
      })}

      {/* Bottom-right module */}
      <rect x="50" y="50" width="18" height="18" rx="2" fill="none" stroke="#39ff14" strokeWidth="2" />
      <rect x="53" y="53" width="5" height="5" rx="0.5" fill="#39ff14" />
      <rect x="61" y="53" width="5" height="5" rx="0.5" fill="#39ff14" />
      <rect x="53" y="61" width="5" height="5" rx="0.5" fill="#39ff14" />
      <rect x="61" y="61" width="5" height="5" rx="0.5" fill="#39ff14" />
    </svg>
  )
}

// ── Surface badge ─────────────────────────────────────────────────────────────
const SURFACE_LABELS: Record<string, string> = {
  hard: 'HARD COURT',
  clay: 'CLAY',
  grass: 'GRASS',
  synthetic: 'SYNTHETIC',
}

// ── Props ─────────────────────────────────────────────────────────────────────
export interface BookingCardProps {
  booking: Booking & { court: Court }
  onCancel?: (id: string) => void
  showActions?: boolean
  index?: number
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function BookingCard({
  booking,
  onCancel,
  showActions = true,
  index = 0,
}: BookingCardProps) {
  const [cancelState, setCancelState] = useState<'idle' | 'confirm' | 'loading'>('idle')
  const { court } = booking

  // Determine if cancellation is allowed (>24 h away and confirmed)
  const bookingDateTime = new Date(
    `${booking.booking_date}T${String(booking.start_hour).padStart(2, '0')}:00:00`,
  )
  const hoursUntil = differenceInHours(bookingDateTime, new Date())
  const canCancel = showActions && booking.status === 'confirmed' && hoursUntil > 24 && !!onCancel

  const shortId = booking.id.split('-')[0].toUpperCase()
  const dateObj = parseISO(booking.booking_date)

  async function handleCancel() {
    if (cancelState === 'idle') {
      setCancelState('confirm')
      return
    }
    if (cancelState === 'confirm') {
      setCancelState('loading')
      await onCancel?.(booking.id)
      setCancelState('idle')
    }
  }

  function handleCancelAbort() {
    setCancelState('idle')
  }

  const isCancelled = booking.status === 'cancelled'
  const isMaintenance = booking.status === 'maintenance'

  return (
    <motion.article
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={!isCancelled ? { y: -3, boxShadow: '0 16px 40px rgba(0,0,0,0.7)' } : undefined}
      className={cn(
        'relative flex overflow-hidden rounded-2xl border',
        'bg-court-card',
        isCancelled ? 'border-neon-pink/20 opacity-70' : 'border-court-border',
      )}
      aria-label={`Booking ${shortId} for ${court.name}`}
    >
      {/* ── Left colour strip ── */}
      <div
        className="w-2 shrink-0"
        style={{ backgroundColor: court.color_hex }}
        aria-hidden="true"
      />

      {/* ── Main ticket body ── */}
      <div className="flex flex-1 min-w-0">
        {/* Left info section */}
        <div className="flex-1 min-w-0 px-5 py-4 space-y-3">
          {/* Court name + status badge */}
          <div className="flex items-start justify-between gap-3">
            <h3
              className={cn(
                'font-display font-bold text-xl leading-none tracking-tight truncate',
                isCancelled ? 'line-through text-slate-500' : 'text-white',
              )}
            >
              {court.name}
            </h3>
            <StatusBadge status={booking.status} />
          </div>

          {/* Surface type */}
          <div
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest"
            style={{
              backgroundColor: `${court.color_hex}18`,
              color: court.color_hex,
              border: `1px solid ${court.color_hex}30`,
            }}
          >
            <Zap size={9} />
            {SURFACE_LABELS[court.surface_type] ?? court.surface_type.toUpperCase()}
            {court.is_indoor ? ' · INDOOR' : ' · OUTDOOR'}
          </div>

          {/* Date & time */}
          <div className="space-y-1">
            <p className="text-slate-100 font-semibold text-sm">
              {format(dateObj, 'EEEE, MMMM d, yyyy')}
            </p>
            <div className="flex items-center gap-1.5 text-slate-400 text-sm">
              <Clock size={13} />
              <span>
                {formatHour(booking.start_hour)} — {formatHour(booking.end_hour)}
              </span>
              <span className="text-slate-600">·</span>
              <span>{booking.end_hour - booking.start_hour}h</span>
            </div>
          </div>

          {/* Price */}
          <p className="text-neon-green font-display font-bold text-lg">
            {formatCurrency(booking.total_price)}
          </p>

          {/* Notes */}
          {booking.notes && (
            <p className="text-slate-500 text-xs italic truncate">Note: {booking.notes}</p>
          )}

          {/* Cancel button */}
          <AnimatePresence mode="wait">
            {canCancel && cancelState === 'idle' && (
              <motion.button
                key="cancel"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                onClick={handleCancel}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-neon-pink transition-colors duration-200 mt-1"
              >
                <X size={12} />
                Cancel booking
              </motion.button>
            )}

            {canCancel && cancelState === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-2 mt-1"
              >
                <span className="text-xs text-neon-pink font-medium">Confirm cancel?</span>
                <button
                  onClick={handleCancel}
                  className="text-xs px-2 py-0.5 rounded-md bg-neon-pink/10 border border-neon-pink/30 text-neon-pink hover:bg-neon-pink/20 transition-colors"
                >
                  Yes
                </button>
                <button
                  onClick={handleCancelAbort}
                  className="text-xs px-2 py-0.5 rounded-md bg-court-surface border border-court-border text-slate-400 hover:text-white transition-colors"
                >
                  No
                </button>
              </motion.div>
            )}

            {cancelState === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 mt-1"
              >
                <div className="w-3 h-3 rounded-full border-2 border-neon-pink/40 border-t-neon-pink animate-spin" />
                <span className="text-xs text-slate-500">Cancelling…</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Perforated divider ── */}
        <div
          className="w-px shrink-0 self-stretch border-l-2 border-dashed border-court-border my-3"
          aria-hidden="true"
        />

        {/* ── Stub (right side) ── */}
        <div className="w-28 shrink-0 flex flex-col items-center justify-center gap-3 px-3 py-4">
          <QRPlaceholder id={booking.id} />
          <div className="text-center">
            <p className="text-[9px] text-slate-600 uppercase tracking-widest">Booking ID</p>
            <p className="font-display font-bold text-xs text-slate-300 tracking-widest mt-0.5">
              #{shortId}
            </p>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  if (status === 'confirmed') {
    return (
      <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest text-neon-green bg-neon-green/10 border border-neon-green/30"
        style={{ boxShadow: '0 0 8px rgba(57,255,20,0.25)' }}
      >
        <CheckCircle2 size={9} />
        CONFIRMED
      </span>
    )
  }
  if (status === 'cancelled') {
    return (
      <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest text-neon-pink bg-neon-pink/10 border border-neon-pink/30">
        <X size={9} />
        CANCELLED
      </span>
    )
  }
  return (
    <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest text-neon-yellow bg-neon-yellow/10 border border-neon-yellow/30">
      <AlertCircle size={9} />
      MAINTENANCE
    </span>
  )
}
