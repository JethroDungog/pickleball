import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CustomerDashboardClient from './CustomerDashboardClient'
import type { Booking, Court, Profile } from '@/types'

// ── Server-side data fetching ─────────────────────────────────────────────────

async function getMyBookings(userId: string): Promise<(Booking & { court: Court })[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('*, court:courts(*)')
    .eq('user_id', userId)
    .order('booking_date', { ascending: false })
    .order('start_hour', { ascending: true })

  if (error) {
    console.error('[getMyBookings]', error.message)
    return []
  }
  return (data ?? []) as (Booking & { court: Court })[]
}

// ── Page (Server Component) ───────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient()

  // Auth guard
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirectTo=/dashboard')
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  const bookings = await getMyBookings(user.id)

  return (
    <CustomerDashboardClient
      profile={profile}
      bookings={bookings}
      userEmail={user.email ?? ''}
    />
  )
}
