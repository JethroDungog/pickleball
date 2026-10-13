'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import type { Court, Booking } from '@/types'

import WizardProgressBar from './WizardProgressBar'
import Step1Date from './Step1Date'
import Step2Slot from './Step2Slot'
import Step3Details, { GuestDetails } from './Step3Details'
import Step4Confirm, { PaymentSubmission } from './Step4Confirm'
import BookingSuccessOverlay from '@/app/book/BookingSuccessOverlay'

interface BookingWizardProps {
  initialCourts?: Court[]
  initialBookings?: Booking[]
  className?: string
}

export default function BookingWizard({
  initialCourts = [],
  initialBookings = [],
  className = '',
}: BookingWizardProps) {
  // ── Step State ─────────────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  const [direction, setDirection] = useState<1 | -1>(1)

  // ── Wizard Selections ───────────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    format(new Date(), 'yyyy-MM-dd')
  )
  const [selectedCourtId, setSelectedCourtId] = useState<string>(() =>
    initialCourts[0]?.id || ''
  )
  const [selectedStartHour, setSelectedStartHour] = useState<number | null>(null)
  const [selectedEndHour, setSelectedEndHour] = useState<number | null>(null)

  const [guestDetails, setGuestDetails] = useState<GuestDetails>({
    fullName: '',
    phone: '',
    email: '',
    agreedToTerms: false,
  })

  // ── Network State ──────────────────────────────────────────────────────────
  const [courts, setCourts] = useState<Court[]>(initialCourts)
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null)

  console.log('[BookingWizard] Render -> step:', step, 'hasConfirmed:', !!confirmedBooking, 'isSubmitting:', isSubmitting)

  useEffect(() => {
    console.log('[BookingWizard] MOUNTED!')
    return () => console.log('[BookingWizard] UNMOUNTED!')
  }, [])

  // Pre-fill user profile if logged in
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setGuestDetails((prev) => ({
          ...prev,
          fullName:
            prev.fullName ||
            (user.user_metadata?.full_name as string) ||
            (user.user_metadata?.name as string) ||
            '',
          email: prev.email || user.email || '',
          phone: prev.phone || (user.user_metadata?.phone as string) || '',
        }))
      }
    })
  }, [])

  // Fetch courts if not provided
  useEffect(() => {
    if (courts.length > 0) return
    const supabase = createClient()
    supabase
      .from('courts')
      .select('*')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setCourts(data as Court[])
          if (!selectedCourtId) {
            setSelectedCourtId(data[0].id)
          }
        }
      })
  }, [courts.length, selectedCourtId])

  // Fetch live bookings for the selected date
  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch(`/api/bookings?date=${encodeURIComponent(selectedDate)}`, {
        cache: 'no-store',
      })
      if (res.ok) {
        const json = await res.json()
        if (json.bookings) {
          setBookings(json.bookings as Booking[])
          return
        }
      }
    } catch {
      // Fallback to direct client query
    }

    try {
      const supabase = createClient()
      const { data } = await supabase
        .from('bookings')
        .select('*, court:courts(*), profile:profiles(*)')
        .eq('booking_date', selectedDate)
        .neq('status', 'cancelled')

      if (data) {
        setBookings(data as Booking[])
      }
    } catch (err) {
      console.error('[BookingWizard] fetchBookings error:', err)
    }
  }, [selectedDate])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  // Realtime WebSocket subscription for instant row updates
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`wizard_bookings_${selectedDate}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        () => {
          fetchBookings()
        }
      )
      .subscribe()

    // 3-second heartbeat fallback to guarantee sync across all devices & mobile connections
    const interval = setInterval(fetchBookings, 3000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [selectedDate, fetchBookings])

  // Step navigation helpers
  const goToStep = (target: 1 | 2 | 3 | 4) => {
    setDirection(target > step ? 1 : -1)
    setStep(target)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 80, behavior: 'smooth' })
    }
  }

  const selectedCourt = useMemo(() => {
    return courts.find((c) => c.id === selectedCourtId) || courts[0] || null
  }, [courts, selectedCourtId])

  // Step 4 final submission
  const handleComplete = async (payment: PaymentSubmission) => {
    if (!selectedCourt || selectedStartHour === null || selectedEndHour === null) {
      toast.error('Booking information is incomplete')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          court_id: selectedCourt.id,
          booking_date: selectedDate,
          start_hour: selectedStartHour,
          end_hour: selectedEndHour,
          guest_name: guestDetails.fullName,
          guest_phone: guestDetails.phone,
          guest_email: guestDetails.email,
          payment_method: payment.method,
          payment_reference: payment.referenceNumber,
          receipt_screenshot: payment.receiptScreenshot,
          sender_name: payment.senderName,
          addons: {
            ball_machine: payment.addOns.ballMachineHours,
            paddles: payment.addOns.paddleCount,
          },
        }),
      })

      const res = await response.json()
      console.log('[BookingWizard] handleComplete received res:', res)

      if (!response.ok || !res.success || !res.booking) {
        toast.error(res.error || 'Failed to complete booking')
        if (res.error?.includes('already reserved') || res.error?.includes('booked')) {
          // Send back to Step 2 to pick another slot
          goToStep(2)
          fetchBookings()
        }
        return
      }

      toast.success('Court booking confirmed!')
      setConfirmedBooking(res.booking)
      fetchBookings()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Animation variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -40 : 40,
      opacity: 0,
      transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
    }),
  }

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* 4-Step Progress Bar Header */}
      <div className="mb-8">
        <WizardProgressBar currentStep={step} onStepClick={goToStep} />
      </div>

      {/* Dynamic Step Content */}
      <div className="relative min-h-[500px]">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <Step1Date
                selectedDate={selectedDate}
                onSelectDate={(d) => setSelectedDate(d)}
                onContinue={() => goToStep(2)}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <Step2Slot
                courts={courts}
                bookings={bookings}
                selectedDate={selectedDate}
                selectedCourtId={selectedCourtId}
                selectedStartHour={selectedStartHour}
                selectedEndHour={selectedEndHour}
                onSelectSlot={(cId, sHour, eHour) => {
                  setSelectedCourtId(cId)
                  setSelectedStartHour(sHour)
                  setSelectedEndHour(eHour)
                }}
                onBack={() => goToStep(1)}
                onContinue={() => goToStep(3)}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <Step3Details
                details={guestDetails}
                onChange={(d) => setGuestDetails(d)}
                onBack={() => goToStep(2)}
                onContinue={() => goToStep(4)}
              />
            </motion.div>
          )}

          {step === 4 && selectedCourt && selectedStartHour !== null && selectedEndHour !== null && (
            <motion.div
              key="step4"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <Step4Confirm
                court={selectedCourt}
                date={selectedDate}
                startHour={selectedStartHour}
                endHour={selectedEndHour}
                guestDetails={guestDetails}
                onBack={() => goToStep(3)}
                onComplete={handleComplete}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmed Booking Success Modal with Confetti & Digital Ticket */}
      {confirmedBooking && selectedCourt && (
        <BookingSuccessOverlay
          booking={confirmedBooking}
          court={selectedCourt}
          onClose={() => {
            console.log('[BookingWizard] onClose CALLED!', new Error().stack)
            setConfirmedBooking(null)
            // Reset to step 1 for new booking
            setStep(1)
            setSelectedStartHour(null)
            setSelectedEndHour(null)
          }}
        />
      )}
    </div>
  )
}
