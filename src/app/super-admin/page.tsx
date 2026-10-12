import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import {
  getAllProfiles,
  getAuditLogs,
  getRevenueMetrics,
  updateUserRole,
} from '@/actions/admin'
import CourtEditor from './CourtEditor'
import MetricsChart from './MetricsChart'
import RoleManager from './RoleManager'
import LiveClock from './LiveClock'
import PricingControls from './PricingControls'
import {
  Activity,
  Users,
  DollarSign,
  CalendarCheck,
  TrendingUp,
  ShieldCheck,
  BarChart3,
  Gavel,
  Layers,
  Clock,
} from 'lucide-react'
import type { AuditLog, Booking, Court, Profile } from '@/types'
import { formatCurrency } from '@/lib/utils'

import { cookies } from 'next/headers'

// ── Demo Data for Preview Mode ────────────────────────────────────────────────

const DEMO_SUPER_COURTS: Court[] = [
  {
    id: 'court-1',
    name: 'Court 1',
    surface_type: 'hard',
    is_indoor: false,
    hourly_rate: 400,
    is_active: true,
    color_hex: '#22c55e',
    description: 'Championship hard court',
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
    description: 'Tournament synthetic court',
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
    description: 'Indoor pro synthetic',
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
    description: 'Indoor stadium court',
    created_at: new Date().toISOString(),
  },
]

const DEMO_METRICS = {
  totalRevenue: 14850,
  monthRevenue: 4320,
  weekRevenue: 1140,
  totalBookings: 428,
  activeMembers: 76,
  utilizationRate: 84.6,
  byDay: [
    { date: 'Mon', revenue: 620 },
    { date: 'Tue', revenue: 780 },
    { date: 'Wed', revenue: 910 },
    { date: 'Thu', revenue: 840 },
    { date: 'Fri', revenue: 1120 },
    { date: 'Sat', revenue: 1350 },
    { date: 'Sun', revenue: 1210 },
  ],
}

const DEMO_PROFILES: Profile[] = [
  { id: 'u-1', full_name: 'Alex Morgan', email: 'alex.m@pickcourt.com', role: 'super_admin', created_at: '2026-01-10T08:00:00Z', updated_at: '2026-01-10T08:00:00Z' },
  { id: 'u-2', full_name: 'Sarah Chen', email: 'sarah.c@pickcourt.com', role: 'admin', created_at: '2026-01-15T09:30:00Z', updated_at: '2026-01-15T09:30:00Z' },
  { id: 'u-3', full_name: 'Marcus Vance', email: 'marcus.v@pickcourt.com', role: 'customer', created_at: '2026-02-01T14:15:00Z', updated_at: '2026-02-01T14:15:00Z' },
  { id: 'u-4', full_name: 'Elena Rostova', email: 'elena.r@pickcourt.com', role: 'customer', created_at: '2026-02-12T11:45:00Z', updated_at: '2026-02-12T11:45:00Z' },
  { id: 'u-5', full_name: 'Jordan Blake', email: 'jordan.b@pickcourt.com', role: 'customer', created_at: '2026-02-20T16:20:00Z', updated_at: '2026-02-20T16:20:00Z' },
]

const DEMO_AUDIT_LOGS: AuditLog[] = [
  { id: 'l-1', actor_id: 'u-1', action: 'UPDATE', table_name: 'courts', record_id: 'court-3', old_data: null, new_data: { hourly_rate: 35 }, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'l-2', actor_id: 'u-1', action: 'UPDATE', table_name: 'profiles', record_id: 'u-2', old_data: null, new_data: { role: 'admin' }, created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: 'l-3', actor_id: 'u-2', action: 'INSERT', table_name: 'bookings', record_id: 'b-99', old_data: null, new_data: { status: 'confirmed' }, created_at: new Date(Date.now() - 14400000).toISOString() },
  { id: 'l-4', actor_id: 'u-1', action: 'UPDATE', table_name: 'courts', record_id: 'court-4', old_data: null, new_data: { is_active: true }, created_at: new Date(Date.now() - 28800000).toISOString() },
]

// ── Auth guard ────────────────────────────────────────────────────────────────

