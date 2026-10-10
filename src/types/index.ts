export type UserRole = 'customer' | 'admin' | 'super_admin'
export type BookingStatus = 'confirmed' | 'cancelled' | 'maintenance'
export type SurfaceType = 'hard' | 'clay' | 'grass' | 'synthetic'

export interface Profile {
  id: string
  full_name: string
  email: string
  phone?: string
  role: UserRole
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Court {
  id: string
  name: string
  description?: string
  surface_type: SurfaceType
  is_indoor: boolean
  hourly_rate: number
  is_active: boolean
  image_url?: string
  color_hex: string
  created_at: string
}

export interface Booking {
  id: string
  court_id: string
  user_id: string
  booking_date: string
  start_hour: number
  end_hour: number
  total_price: number
  status: BookingStatus
  notes?: string
  created_at: string
  updated_at: string
  court?: Court
  profile?: Profile
}

export interface TimeSlot {
  hour: number
  label: string
  isAvailable: boolean
  isSelected: boolean
  isMaintenace: boolean
}

export interface BookingDraft {
  courtId: string
  courtName: string
  courtColor: string
  date: string
  startHour: number
  endHour: number
  hourlyRate: number
  totalPrice: number
}

export interface AuditLog {
  id: string
  actor_id: string | null
  action: string
  table_name: string
  record_id: string | null
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  created_at: string
  actor?: Profile
}

export interface RevenueMetrics {
  totalRevenue: number
  monthRevenue: number
  weekRevenue: number
  totalBookings: number
  activeMembers: number
  utilizationRate: number
  byDay: { date: string; revenue: number }[]
}

export interface NewCourtInput {
  name: string
  surface_type: SurfaceType
  is_indoor: boolean
  hourly_rate: number
  color_hex: string
  description?: string
}
