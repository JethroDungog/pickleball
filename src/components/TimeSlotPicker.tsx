'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Clock, Sun, Moon, Sparkles } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import type { Court, Booking } from '@/types'

interface TimeSlotPickerProps {
  court: Court
  bookings: Booking[]
  selectedDate: string
  selectedStartHour: number | null
  selectedEndHour: number | null
  onSelectRange: (startHour: number, endHour: number) => void
  onClear: () => void
}

type PeriodFilter = 'all' | 'morning' | 'afternoon' | 'evening' | 'night'

// 24 Hour Slots Helper
function getSlotLabel(hour: number): { display12: string; display24: string } {
  const nextHour = (hour + 1) % 24
  const format12 = (h: number) => {
    const period = h < 12 || h === 24 ? 'AM' : 'PM'
    const val = h % 12 === 0 ? 12 : h % 12
    return `${val}:00 ${period}`
  }
  const endPeriod = hour + 1 === 24 ? '12:00 AM' : format12(nextHour)
  return {
    display12: `${format12(hour)} – ${endPeriod}`,
    display24: `${String(hour).padStart(2, '0')}:00 – ${String(hour + 1).padStart(2, '0')}:00`,
  }
}

export default function TimeSlotPicker({
  court,
  bookings,
  selectedDate,
  selectedStartHour,
  selectedEndHour,
  onSelectRange,
  onClear,
}: TimeSlotPickerProps) {
  const [period, setPeriod] = useState<PeriodFilter>('all')
  const [desiredDuration, setDesiredDuration] = useState<number>(1)

  // Check current time for today
  const isToday = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    return selectedDate === todayStr
  }, [selectedDate])

  const currentHourNow = new Date().getHours()

  // Generate 24 slots (0..23)
  const allSlots = useMemo(() => {
    return Array.from({ length: 24 }, (_, hour) => {
      // Find booking conflict
      const isBooked = bookings.some(
        (b) =>
          b.court_id === court.id &&
          b.booking_date === selectedDate &&
          b.status !== 'cancelled' &&
          b.status !== 'maintenance' &&
          hour >= b.start_hour &&
          hour < b.end_hour,
      )
      const isMaintenance = bookings.some(
        (b) =>
          b.court_id === court.id &&
          b.booking_date === selectedDate &&
          b.status === 'maintenance' &&
          hour >= b.start_hour &&
          hour < b.end_hour,
      )
      const isPast = isToday && hour <= currentHourNow

      // Check if this hour is inside selected range
      const isSelected =
        selectedStartHour !== null &&
        selectedEndHour !== null &&
        hour >= selectedStartHour &&
        hour < selectedEndHour

      const isStart = selectedStartHour === hour

      const { display12, display24 } = getSlotLabel(hour)

      return {
        hour,
        display12,
        display24,
        isBooked,
        isMaintenance,
        isPast,
        isSelected,
        isStart,
        isAvailable: !isBooked && !isMaintenance && !isPast,
      }
    })
  }, [court.id, bookings, selectedDate, isToday, currentHourNow, selectedStartHour, selectedEndHour])

  // Filter slots based on period
  const filteredSlots = useMemo(() => {
    switch (period) {
      case 'morning':
        return allSlots.filter((s) => s.hour >= 6 && s.hour < 12)
      case 'afternoon':
        return allSlots.filter((s) => s.hour >= 12 && s.hour < 17)
      case 'evening':
        return allSlots.filter((s) => s.hour >= 17 && s.hour < 22)
      case 'night':
        return allSlots.filter((s) => s.hour >= 22 || s.hour < 6)
      default:
        return allSlots
    }
  }, [allSlots, period])

  // Handle slot click
  const handleSlotClick = (clickedHour: number) => {
    const slot = allSlots.find((s) => s.hour === clickedHour)
    if (!slot || !slot.isAvailable) return

    // If currently selected slot is clicked, toggle it off
    if (
      selectedStartHour !== null &&
      selectedEndHour !== null &&
      clickedHour >= selectedStartHour &&
      clickedHour < selectedEndHour
    ) {
      onClear()
      return
    }

    // If a range is already selected and user clicks a later hour within 4 hours, expand the range
    if (selectedStartHour !== null && selectedEndHour !== null) {
      if (clickedHour > selectedStartHour && clickedHour - selectedStartHour < 4) {
        let allValid = true
        for (let h = selectedStartHour; h <= clickedHour; h++) {
          const targetSlot = allSlots.find((s) => s.hour === h)
          if (!targetSlot || !targetSlot.isAvailable) {
            allValid = false
            break
          }
        }
        if (allValid) {
          onSelectRange(selectedStartHour, clickedHour + 1)
          return
        }
      }
    }

    // Default: select starting at clickedHour with desiredDuration
    const targetEnd = Math.min(24, clickedHour + desiredDuration)
    // Verify all slots in target range are available
    let allValid = true
    for (let h = clickedHour; h < targetEnd; h++) {
      const targetSlot = allSlots.find((s) => s.hour === h)
      if (!targetSlot || !targetSlot.isAvailable) {
        allValid = false
        break
      }
    }

    if (allValid) {
      onSelectRange(clickedHour, targetEnd)
    } else {
      // Fallback to single 1-hour slot
      onSelectRange(clickedHour, clickedHour + 1)
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Header controls: Court Title + Duration + Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--apple-border)] pb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: court.color_hex }}
          />
          <span className="font-bold text-[var(--apple-text)] text-base">
            {court.name} — 24-Hour Time Slots
          </span>
          <span className="text-xs text-[var(--apple-subtext)] font-mono hidden sm:inline">
            (24/7 Schedule)
          </span>
        </div>

        {/* Duration selector - Apple segmented control */}
        <div className="flex items-center p-1 rounded-full bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] self-start sm:self-auto">
          <span className="text-xs text-[var(--apple-subtext)] font-medium px-2 hidden md:inline">
            Duration:
          </span>
          {[1, 2, 3, 4].map((hrs) => (
            <button
              key={hrs}
              type="button"
              onClick={() => {
                setDesiredDuration(hrs)
                if (selectedStartHour !== null) {
                  const targetEnd = Math.min(24, selectedStartHour + hrs)
                  let allFree = true
                  for (let h = selectedStartHour; h < targetEnd; h++) {
                    const s = allSlots.find((slot) => slot.hour === h)
                    if (!s || !s.isAvailable) allFree = false
                  }
                  if (allFree) onSelectRange(selectedStartHour, targetEnd)
                }
              }}
              className={cn(
                'px-3 py-1 rounded-full text-xs transition-all cursor-pointer',
                desiredDuration === hrs
                  ? 'bg-white dark:bg-white/10 text-black dark:text-white font-semibold shadow-sm'
                  : 'text-[var(--apple-subtext)] hover:text-[var(--apple-text)]',
              )}
            >
              {hrs}h
            </button>
          ))}
        </div>
      </div>

      {/* Period Filter Tabs (Apple pill chips - horizontal scroll on mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        {[
          { id: 'all', label: 'All 24h', shortLabel: 'All 24h', icon: Sparkles },
          { id: 'morning', label: 'Morning (6AM–12PM)', shortLabel: 'Morning', icon: Sun },
          { id: 'afternoon', label: 'Afternoon (12PM–5PM)', shortLabel: 'Afternoon', icon: Sun },
          { id: 'evening', label: 'Evening (5PM–10PM)', shortLabel: 'Evening', icon: Moon },
          { id: 'night', label: 'Overnight (10PM–6AM)', shortLabel: 'Overnight', icon: Moon },
        ].map(({ id, label, shortLabel, icon: Icon }) => {
          const isActive = period === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => setPeriod(id as PeriodFilter)}
              className={cn(
                'shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer border',
                isActive
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black border-black dark:border-white font-semibold shadow-sm'
                  : 'bg-[var(--apple-card)] text-[var(--apple-subtext)] border-[var(--apple-border)] hover:bg-[var(--apple-card-hover)] shadow-sm',
              )}
            >
              <Icon size={12} className={cn('shrink-0', isActive ? 'text-current' : 'text-[var(--apple-muted)]')} />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{shortLabel}</span>
            </button>
          )
        })}
      </div>

      {/* Slot Grid: Apple minimalist cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-2.5">
        {filteredSlots.map((slot) => {
          const isSelected = slot.isSelected
          const isAvailable = slot.isAvailable

          let statusText = 'Available'
          let statusColor = 'text-[#30d158]'
          if (slot.isPast) {
            statusText = 'Past'
            statusColor = 'text-[var(--apple-muted)] opacity-50'
          } else if (slot.isMaintenance) {
            statusText = 'Maintenance'
            statusColor = 'text-amber-500'
          } else if (slot.isBooked) {
            statusText = 'Booked'
            statusColor = 'text-[var(--apple-muted)]'
          } else if (isSelected) {
            statusText = 'Selected'
            statusColor = 'text-[#30d158]'
          }

          return (
            <motion.button
              key={slot.hour}
              type="button"
              disabled={!isAvailable}
              onClick={() => handleSlotClick(slot.hour)}
              whileHover={isAvailable ? { scale: 1.01 } : {}}
              whileTap={isAvailable ? { scale: 0.98 } : {}}
              className={cn(
                'relative flex flex-col justify-between p-3.5 rounded-2xl border text-left transition-all min-h-[76px]',
                isSelected
                  ? 'bg-neutral-900 text-white dark:bg-[#252528] dark:text-white border-black/40 dark:border-white/40 ring-1 ring-black/10 dark:ring-white/20 shadow-md'
                  : isAvailable
                  ? 'bg-[var(--apple-card)] hover:bg-[var(--apple-card-hover)] text-[var(--apple-text)] border-[var(--apple-border)] shadow-sm cursor-pointer'
                  : 'bg-black/[0.02] dark:bg-white/[0.02] border-transparent opacity-35 cursor-not-allowed',
              )}
            >
              {/* Top row: Time Interval (e.g. 8:00 AM – 9:00 AM) */}
              <div className="flex items-start justify-between gap-1 w-full">
                <span
                  className={cn(
                    'font-medium text-xs sm:text-sm tracking-tight',
                    isSelected ? 'text-white font-semibold' : isAvailable ? 'text-[var(--apple-text)]' : 'text-[var(--apple-muted)]',
                  )}
                >
                  {slot.display12}
                </span>

                {isSelected && (
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#30d158] text-black shrink-0 shadow-sm">
                    <Check size={9} strokeWidth={3} />
                  </span>
                )}
              </div>

              {/* Bottom row: Price in PHP + Status Badge */}
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-[var(--apple-border)]">
                <span
                  className={cn(
                    'font-semibold text-xs',
                    isSelected ? 'text-white' : isAvailable ? 'text-[var(--apple-text)]' : 'text-[var(--apple-muted)]',
                  )}
                >
                  {formatCurrency(court.hourly_rate)}
                </span>

                <span className={cn('text-[10px] font-medium tracking-wide', statusColor)}>
                  {statusText}
                </span>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Helper Legend */}
      <div className="flex items-center justify-between pt-2 text-[11px] text-[var(--apple-subtext)] flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#30d158]" />
            <span>Available</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span>Booked</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Maintenance</span>
          </span>
        </div>
        <span className="text-[var(--apple-muted)]">
          Tap slot to select · Tap later slot to extend
        </span>
      </div>
    </div>
  )
}
