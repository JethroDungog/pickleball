'use client'

import { motion } from 'framer-motion'
import { Check, ShieldCheck, Sun, Umbrella } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import type { Court, Booking } from '@/types'

interface CourtSelectorCardsProps {
  courts: Court[]
  selectedCourtId: string | null
  onSelectCourt: (courtId: string) => void
  bookings: Booking[]
  selectedDate: string
}

export default function CourtSelectorCards({
  courts,
  selectedCourtId,
  onSelectCourt,
  bookings,
  selectedDate,
}: CourtSelectorCardsProps) {
  // Count free slots per court for this date (24 hours)
  const getFreeSlots = (courtId: string) => {
    const courtBookings = bookings.filter(
      (b) => b.court_id === courtId && b.booking_date === selectedDate && b.status !== 'cancelled',
    )
    const bookedHours = courtBookings.reduce((acc, b) => acc + (b.end_hour - b.start_hour), 0)
    return Math.max(0, 24 - bookedHours)
  }

  return (
    <div className="w-full space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-wider uppercase text-white/50">
          Select Court (4 Available)
        </span>
        <span className="text-[11px] text-white/40">
          24/7 Facility · High-Visibility Lines
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {courts.slice(0, 4).map((court) => {
          const isSelected = selectedCourtId === court.id
          const freeHours = getFreeSlots(court.id)
          const isFull = freeHours === 0

          return (
            <motion.button
              key={court.id}
              type="button"
              onClick={() => onSelectCourt(court.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer min-h-[110px] sm:min-h-[120px]',
                isSelected
                  ? 'bg-neutral-900 text-white dark:bg-[#252528] dark:text-white border-black/40 dark:border-white/30 shadow-md ring-1 ring-black/10 dark:ring-white/20'
                  : 'bg-[var(--apple-card)] hover:bg-[var(--apple-card-hover)] text-[var(--apple-text)] border-[var(--apple-border)] shadow-sm',
              )}
            >
              {/* Top Row: Name + Badge */}
              <div className="flex items-start justify-between gap-1.5 w-full">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: court.color_hex }}
                  />
                  <span
                    className={cn(
                      'font-semibold text-sm tracking-tight',
                      isSelected ? 'text-white' : 'text-[var(--apple-text)]',
                    )}
                  >
                    {court.name}
                  </span>
                </div>

                {isSelected && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white text-black shadow-sm">
                    <Check size={11} strokeWidth={3} />
                  </span>
                )}
              </div>

              {/* Surface & Location Specs */}
              <div className="mt-2 space-y-1">
                <div
                  className={cn(
                    'flex items-center gap-1.5 text-[11px]',
                    isSelected ? 'text-white/60' : 'text-[var(--apple-subtext)]',
                  )}
                >
                  {court.is_indoor ? (
                    <Umbrella size={12} className="text-amber-300 shrink-0" />
                  ) : (
                    <Sun size={12} className="text-emerald-400 shrink-0" />
                  )}
                  <span className="capitalize">{court.surface_type}</span>
                  <span>·</span>
                  <span>{court.is_indoor ? 'Indoor' : 'Outdoor'}</span>
                </div>

                {/* Price and Availability */}
                <div className="flex items-center justify-between pt-1">
                  <span className="font-semibold text-sm text-[var(--apple-text)]">
                    {formatCurrency(court.hourly_rate)}
                    <span className="text-[10px] font-normal text-[var(--apple-subtext)]">/hr</span>
                  </span>

                  <span
                    className={cn(
                      'text-[10px] font-medium px-2 py-0.5 rounded-full border',
                      isFull
                        ? 'text-red-500 bg-red-500/10 border-red-500/20'
                        : freeHours < 8
                        ? 'text-amber-600 dark:text-amber-300 bg-amber-500/10 border-amber-500/20'
                        : 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                    )}
                  >
                    {freeHours}/24h free
                  </span>
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
