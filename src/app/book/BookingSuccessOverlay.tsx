'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useRouter } from 'next/navigation'
import { X, Calendar, Clock, CreditCard, MapPin, CheckCircle2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { formatHour, formatCurrency } from '@/lib/utils'
import type { Booking, Court } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface BookingSuccessOverlayProps {
  booking: Booking
  court: Court
  onClose: () => void
}

// ── Detail Row Helper ─────────────────────────────────────────────────────────

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.06]">
      <div className="flex items-center gap-2.5 text-white/60 text-xs">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-xs font-semibold text-white text-right">{value}</div>
    </div>
  )
}

// ── Main Overlay ──────────────────────────────────────────────────────────────

export default function BookingSuccessOverlay({
  booking,
  court,
  onClose,
}: BookingSuccessOverlayProps) {
  const router = useRouter()
  const hasShownConfetti = useRef(false)

  // Confetti burst on mount
  useEffect(() => {
    if (hasShownConfetti.current) return
    hasShownConfetti.current = true

    const duration = 2500
    const end = Date.now() + duration
    const appleColors = ['#30d158', '#0a84ff', '#ffffff', '#ffd60a']

    function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: appleColors,
        zIndex: 9999,
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: appleColors,
        zIndex: 9999,
      })
      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }, [])

  // Safe date label parsing to guarantee no RangeError crashes
  let dateLabel = booking.booking_date
  try {
    const parsed = parseISO(booking.booking_date)
    if (!isNaN(parsed.getTime())) {
      dateLabel = format(parsed, 'EEEE, MMMM d, yyyy')
    }
  } catch {
    dateLabel = booking.booking_date
  }

  const timeLabel = `${formatHour(booking.start_hour)} – ${formatHour(booking.end_hour)}`
  const duration = booking.end_hour - booking.start_hour

  return (
    <motion.div
      key="booking-success-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)' }}
    >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors z-10 p-2 rounded-full hover:bg-white/10"
          aria-label="Close"
        >
          <X size={22} />
        </button>

        {/* Ticket Card */}
        <motion.div
          className="relative w-full max-w-md"
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
        >
          <div className="relative overflow-hidden rounded-3xl shadow-2xl bg-[#1c1c1e] border border-white/10 text-white">
            {/* Top court color accent */}
            <div
              className="h-2 w-full"
              style={{ background: court.color_hex }}
            />

            {/* Top section */}
            <div className="px-6 pt-6 pb-5">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-2">
                    <CheckCircle2 size={11} />
                    <span>Booking Confirmed</span>
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">
                    {court.name}
                  </h2>
                  <p className="text-white/60 text-xs mt-0.5">
                    {court.surface_type.charAt(0).toUpperCase() + court.surface_type.slice(1)} surface ·{' '}
                    {court.is_indoor ? 'Indoor Arena' : 'Outdoor Court'}
                  </p>
                </div>
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
                  style={{ background: `${court.color_hex}25`, border: `1px solid ${court.color_hex}50` }}
                >
                  <MapPin size={18} style={{ color: court.color_hex }} />
                </div>
              </div>

              {/* Booking Details */}
              <div className="space-y-1 bg-black/30 rounded-2xl p-4 border border-white/5">
                <DetailRow icon={<Calendar size={14} className="text-white/50" />} label="Date" value={dateLabel} />
                <DetailRow
                  icon={<Clock size={14} className="text-white/50" />}
                  label="Time"
                  value={`${timeLabel} (${duration}h)`}
                />
                <DetailRow
                  icon={<CreditCard size={14} className="text-white/50" />}
                  label="Total Rate"
                  value={
                    <span className="text-white font-bold text-sm">
                      {formatCurrency(booking.total_price)}
                    </span>
                  }
                />
              </div>
            </div>

            {/* Bottom Section */}
            <div className="px-6 pb-6 pt-2 space-y-4">
              <div className="flex items-center justify-between text-xs text-white/40 pt-2 border-t border-white/10">
                <span className="font-mono uppercase tracking-wider text-[11px]">Pass Reference</span>
                <span className="font-mono text-white/80 font-semibold">#{booking.id.slice(0, 8).toUpperCase()}</span>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 py-3 px-4 rounded-full bg-white text-black font-semibold text-xs tracking-wide hover:bg-neutral-200 transition-all text-center shadow-sm"
                >
                  View My Passes
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-5 rounded-full bg-white/10 text-white font-semibold text-xs tracking-wide hover:bg-white/15 transition-all text-center"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
  )
}
