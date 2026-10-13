'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format, addDays } from 'date-fns'
import { ChevronRight, Calendar, Clock, MapPin, Zap, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import MultiCourtGantt from '@/components/MultiCourtGantt'
import Footer from '@/components/Footer'
import type { Court, Booking } from '@/types'

const FALLBACK_COURTS: Court[] = [
  {
    id: '1fa9e1ab-9429-435e-bbbf-d48286090345',
    name: 'Court 1',
    description: 'Championship hard court with high-visibility lines & pro lighting',
    surface_type: 'hard',
    is_indoor: false,
    hourly_rate: 400,
    is_active: true,
    color_hex: '#30d158',
    created_at: '',
  },
  {
    id: 'a3a01fcd-a8fd-4264-876a-cdcfb59c05f6',
    name: 'Court 2',
    description: 'Tournament grade synthetic court with multi-layer shock absorption',
    surface_type: 'synthetic',
    is_indoor: false,
    hourly_rate: 400,
    is_active: true,
    color_hex: '#0a84ff',
    created_at: '',
  },
  {
    id: '7eba227a-fe3b-4a34-8140-451aa178e73b',
    name: 'Court 3',
    description: 'Indoor climate-controlled pro synthetic arena with spectator seating',
    surface_type: 'synthetic',
    is_indoor: true,
    hourly_rate: 550,
    is_active: true,
    color_hex: '#ff9f0a',
    created_at: '',
  },
  {
    id: '95142fde-40d5-40df-a29c-8ad0b24922a6',
    name: 'Court 4',
    description: 'Indoor stadium arena court equipped with broadcast tournament lighting',
    surface_type: 'hard',
    is_indoor: true,
    hourly_rate: 550,
    is_active: true,
    color_hex: '#ff453a',
    created_at: '',
  },
]

export default function SchedulePage() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [courts, setCourts] = useState<Court[]>(FALLBACK_COURTS)
  const [bookings, setBookings] = useState<Booking[]>([])

  const supabase = createClient()
  const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i))

  const loadData = useCallback(async () => {
    try {
      const [courtsRes, bookingsRes] = await Promise.all([
        supabase.from('courts').select('*').eq('is_active', true).order('name'),
        fetch(`/api/bookings?date=${encodeURIComponent(selectedDate)}`, { cache: 'no-store' }),
      ])

      if (courtsRes.data && courtsRes.data.length > 0) {
        setCourts(courtsRes.data as Court[])
      }

      if (bookingsRes.ok) {
        const json = await bookingsRes.json()
        if (json.bookings) {
          setBookings(json.bookings as Booking[])
        }
      }
    } catch {
      // Fallback courts remain active
    }
  }, [selectedDate, supabase])

  // Initial load and fast 2.5s fallback polling
  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 2500)
    return () => clearInterval(interval)
  }, [loadData])

  // Real-time Supabase WebSocket event sync
  useEffect(() => {
    const channel = supabase
      .channel(`schedule-realtime-${selectedDate}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        () => {
          loadData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedDate, supabase, loadData])

  return (
    <main className="min-h-screen bg-[var(--apple-bg)] text-[var(--apple-text)] pt-24 pb-16 font-body antialiased transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--apple-border)] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-none" />
              <span>Live Facility Timeline</span>
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-[var(--apple-text)] tracking-tight">
              Court Availability Schedule
            </h1>
            <p className="text-xs sm:text-sm text-[var(--apple-subtext)] mt-1">
              Real-time schedule for all 4 championship courts. Open 24/7 with zero double-booking concurrency.
            </p>
          </div>
          <Link href="/book">
            <button
              type="button"
              className="btn-primary text-xs !py-2.5 !px-5 inline-flex items-center gap-2"
            >
              <span>Book a Court</span>
              <ChevronRight size={14} strokeWidth={2.5} />
            </button>
          </Link>
        </div>

        {/* Facility Summary Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-[var(--apple-card)] border border-[var(--apple-border)] shadow-xs">
            <p className="text-[10px] text-[var(--apple-subtext)] font-semibold uppercase tracking-wider">Courts</p>
            <p className="font-display font-bold text-xl sm:text-2xl text-[var(--apple-text)] mt-1">4 Pro Courts</p>
            <p className="text-[11px] text-[var(--apple-subtext)] mt-0.5">2 Outdoor · 2 Indoor</p>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--apple-card)] border border-[var(--apple-border)] shadow-xs">
            <p className="text-[10px] text-[var(--apple-subtext)] font-semibold uppercase tracking-wider">Access</p>
            <p className="font-display font-bold text-xl sm:text-2xl text-[var(--apple-text)] mt-1">24 Hours</p>
            <p className="text-[11px] text-[var(--apple-subtext)] mt-0.5">Continuous facility access</p>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--apple-card)] border border-[var(--apple-border)] shadow-xs">
            <p className="text-[10px] text-[var(--apple-subtext)] font-semibold uppercase tracking-wider">Starting Rate</p>
            <p className="font-display font-bold text-xl sm:text-2xl text-[var(--apple-text)] mt-1">₱400 / hr</p>
            <p className="text-[11px] text-[var(--apple-subtext)] mt-0.5">PHP standard rates</p>
          </div>
          <div className="p-4 rounded-2xl bg-[var(--apple-card)] border border-[var(--apple-border)] shadow-xs">
            <p className="text-[10px] text-[var(--apple-subtext)] font-semibold uppercase tracking-wider">Status</p>
            <p className="font-display font-bold text-xl sm:text-2xl text-emerald-600 dark:text-emerald-400 mt-1">Available</p>
            <p className="text-[11px] text-[var(--apple-subtext)] mt-0.5">Instant booking confirmation</p>
          </div>
        </div>

        {/* Apple Calendar Date Strip */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-[var(--apple-subtext)] uppercase tracking-wider">
              Select Date
            </p>
            <span className="text-xs text-[var(--apple-subtext)]">
              {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {dates.map((d) => {
              const dateStr = format(d, 'yyyy-MM-dd')
              const isSelected = dateStr === selectedDate
              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`flex-shrink-0 px-4 py-2.5 rounded-2xl border text-xs transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--apple-pill-bg)] text-[var(--apple-pill-text)] border-[var(--apple-pill-bg)] font-semibold shadow-sm'
                      : 'bg-[var(--apple-card)] border-[var(--apple-border)] text-[var(--apple-subtext)] hover:text-[var(--apple-text)] hover:bg-[var(--apple-elevated)]'
                  }`}
                >
                  <div className={`uppercase tracking-wider text-[10px] ${isSelected ? 'opacity-80' : 'text-[var(--apple-muted)]'}`}>
                    {format(d, 'EEE')}
                  </div>
                  <div className="text-sm font-semibold mt-0.5">{format(d, 'MMM d')}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Timeline Gantt */}
        <div>
          <MultiCourtGantt
            courts={courts}
            bookings={bookings}
            selectedDate={selectedDate}
            onSlotClick={(courtId, hour) => {
              router.push(`/book?court=${encodeURIComponent(courtId)}&hour=${hour}&date=${encodeURIComponent(selectedDate)}`)
            }}
          />
        </div>

        {/* Court Information Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {courts.map((court) => (
            <div
              key={court.id}
              className="p-5 rounded-3xl bg-[var(--apple-card)] border border-[var(--apple-border)] flex flex-col justify-between space-y-3 shadow-xs hover:border-black/20 dark:hover:border-white/20 transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: court.color_hex }}
                    />
                    <h3 className="font-semibold text-base text-[var(--apple-text)]">{court.name}</h3>
                  </div>
                  <span className="text-xs font-bold text-[var(--apple-text)]">
                    {formatCurrency(court.hourly_rate)}/hr
                  </span>
                </div>
                <p className="text-xs text-[var(--apple-subtext)] leading-relaxed">{court.description}</p>
              </div>

              <div className="pt-3 border-t border-[var(--apple-border)] flex items-center justify-between text-[11px] text-[var(--apple-subtext)]">
                <span className="capitalize">{court.surface_type} surface</span>
                <span className="font-medium text-[var(--apple-text)]">{court.is_indoor ? 'Indoor Pro' : 'Outdoor'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  )
}
