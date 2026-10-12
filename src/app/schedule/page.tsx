'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { format, addDays } from 'date-fns'
import { ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import MultiCourtGantt from '@/components/MultiCourtGantt'
import Footer from '@/components/Footer'
import type { Court, Booking } from '@/types'

const FALLBACK_COURTS: Court[] = [
  {
    id: 'court-1-default',
    name: 'Court 1',
    description: 'Championship hard court with high-visibility lines',
    surface_type: 'hard',
    is_indoor: false,
    hourly_rate: 400,
    is_active: true,
    color_hex: '#30d158',
    created_at: '',
  },
  {
    id: 'court-2-default',
    name: 'Court 2',
    description: 'Tournament grade synthetic court with shock absorption',
    surface_type: 'synthetic',
    is_indoor: false,
    hourly_rate: 400,
    is_active: true,
    color_hex: '#0a84ff',
    created_at: '',
  },
  {
    id: 'court-3-default',
    name: 'Court 3',
    description: 'Indoor climate-controlled pro synthetic court',
    surface_type: 'synthetic',
    is_indoor: true,
    hourly_rate: 550,
    is_active: true,
    color_hex: '#ff9f0a',
    created_at: '',
  },
  {
    id: 'court-4-default',
    name: 'Court 4',
    description: 'Indoor stadium court with professional tournament lighting',
    surface_type: 'hard',
    is_indoor: true,
    hourly_rate: 550,
    is_active: true,
    color_hex: '#ff453a',
    created_at: '',
  },
]

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [courts, setCourts] = useState<Court[]>(FALLBACK_COURTS)
  const [bookings, setBookings] = useState<Booking[]>([])

  const supabase = createClient()
  const dates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i))

  useEffect(() => {
    async function loadData() {
      try {
        const [courtsRes, bookingsRes] = await Promise.all([
          supabase.from('courts').select('*').eq('is_active', true).order('name'),
          supabase
            .from('bookings')
            .select('*, court:courts(*), profile:profiles(full_name, avatar_url)')
            .eq('booking_date', selectedDate)
            .neq('status', 'cancelled'),
        ])
        if (courtsRes.data && courtsRes.data.length > 0) {
          setCourts(courtsRes.data as Court[])
        }
        if (bookingsRes.data) {
          setBookings(bookingsRes.data as Booking[])
        }
      } catch {
        // Fallback courts remain active
      }
    }
    loadData()
  }, [selectedDate, supabase])

  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-16 font-body antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs font-medium text-white/70 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#30d158]" />
              <span>Live Facility Timeline</span>
            </div>
            <h1 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
              Court Availability Schedule
            </h1>
            <p className="text-sm text-white/50 mt-1">
              Real-time schedule for all 4 championship courts. Updated 24/7.
            </p>
          </div>
          <Link href="/book">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black font-semibold text-xs tracking-wide hover:bg-neutral-200 transition-all shadow-sm active:scale-95"
            >
              <span>Book a Court</span>
              <ChevronRight size={14} strokeWidth={2.5} />
            </button>
          </Link>
        </div>

        {/* Apple Calendar Date Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {dates.map((d) => {
            const dateStr = format(d, 'yyyy-MM-dd')
            const isSelected = dateStr === selectedDate
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-2xl border text-xs transition-all ${
                  isSelected
                    ? 'bg-white text-black border-white font-semibold shadow-sm'
                    : 'bg-[#1c1c1e] border-white/[0.08] text-white/70 hover:text-white hover:bg-[#2c2c2e]'
                }`}
              >
                <div className={`uppercase tracking-wider text-[10px] ${isSelected ? 'text-black/60 font-semibold' : 'text-white/40'}`}>
                  {format(d, 'EEE')}
                </div>
                <div className="text-sm font-semibold">{format(d, 'MMM d')}</div>
              </button>
            )
          })}
        </div>

        {/* Timeline Gantt */}
        <div>
          <MultiCourtGantt
            courts={courts}
            bookings={bookings}
            selectedDate={selectedDate}
          />
        </div>

        {/* Court Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {courts.map((court) => (
            <div
              key={court.id}
              className="p-5 rounded-3xl bg-[#1c1c1e] border border-white/[0.08] space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: court.color_hex }}
                  />
                  <h3 className="font-semibold text-base text-white">{court.name}</h3>
                </div>
                <span className="text-xs font-semibold text-white">
                  {formatCurrency(court.hourly_rate)}/hr
                </span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">{court.description}</p>
              <div className="flex items-center justify-between text-[11px] text-white/40 pt-2 border-t border-white/[0.06]">
                <span className="capitalize">{court.surface_type} surface</span>
                <span>{court.is_indoor ? 'Indoor' : 'Outdoor'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  )
}
