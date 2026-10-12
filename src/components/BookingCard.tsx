'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO, differenceInHours } from 'date-fns'
import { X, CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react'
import { cn, formatHour, formatCurrency } from '@/lib/utils'
import type { Booking, Court } from '@/types'

// ── QR Code SVG ──────────────────────────────────────────────────────────────
function QRPlaceholder({ id }: { id: string }) {
  // Deterministic 6×6 bit grid from booking ID
  const bits: boolean[] = Array.from({ length: 36 }, (_, i) => {
    const charCode = id.charCodeAt(i % id.length) ?? 65
    return (charCode + i * 7) % 3 !== 0
  })

  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 72 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Booking QR code"
      className="text-[var(--apple-text)] opacity-85"
    >
      {/* Corner squares */}
      <rect x="4" y="4" width="18" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <rect x="8" y="8" width="10" height="10" rx="1.5" fill="currentColor" />
      <rect x="50" y="4" width="18" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <rect x="54" y="8" width="10" height="10" rx="1.5" fill="currentColor" />
      <rect x="4" y="50" width="18" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <rect x="8" y="54" width="10" height="10" rx="1.5" fill="currentColor" />

      {/* Data modules */}
      {bits.map((filled, i) => {
        const col = i % 6
        const row = Math.floor(i / 6)
        const x = 27 + col * 7
        const y = 27 + row * 7
        return filled ? (
          <rect key={i} x={x} y={y} width="5" height="5" rx="1" fill="currentColor" />
        ) : null
      })}

      {/* Bottom-right module */}
      <rect x="50" y="50" width="18" height="18" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <rect x="54" y="54" width="5" height="5" rx="1" fill="currentColor" />
      <rect x="61" y="54" width="5" height="5" rx="1" fill="currentColor" />
      <rect x="54" y="61" width="5" height="5" rx="1" fill="currentColor" />
      <rect x="61" y="61" width="5" height="5" rx="1" fill="currentColor" />
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

  return (
    <motion.article
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 20, opacity: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className={cn(
        'relative flex overflow-hidden rounded-3xl border transition-all',
        'bg-[var(--apple-card)]',
        isCancelled
          ? 'border-rose-500/20 opacity-60'
          : 'border-[var(--apple-border)] shadow-xs hover:border-black/20 dark:hover:border-white/20',
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
                isCancelled ? 'line-through text-[var(--apple-subtext)]' : 'text-[var(--apple-text)]',
              )}
            >
              {court.name}
            </h3>
            <StatusBadge status={booking.status} />
          </div>

          {/* Surface type */}
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider"
            style={{
              backgroundColor: `${court.color_hex}14`,
              color: court.color_hex,
              border: `1px solid ${court.color_hex}30`,
            }}
          >
            <Zap size={10} />
            {SURFACE_LABELS[court.surface_type] ?? court.surface_type.toUpperCase()}
            {court.is_indoor ? ' · INDOOR' : ' · OUTDOOR'}
          </div>

          {/* Date & time */}
          <div className="space-y-1">
            <p className="text-[var(--apple-text)] font-semibold text-sm">
              {format(dateObj, 'EEEE, MMMM d, yyyy')}
            </p>
            <div className="flex items-center gap-1.5 text-[var(--apple-subtext)] text-xs sm:text-sm">
              <Clock size={13} />
              <span>
                {formatHour(booking.start_hour)} — {formatHour(booking.end_hour)}
              </span>
              <span className="opacity-40">·</span>
              <span>{booking.end_hour - booking.start_hour}h duration</span>
            </div>
          </div>

          {/* Price */}
          <p className="font-display font-bold text-lg text-[var(--apple-text)] tabular-nums">
            {formatCurrency(booking.total_price)}
          </p>

          {/* Notes */}
          {booking.notes && (
            <p className="text-[var(--apple-subtext)] text-xs italic truncate">Note: {booking.notes}</p>
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
                className="flex items-center gap-1.5 text-xs text-rose-500 hover:text-rose-600 transition-colors mt-1 font-medium cursor-pointer"
              >
                <X size={12} />
                Cancel reservation
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
                <span className="text-xs text-rose-500 font-semibold">Confirm cancel?</span>
                <button
                  onClick={handleCancel}
                  className="text-xs px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-semibold hover:bg-rose-500/20 transition-colors cursor-pointer"
                >
                  Yes, cancel
                </button>
                <button
                  onClick={handleCancelAbort}
                  className="text-xs px-2.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.06] border border-[var(--apple-border)] text-[var(--apple-text)] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] transition-colors cursor-pointer"
                >
                  Keep
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
                <div className="w-3 h-3 rounded-full border-2 border-rose-500/40 border-t-rose-500 animate-spin" />
                <span className="text-xs text-[var(--apple-subtext)]">Cancelling…</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Perforated divider ── */}
        <div
          className="w-px shrink-0 self-stretch border-l-2 border-dashed border-[var(--apple-border)] my-3"
          aria-hidden="true"
        />

        {/* ── Stub (right side) ── */}
        <div className="w-28 sm:w-32 shrink-0 flex flex-col items-center justify-center gap-2.5 px-3 py-4 bg-black/[0.01] dark:bg-white/[0.01]">
          <QRPlaceholder id={booking.id} />
          <div className="text-center">
            <p className="text-[9px] text-[var(--apple-subtext)] uppercase font-semibold tracking-wider">Pass ID</p>
            <p className="font-display font-bold text-xs text-[var(--apple-text)] tracking-wider mt-0.5">
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
      <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
        <CheckCircle2 size={10} />
        CONFIRMED
      </span>
    )
  }
  if (status === 'cancelled') {
    return (
      <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20">
        <X size={10} />
        CANCELLED
      </span>
    )
  }
  return (
    <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20">
      <AlertCircle size={10} />
      MAINTENANCE
    </span>
  )
}
