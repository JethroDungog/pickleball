import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import CustomerDashboardClient from './CustomerDashboardClient'
import type { Booking, Court, Profile } from '@/types'

// ── Server-side data fetching ─────────────────────────────────────────────────

async function getMyBookings(userId: string): Promise<(Booking & { court: Court })[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('bookings')
      .select('*, court:courts(*)')
      .eq('user_id', userId)
      .order('booking_date', { ascending: false })
      .order('start_hour', { ascending: true })

    if (error || !data) {
      return []
    }
    return data as (Booking & { court: Court })[]
  } catch {
    return []
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()

  // Auth guard
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirectTo=/dashboard')
  }


  // Fetch real profile for authenticated user
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single<Profile>()

  const bookings = await getMyBookings(user!.id)

  const userProfile: Profile = profile ?? {
    id: user!.id,
    full_name:
      (user!.user_metadata?.full_name as string) ||
      (user!.user_metadata?.name as string) ||
      (user!.email ? user!.email.split('@')[0] : 'Player'),
    email: user!.email ?? '',
    phone: (user!.user_metadata?.phone as string) ?? '',
    role: 'customer',
    created_at: user!.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  return (
    <CustomerDashboardClient
      profile={userProfile}
      bookings={bookings}
      userEmail={user?.email ?? userProfile.email}
    />
  )
}