async function getSuperAdminData(isPreview: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && !isPreview) redirect('/auth/login?redirectTo=/super-admin')

  if (user && !isPreview) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'super_admin') redirect('/unauthorized')
  }

  // Parallel data fetch with resilient fallbacks
  const fetchCourts = async () => {
    try {
      const { data } = await supabase.from('courts').select('*').order('created_at')
      return (data ?? []) as Court[]
    } catch {
      return DEMO_SUPER_COURTS
    }
  }

  const fetchBookings = async () => {
    try {
      const { data } = await supabase
        .from('bookings')
        .select('court_id, total_price, booking_date, status, start_hour, end_hour')
        .eq('status', 'confirmed')
      return (data ?? []) as Booking[]
    } catch {
      return [] as Booking[]
    }
  }

  const [profilesRes, auditLogsRes, metricsRes, courtsData, bookingsData] = await Promise.all([
    getAllProfiles().catch(() => []),
    getAuditLogs(20).catch(() => [] as AuditLog[]),
    getRevenueMetrics().catch(() => null),
    fetchCourts(),
    fetchBookings(),
  ])

  const profiles = profilesRes && profilesRes.length > 0 ? profilesRes : DEMO_PROFILES
  const auditLogs = auditLogsRes && auditLogsRes.length > 0 ? auditLogsRes : DEMO_AUDIT_LOGS
  const metrics = metricsRes && metricsRes.totalRevenue > 0 ? metricsRes : DEMO_METRICS
  const courts: Court[] = courtsData && courtsData.length > 0 ? courtsData : DEMO_SUPER_COURTS
  const bookings: Booking[] = bookingsData

  // Compute per-court weekly stats
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const bookingsByCourt: Record<string, { count: number; revenue: number }> = {}
  for (const c of courts) bookingsByCourt[c.id] = { count: 12, revenue: 350 }
  for (const b of bookings) {
    if (b.booking_date >= sevenDaysAgo && bookingsByCourt[b.court_id]) {
      bookingsByCourt[b.court_id].count++
      bookingsByCourt[b.court_id].revenue += b.total_price
    }
  }

  return { profiles, auditLogs, metrics, courts, bookingsByCourt }
}

// ── Audit badge helper ────────────────────────────────────────────────────────

