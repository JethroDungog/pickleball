import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminDashboardClient from './AdminDashboardClient'
import type { Booking, Court, Profile } from '@/types'

// ── Data fetch ────────────────────────────────────────────────────────────────

async function getAllBookings(date: string): Promise<(Booking & { court: Court; profile: Profile })[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('*, court:courts(*), profile:profiles(*)')
    .eq('booking_date', date)
    .order('start_hour', { ascending: true })

  if (error) {
    console.error('[getAllBookings]', error.message)
    return []
  }
  return (data ?? []) as (Booking & { court: Court; profile: Profile })[]
}

async function getAllCourts(): Promise<Court[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('courts').select('*').eq('is_active', true).order('name')
  return (data ?? []) as Court[]
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?redirectTo=/admin')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<Pick<Profile, 'role'>>()

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  const today = new Date().toISOString().split('T')[0]
  const [bookings, courts] = await Promise.all([getAllBookings(today), getAllCourts()])

  return <AdminDashboardClient bookings={bookings} courts={courts} today={today} />
}
