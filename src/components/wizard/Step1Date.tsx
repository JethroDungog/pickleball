'use client'

import { useState } from 'react'
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  addDays,
  startOfDay,
} from 'date-fns'
import { ChevronLeft, ChevronRight, ArrowRight, Calendar as CalendarIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Step1DateProps {
  selectedDate: string
  onSelectDate: (date: string) => void
  onContinue: () => void
}

export default function Step1Date({
  selectedDate,
  onSelectDate,
  onContinue,
}: Step1DateProps) {
  const currentDate = new Date(selectedDate)
  const [currentMonth, setCurrentMonth] = useState<Date>(currentDate)

  const today = startOfDay(new Date())
  const maxBookingDate = addDays(today, 60)

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))

  // Calculate calendar grid days
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })

  const weekDayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

  return (
    <div className="space-y-8 max-w-xl mx-auto py-2">
      {/* Title */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">
          <CalendarIcon size={12} />
          <span>Step 1 · Schedule Date</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--apple-text)]">
          Select Your Playing Date
        </h2>
        <p className="text-xs sm:text-sm text-[var(--apple-subtext)]">
          Reservations open up to 60 days ahead with 24/7 court availability.
        </p>
      </div>

      {/* Calendar Card (Apple Squircle) */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[var(--apple-card)] border border-[var(--apple-border)] shadow-sm space-y-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between px-2">
          <button
            type="button"
            onClick={prevMonth}
            disabled={isBefore(endOfMonth(subMonths(currentMonth, 1)), today)}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-[var(--apple-border)] text-[var(--apple-text)] hover:bg-[var(--apple-card-hover)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="font-semibold text-sm sm:text-base text-[var(--apple-text)]">
            {format(currentMonth, 'MMMM yyyy')}
          </span>

          <button
            type="button"
            onClick={nextMonth}
            disabled={isBefore(maxBookingDate, startOfMonth(addMonths(currentMonth, 1)))}
            className="w-8 h-8 rounded-full flex items-center justify-center border border-[var(--apple-border)] text-[var(--apple-text)] hover:bg-[var(--apple-card-hover)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {weekDayLabels.map((day) => (
            <div
              key={day}
              className="text-[11px] font-medium text-[var(--apple-muted)] uppercase tracking-wider py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {calendarDays.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const isSelected = dateStr === selectedDate
            const isCurrentMonthDay = isSameMonth(day, currentMonth)
            const isDayPast = isBefore(day, today)
            const isDayTooFar = isBefore(maxBookingDate, day)
            const isDisabled = !isCurrentMonthDay || isDayPast || isDayTooFar
            const dayIsToday = isToday(day)

            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={isDisabled}
                onClick={() => onSelectDate(dateStr)}
                className={cn(
                  'aspect-square rounded-2xl flex flex-col items-center justify-center text-xs sm:text-sm font-medium transition-all relative outline-none',
                  isSelected
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-black font-bold shadow-md z-10 scale-105'
                    : dayIsToday && !isDisabled
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30 hover:bg-emerald-500/25 cursor-pointer'
                    : !isDisabled
                    ? 'text-[var(--apple-text)] hover:bg-[var(--apple-card-hover)] cursor-pointer'
                    : 'text-[var(--apple-muted)] opacity-25 cursor-not-allowed'
                )}
              >
                <span>{format(day, 'd')}</span>
                {dayIsToday && !isSelected && (
                  <span className="w-1 h-1 rounded-full bg-emerald-500 mt-0.5" />
                )}
              </button>
            )
          })}
        </div>

        {/* Calendar Footnote */}
        <div className="pt-4 border-t border-[var(--apple-border)] text-center space-y-1">
          <p className="text-[11px] text-[var(--apple-muted)]">
            Greyed-out dates are closed for booking. Bookings open up to 60 days ahead.
          </p>
          <p className="text-xs font-semibold text-[var(--apple-text)] pt-1">
            Selected: <span className="underline decoration-emerald-500 underline-offset-4">{format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}</span>
          </p>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={onContinue}
          className="btn-primary !px-8 !py-3.5 text-sm flex items-center gap-2 shadow-sm"
        >
          <span>Continue</span>
          <ArrowRight size={15} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
