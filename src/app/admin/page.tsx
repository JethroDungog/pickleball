import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import AdminDashboardClient from './AdminDashboardClient'
import type { Booking, Court, Profile } from '@/types'

// ── Demo Data for Preview Mode ────────────────────────────────────────────────

const DEMO_COURTS: Court[] = [
  {
    id: 'court-1',
    name: 'Court 1',
    surface_type: 'hard',
    is_indoor: false,
    hourly_rate: 400,
    is_active: true,
    color_hex: '#22c55e',
    description: 'Championship hard court with high-visibility lines',
    created_at: new Date().toISOString(),
  },
  {
    id: 'court-2',
    name: 'Court 2',
    surface_type: 'synthetic',
    is_indoor: false,
    hourly_rate: 400,
    is_active: true,
    color_hex: '#3b82f6',
    description: 'Tournament grade synthetic court with shock absorption',
    created_at: new Date().toISOString(),
  },
  {
    id: 'court-3',
    name: 'Court 3',
    surface_type: 'synthetic',
    is_indoor: true,
    hourly_rate: 550,
    is_active: true,
    color_hex: '#f59e0b',
    description: 'Indoor climate-controlled pro synthetic court',
    created_at: new Date().toISOString(),
  },
  {
    id: 'court-4',
    name: 'Court 4',
    surface_type: 'hard',
    is_indoor: true,
    hourly_rate: 550,
    is_active: true,
    color_hex: '#ef4444',
    description: 'Indoor stadium court with professional tournament lighting',
    created_at: new Date().toISOString(),
  },
]

function getDemoBookings(today: string): (Booking & { court: Court; profile: Profile })[] {
  const now = new Date().toISOString()
  return [
    {
      id: 'demo-1',
      court_id: 'court-1',
      user_id: 'u-1',
      booking_date: today,
      start_hour: 8,
      end_hour: 10,
      total_price: 800,
      status: 'confirmed',
      notes: 'Morning drill session',
      created_at: now,
      updated_at: now,
      court: DEMO_COURTS[0],
      profile: {
        id: 'u-1',
        full_name: 'Marcus Vance',
        email: 'marcus.v@pickcourt.com',
        role: 'customer',
        created_at: now,
        updated_at: now,
      },
    },
    {
      id: 'demo-2',
      court_id: 'court-1',
      user_id: 'u-2',
      booking_date: today,
      start_hour: 14,
      end_hour: 16,
      total_price: 800,
      status: 'confirmed',
      notes: 'Singles ladder match',
      created_at: now,
      updated_at: now,
      court: DEMO_COURTS[0],
      profile: {
        id: 'u-2',
        full_name: 'Sarah Chen',
        email: 'sarah.c@pickcourt.com',
        role: 'customer',
        created_at: now,
        updated_at: now,
      },
    },
    {
      id: 'demo-3',
      court_id: 'court-2',
      user_id: 'u-3',
      booking_date: today,
      start_hour: 10,
      end_hour: 12,
      total_price: 800,
      status: 'confirmed',
      notes: 'Doubles league warm-up',
      created_at: now,
      updated_at: now,
      court: DEMO_COURTS[1],
      profile: {
        id: 'u-3',
        full_name: 'Elena Rostova',
        email: 'elena.r@pickcourt.com',
        role: 'customer',
        created_at: now,
        updated_at: now,
      },
    },
    {
      id: 'demo-4',
      court_id: 'court-3',
      user_id: 'u-4',
      booking_date: today,
      start_hour: 16,
      end_hour: 18,
      total_price: 1100,
      status: 'confirmed',
      notes: 'Private coaching clinic',
      created_at: now,
      updated_at: now,
      court: DEMO_COURTS[2],
      profile: {
        id: 'u-4',
        full_name: 'Liam O’Connor',
        email: 'liam.o@pickcourt.com',
        role: 'customer',
        created_at: now,
        updated_at: now,
      },
    },
    {
      id: 'demo-5',
      court_id: 'court-4',
      user_id: 'u-5',
      booking_date: today,
      start_hour: 18,
      end_hour: 20,
      total_price: 1100,
      status: 'confirmed',
      notes: 'Evening tournament round',
      created_at: now,
      updated_at: now,
      court: DEMO_COURTS[3],
      profile: {
        id: 'u-5',
        full_name: 'Jordan Blake',
        email: 'jordan.b@pickcourt.com',
        role: 'customer',
        created_at: now,
        updated_at: now,
      },
    },
  ]
}

// ── Data fetch ────────────────────────────────────────────────────────────────

async function getAllBookings(date: string): Promise<(Booking & { court: Court; profile: Profile })[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('bookings')
      .select('*, court:courts(*), profile:profiles(*)')
      .eq('booking_date', date)
      .order('start_hour', { ascending: true })

    if (error || !data || data.length === 0) {
      return getDemoBookings(date)
    }
    return data as (Booking & { court: Court; profile: Profile })[]
  } catch {
    return getDemoBookings(date)
  }
}

async function getAllCourts(): Promise<Court[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('courts').select('*').eq('is_active', true).order('name')
    if (error || !data || data.length === 0) {
      return DEMO_COURTS
    }
    return data as Court[]
  } catch {
    return DEMO_COURTS
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login?redirectTo=/admin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<Pick<Profile, 'role'>>()

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect('/unauthorized')
  }

  const today = new Date().toISOString().split('T')[0]
  const [bookings, courts] = await Promise.all([getAllBookings(today), getAllCourts()])

  return <AdminDashboardClient bookings={bookings} courts={courts} today={today} />
}
