import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Booking } from '@/types'

// ── Class name helper ─────────────────────────────────────────────────────────

/**
 * Combines clsx and tailwind-merge for ergonomic conditional className building.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// ── Formatting helpers ────────────────────────────────────────────────────────

/**
 * Formats a number as USD currency.
 * @example formatCurrency(25) → '$25.00'
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formats a date string or Date object to a human-readable form.
 * @example formatDate('2024-07-20') → 'Saturday, July 20, 2024'
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

/**
 * Converts a 24-hour integer (0–23) to a 12-hour AM/PM label.
 * @example formatHour(0)  → '12:00 AM'
 * @example formatHour(13) → '1:00 PM'
 */
export function formatHour(hour: number): string {
  if (hour < 0 || hour > 23) throw new RangeError(`hour must be 0–23, got ${hour}`)
  const period = hour < 12 ? 'AM' : 'PM'
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${h}:00 ${period}`
}

// ── Booking helpers ───────────────────────────────────────────────────────────

type SlotStatus = 'available' | 'booked' | 'maintenance'

/**
 * Determines the status of a specific time slot.
 *
 * @param bookings   - Array of all bookings to check against.
 * @param courtId    - The court being queried.
 * @param date       - ISO date string (YYYY-MM-DD) for the slot.
 * @param hour       - Hour of the slot (0–23, inclusive start).
 * @returns 'available' | 'booked' | 'maintenance'
 */
export function getSlotStatus(
  bookings: Booking[],
  courtId: string,
  date: string,
  hour: number,
): SlotStatus {
  const relevant = bookings.filter(
    (b) => b.court_id === courtId && b.booking_date === date,
  )

  for (const booking of relevant) {
    if (hour >= booking.start_hour && hour < booking.end_hour) {
      if (booking.status === 'maintenance') return 'maintenance'
      if (booking.status === 'confirmed') return 'booked'
    }
  }

  return 'available'
}
