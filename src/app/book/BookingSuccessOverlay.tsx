'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useRouter } from 'next/navigation'
import { X, Calendar, Clock, DollarSign, MapPin } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { formatHour, formatCurrency } from '@/lib/utils'
import type { Booking, Court } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

interface BookingSuccessOverlayProps {
  booking: Booking
  court: Court
  onClose: () => void
}

// ── Animated SVG Checkmark ────────────────────────────────────────────────────

function AnimatedCheckmark() {
  return (
    <svg
      viewBox="0 0 80 80"
      className="w-20 h-20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Circle */}
      <motion.circle
        cx="40"
        cy="40"
        r="36"
        stroke="#39ff14"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      {/* Checkmark */}
      <motion.path
        d="M24 41L35 52L56 30"
        stroke="#39ff14"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5, ease: 'easeOut' }}
      />
    </svg>
  )
}

// ── Serrated Edge SVG ─────────────────────────────────────────────────────────

function SerratedEdge({ flip = false }: { flip?: boolean }) {
  // 20 teeth across 400px width
  const teeth = Array.from({ length: 20 }, (_, i) => i)
  const toothW = 20
  const toothH = 10

  const d = teeth
    .map((i) => {
      const x = i * toothW
      return `L${x + toothW / 2} ${flip ? 0 : toothH} L${x + toothW} ${flip ? toothH : 0}`
    })
    .join(' ')

  const fullPath = `M0 ${flip ? toothH : 0} ${d} L400 ${flip ? toothH : 0} L400 ${flip ? 0 : toothH} L0 ${flip ? 0 : toothH} Z`

  return (
    <svg
      viewBox={`0 0 400 ${toothH}`}
      className="w-full"
      style={{ height: toothH }}
      preserveAspectRatio="none"
    >
      <path d={fullPath} fill="#0d0d0d" />
    </svg>
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

    const duration = 3000
    const end = Date.now() + duration

    const neonColors = ['#39ff14', '#00f5ff', '#ffffff', '#39ff14', '#00f5ff']

    function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: neonColors,
        zIndex: 9999,
      })
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: neonColors,
        zIndex: 9999,
      })
      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }, [])

  const dateLabel = format(parseISO(booking.booking_date), 'EEEE, MMMM d, yyyy')
  const timeLabel = `${formatHour(booking.start_hour)} – ${formatHour(booking.end_hour)}`
  const duration = booking.end_hour - booking.start_hour

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ backgroundColor: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {/* Ticket Card */}
        <motion.div
          className="relative w-full max-w-md"
          initial={{ scale: 0.85, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 40 }}
          transition={{ type: 'spring', damping: 22, stiffness: 280, delay: 0.1 }}
        >
          {/* Ticket container */}
          <div className="relative overflow-hidden rounded-2xl shadow-2xl" style={{ background: '#111' }}>
            {/* Court color accent strip (left border) */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl"
              style={{ background: court.color_hex }}
            />

            {/* Top section */}
            <div className="px-8 pt-10 pb-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-xs font-mono tracking-[0.25em] uppercase text-white/40 mb-1">
                    Court Booking Confirmed
                  </p>
                  <h2
                    className="text-2xl font-bold tracking-tight"
                    style={{ fontFamily: 'Syne, sans-serif', color: court.color_hex }}
                  >
                    {court.name}
                  </h2>
                  <p className="text-white/50 text-sm mt-0.5">
                    {court.surface_type.charAt(0).toUpperCase() + court.surface_type.slice(1)} ·{' '}
                    {court.is_indoor ? 'Indoor' : 'Outdoor'}
                  </p>
                </div>
                <AnimatedCheckmark />
              </div>

              {/* Booking Details Grid */}
              <div className="space-y-3">
                <DetailRow icon={<Calendar size={15} className="text-[#39ff14]" />} label="Date" value={dateLabel} />
                <DetailRow
                  icon={<Clock size={15} className="text-[#00f5ff]" />}
                  label="Time"
                  value={`${timeLabel} (${duration}h)`}
                />
                <DetailRow
                  icon={<MapPin size={15} className="text-white/40" />}
                  label="Court"
                  value={court.name}
                />
                <DetailRow
                  icon={<DollarSign size={15} className="text-[#39ff14]" />}
                  label="Total Paid"
                  value={
                    <span className="text-[#39ff14] font-bold text-lg">
                      {formatCurrency(booking.total_price)}
                    </span>
                  }
                />
              </div>
            </div>

            {/* Serrated tear-off edge */}
            <div className="relative" style={{ background: '#1a1a1a' }}>
              <div className="absolute -top-[10px] left-0 right-0 z-10">
                <SerratedEdge />
              </div>

              {/* Bottom stub */}
              <div className="px-8 pt-8 pb-8">
                {/* Booking ID */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs text-white/30 font-mono tracking-widest uppercase mb-1">
                      Booking ID
                    </p>
                    <p className="font-mono text-sm text-white/60 tracking-wider">
                      #{booking.id.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  {/* Barcode visual */}
                  <div className="flex gap-px items-end h-8 opacity-30">
                    {Array.from({ length: 28 }, (_, i) => (
                      <div
                        key={i}
                        className="bg-white w-px"
                        style={{ height: `${30 + Math.sin(i * 1.3) * 20}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    onClick={() => router.push('/dashboard')}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all"
                    style={{
                      background: '#39ff14',
                      color: '#0d0d0d',
                    }}
                    whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(57,255,20,0.5)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View My Bookings
                  </motion.button>
                  <motion.button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl text-sm font-semibold tracking-wide border border-white/10 text-white/70 hover:border-white/30 hover:text-white transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Book Another
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Glow behind card */}
          <div
            className="absolute inset-0 -z-10 rounded-2xl blur-3xl opacity-20"
            style={{ background: court.color_hex }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ── Sub-component: Detail Row ─────────────────────────────────────────────────

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
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <span className="text-white/40 text-sm w-16 flex-shrink-0">{label}</span>
      <span className="text-white text-sm font-medium">{value}</span>
    </div>
  )
}
