import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import CustomerDashboardClient from './CustomerDashboardClient'
import type { Booking, Court, Profile } from '@/types'

// ── Demo Customer Data for Preview Mode ───────────────────────────────────────

const DEMO_CUSTOMER_PROFILE: Profile = {
  id: 'demo-user-1',
  full_name: 'Alex Morgan',
  email: 'alex.morgan@pickcourt.com',
  phone: '+1 (555) 019-2834',
  role: 'customer',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const DEMO_CUSTOMER_BOOKINGS: (Booking & { court: Court })[] = [
  {
    id: 'pass-bk-8492',
    court_id: 'court-1-default',
    user_id: 'demo-user-1',
    booking_date: new Date().toISOString().split('T')[0],
    start_hour: 18,
    end_hour: 20,
    total_price: 50,
    status: 'confirmed',
    notes: 'Championship warmup session',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    court: {
      id: 'court-1-default',
      name: 'Court 1',
      description: 'Championship hard court with high-visibility lines',
      surface_type: 'hard',
      is_indoor: false,
      hourly_rate: 25,
      is_active: true,
      color_hex: '#22c55e',
      created_at: new Date().toISOString(),
    },
  },
]

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

// ── Page (Server Component) ───────────────────────────────────────────────────

interface DashboardPageProps {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const cookieStore = cookies()
  const previewCookie = cookieStore.get('preview_role')?.value
  const previewParam = typeof searchParams?.preview === 'string' ? searchParams.preview : undefined
  const isPreview = Boolean(previewParam || previewCookie)

  const supabase = await createClient()

  // Auth guard
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && !isPreview) {
    redirect('/auth/login?redirectTo=/dashboard')
  }

  if (!user && isPreview) {
    return (
      <CustomerDashboardClient
        profile={DEMO_CUSTOMER_PROFILE}
        bookings={DEMO_CUSTOMER_BOOKINGS}
        userEmail={DEMO_CUSTOMER_PROFILE.email}
      />
    )
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
