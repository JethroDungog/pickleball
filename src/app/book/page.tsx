'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addDays, parseISO, isToday } from 'date-fns'
import { Map, AlignLeft, ChevronLeft, Loader2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

import { createClient } from '@/lib/supabase/client'
import { createBooking } from '@/actions/bookings'
import { cn, formatHour, formatCurrency, getSlotStatus } from '@/lib/utils'
import type { Court, Booking, BookingDraft } from '@/types'

import CourtMapPicker from '@/components/CourtMapPicker'
import BookingTimeline from '@/components/BookingTimeline'
import ReservationDock from '@/components/ReservationDock'
import MultiCourtGantt from '@/components/MultiCourtGantt'
import BookingSuccessOverlay from './BookingSuccessOverlay'

// ── Constants ─────────────────────────────────────────────────────────────────

const DATE_STRIP_DAYS = 14

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BookPage() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [selectedStartHour, setSelectedStartHour] = useState<number | null>(null)
  const [selectedEndHour, setSelectedEndHour] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'map' | 'timeline'>('map')
  const [courts, setCourts] = useState<Court[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isBooking, setIsBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState<{
    booking: Booking
    court: Court
  } | null>(null)
  const [loadingCourts, setLoadingCourts] = useState(true)
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [notes, setNotes] = useState('')

  // ── Supabase client ────────────────────────────────────────────────────────
  const supabase = createClient()

  // ── Date strip ────────────────────────────────────────────────────────────
  const dateOptions = Array.from({ length: DATE_STRIP_DAYS }, (_, i) =>
    addDays(new Date(), i),
  )

  // ── Fetch courts on mount ──────────────────────────────────────────────────
  useEffect(() => {
    async function fetchCourts() {
      setLoadingCourts(true)
      const { data, error } = await supabase
        .from('courts')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        toast.error('Failed to load courts')
        console.error('[BookPage] fetchCourts:', error)
      } else {
        setCourts(data as Court[])
      }
      setLoadingCourts(false)
    }
    fetchCourts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Fetch bookings when date changes ───────────────────────────────────────
  useEffect(() => {
    async function fetchBookings() {
      setLoadingBookings(true)
      const { data, error } = await supabase
        .from('bookings')
        .select('*, court:courts(*), profile:profiles(full_name, avatar_url)')
        .eq('booking_date', selectedDate)
        .neq('status', 'cancelled')

      if (error) {
        console.error('[BookPage] fetchBookings:', error)
      } else {
        setBookings((data ?? []) as Booking[])
      }
      setLoadingBookings(false)
    }
    fetchBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])

  // ── Time selection logic ───────────────────────────────────────────────────
  const handleHourClick = useCallback(
    (hour: number, courtId?: string) => {
      // If a court is passed (from Gantt), select it first
      if (courtId && courtId !== selectedCourtId) {
        setSelectedCourtId(courtId)
        setSelectedStartHour(hour)
        setSelectedEndHour(null)
        return
      }

      if (selectedStartHour === null) {
        // First click: set start
        setSelectedStartHour(hour)
        setSelectedEndHour(null)
      } else if (selectedEndHour === null) {
        // Second click: set end (validate)
        if (hour <= selectedStartHour) {
          toast.error('End time must be after start time')
          return
        }
        if (hour - selectedStartHour > 4) {
          toast.error('Maximum booking is 4 hours')
          return
        }
        // Check for conflicts
        if (selectedCourtId) {
          for (let h = selectedStartHour; h < hour; h++) {
            const status = getSlotStatus(bookings, selectedCourtId, selectedDate, h)
            if (status !== 'available') {
              toast.error('Selected range includes an unavailable slot')
              return
            }
          }
        }
        setSelectedEndHour(hour)
      } else {
        // Third click: reset
        setSelectedStartHour(hour)
        setSelectedEndHour(null)
      }
    },
    [selectedStartHour, selectedEndHour, selectedCourtId, bookings, selectedDate],
  )

  // ── Gantt slot click ───────────────────────────────────────────────────────
  const handleGanttSlotClick = useCallback(
    (courtId: string, hour: number) => {
      if (courtId !== selectedCourtId) {
        setSelectedCourtId(courtId)
        setSelectedStartHour(hour)
        setSelectedEndHour(null)
      } else {
        handleHourClick(hour)
      }
    },
    [selectedCourtId, handleHourClick],
  )

  // ── Draft computation ──────────────────────────────────────────────────────
  const selectedCourt = courts.find((c) => c.id === selectedCourtId) ?? null
  const draft: BookingDraft | null =
    selectedCourtId && selectedStartHour !== null && selectedEndHour !== null && selectedCourt
      ? {
          courtId: selectedCourtId,
          courtName: selectedCourt.name,
          courtColor: selectedCourt.color_hex,
          date: selectedDate,
          startHour: selectedStartHour,
          endHour: selectedEndHour,
          hourlyRate: selectedCourt.hourly_rate,
          totalPrice: selectedCourt.hourly_rate * (selectedEndHour - selectedStartHour),
        }
      : null

  // ── Booking submission ─────────────────────────────────────────────────────
  const handleConfirmBooking = useCallback(async () => {
    if (!draft) return
    setIsBooking(true)

    try {
      const result = await createBooking({
        court_id: draft.courtId,
        booking_date: draft.date,
        start_hour: draft.startHour,
        end_hour: draft.endHour,
        notes: notes.trim() || undefined,
      })

      if (!result.success) {
        toast.error(result.error ?? 'Booking failed')
        return
      }

      // Re-fetch bookings to reflect new state
      const { data } = await supabase
        .from('bookings')
        .select('*, court:courts(*), profile:profiles(full_name, avatar_url)')
        .eq('booking_date', selectedDate)
        .neq('status', 'cancelled')
      setBookings((data ?? []) as Booking[])

      // Show success overlay
      setBookingSuccess({ booking: result.booking!, court: selectedCourt! })

      // Reset selection
      setSelectedStartHour(null)
      setSelectedEndHour(null)
      setNotes('')
    } catch (err) {
      console.error('[BookPage] handleConfirmBooking:', err)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsBooking(false)
    }
  }, [draft, notes, selectedDate, selectedCourt, supabase])

  // ── Success overlay close ──────────────────────────────────────────────────
  const handleCloseSuccess = useCallback(() => {
    setBookingSuccess(null)
    setSelectedCourtId(null)
    setSelectedStartHour(null)
    setSelectedEndHour(null)
  }, [])

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main
      className="min-h-screen"
      style={{ background: '#0d0d0d', fontFamily: 'Inter, sans-serif' }}
    >
      {/* ── Page header ── */}
      <div className="border-b border-white/10 px-6 py-5 flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight text-white"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Book a Court
          </h1>
          <p className="text-white/40 text-sm mt-0.5">
            Select a date, court, and time to reserve your session
          </p>
        </div>

        {/* View toggle */}
        <ViewToggle viewMode={viewMode} onChange={setViewMode} />
      </div>

      {/* ── Date Strip ── */}
      <DateStrip
        dates={dateOptions}
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
      />

      {/* ── Main content ── */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-180px)]">
        {/* Left Panel — 60% */}
        <div className="flex-[3] border-r border-white/10 p-6 space-y-6">
          {loadingCourts ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-6 h-6 animate-spin text-[#39ff14]" />
            </div>
          ) : courts.length === 0 ? (
            <EmptyState message="No courts available right now." />
          ) : viewMode === 'map' ? (
            <>
              {/* Court Map Picker */}
              <CourtMapPicker
                courts={courts}
                bookings={bookings}
                selectedDate={selectedDate}
                selectedCourtId={selectedCourtId}
                onSelectCourt={(id) => {
                  setSelectedCourtId(id)
                  setSelectedStartHour(null)
                  setSelectedEndHour(null)
                }}
              />

              {/* Per-court timeline (shown when a court is selected) */}
              <AnimatePresence>
                {selectedCourt && (
                  <motion.div
                    key={selectedCourt.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 16 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: selectedCourt.color_hex }}
                      />
                      <h3 className="text-sm font-semibold text-white/70">
                        {selectedCourt.name} — Time Selection
                      </h3>
                    </div>
                    <BookingTimeline
                      court={selectedCourt}
                      bookings={bookings.filter((b) => b.court_id === selectedCourt.id)}
                      selectedDate={selectedDate}
                      selectedStartHour={selectedStartHour}
                      selectedEndHour={selectedEndHour}
                      onSlotClick={handleHourClick}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            /* Gantt / Timeline view */
            <MultiCourtGantt
              courts={courts}
              bookings={bookings}
              selectedDate={selectedDate}
              onSlotClick={handleGanttSlotClick}
              isAdmin={false}
            />
          )}
        </div>

        {/* Right Panel — 40%: Booking Summary */}
        <div className="flex-[2] p-6 space-y-6">
          <BookingSummaryPanel
            draft={draft}
            court={selectedCourt}
            notes={notes}
            onNotesChange={setNotes}
            onConfirm={handleConfirmBooking}
            isBooking={isBooking}
            selectedStartHour={selectedStartHour}
            selectedEndHour={selectedEndHour}
            hasCourtSelected={!!selectedCourtId}
          />
        </div>
      </div>

      {/* Reservation Dock — slides up when draft exists */}
      <AnimatePresence>
        {draft && (
          <ReservationDock
            draft={draft}
            onConfirm={handleConfirmBooking}
            onClear={() => {
              setSelectedStartHour(null)
              setSelectedEndHour(null)
            }}
            isLoading={isBooking}
          />
        )}
      </AnimatePresence>

      {/* Success Overlay */}
      <AnimatePresence>
        {bookingSuccess && (
          <BookingSuccessOverlay
            booking={bookingSuccess.booking}
            court={bookingSuccess.court}
            onClose={handleCloseSuccess}
          />
        )}
      </AnimatePresence>
    </main>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

// Date Strip
function DateStrip({
  dates,
  selectedDate,
  onSelect,
}: {
  dates: Date[]
  selectedDate: string
  onSelect: (date: string) => void
}) {
  return (
    <div className="border-b border-white/10 px-6 py-3">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {dates.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd')
          const isSelected = dateStr === selectedDate
          const today = isToday(date)

          return (
            <motion.button
              key={dateStr}
              onClick={() => onSelect(dateStr)}
              className={cn(
                'flex-shrink-0 flex flex-col items-center px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border',
                isSelected
                  ? 'border-transparent text-[#0d0d0d]'
                  : 'border-white/10 text-white/50 hover:border-white/30 hover:text-white',
              )}
              style={isSelected ? { background: '#39ff14' } : {}}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              <span className="text-[10px] uppercase tracking-wider opacity-70">
                {today ? 'Today' : format(date, 'EEE')}
              </span>
              <span className="text-base font-bold leading-tight">{format(date, 'd')}</span>
              <span className="text-[10px] opacity-70">{format(date, 'MMM')}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// View Toggle
function ViewToggle({
  viewMode,
  onChange,
}: {
  viewMode: 'map' | 'timeline'
  onChange: (v: 'map' | 'timeline') => void
}) {
  return (
    <div
      className="flex items-center gap-1 p-1 rounded-xl border border-white/10"
      style={{ background: '#1a1a1a' }}
    >
      {(['map', 'timeline'] as const).map((mode) => {
        const isActive = viewMode === mode
        return (
          <motion.button
            key={mode}
            onClick={() => onChange(mode)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
              isActive ? 'text-[#0d0d0d]' : 'text-white/40 hover:text-white/70',
            )}
            style={isActive ? { background: '#39ff14' } : {}}
            whileTap={{ scale: 0.95 }}
          >
            {mode === 'map' ? <Map size={13} /> : <AlignLeft size={13} />}
            {mode === 'map' ? 'Court Map' : 'Timeline'}
          </motion.button>
        )
      })}
    </div>
  )
}

// Booking Summary Panel
interface BookingSummaryPanelProps {
  draft: BookingDraft | null
  court: Court | null
  notes: string
  onNotesChange: (v: string) => void
  onConfirm: () => void
  isBooking: boolean
  selectedStartHour: number | null
  selectedEndHour: number | null
  hasCourtSelected: boolean
}

function BookingSummaryPanel({
  draft,
  court,
  notes,
  onNotesChange,
  onConfirm,
  isBooking,
  selectedStartHour,
  selectedEndHour,
  hasCourtSelected,
}: BookingSummaryPanelProps) {
  return (
    <div className="sticky top-6 space-y-4">
      <h2
        className="text-lg font-bold text-white tracking-tight"
        style={{ fontFamily: 'Syne, sans-serif' }}
      >
        Booking Summary
      </h2>

      {!hasCourtSelected && (
        <StepHint step={1} text="Select a court from the map" />
      )}
      {hasCourtSelected && selectedStartHour === null && (
        <StepHint step={2} text="Click a time slot to set your start time" />
      )}
      {hasCourtSelected && selectedStartHour !== null && selectedEndHour === null && (
        <StepHint
          step={3}
          text={`Start: ${formatHour(selectedStartHour)} — now click an end time`}
          accent
        />
      )}

      <AnimatePresence mode="wait">
        {draft && court ? (
          <motion.div
            key="draft"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            {/* Court card */}
            <div
              className="rounded-2xl p-5 border border-white/10 space-y-3"
              style={{ background: '#111' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-10 rounded-full"
                  style={{ background: court.color_hex }}
                />
                <div>
                  <p className="text-white font-semibold">{court.name}</p>
                  <p className="text-white/40 text-xs">
                    {court.surface_type} · {court.is_indoor ? 'Indoor' : 'Outdoor'} ·{' '}
                    {formatCurrency(court.hourly_rate)}/hr
                  </p>
                </div>
              </div>

              <div className="h-px bg-white/10" />

              <div className="space-y-2 text-sm">
                <SummaryRow label="Date" value={format(parseISO(draft.date), 'EEE, MMM d, yyyy')} />
                <SummaryRow
                  label="Time"
                  value={`${formatHour(draft.startHour)} – ${formatHour(draft.endHour)}`}
                />
                <SummaryRow
                  label="Duration"
                  value={`${draft.endHour - draft.startHour} hour${draft.endHour - draft.startHour > 1 ? 's' : ''}`}
                />
              </div>

              <div className="h-px bg-white/10" />

              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm">Total</span>
                <span
                  className="text-2xl font-bold"
                  style={{ fontFamily: 'Syne, sans-serif', color: '#39ff14' }}
                >
                  {formatCurrency(draft.totalPrice)}
                </span>
              </div>
            </div>

            {/* Notes input */}
            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium tracking-wide uppercase">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Any special requests..."
                rows={3}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 border border-white/10 outline-none focus:border-[#39ff14]/50 resize-none transition-colors"
                style={{ background: '#111' }}
              />
            </div>

            {/* Confirm button */}
            <motion.button
              onClick={onConfirm}
              disabled={isBooking}
              className="w-full py-4 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              style={{ background: '#39ff14', color: '#0d0d0d' }}
              whileHover={{ scale: 1.01, boxShadow: '0 0 24px rgba(57,255,20,0.4)' }}
              whileTap={{ scale: 0.99 }}
            >
              {isBooking ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Confirming…
                </>
              ) : (
                'Confirm Booking'
              )}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Placeholder skeleton */}
            <div
              className="rounded-2xl border border-dashed border-white/10 p-8 flex flex-col items-center justify-center gap-3 text-center"
              style={{ minHeight: 220 }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: '#1a1a1a' }}
              >
                <ChevronLeft size={20} className="text-white/20" />
              </div>
              <p className="text-white/30 text-sm max-w-[180px]">
                Your booking details will appear here once you&apos;ve made a selection.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/40">{label}</span>
      <span className="text-white font-medium">{value}</span>
    </div>
  )
}

function StepHint({ step, text, accent }: { step: number; text: string; accent?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 text-sm"
    >
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{ background: accent ? '#39ff14' : '#1a1a1a', color: accent ? '#0d0d0d' : '#fff' }}
      >
        {step}
      </div>
      <span style={{ color: accent ? '#39ff14' : 'rgba(255,255,255,0.4)' }}>{text}</span>
    </motion.div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
      <AlertCircle size={32} className="text-white/20" />
      <p className="text-white/40 text-sm">{message}</p>
    </div>
  )
}
