'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wrench, DollarSign } from 'lucide-react'
import { cn, formatHour } from '@/lib/utils'
import type { Court, Booking } from '@/types'

interface BookingTimelineProps {
  court: Court
  bookings: Booking[]
  selectedDate: string
  selectedStartHour: number | null
  selectedEndHour: number | null
  onSlotClick: (hour: number) => void
}

const FIRST_HOUR = 6
const LAST_HOUR = 22 // exclusive — slots are 6..21
const HOURS = Array.from({ length: LAST_HOUR - FIRST_HOUR }, (_, i) => FIRST_HOUR + i)

type SlotState = 'available' | 'booked' | 'maintenance' | 'selected' | 'range'

function getSlotState(
  hour: number,
  bookings: Booking[],
  courtId: string,
  date: string,
  selectedStart: number | null,
  selectedEnd: number | null,
): { state: SlotState; booking?: Booking } {
  const match = bookings.find(
    (b) =>
      b.court_id === courtId &&
      b.booking_date === date &&
      hour >= b.start_hour &&
      hour < b.end_hour,
  )
  if (match) {
    return {
      state: match.status === 'maintenance' ? 'maintenance' : 'booked',
      booking: match,
    }
  }
  if (selectedStart !== null && selectedEnd !== null) {
    const lo = Math.min(selectedStart, selectedEnd)
    const hi = Math.max(selectedStart, selectedEnd)
    if (hour === lo) return { state: 'selected' }
    if (hour > lo && hour < hi) return { state: 'range' }
    if (hour === hi - 1 && hi > lo) return { state: 'range' }
  }
  if (selectedStart !== null && selectedEnd === null && hour === selectedStart) {
    return { state: 'selected' }
  }
  return { state: 'available' }
}

function getCurrentHour(): number {
  return new Date().getHours()
}

function isToday(dateStr: string): boolean {
  const today = new Date()
  const d = new Date(dateStr)
  return (
    today.getFullYear() === d.getFullYear() &&
    today.getMonth() === d.getMonth() &&
    today.getDate() === d.getDate()
  )
}

