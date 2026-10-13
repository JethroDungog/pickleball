'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, formatCurrency } from '@/lib/utils'
import type { Court, Booking } from '@/types'

interface CourtMapPickerProps {
  selectedCourtId: string | null
  onSelectCourt: (courtId: string) => void
  courts: Court[]
  bookings: Booking[]
  selectedDate: string
  mode?: 'picker' | 'preview'
}

const HOURS_IN_DAY = 24 // 24/7 facility
const COURT_POSITIONS: Record<number, { col: number; row: number }> = {
  0: { col: 0, row: 0 },
  1: { col: 1, row: 0 },
  2: { col: 0, row: 1 },
  3: { col: 1, row: 1 },
}

// SVG layout constants (in SVG units)
const VIEWBOX_W = 800
const VIEWBOX_H = 540
const COURT_W = 310
const COURT_H = 190
const GAP_X = 40
const GAP_Y = 44
const OFFSET_X = 70
const OFFSET_Y = 56

// Pickleball court line proportions (44ft x 20ft → ratio 2.2:1)
// Kitchen line: 7ft from net → 7/22 = ~31.8% from center each side
function CourtShape({
  x,
  y,
  w,
  h,
  color,
  label,
  isSelected,
  isHovered,
  availability,
  mode,
  onClick,
  onMouseEnter,
  onMouseLeave,
  courtIndex,
}: {
  x: number
  y: number
  w: number
  h: number
  color: string
  label: string
  isSelected: boolean
  isHovered: boolean
  availability: { free: number; total: number }
  mode: 'picker' | 'preview'
  onClick: () => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  courtIndex: number
}) {
  const cx = x + w / 2
  const cy = y + h / 2
  const netX = cx
  // Kitchen lines: 31.8% from center toward each baseline
  const kitchenOffset = w * 0.318
  const leftKitchenX = cx - kitchenOffset
  const rightKitchenX = cx + kitchenOffset

  const availPct = availability.total > 0 ? availability.free / availability.total : 0
  const glowColor =
    availPct === 0
      ? '#ef4444'
      : availPct < 0.5
      ? '#f59e0b'
      : '#22c55e'

  const scale = isSelected ? 1.03 : isHovered ? 1.015 : 1
  const transformOrigin = `${x + w / 2}px ${y + h / 2}px`

  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.82 }}
      animate={{ opacity: 1, scale }}
      transition={{
        opacity: { delay: courtIndex * 0.12, duration: 0.4 },
        scale: { type: 'spring', stiffness: 260, damping: 20 },
      }}
      style={{ transformOrigin, cursor: mode === 'picker' ? 'pointer' : 'default' }}
      onClick={mode === 'picker' ? onClick : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Glow behind court when selected or available */}
      {(isSelected || isHovered) && (
        <motion.rect
          x={x - 6}
          y={y - 6}
          width={w + 12}
          height={h + 12}
          rx={8}
          fill="none"
          stroke={isSelected ? color : glowColor}
          strokeWidth={isSelected ? 2.5 : 1.5}
          opacity={isSelected ? 0.9 : 0.5}
          style={{
            filter: `drop-shadow(0 0 ${isSelected ? 12 : 8}px ${isSelected ? color : glowColor})`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* Court surface */}
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={4}
        fill="#0f1a0f"
        stroke={color}
        strokeWidth={isSelected ? 2 : 1}
        opacity={isSelected ? 1 : 0.85}
      />

      {/* Court surface texture lines */}
      {Array.from({ length: 6 }).map((_, i) => (
        <line
          key={`htex-${i}`}
          x1={x}
          y1={y + (h / 6) * (i + 1)}
          x2={x + w}
          y2={y + (h / 6) * (i + 1)}
          stroke={color}
          strokeWidth={0.3}
          opacity={0.08}
        />
      ))}

      {/* Sidelines (top & bottom) */}
      <line x1={x} y1={y} x2={x + w} y2={y} stroke={color} strokeWidth={1.5} opacity={0.9} />
      <line x1={x} y1={y + h} x2={x + w} y2={y + h} stroke={color} strokeWidth={1.5} opacity={0.9} />
      {/* Baselines (left & right) */}
      <line x1={x} y1={y} x2={x} y2={y + h} stroke={color} strokeWidth={1.5} opacity={0.9} />
      <line x1={x + w} y1={y} x2={x + w} y2={y + h} stroke={color} strokeWidth={1.5} opacity={0.9} />

      {/* Net line (center, bold) */}
      <line x1={netX} y1={y} x2={netX} y2={y + h} stroke={color} strokeWidth={3} opacity={0.95} />
      {/* Net post dots */}
      <circle cx={netX} cy={y} r={4} fill={color} opacity={0.9} />
      <circle cx={netX} cy={y + h} r={4} fill={color} opacity={0.9} />

      {/* Left kitchen line */}
      <line x1={leftKitchenX} y1={y} x2={leftKitchenX} y2={y + h} stroke={color} strokeWidth={1} opacity={0.7} />
      {/* Right kitchen line */}
      <line x1={rightKitchenX} y1={y} x2={rightKitchenX} y2={y + h} stroke={color} strokeWidth={1} opacity={0.7} />

      {/* Center service lines (only in NVZ) */}
      <line x1={leftKitchenX} y1={cy} x2={x} y2={cy} stroke={color} strokeWidth={0.8} opacity={0.6} />
      <line x1={x + w} y1={cy} x2={rightKitchenX} y2={cy} stroke={color} strokeWidth={0.8} opacity={0.6} />

      {/* Availability status pill badge (top-right of court) */}
      <g transform={`translate(${x + w - 74}, ${y + 8})`}>
        <rect
          x="0"
          y="0"
          width="66"
          height="18"
          rx="9"
          fill="#0a0a0ae6"
          stroke={glowColor}
          strokeWidth="1"
        />
        <circle cx="10" cy="9" r="3.5" fill={glowColor} />
        <text
          x="36"
          y="12.5"
          textAnchor="middle"
          fill={glowColor}
          fontSize="9"
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
        >
          {availability.free}/{availability.total}h
        </text>
      </g>

      {/* Court label */}
      <text
        x={cx}
        y={y - 12}
        textAnchor="middle"
        fill={color}
        fontSize={12}
        fontWeight={800}
        letterSpacing={3}
        fontFamily="system-ui, sans-serif"
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      >
        {label}
      </text>

      {/* Selected check mark */}
      {isSelected && (
        <g>
          <circle cx={x + 16} cy={y + 14} r={8} fill={color} opacity={0.9} />
          <text x={x + 16} y={y + 18} textAnchor="middle" fill="#000" fontSize={9} fontWeight={900}>
            ✓
          </text>
        </g>
      )}

      {/* Explicit click & touch hit area covering entire court box */}
      {mode === 'picker' && (
        <rect
          x={x}
          y={y}
          width={w}
          height={h}
          fill="transparent"
          style={{ cursor: 'pointer', pointerEvents: 'all' }}
          onClick={(e) => {
            e.stopPropagation()
            onClick()
          }}
          onTouchEnd={(e) => {
            e.stopPropagation()
            onClick()
          }}
        />
      )}
    </motion.g>
  )
}

// Bench indicator SVG shape
function Bench({ x, y, angle = 0 }: { x: number; y: number; angle?: number }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${angle})`} opacity={0.3}>
      <rect x={-12} y={-4} width={24} height={8} rx={2} fill="#2a2a2a" stroke="#444" strokeWidth={0.5} />
      <rect x={-10} y={-6} width={20} height={3} rx={1} fill="#333" />
    </g>
  )
}

export default function CourtMapPicker({
  selectedCourtId,
  onSelectCourt,
  courts,
  bookings,
  selectedDate,
  mode = 'picker',
}: CourtMapPickerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [tooltipCourt, setTooltipCourt] = useState<Court | null>(null)

  // Compute available hours per court for the selected date
  const courtAvailability = useMemo(() => {
    const result: Record<string, { free: number; total: number }> = {}
    for (const court of courts) {
      const courtBookings = bookings.filter(
        (b) =>
          b.court_id === court.id &&
          b.booking_date === selectedDate &&
          b.status === 'confirmed',
      )
      const bookedHours = courtBookings.reduce(
        (acc, b) => acc + (b.end_hour - b.start_hour),
        0,
      )
      const free = Math.max(0, HOURS_IN_DAY - bookedHours)
      result[court.id] = { free, total: HOURS_IN_DAY }
    }
    return result
  }, [courts, bookings, selectedDate])

  const courtsToRender = courts.slice(0, 4)

  const getCourtXY = (index: number): { x: number; y: number } => {
    const pos = COURT_POSITIONS[index] ?? { col: 0, row: 0 }
    return {
      x: OFFSET_X + pos.col * (COURT_W + GAP_X),
      y: OFFSET_Y + pos.row * (COURT_H + GAP_Y),
    }
  }

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-[var(--apple-border)] bg-[#18181b] text-white shadow-sm">
      {/* Top Header Bar: Clean Apple Obsidian bar with ZERO court overlap */}
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/10 bg-black/30">
        <span className="text-[11px] font-bold tracking-wider text-white/80 uppercase">
          {mode === 'preview' ? 'Facility Overview' : '2D Court Layout'}
        </span>
        <div className="flex items-center gap-3">
          {[
            { color: '#30d158', label: 'Available' },
            { color: '#ffd60a', label: 'Partial' },
            { color: '#ff453a', label: 'Full' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] text-white/60 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG map */}
      <svg
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        className="w-full"
        style={{ maxHeight: '480px' }}
        aria-label="Pickleball facility map"
      >
        {/* Facility outline */}
        <rect
          x={8}
          y={8}
          width={VIEWBOX_W - 16}
          height={VIEWBOX_H - 16}
          rx={16}
          fill="none"
          stroke="#39ff1415"
          strokeWidth={1}
        />

        {/* Center separator line */}
        <line
          x1={VIEWBOX_W / 2}
          y1={OFFSET_Y - 20}
          x2={VIEWBOX_W / 2}
          y2={VIEWBOX_H - 35}
          stroke="#ffffff12"
          strokeWidth={1}
          strokeDasharray="6,6"
        />

        {/* Bench indicators */}
        <Bench x={38} y={OFFSET_Y + COURT_H / 2} angle={90} />
        <Bench x={38} y={OFFSET_Y + COURT_H + GAP_Y + COURT_H / 2} angle={90} />
        <Bench x={VIEWBOX_W - 38} y={OFFSET_Y + COURT_H / 2} angle={90} />
        <Bench x={VIEWBOX_W - 38} y={OFFSET_Y + COURT_H + GAP_Y + COURT_H / 2} angle={90} />

        {/* Courts */}
        {courtsToRender.map((court, index) => {
          const { x, y } = getCourtXY(index)
          const avail = courtAvailability[court.id] ?? { free: HOURS_IN_DAY, total: HOURS_IN_DAY }
          return (
            <CourtShape
              key={court.id}
              x={x}
              y={y}
              w={COURT_W}
              h={COURT_H}
              color={court.color_hex}
              label={court.name.toUpperCase()}
              isSelected={selectedCourtId === court.id}
              isHovered={hoveredId === court.id}
              availability={avail}
              mode={mode}
              courtIndex={index}
              onClick={() => onSelectCourt(court.id)}
              onMouseEnter={() => {
                setHoveredId(court.id)
                setTooltipCourt(court)
              }}
              onMouseLeave={() => {
                setHoveredId(null)
                setTooltipCourt(null)
              }}
            />
          )
        })}

        {/* Facility labels */}
        <text
          x={VIEWBOX_W / 2}
          y={VIEWBOX_H - 14}
          textAnchor="middle"
          fill="#ffffff20"
          fontSize={9}
          letterSpacing={4}
          fontFamily="system-ui"
          fontWeight={600}
        >
          PICKCOURT FACILITY · PREMIUM COURTS
        </text>
      </svg>

      {/* Tooltip overlay */}
      <AnimatePresence>
        {tooltipCourt && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none hidden sm:block"
          >
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-black/90 border border-white/15 backdrop-blur-xl shadow-xl">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: tooltipCourt.color_hex,
                  boxShadow: `0 0 8px ${tooltipCourt.color_hex}`,
                }}
              />
              <div>
                <p className="text-xs font-bold text-white tracking-wide">
                  {tooltipCourt.name}
                </p>
                <p className="text-[10px] text-white/50">
                  {tooltipCourt.surface_type} ·{' '}
                  {tooltipCourt.is_indoor ? 'Indoor' : 'Outdoor'} ·{' '}
                  {formatCurrency(tooltipCourt.hourly_rate)}/hr
                </p>
              </div>
              <div className="text-right">
                <p
                  className="text-xs font-bold"
                  style={{ color: courtAvailability[tooltipCourt.id]?.free === 0 ? '#ef4444' : '#30d158' }}
                >
                  {courtAvailability[tooltipCourt.id]?.free ?? HOURS_IN_DAY} hrs free
                </p>
              </div>
              {mode === 'picker' && (
                <div className="text-[9px] text-white/60 font-medium border border-white/20 rounded px-1.5 py-0.5">
                  click to select
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
