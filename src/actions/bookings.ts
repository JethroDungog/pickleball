'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
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
  try {
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

    // 3. Ensure court exists (resolve fallback ID if needed)
    let courtId = data.court_id
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courtId)

    let court: { id: string; hourly_rate: number; is_active: boolean } | null = null

    if (isUUID) {
      const { data: courtData } = await supabase
        .from('courts')
        .select('id, hourly_rate, is_active')
        .eq('id', courtId)
        .maybeSingle()
      court = courtData
    }

    // If court not found by UUID, try matching by court name or fallback to first active court
    if (!court) {
      const { data: allCourts } = await supabase
        .from('courts')
        .select('id, name, hourly_rate, is_active')
        .eq('is_active', true)
        .order('name')

      if (allCourts && allCourts.length > 0) {
        const match = allCourts.find(
          (c) =>
            courtId.toLowerCase().includes(c.name.toLowerCase().replace(/\s+/g, '')) ||
            courtId.toLowerCase().includes(c.name.toLowerCase()),
        )
        court = match || allCourts[0]
        courtId = court.id
      }
    }

    if (!court) {
      return { success: false, error: 'Court not found. Please refresh and try again.' }
    }
    if (!court.is_active) {
      return { success: false, error: 'This court is currently unavailable for booking.' }
    }

    // 4. Ensure user profile exists in public.profiles to satisfy foreign key constraint
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!existingProfile) {
      const fullName =
        (user.user_metadata?.full_name as string) ||
        (user.user_metadata?.name as string) ||
        (user.email ? user.email.split('@')[0] : 'Player')
      const avatarUrl =
        (user.user_metadata?.avatar_url as string) ||
        (user.user_metadata?.picture as string) ||
        null

      await supabase.from('profiles').upsert(
        {
          id: user.id,
          email: user.email || '',
          full_name: fullName,
          avatar_url: avatarUrl,
          role: 'customer',
        },
        { onConflict: 'id', ignoreDuplicates: true },
      )
    }

    // 5. Check for overlapping bookings on this court and date
    const { data: existingBookings } = await supabase
      .from('bookings')
      .select('id, start_hour, end_hour')
      .eq('court_id', courtId)
      .eq('booking_date', data.booking_date)
      .neq('status', 'cancelled')

    if (existingBookings && existingBookings.length > 0) {
      const hasOverlap = existingBookings.some((b) => {
        return data.start_hour < b.end_hour && data.end_hour > b.start_hour
      })
      if (hasOverlap) {
        return {
          success: false,
          error: 'This time slot is already reserved. Please select another time.',
        }
      }
    }

    // 6. Calculate total price (using court's hourly rate)
    const total_price = court.hourly_rate * (data.end_hour - data.start_hour)

    // 7. Insert booking
    const { data: booking, error: insertError } = await supabase
      .from('bookings')
      .insert({
        court_id: courtId,
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
      if (insertError.code === '23505') {
        return { success: false, error: 'This time slot is already booked.' }
      }
      console.error('[createBooking] insert error:', insertError)
      return {
        success: false,
        error: insertError.message || 'Failed to create booking. Please try again.',
      }
    }

    return { success: true, booking: booking as Booking }
  } catch (err: any) {
    console.error('[createBooking] caught error:', err)
    return {
      success: false,
      error: err?.message || 'An unexpected error occurred while processing your booking.',
    }
  }
}

// ── cancelBooking ─────────────────────────────────────────────────────────────

/**
 * Cancels a booking. Enforces 24-hour notice policy.
 * Only the booking owner or an admin may cancel.
 */
export async function cancelBooking(bookingId: string): Promise<BookingActionResult> {
  try {
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
    revalidatePath('/schedule')

    return { success: true, booking: updated as Booking }
  } catch (err: any) {
    console.error('[cancelBooking] caught error:', err)
    return {
      success: false,
      error: err?.message || 'Failed to cancel booking. Please try again.',
    }
  }
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
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    const supabase = createSupabaseClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

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
  } catch (err) {
    console.error('[getCourtBookings] exception:', err)
    return []
  }
}

// ── getFacilityBookings ───────────────────────────────────────────────────────

/**
 * Returns all non-cancelled bookings for all courts on a given date.
 * Bypasses RLS via service role so that all players and visitors see accurate availability.
 */
export async function getFacilityBookings(date: string): Promise<Booking[]> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    const supabase = createSupabaseClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data, error } = await supabase
      .from('bookings')
      .select('*, court:courts(*), profile:profiles(full_name, avatar_url)')
      .eq('booking_date', date)
      .neq('status', 'cancelled')
      .order('start_hour', { ascending: true })

    if (error) {
      console.error('[getFacilityBookings] error:', error)
      return []
    }

    return (data ?? []) as unknown as Booking[]
  } catch (err) {
    console.error('[getFacilityBookings] exception:', err)
    return []
  }
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