export default function BookingTimeline({
  court,
  bookings,
  selectedDate,
  selectedStartHour,
  selectedEndHour,
  onSlotClick,
}: BookingTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const dragStartHour = useRef<number | null>(null)
  const [dragEnd, setDragEnd] = useState<number | null>(null)

  const todaySelected = isToday(selectedDate)
  const nowHour = getCurrentHour()

  // Scroll to current time on mount
  useEffect(() => {
    if (todaySelected && scrollRef.current) {
      const pct = Math.max(0, (nowHour - FIRST_HOUR) / (LAST_HOUR - FIRST_HOUR))
      const el = scrollRef.current
      el.scrollLeft = pct * (el.scrollWidth - el.clientWidth)
    }
  }, [todaySelected, nowHour])

  const handlePointerDown = useCallback(
    (hour: number, e: React.PointerEvent) => {
      e.preventDefault()
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      isDragging.current = true
      dragStartHour.current = hour
      setDragEnd(null)
      onSlotClick(hour)
    },
    [onSlotClick],
  )

  const handlePointerEnter = useCallback((hour: number) => {
    if (isDragging.current && dragStartHour.current !== null) {
      setDragEnd(hour)
    }
  }, [])

  const handlePointerUp = useCallback(
    (hour: number) => {
      if (isDragging.current && dragStartHour.current !== null && hour !== dragStartHour.current) {
        // Fire a range — call onSlotClick with the end
        onSlotClick(hour + 1)
      }
      isDragging.current = false
      dragStartHour.current = null
      setDragEnd(null)
    },
    [onSlotClick],
  )

  // Effective display range for drag preview
  const dragLo =
    dragStartHour.current !== null && dragEnd !== null
      ? Math.min(dragStartHour.current, dragEnd)
      : null
  const dragHi =
    dragStartHour.current !== null && dragEnd !== null
      ? Math.max(dragStartHour.current, dragEnd)
      : null

  return (
    <div className="w-full space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{
              backgroundColor: court.color_hex,
              boxShadow: `0 0 6px ${court.color_hex}`,
            }}
          />
          <span className="text-sm font-semibold text-white tracking-wide">
            {court.name}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/40">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-neon-green/30 border border-neon-green/50" />
            Available
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-red-500/30 border border-red-500/50" />
            Booked
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-amber-500/30 border border-amber-500/50" />
            Maintenance
          </span>
        </div>
      </div>

      {/* Scrollable timeline */}
      <div
        ref={scrollRef}
        className="overflow-x-auto pb-2 select-none"
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#39ff1430 transparent' }}
      >
        <div className="relative min-w-max flex flex-col">
          {/* Hour labels */}
          <div className="flex gap-1 mb-1.5 px-0.5">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="w-16 flex-shrink-0 text-center text-[10px] font-medium text-white/30"
              >
                {formatHour(hour)}
              </div>
            ))}
          </div>

          {/* Slots row */}
          <div className="relative flex gap-1">
            {/* Current time indicator */}
            {todaySelected && nowHour >= FIRST_HOUR && nowHour < LAST_HOUR && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-neon-cyan z-20 pointer-events-none"
                style={{
                  left: `${((nowHour - FIRST_HOUR) / (LAST_HOUR - FIRST_HOUR)) * 100}%`,
                  boxShadow: '0 0 6px #00f5ff',
                }}
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-neon-cyan" />
              </div>
            )}

            {HOURS.map((hour, i) => {
              const { state, booking } = getSlotState(
                hour,
                bookings,
                court.id,
                selectedDate,
                selectedStartHour,
                selectedEndHour,
              )

              const inDragRange =
                dragLo !== null &&
                dragHi !== null &&
                hour >= dragLo &&
                hour <= dragHi

              const isPast = todaySelected && hour < nowHour

              const initials = booking?.profile
                ? booking.profile.full_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : '??'

              return (
                <motion.div
                  key={hour}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: isPast ? 0.35 : 1, y: 0 }}
                  transition={{
                    delay: i * 0.018,
                    duration: 0.25,
                    ease: 'easeOut',
                  }}
                  whileTap={
                    state === 'available' && !isPast
                      ? { scale: 1.05, transition: { type: 'spring', stiffness: 400, damping: 15 } }
                      : {}
                  }
                  className={cn(
                    'relative w-16 h-20 flex-shrink-0 rounded-xl border transition-all duration-150 flex flex-col items-center justify-center gap-1 overflow-hidden',
                    state === 'available' && !isPast && !inDragRange
                      ? 'bg-neon-green/5 border-neon-green/20 hover:bg-neon-green/15 hover:border-neon-green/50 cursor-pointer'
                      : '',
                    state === 'selected'
                      ? 'bg-neon-green/20 border-neon-green cursor-pointer'
                      : '',
                    state === 'range'
                      ? 'bg-neon-green/10 border-neon-green/40 cursor-pointer'
                      : '',
                    state === 'booked'
                      ? 'bg-red-950/40 border-red-500/25 cursor-not-allowed'
                      : '',
                    state === 'maintenance'
                      ? 'bg-amber-950/40 border-amber-500/30 cursor-not-allowed'
                      : '',
                    isPast && state === 'available'
                      ? 'bg-white/3 border-white/8 cursor-not-allowed'
                      : '',
                    inDragRange && state === 'available'
                      ? 'bg-neon-green/15 border-neon-green/50'
                      : '',
                  )}
                  onPointerDown={
                    state === 'available' && !isPast
                      ? (e) => handlePointerDown(hour, e)
                      : undefined
                  }
                  onPointerEnter={() => handlePointerEnter(hour)}
                  onPointerUp={() => handlePointerUp(hour)}
                >
                  {/* Neon glow for selected */}
                  {(state === 'selected' || state === 'range') && (
                    <div
                      className="absolute inset-0 rounded-xl opacity-20"
                      style={{
                        boxShadow: `inset 0 0 20px #39ff14`,
                      }}
                    />
                  )}

                  {state === 'maintenance' && (
                    <Wrench size={16} className="text-amber-400" />
                  )}

                  {state === 'booked' && (
                    <>
                      <div className="w-7 h-7 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-[9px] font-bold text-red-300">
                        {initials}
                      </div>
                      <div className="text-[9px] text-red-400/70 font-medium">Booked</div>
                    </>
                  )}

                  {state === 'maintenance' && (
                    <div className="text-[9px] text-amber-400/70 font-medium">Maint.</div>
                  )}

                  {(state === 'available' || state === 'selected' || state === 'range') &&
                    !isPast && (
                      <>
                        <div
                          className={cn(
                            'flex items-center gap-0.5 text-[10px] font-bold',
                            state === 'selected' || state === 'range'
                              ? 'text-neon-green'
                              : 'text-white/30',
                          )}
                        >
                          <DollarSign size={8} />
                          {court.hourly_rate}
                        </div>
                        {(state === 'selected' || state === 'range') && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-[8px] text-neon-green/70 font-semibold"
                          >
                            {state === 'selected' ? 'START' : '●'}
                          </motion.div>
                        )}
                      </>
                    )}

                  {isPast && state === 'available' && (
                    <div className="text-[9px] text-white/20 font-medium">Past</div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Selection range neon band */}
          <AnimatePresence>
            {selectedStartHour !== null && selectedEndHour !== null && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0 }}
                className="mt-2 h-1 rounded-full"
                style={{
                  marginLeft: `${(Math.min(selectedStartHour, selectedEndHour) - FIRST_HOUR) * 68}px`,
                  width: `${Math.abs(selectedEndHour - selectedStartHour) * 68 - 4}px`,
                  background: `linear-gradient(90deg, ${court.color_hex}, #39ff14)`,
                  boxShadow: `0 0 8px #39ff1480`,
                  transformOrigin: 'left',
                }}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