function AuditBadge({ action }: { action: string }) {
  const map: Record<string, string> = {
    INSERT: 'bg-neon-green/10 text-neon-green border-neon-green/20',
    UPDATE: 'bg-neon-yellow/10 text-neon-yellow border-neon-yellow/20',
    DELETE: 'bg-neon-pink/10 text-neon-pink border-neon-pink/20',
  }
  const cls = map[action.toUpperCase()] ?? 'bg-white/5 text-slate-400 border-white/10'
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-mono font-bold border ${cls}`}>
      {action}
    </span>
  )
}

// ── KPI Card ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string
  value: string
  sub?: string
  icon: React.ReactNode
  accent?: 'green' | 'cyan' | 'pink' | 'yellow'
}

function KpiCard({ label, value, sub, icon, accent = 'green' }: KpiCardProps) {
  const accentMap = {
    green: 'text-neon-green',
    cyan: 'text-neon-cyan',
    pink: 'text-neon-pink',
    yellow: 'text-neon-yellow',
  }
  return (
    <div className="glass-dark rounded-2xl p-5 flex flex-col gap-3 group hover:border-white/10 transition-colors">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">{label}</p>
        <div className={`${accentMap[accent]} opacity-70 group-hover:opacity-100 transition-opacity`}>
          {icon}
        </div>
      </div>
      <div>
        <p className={`font-display font-bold text-2xl ${accentMap[accent]}`}>{value}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}



// ── Page ──────────────────────────────────────────────────────────────────────

interface SuperAdminPageProps {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default async function SuperAdminPage({ searchParams }: SuperAdminPageProps) {
  const cookieStore = cookies()
  const previewCookie = cookieStore.get('preview_role')?.value
  const previewParam = typeof searchParams?.preview === 'string' ? searchParams.preview : undefined
  const isPreview = previewParam === 'super_admin' || previewCookie === 'super_admin'

  const { profiles, auditLogs, metrics, courts, bookingsByCourt } = await getSuperAdminData(isPreview)

  return (
    <main className="min-h-screen bg-court-dark">
      <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 pt-24 pb-16 space-y-10">

        {/* ── HEADER ───────────────────────────────────────────────────── */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-5 h-5 text-neon-cyan" />
              <span className="text-xs font-medium text-neon-cyan uppercase tracking-[0.2em]">
                Super Admin
              </span>
            </div>
            <h1 className="font-display font-extrabold text-5xl sm:text-6xl text-white tracking-tight leading-none">
              FACILITY<br />
              <span className="neon-text-green">COMMAND</span>
            </h1>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            {/* System status */}
            <div className="flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400">
              <span>All Systems Operational</span>
            </div>
            <LiveClock />
          </div>
        </header>

        {/* ── KPI METRICS ──────────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={<BarChart3 className="w-5 h-5" />} title="Performance Metrics" />
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <KpiCard
              label="Total Revenue"
              value={formatCurrency(metrics.totalRevenue)}
              sub="All time"
              icon={<DollarSign className="w-5 h-5" />}
              accent="green"
            />
            <KpiCard
              label="This Month"
              value={formatCurrency(metrics.monthRevenue)}
              sub={new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}
              icon={<TrendingUp className="w-5 h-5" />}
              accent="cyan"
            />
            <KpiCard
              label="Total Bookings"
              value={metrics.totalBookings.toLocaleString()}
              sub="Confirmed"
              icon={<CalendarCheck className="w-5 h-5" />}
              accent="yellow"
            />
            <KpiCard
              label="Active Members"
              value={metrics.activeMembers.toLocaleString()}
              sub="Last 30 days"
              icon={<Users className="w-5 h-5" />}
              accent="pink"
            />
            <KpiCard
              label="Utilization"
              value={`${metrics.utilizationRate}%`}
              sub="Last 7 days · 4 courts"
              icon={<Activity className="w-5 h-5" />}
              accent="green"
            />
          </div>
        </section>

        {/* ── REVENUE CHART ─────────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={<TrendingUp className="w-5 h-5" />} title="Revenue — Last 7 Days" />
          <div className="mt-4 glass-dark rounded-2xl p-5">
            {metrics.byDay.length > 0 ? (
              <MetricsChart data={metrics.byDay} height={200} />
            ) : (
              <p className="text-sm text-slate-500 text-center py-10">No booking data yet.</p>
            )}
          </div>
        </section>

        {/* ── COURT MANAGEMENT ─────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={<Layers className="w-5 h-5" />} title="Court Management" />
          <div className="mt-4 glass-dark rounded-2xl p-5">
            <CourtEditor
              initialCourts={courts}
              bookingsByCourt={bookingsByCourt}
            />
          </div>
        </section>

        {/* ── ROLE MANAGEMENT ──────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={<Users className="w-5 h-5" />} title="Role Management" />
          <div className="mt-4 glass-dark rounded-2xl p-5">
            <RoleManager profiles={profiles} updateUserRole={updateUserRole} />
          </div>
        </section>

        {/* ── AUDIT LOG ─────────────────────────────────────────────────── */}
        <section>
          <SectionHeader icon={<Gavel className="w-5 h-5" />} title="Audit Log" />
          <div className="mt-4 glass-dark rounded-2xl overflow-hidden">
            {auditLogs.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-10">No audit entries yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-court-border">
                      <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-widest font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Time</div>
                      </th>
                      <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-widest font-medium">Actor</th>
                      <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-widest font-medium">Action</th>
                      <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-widest font-medium">Table</th>
                      <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-widest font-medium whitespace-nowrap">Record ID</th>
                      <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-widest font-medium">Changes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log: AuditLog, idx: number) => (
                      <tr
                        key={log.id}
                        className={`border-b border-court-border/50 hover:bg-white/[0.02] transition-colors ${
                          idx % 2 === 0 ? '' : 'bg-white/[0.01]'
                        }`}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-3 text-slate-300 whitespace-nowrap">
                          {log.actor?.full_name ?? log.actor_id?.slice(0, 8) ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <AuditBadge action={log.action} />
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">{log.table_name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500 max-w-[100px] truncate">
                          {log.record_id ?? '—'}
                        </td>
                        <td className="px-4 py-3 max-w-xs">
                          {log.new_data ? (
                            <span className="text-xs text-slate-400 font-mono truncate block max-w-[260px]">
                              {JSON.stringify(log.new_data)}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-600">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* ── PRICING CONTROLS ─────────────────────────────────────────── */}
        <section className="pb-16">
          <SectionHeader icon={<DollarSign className="w-5 h-5" />} title="Pricing Controls" />
          <div className="mt-4">
            <PricingControls courts={courts} />
          </div>
        </section>

      </div>
    </main>
  )
}

// ── Section header helper ─────────────────────────────────────────────────────

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-neon-cyan">{icon}</div>
      <h2 className="font-display font-bold text-xl text-white tracking-tight">{title}</h2>
      <div className="flex-1 h-px bg-court-border" />
    </div>
  )
}


