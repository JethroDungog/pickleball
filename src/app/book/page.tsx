'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addDays, parseISO, isToday } from 'date-fns'
import { Map, AlignLeft, ChevronLeft, Loader2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

import { createClient } from '@/lib/supabase/client'
import { createBooking } from '@/actions/bookings'
import { cn, formatHour, formatCurrency, getSlotStatus } from '@/lib/utils'
import type { Court, Booking, BookingDraft } from '@/types'

import CourtSelectorCards from '@/components/CourtSelectorCards'
import CourtMapPicker from '@/components/CourtMapPicker'
import TimeSlotPicker from '@/components/TimeSlotPicker'
import ReservationDock from '@/components/ReservationDock'
import MultiCourtGantt from '@/components/MultiCourtGantt'
import Footer from '@/components/Footer'
import BookingSuccessOverlay from './BookingSuccessOverlay'

// ── Constants ─────────────────────────────────────────────────────────────────

const DATE_STRIP_DAYS = 14

const FALLBACK_COURTS: Court[] = [
  {
    id: '1fa9e1ab-9429-435e-bbbf-d48286090345',
    name: 'Court 1',
    description: 'Championship hard court with tournament-grade lighting',
    surface_type: 'hard',
    is_indoor: false,
    hourly_rate: 400, // PHP 400/hr
    is_active: true,
    color_hex: '#22c55e',
    created_at: new Date().toISOString(),
  },
  {
    id: 'a3a01fcd-a8fd-4264-876a-cdcfb59c05f6',
    name: 'Court 2',
    description: 'Tournament grade synthetic court with shock absorption',
    surface_type: 'synthetic',
    is_indoor: false,
    hourly_rate: 400, // PHP 400/hr
    is_active: true,
    color_hex: '#3b82f6',
    created_at: new Date().toISOString(),
  },
  {
    id: '7eba227a-fe3b-4a34-8140-451aa178e73b',
    name: 'Court 3',
    description: 'Indoor climate-controlled pro synthetic court',
    surface_type: 'synthetic',
    is_indoor: true,
    hourly_rate: 550, // PHP 550/hr
    is_active: true,
    color_hex: '#f59e0b',
    created_at: new Date().toISOString(),
  },
  {
    id: '95142fde-40d5-40df-a29c-8ad0b24922a6',
    name: 'Court 4',
    description: 'Indoor stadium arena with broadcast lighting',
    surface_type: 'hard',
    is_indoor: true,
    hourly_rate: 550, // PHP 550/hr
    is_active: true,
    color_hex: '#ef4444',
    created_at: new Date().toISOString(),
  },
]

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BookPage() {
  const router = useRouter()

  // ── State ──────────────────────────────────────────────────────────────────
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(FALLBACK_COURTS[0].id)
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [selectedStartHour, setSelectedStartHour] = useState<number | null>(null)
  const [selectedEndHour, setSelectedEndHour] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'map' | 'timeline'>('map')
  const [courts, setCourts] = useState<Court[]>(FALLBACK_COURTS)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isBooking, setIsBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState<{
    booking: Booking
    court: Court
  } | null>(null)
  const [loadingCourts, setLoadingCourts] = useState(false)
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
      try {
        const { data, error } = await supabase
          .from('courts')
          .select('*')
          .eq('is_active', true)
          .order('name')

        if (!error && data && data.length > 0) {
          setCourts(data as Court[])
          setSelectedCourtId((prev) => (prev && data.some((c) => c.id === prev) ? prev : data[0].id))
        }
      } catch (err) {
        // Fallback courts remain active
      }
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

  // ── Select time range handler ──────────────────────────────────────────────
  const handleSelectRange = useCallback((startHour: number, endHour: number) => {
    setSelectedStartHour(startHour)
    setSelectedEndHour(endHour)
  }, [])

  const handleClearTime = useCallback(() => {
    setSelectedStartHour(null)
    setSelectedEndHour(null)
  }, [])

  // ── Gantt slot click ───────────────────────────────────────────────────────
  const handleGanttSlotClick = useCallback(
    (courtId: string, hour: number) => {
      setSelectedCourtId(courtId)
      handleSelectRange(hour, Math.min(24, hour + 1))
    },
    [handleSelectRange],
  )

  // ── Draft computation ──────────────────────────────────────────────────────
  const selectedCourt = useMemo(
    () => courts.find((c) => c.id === selectedCourtId) ?? courts[0] ?? null,
    [courts, selectedCourtId]
  )
  const draft: BookingDraft | null = useMemo(() => {
    if (!selectedCourtId || selectedStartHour === null || selectedEndHour === null || !selectedCourt) {
      return null
    }
    return {
      courtId: selectedCourtId,
      courtName: selectedCourt.name,
      courtColor: selectedCourt.color_hex,
      date: selectedDate,
      startHour: selectedStartHour,
      endHour: selectedEndHour,
      hourlyRate: selectedCourt.hourly_rate,
      totalPrice: selectedCourt.hourly_rate * (selectedEndHour - selectedStartHour),
    }
  }, [selectedCourtId, selectedStartHour, selectedEndHour, selectedCourt, selectedDate])

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
        if (result.error === 'Authentication required') {
          toast.error('Please sign in to complete your reservation')
          router.push(`/auth/login?redirectTo=${encodeURIComponent('/book')}`)
          return
        }
        toast.error(result.error ?? 'Booking failed')
        return
      }

      // Re-fetch bookings to reflect new state
      try {
        const { data } = await supabase
          .from('bookings')
          .select('*, court:courts(*), profile:profiles(full_name, avatar_url)')
          .eq('booking_date', selectedDate)
          .neq('status', 'cancelled')
        if (data) setBookings(data as Booking[])
      } catch {}

      // Show success overlay safely
      if (result.booking && selectedCourt) {
        setBookingSuccess({ booking: result.booking, court: selectedCourt })
      } else {
        toast.success('Court reserved successfully!')
      }

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
  }, [draft, notes, selectedDate, selectedCourt, supabase, router])

  // ── Success overlay close ──────────────────────────────────────────────────
  const handleCloseSuccess = useCallback(() => {
    setBookingSuccess(null)
    setSelectedCourtId(FALLBACK_COURTS[0].id)
    setSelectedStartHour(null)
    setSelectedEndHour(null)
  }, [])

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main
      className="min-h-screen pt-20 sm:pt-24 bg-[var(--apple-bg)] text-[var(--apple-text)] flex flex-col justify-between transition-colors"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <div>
        {/* ── Page Header ── */}
        <div className="border-b border-[var(--apple-border)] px-4 sm:px-6 lg:px-8 py-5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1
                className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--apple-text)]"
                style={{ fontFamily: 'Syne, sans-serif' }}
              >
                Book a Court
              </h1>
              <p className="text-[var(--apple-subtext)] text-xs sm:text-sm mt-1">
                Open 24/7 · 4 Championship Courts · Rates in Philippine Peso (PHP ₱)
              </p>
            </div>

            {/* View toggle */}
            <ViewToggle viewMode={viewMode} onChange={setViewMode} />
          </div>
        </div>

        {/* ── Date Strip (Horizontal scroll on mobile) ── */}
        <DateStrip
          dates={dateOptions}
          selectedDate={selectedDate}
          onSelect={(d) => {
            setSelectedDate(d)
            setSelectedStartHour(null)
            setSelectedEndHour(null)
          }}
        />

        {/* ── Main Responsive Grid ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">

            {/* ── Left Column (lg:col-span-8, min-w-0 for guaranteed zero-overflow) ── */}
            <div className="lg:col-span-8 min-w-0 w-full space-y-7">
              {loadingCourts ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-6 h-6 animate-spin text-[#39ff14]" />
                </div>
              ) : courts.length === 0 ? (
                <EmptyState message="No courts available right now." />
              ) : viewMode === 'map' ? (
                <>
                  {/* 1. Tactile Court Selection Cards (100% Touch & Clickable) */}
                  <CourtSelectorCards
                    courts={courts}
                    selectedCourtId={selectedCourtId}
                    onSelectCourt={(id) => {
                      setSelectedCourtId(id)
                      setSelectedStartHour(null)
                      setSelectedEndHour(null)
                    }}
                    bookings={bookings}
                    selectedDate={selectedDate}
                  />

                  {/* 2. Visual 2D Court Map */}
                  <div className="space-y-2">
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
                  </div>

                  {/* 3. Friendly 24-Hour Time Slot Picker (8-9, 9-10, 10-11, etc.) */}
                  {selectedCourt && (
                    <motion.div
                      key={selectedCourt.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-5 sm:p-6 rounded-3xl border border-[var(--apple-border)] bg-[var(--apple-card)] shadow-sm"
                    >
                      <TimeSlotPicker
                        court={selectedCourt}
                        bookings={bookings}
                        selectedDate={selectedDate}
                        selectedStartHour={selectedStartHour}
                        selectedEndHour={selectedEndHour}
                        onSelectRange={handleSelectRange}
                        onClear={handleClearTime}
                      />
                    </motion.div>
                  )}
                </>
              ) : (
                /* 4. Gantt Timeline View with strict min-w-0 */
                <div className="space-y-4">
                  {/* Court quick tabs in timeline view */}
                  <CourtSelectorCards
                    courts={courts}
                    selectedCourtId={selectedCourtId}
                    onSelectCourt={(id) => {
                      setSelectedCourtId(id)
                      setSelectedStartHour(null)
                      setSelectedEndHour(null)
                    }}
                    bookings={bookings}
                    selectedDate={selectedDate}
                  />

                  <MultiCourtGantt
                    courts={courts}
                    bookings={bookings}
                    selectedDate={selectedDate}
                    onSlotClick={handleGanttSlotClick}
                    isAdmin={false}
                  />
                </div>
              )}
            </div>

            {/* ── Right Column (lg:col-span-4, min-w-0, Sticky Booking Summary) ── */}
            <div className="lg:col-span-4 min-w-0 w-full">
              <div className="sticky top-24">
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

          </div>
        </div>

        {/* Floating Reservation Dock (Bottom Bar for Quick Mobile Reservation) */}
        <AnimatePresence>
          {draft && (
            <ReservationDock
              draft={draft}
              onConfirm={handleConfirmBooking}
              onClear={handleClearTime}
              isLoading={isBooking}
            />
          )}
        </AnimatePresence>

        {/* Success Confetti & Ticket Modal */}
        <AnimatePresence>
          {bookingSuccess && (
            <BookingSuccessOverlay
              booking={bookingSuccess.booking}
              court={bookingSuccess.court}
              onClose={handleCloseSuccess}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Global Footer with Discrete Staff Access */}
      <Footer />
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
    <div className="border-b border-[var(--apple-border)] px-4 sm:px-6 lg:px-8 py-3 bg-[var(--apple-bg)] transition-colors">
      <div className="max-w-7xl mx-auto flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {dates.map((date) => {
          const dateStr = format(date, 'yyyy-MM-dd')
          const isSelected = dateStr === selectedDate
          const today = isToday(date)

          return (
            <motion.button
              key={dateStr}
              type="button"
              onClick={() => onSelect(dateStr)}
              className={cn(
                'flex-shrink-0 flex flex-col items-center px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all border cursor-pointer min-w-[62px]',
                isSelected
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-black border-black dark:border-white shadow-sm font-semibold'
                  : 'border-[var(--apple-border)] text-[var(--apple-subtext)] hover:text-[var(--apple-text)] bg-[var(--apple-card)] hover:bg-[var(--apple-card-hover)] shadow-sm',
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
            >
              <span className={cn('text-[10px] uppercase tracking-wider', isSelected ? 'opacity-90 font-bold' : 'opacity-60')}>
                {today ? 'Today' : format(date, 'EEE')}
              </span>
              <span className="text-base font-bold leading-tight mt-0.5">{format(date, 'd')}</span>
              <span className={cn('text-[10px]', isSelected ? 'opacity-90 font-medium' : 'opacity-60')}>{format(date, 'MMM')}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

// View Toggle - Apple Segmented Control
function ViewToggle({
  viewMode,
  onChange,
}: {
  viewMode: 'map' | 'timeline'
  onChange: (v: 'map' | 'timeline') => void
}) {
  return (
    <div
      className="flex items-center p-1 rounded-full border border-[var(--apple-border)] bg-black/[0.04] dark:bg-white/[0.04] self-start sm:self-auto"
    >
      {(['map', 'timeline'] as const).map((mode) => {
        const isActive = viewMode === mode
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={cn(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer',
              isActive
                ? 'bg-white dark:bg-white/10 text-black dark:text-white font-semibold shadow-sm'
                : 'text-[var(--apple-subtext)] hover:text-[var(--apple-text)]',
            )}
          >
            {mode === 'map' ? <Map size={12} /> : <AlignLeft size={12} />}
            <span>{mode === 'map' ? 'Court Map' : '24h Timeline'}</span>
          </button>
        )
      })}
    </div>
  )
}

// Booking Summary Panel - Apple Card Pass
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--apple-text)] tracking-tight">
          Booking Summary
        </h2>
        <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-[var(--apple-subtext)] border border-[var(--apple-border)]">
          Philippine Peso (₱)
        </span>
      </div>

      {!hasCourtSelected && (
        <StepHint step={1} text="Choose Court 1, 2, 3, or 4" />
      )}
      {hasCourtSelected && selectedStartHour === null && (
        <StepHint step={2} text="Tap a 24-hour time slot (e.g. 8:00 AM – 9:00 AM)" />
      )}

      <AnimatePresence mode="wait">
        {draft && court ? (
          <motion.div
            key="draft"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Court card */}
            <div className="rounded-3xl p-5 sm:p-6 border border-[var(--apple-border)] bg-[var(--apple-card)] space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-10 rounded-full"
                  style={{ background: court.color_hex }}
                />
                <div>
                  <p className="text-[var(--apple-text)] font-semibold text-base">{court.name}</p>
                  <p className="text-[var(--apple-subtext)] text-xs">
                    {court.surface_type} · {court.is_indoor ? 'Indoor' : 'Outdoor'} ·{' '}
                    {formatCurrency(court.hourly_rate)}/hr
                  </p>
                </div>
              </div>

              <div className="h-px bg-[var(--apple-border)]" />

              <div className="space-y-2.5 text-sm">
                <SummaryRow label="Date" value={format(parseISO(draft.date), 'EEE, MMM d, yyyy')} />
                <SummaryRow
                  label="Time Slot"
                  value={`${formatHour(draft.startHour)} – ${formatHour(draft.endHour)}`}
                />
                <SummaryRow
                  label="Duration"
                  value={`${draft.endHour - draft.startHour} hour${draft.endHour - draft.startHour > 1 ? 's' : ''}`}
                />
                <SummaryRow
                  label="Rate"
                  value={`${formatCurrency(court.hourly_rate)} / hr`}
                />
              </div>

              <div className="h-px bg-[var(--apple-border)]" />

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[var(--apple-subtext)] text-xs block">Total Amount</span>
                  <span className="text-[10px] text-[var(--apple-muted)]">Tax & Lighting included</span>
                </div>
                <span className="text-2xl font-bold text-[var(--apple-text)] tabular-nums tracking-tight">
                  {formatCurrency(draft.totalPrice)}
                </span>
              </div>
            </div>

            {/* Notes input */}
            <div>
              <label className="block text-xs text-[var(--apple-subtext)] mb-1.5 font-medium">
                Special Requests / Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Racket rental, extra balls, coach accompaniment..."
                rows={2}
                className="w-full rounded-2xl px-4 py-3 text-sm text-[var(--apple-text)] placeholder-[var(--apple-muted)] border border-[var(--apple-border)] bg-[var(--apple-card)] outline-none focus:border-black/30 dark:focus:border-white/30 resize-none transition-colors"
              />
            </div>

            {/* Confirm button - Apple clean pill */}
            <button
              type="button"
              onClick={onConfirm}
              disabled={isBooking}
              className="btn-primary w-full !py-3.5 text-sm tracking-normal flex items-center justify-center gap-2 shadow-sm"
            >
              {isBooking ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Confirming Reservation…</span>
                </>
              ) : (
                <span>Confirm Reservation · {formatCurrency(draft.totalPrice)}</span>
              )}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Placeholder state */}
            <div
              className="rounded-3xl border border-dashed border-[var(--apple-border)] p-8 flex flex-col items-center justify-center gap-3 text-center bg-[var(--apple-card)]/40"
              style={{ minHeight: 220 }}
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.05]"
              >
                <ChevronLeft size={20} className="text-[var(--apple-muted)]" />
              </div>
              <p className="text-[var(--apple-subtext)] text-xs sm:text-sm max-w-[200px]">
                Your booking details will appear here once you select a court and time slot.
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
      <span className="text-[var(--apple-subtext)] text-xs">{label}</span>
      <span className="text-[var(--apple-text)] font-semibold text-xs sm:text-sm">{value}</span>
    </div>
  )
}

function StepHint({ step, text, accent }: { step: number; text: string; accent?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 text-xs sm:text-sm p-3 rounded-2xl bg-[var(--apple-card)] border border-[var(--apple-border)] shadow-sm"
    >
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${accent ? 'bg-[#30d158] text-black' : 'bg-black/[0.05] dark:bg-white/10 text-[var(--apple-text)]'
          }`}
      >
        {step}
      </div>
      <span className={accent ? 'text-[#30d158] font-medium' : 'text-[var(--apple-subtext)]'}>{text}</span>
    </motion.div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-3 text-center">
      <AlertCircle size={32} className="text-[var(--apple-muted)]" />
      <p className="text-[var(--apple-subtext)] text-sm">{message}</p>
    </div>
  )
}
