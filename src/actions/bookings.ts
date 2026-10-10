'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Booking, BookingStatus } from '@/types'

// ── Input / Result Types ──────────────────────────────────────────────────────

export interface CreateBookingInput {
  court_id: string
  booking_date: string
  start_hour: number
  end_hour: number
  notes?: string
}

export interface BookingActionResult {
  success: boolean
  booking?: Booking
  error?: string
}

// ── createBooking ─────────────────────────────────────────────────────────────

/**
 * Creates a new court booking for the authenticated user.
 * Calculates total price from court hourly_rate × duration.
 * Handles unique-constraint conflicts (double-booking) gracefully.
 */
export async function createBooking(
  data: CreateBookingInput,
): Promise<BookingActionResult> {
  const supabase = await createClient()

  // 1. Auth guard
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Authentication required' }
  }

  // 2. Validate hour range
  if (data.end_hour <= data.start_hour) {
    return { success: false, error: 'End time must be after start time' }
  }
  if (data.end_hour - data.start_hour > 4) {
    return { success: false, error: 'Maximum booking duration is 4 hours' }
  }

  // 3. Fetch court hourly_rate
  const { data: court, error: courtError } = await supabase
    .from('courts')
    .select('id, hourly_rate, is_active')
    .eq('id', data.court_id)
    .single()

  if (courtError || !court) {
    return { success: false, error: 'Court not found' }
  }
  if (!court.is_active) {
    return { success: false, error: 'This court is currently unavailable' }
  }

  // 4. Calculate total price
  const total_price = court.hourly_rate * (data.end_hour - data.start_hour)

  // 5. Insert booking
  const { data: booking, error: insertError } = await supabase
    .from('bookings')
    .insert({
      court_id: data.court_id,
      user_id: user.id,
      booking_date: data.booking_date,
      start_hour: data.start_hour,
      end_hour: data.end_hour,
      total_price,
      status: 'confirmed' as BookingStatus,
      notes: data.notes ?? null,
    })
    .select('*, court:courts(*), profile:profiles(*)')
    .single()

  if (insertError) {
    // PostgreSQL unique constraint violation → double-booking
    if (insertError.code === '23505') {
      return { success: false, error: 'This time slot is already booked' }
    }
    console.error('[createBooking]', insertError)
    return { success: false, error: 'Failed to create booking. Please try again.' }
  }

  revalidatePath('/book')
  revalidatePath('/dashboard')

  return { success: true, booking: booking as Booking }
}

// ── cancelBooking ─────────────────────────────────────────────────────────────

/**
 * Cancels a booking. Enforces 24-hour notice policy.
 * Only the booking owner or an admin may cancel.
 */
export async function cancelBooking(bookingId: string): Promise<BookingActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Authentication required' }
  }

  // Fetch booking + profile role
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('*, profile:profiles(role)')
    .eq('id', bookingId)
    .single()

  if (fetchError || !booking) {
    return { success: false, error: 'Booking not found' }
  }

  // Role check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'
  if (booking.user_id !== user.id && !isAdmin) {
    return { success: false, error: 'You do not have permission to cancel this booking' }
  }

  // 24-hour cancellation window
  const bookingStart = new Date(`${booking.booking_date}T${String(booking.start_hour).padStart(2, '0')}:00:00`)
  const hoursUntilBooking = (bookingStart.getTime() - Date.now()) / (1000 * 60 * 60)

  if (hoursUntilBooking < 24 && !isAdmin) {
    return {
      success: false,
      error: 'Cancellations must be made at least 24 hours before the booking',
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .select('*, court:courts(*)')
    .single()

  if (updateError) {
    console.error('[cancelBooking]', updateError)
    return { success: false, error: 'Failed to cancel booking' }
  }

  revalidatePath('/dashboard')

  return { success: true, booking: updated as Booking }
}

// ── getMyBookings ─────────────────────────────────────────────────────────────

/**
 * Returns all bookings for the current authenticated user,
 * ordered by date descending then start hour ascending.
 */
export async function getMyBookings(): Promise<Booking[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('bookings')
    .select('*, court:courts(*)')
    .eq('user_id', user.id)
    .order('booking_date', { ascending: false })
    .order('start_hour', { ascending: true })

  if (error) {
    console.error('[getMyBookings]', error)
    return []
  }

  return (data ?? []) as Booking[]
}

// ── getCourtBookings ──────────────────────────────────────────────────────────

/**
 * Returns all non-cancelled bookings for a specific court on a given date.
 * Used for public availability display on the booking page.
 */
export async function getCourtBookings(courtId: string, date: string): Promise<Booking[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('bookings')
    .select('*, court:courts(*), profile:profiles(full_name, avatar_url)')
    .eq('court_id', courtId)
    .eq('booking_date', date)
    .neq('status', 'cancelled')
    .order('start_hour', { ascending: true })

  if (error) {
    console.error('[getCourtBookings]', error)
    return []
  }

  return (data ?? []) as Booking[]
}

// ── getAllBookings ─────────────────────────────────────────────────────────────

interface GetAllBookingsFilters {
  date?: string
  courtId?: string
  status?: BookingStatus
}

/**
 * Admin-only: fetches all bookings with optional filters.
 * Joins court and profile data for admin views.
 */
export async function getAllBookings(
  filters?: GetAllBookingsFilters,
): Promise<Booking[]> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  // Role check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (
    !profile ||
    (profile.role !== 'admin' && profile.role !== 'super_admin')
  ) {
    console.warn('[getAllBookings] Unauthorized attempt by user:', user.id)
    return []
  }

  let query = supabase
    .from('bookings')
    .select('*, court:courts(*), profile:profiles(*)')
    .order('booking_date', { ascending: false })
    .order('start_hour', { ascending: true })

  if (filters?.date) {
    query = query.eq('booking_date', filters.date)
  }
  if (filters?.courtId) {
    query = query.eq('court_id', filters.courtId)
  }
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  const { data, error } = await query

  if (error) {
    console.error('[getAllBookings]', error)
    return []
  }

  return (data ?? []) as Booking[]
}

// ── updateBookingStatus ───────────────────────────────────────────────────────

/**
 * Admin-only: updates the status of any booking.
 * Used for maintenance scheduling and manual overrides.
 */
export async function updateBookingStatus(
  bookingId: string,
  status: BookingStatus,
): Promise<BookingActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Authentication required' }
  }

  // Role check
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (
    !profile ||
    (profile.role !== 'admin' && profile.role !== 'super_admin')
  ) {
    return { success: false, error: 'Admin access required' }
  }

  const { data: updated, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select('*, court:courts(*)')
    .single()

  if (error) {
    console.error('[updateBookingStatus]', error)
    return { success: false, error: 'Failed to update booking status' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/book')

  return { success: true, booking: updated as Booking }
}
