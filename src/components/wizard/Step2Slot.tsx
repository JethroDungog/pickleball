'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import {
  ChevronLeft,
  ArrowRight,
  Clock,
  MapPin,
  Check,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react'
import { cn, formatHour, formatCurrency, getSlotStatus } from '@/lib/utils'
import type { Court, Booking } from '@/types'

interface Step2SlotProps {
  courts: Court[]
  bookings: Booking[]
  selectedDate: string
  selectedCourtId: string
  selectedStartHour: number | null
  selectedEndHour: number | null
  onSelectSlot: (courtId: string, startHour: number, endHour: number) => void
  onBack: () => void
  onContinue: () => void
}

type PeriodFilter = 'all' | 'morning' | 'afternoon' | 'evening' | 'overnight'

export default function Step2Slot({
  courts,
  bookings,
  selectedDate,
  selectedCourtId,
  selectedStartHour,
  selectedEndHour,
  onSelectSlot,
  onBack,
  onContinue,
}: Step2SlotProps) {
  const [duration, setDuration] = useState<number>(() => {
    if (selectedStartHour !== null && selectedEndHour !== null) {
      return Math.max(1, selectedEndHour - selectedStartHour)
    }
    return 1
  })
  const [period, setPeriod] = useState<PeriodFilter>('all')

  const selectedCourt = useMemo(
    () => courts.find((c) => c.id === selectedCourtId) || courts[0],
    [courts, selectedCourtId]
  )

  // Filter 24 hours based on period
  const hours = useMemo(() => {
    const all = Array.from({ length: 24 }, (_, i) => i)
    switch (period) {
      case 'morning':
        return all.filter((h) => h >= 6 && h < 12)
      case 'afternoon':
        return all.filter((h) => h >= 12 && h < 17)
      case 'evening':
        return all.filter((h) => h >= 17 && h < 22)
      case 'overnight':
        return all.filter((h) => h >= 22 || h < 6)
      default:
        return all
    }
  }, [period])

  const isSelectionActive =
    selectedCourtId && selectedStartHour !== null && selectedEndHour !== null

  const handleSlotPick = (court: Court, startHour: number) => {
    const targetEnd = Math.min(24, startHour + duration)
    // Verify target range is available
    for (let h = startHour; h < targetEnd; h++) {
      const status = getSlotStatus(bookings, court.id, selectedDate, h)
      if (status !== 'available') return
    }
    onSelectSlot(court.id, startHour, targetEnd)
  }

  return (
    <div className="space-y-7 max-w-4xl mx-auto py-2">
      {/* Title */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
          <Clock size={12} />
          <span>Step 2 · Court & Time Interval</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--apple-text)]">
          Choose Court & Available Slot
        </h2>
        <p className="text-xs sm:text-sm text-[var(--apple-subtext)]">
          {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')} · Live availability across all 4 courts
        </p>
      </div>

      {/* Top Preview Card (Selected Slot Summary) */}
      <div className="rounded-3xl p-5 sm:p-6 bg-[var(--apple-card)] border border-[var(--apple-border)] shadow-sm">
        {isSelectionActive && selectedCourt ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${selectedCourt.color_hex}15`,
                  border: `1px solid ${selectedCourt.color_hex}30`,
                }}
              >
                <MapPin size={18} style={{ color: selectedCourt.color_hex }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base text-[var(--apple-text)]">
                    {selectedCourt.name}
                  </h3>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-[var(--apple-subtext)]">
                    {selectedCourt.is_indoor ? 'Indoor' : 'Outdoor'}
                  </span>
                </div>
                <p className="text-xs text-[var(--apple-subtext)] mt-0.5">
                  {formatHour(selectedStartHour!)} – {formatHour(selectedEndHour!)} · {selectedEndHour! - selectedStartHour!}h duration
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-[var(--apple-border)]">
              <div className="text-right">
                <span className="text-[10px] text-[var(--apple-subtext)] uppercase font-semibold">Total</span>
                <p className="text-xl font-bold text-[var(--apple-text)] tabular-nums">
                  {formatCurrency(selectedCourt.hourly_rate * (selectedEndHour! - selectedStartHour!))}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <Check size={12} strokeWidth={3} />
                <span>Selected</span>
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-3 text-xs sm:text-sm text-[var(--apple-subtext)]">
            Tap any open green slot below to select your court and time interval.
          </div>
        )}
      </div>

      {/* Filter Bar: Duration & Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Duration Pills (1h, 2h, 3h, 4h) */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-[var(--apple-subtext)] font-semibold mr-1">Duration:</span>
          {[1, 2, 3, 4].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setDuration(d)
                if (selectedStartHour !== null) {
                  onSelectSlot(selectedCourtId, selectedStartHour, Math.min(24, selectedStartHour + d))
                }
              }}
              className={cn(
                'px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                duration === d
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-xs'
                  : 'bg-[var(--apple-card)] text-[var(--apple-subtext)] hover:text-[var(--apple-text)] border border-[var(--apple-border)]'
              )}
            >
              {d}h
            </button>
          ))}
        </div>

        {/* Period Chips (All, Morning, Afternoon, Evening, Overnight) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All 24h', icon: Sparkles },
            { id: 'morning', label: 'Morning (6AM–12PM)', icon: Sun },
            { id: 'afternoon', label: 'Afternoon (12PM–5PM)', icon: Sun },
            { id: 'evening', label: 'Evening (5PM–10PM)', icon: Moon },
            { id: 'overnight', label: 'Overnight (10PM–6AM)', icon: Moon },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setPeriod(id as PeriodFilter)}
              className={cn(
                'shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer border',
                period === id
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black border-black dark:border-white font-semibold'
                  : 'bg-[var(--apple-card)] text-[var(--apple-subtext)] border-[var(--apple-border)] hover:bg-[var(--apple-card-hover)]'
              )}
            >
              <Icon size={11} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Courts & Slots Grouped Listing */}
      <div className="space-y-7">
        {courts.map((court) => {
          return (
            <div
              key={court.id}
              className="rounded-3xl p-5 sm:p-6 bg-[var(--apple-card)] border border-[var(--apple-border)] shadow-xs space-y-4"
            >
              {/* Court Header */}
              <div className="flex items-center justify-between border-b border-[var(--apple-border)] pb-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: court.color_hex }}
                  />
                  <div>
                    <h3 className="font-semibold text-base text-[var(--apple-text)]">
                      {court.name}
                    </h3>
                    <p className="text-[11px] text-[var(--apple-subtext)]">
                      {court.description}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-[var(--apple-text)] block">
                    {formatCurrency(court.hourly_rate)} / hr
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-[var(--apple-muted)] tracking-wider">
                    {court.is_indoor ? 'Indoor Pro' : 'Outdoor'}
                  </span>
                </div>
              </div>

              {/* Slot Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-2.5">
                {hours.map((hour) => {
                  const status = getSlotStatus(bookings, court.id, selectedDate, hour)
                  const isBooked = status === 'booked' || status === 'maintenance'
                  const isSelected =
                    selectedCourtId === court.id &&
                    selectedStartHour !== null &&
                    selectedEndHour !== null &&
                    hour >= selectedStartHour &&
                    hour < selectedEndHour

                  const label = `${formatHour(hour)} – ${formatHour(hour + 1)}`

                  return (
                    <button
                      key={hour}
                      type="button"
                      disabled={isBooked}
                      onClick={() => handleSlotPick(court, hour)}
                      className={cn(
                        'relative flex flex-col justify-between p-3 rounded-2xl border text-left transition-all min-h-[72px] outline-none',
                        isSelected
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-black border-black dark:border-white shadow-md font-semibold ring-2 ring-[#30d158] ring-offset-1'
                          : !isBooked
                          ? 'bg-[var(--apple-card)] hover:bg-[var(--apple-card-hover)] text-[var(--apple-text)] border-[var(--apple-border)] shadow-xs hover:border-black/20 dark:hover:border-white/20 cursor-pointer'
                          : 'bg-black/[0.02] dark:bg-white/[0.02] border-transparent opacity-35 cursor-not-allowed line-through'
                      )}
                    >
                      <div className="flex items-start justify-between gap-1 w-full">
                        <span
                          className={cn(
                            'text-xs font-medium tracking-tight',
                            isSelected
                              ? 'text-white dark:text-black'
                              : !isBooked
                              ? 'text-[var(--apple-text)]'
                              : 'text-[var(--apple-muted)]'
                          )}
                        >
                          {label}
                        </span>
                        {isSelected && (
                          <span className="w-3.5 h-3.5 rounded-full bg-[#30d158] text-black flex items-center justify-center shrink-0">
                            <Check size={9} strokeWidth={3} />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-[var(--apple-border)]/60 text-[10px]">
                        <span className={isSelected ? 'text-white/80 dark:text-black/80 font-bold' : 'font-semibold text-[var(--apple-text)]'}>
                          {formatCurrency(court.hourly_rate)}
                        </span>
                        <span
                          className={cn(
                            'font-semibold',
                            isSelected
                              ? 'text-white dark:text-black'
                              : !isBooked
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-[var(--apple-muted)]'
                          )}
                        >
                          {isSelected ? 'Selected' : isBooked ? 'Booked' : 'Available'}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--apple-border)]">
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary !px-6 !py-3 text-xs sm:text-sm flex items-center gap-1.5"
        >
          <ChevronLeft size={16} />
          <span>Back to Date</span>
        </button>

        <button
          type="button"
          disabled={!isSelectionActive}
          onClick={onContinue}
          className="btn-primary !px-8 !py-3 text-xs sm:text-sm flex items-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Continue to Details</span>
          <ArrowRight size={15} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
