'use client'

import { useState, useEffect } from 'react'
import {
  ChevronLeft,
  CheckCircle2,
  Clock,
  QrCode,
  CreditCard,
  Upload,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  FileText,
  Sparkles,
} from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { cn, formatHour, formatCurrency } from '@/lib/utils'
import type { Court } from '@/types'
import type { GuestDetails } from './Step3Details'

export interface PaymentSubmission {
  method: 'qr_code' | 'paymongo'
  referenceNumber: string
  receiptScreenshot?: string
  senderName?: string
  addOns: {
    ballMachineHours: number
    paddleCount: number
  }
}

interface Step4ConfirmProps {
  court: Court
  date: string
  startHour: number
  endHour: number
  guestDetails: GuestDetails
  onBack: () => void
  onComplete: (payment: PaymentSubmission) => Promise<void>
  isSubmitting: boolean
}

export default function Step4Confirm({
  court,
  date,
  startHour,
  endHour,
  guestDetails,
  onBack,
  onComplete,
  isSubmitting,
}: Step4ConfirmProps) {
  // 10-Minute Hold Countdown Timer (600 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(600)
  const [copiedAccount, setCopiedAccount] = useState(false)

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'qr_code' | 'paymongo'>('qr_code')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [senderName, setSenderName] = useState('')
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)

  // Add-ons
  const [ballMachineHours, setBallMachineHours] = useState<number>(0)
  const [paddleCount, setPaddleCount] = useState<number>(0)

  // Voucher
  const [voucherCode, setVoucherCode] = useState('')
  const [discountAmount, setDiscountAmount] = useState<number>(0)

  // Countdown effect
  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const rem = secs % 60
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`
  }

  // Cost calculations
  const duration = endHour - startHour
  const baseCourtFee = court.hourly_rate * duration
  const ballMachineFee =
    ballMachineHours === 1 ? 350 : ballMachineHours === 2 ? 600 : ballMachineHours === 3 ? 750 : 0
  const paddleFee = paddleCount * 100
  const totalAmount = Math.max(0, baseCourtFee + ballMachineFee + paddleFee - discountAmount)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedAccount(true)
    toast.success('Account number copied!')
    setTimeout(() => setCopiedAccount(false), 2000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG/JPG)')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setReceiptPreview(reader.result as string)
      toast.success('Payment receipt attached')
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (paymentMethod === 'qr_code' && !referenceNumber.trim()) {
      toast.error('Please enter the GCash/Bank reference number')
      return
    }

    await onComplete({
      method: paymentMethod,
      referenceNumber: referenceNumber.trim() || 'PAYMONGO-ONLINE',
      receiptScreenshot: receiptPreview || undefined,
      senderName: senderName.trim() || undefined,
      addOns: {
        ballMachineHours,
        paddleCount,
      },
    })
  }

  return (
    <div className="space-y-7 max-w-3xl mx-auto py-2">
      {/* 10-Minute Hold Banner */}
      <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center shrink-0 font-bold shadow-xs">
            <CheckCircle2 size={16} />
          </div>
          <div>
            <h4 className="font-semibold text-[var(--apple-text)]">
              Court Held — Complete Payment to Confirm
            </h4>
            <p className="text-[11px] text-[var(--apple-subtext)]">
              {court.name} · {format(new Date(date), 'EEE, MMM d')} ({formatHour(startHour)} – {formatHour(endHour)})
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-mono font-bold tabular-nums">
          <Clock size={13} className="animate-spin" />
          <span>Hold expires in {formatTimer(timeLeft)}</span>
        </div>
      </div>

      {/* Summary Card */}
      <div className="rounded-3xl p-6 sm:p-7 bg-[var(--apple-card)] border border-[var(--apple-border)] shadow-sm space-y-5">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-[var(--apple-subtext)] border-b border-[var(--apple-border)] pb-2.5">
          Booking Summary
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-[var(--apple-muted)] block text-[10px] uppercase font-semibold">Court</span>
            <span className="font-semibold text-sm text-[var(--apple-text)] mt-0.5 block">{court.name}</span>
            <span className="text-[11px] text-[var(--apple-subtext)]">{court.is_indoor ? 'Indoor Arena' : 'Outdoor Court'}</span>
          </div>

          <div>
            <span className="text-[var(--apple-muted)] block text-[10px] uppercase font-semibold">Date</span>
            <span className="font-semibold text-sm text-[var(--apple-text)] mt-0.5 block">
              {format(new Date(date), 'MMM d, yyyy')}
            </span>
            <span className="text-[11px] text-[var(--apple-subtext)]">{format(new Date(date), 'EEEE')}</span>
          </div>

          <div>
            <span className="text-[var(--apple-muted)] block text-[10px] uppercase font-semibold">Time Interval</span>
            <span className="font-semibold text-sm text-[var(--apple-text)] mt-0.5 block tabular-nums">
              {formatHour(startHour)} – {formatHour(endHour)}
            </span>
            <span className="text-[11px] text-[var(--apple-subtext)]">{duration} hour{duration > 1 ? 's' : ''}</span>
          </div>

          <div>
            <span className="text-[var(--apple-muted)] block text-[10px] uppercase font-semibold">Reserved For</span>
            <span className="font-semibold text-sm text-[var(--apple-text)] mt-0.5 block">{guestDetails.fullName}</span>
            <span className="text-[11px] text-[var(--apple-subtext)]">{guestDetails.phone}</span>
          </div>

          <div>
            <span className="text-[var(--apple-muted)] block text-[10px] uppercase font-semibold">Court Rate</span>
            <span className="font-semibold text-sm text-[var(--apple-text)] mt-0.5 block">{formatCurrency(court.hourly_rate)} / hr</span>
          </div>

          <div>
            <span className="text-[var(--apple-muted)] block text-[10px] uppercase font-semibold">Total Amount</span>
            <span className="font-bold text-lg text-[var(--apple-text)] mt-0.5 block tabular-nums">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        {/* Add-Ons Section */}
        <div className="pt-4 border-t border-[var(--apple-border)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[var(--apple-text)]">Add-on: Ball Machine Rental</p>
              <p className="text-[11px] text-[var(--apple-subtext)]">Pusun Mini Pro — auto feed, adjustable top-spin & drills.</p>
            </div>
            <div className="flex items-center gap-1.5">
              {[
                { h: 0, label: 'None', rate: 0 },
                { h: 1, label: '1 hr', rate: 350 },
                { h: 2, label: '2 hrs', rate: 600 },
              ].map((opt) => (
                <button
                  key={opt.h}
                  type="button"
                  onClick={() => setBallMachineHours(opt.h)}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                    ballMachineHours === opt.h
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-xs'
                      : 'bg-black/[0.03] dark:bg-white/[0.05] text-[var(--apple-subtext)] hover:text-[var(--apple-text)] border border-[var(--apple-border)]'
                  )}
                >
                  {opt.label} {opt.rate > 0 ? `· ₱${opt.rate}` : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[var(--apple-text)]">Add-on: Paddle Rental</p>
              <p className="text-[11px] text-[var(--apple-subtext)]">Raw carbon fiber pro tournament paddles (₱100 each).</p>
            </div>
            <div className="flex items-center gap-1.5">
              {[0, 2, 4].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setPaddleCount(count)}
                  className={cn(
                    'px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                    paddleCount === count
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-xs'
                      : 'bg-black/[0.03] dark:bg-white/[0.05] text-[var(--apple-subtext)] hover:text-[var(--apple-text)] border border-[var(--apple-border)]'
                  )}
                >
                  {count === 0 ? 'None' : `${count} Paddles · ₱${count * 100}`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Options Card */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[var(--apple-card)] border border-[var(--apple-border)] shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base sm:text-lg text-[var(--apple-text)]">
            Payment Options
          </h3>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 size={13} />
            <span>Instant Hold Active</span>
          </span>
        </div>

        {/* Payment Tabs: QR Ph / GCash vs PayMongo */}
        <div className="flex rounded-full bg-black/[0.04] dark:bg-white/[0.06] p-1 border border-[var(--apple-border)]">
          <button
            type="button"
            onClick={() => setPaymentMethod('qr_code')}
            className={cn(
              'flex-1 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer',
              paymentMethod === 'qr_code'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-sm'
                : 'text-[var(--apple-subtext)] hover:text-[var(--apple-text)]'
            )}
          >
            <QrCode size={14} />
            <span>QR Ph / GCash / Maya</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod('paymongo')}
            className={cn(
              'flex-1 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer',
              paymentMethod === 'paymongo'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-black shadow-sm'
                : 'text-[var(--apple-subtext)] hover:text-[var(--apple-text)]'
            )}
          >
            <CreditCard size={14} />
            <span>PayMongo Online</span>
          </button>
        </div>

        {/* Tab 1: QR Code Flow */}
        {paymentMethod === 'qr_code' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Left: Official Payment Card */}
              <div className="rounded-2xl p-5 bg-black/[0.02] dark:bg-white/[0.03] border border-[var(--apple-border)] space-y-3.5 text-center">
                {/* QR Code graphic */}
                <div className="w-44 h-44 mx-auto rounded-2xl bg-white p-2.5 shadow-md border flex items-center justify-center">
                  {/* Clean SVG Mock for QR Ph / GCash */}
                  <div className="w-full h-full bg-neutral-950 rounded-xl p-2 flex flex-col items-center justify-center text-white text-[10px] space-y-1 relative overflow-hidden">
                    <QrCode size={90} className="text-white" />
                    <span className="font-bold tracking-wider text-[9px] uppercase bg-emerald-500 text-black px-1.5 py-0.5 rounded">
                      QR Ph · GCash · Maya
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-[var(--apple-text)]">PickCourt Operations</p>
                  <p className="text-[11px] text-[var(--apple-subtext)]">GCash / Maya / UnionBank InstaPay</p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-xs font-mono font-semibold text-[var(--apple-text)] mt-1">
                    <span>0917 123 4567</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('09171234567')}
                      className="text-[var(--apple-subtext)] hover:text-[var(--apple-text)] ml-1 cursor-pointer"
                      title="Copy account number"
                    >
                      {copiedAccount ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Upload & Reference Form */}
              <div className="space-y-4">
                {/* Reference Number */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[var(--apple-text)]">
                    Payment Reference Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1029 3847 5612"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-[var(--apple-border)] text-xs sm:text-sm text-[var(--apple-text)] placeholder-[var(--apple-muted)] focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 transition-all font-mono"
                  />
                  <p className="text-[10px] text-[var(--apple-muted)]">
                    Copy the reference number from your GCash, Maya, or bank receipt.
                  </p>
                </div>

                {/* Screenshot Upload */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[var(--apple-text)]">
                    Upload Payment Screenshot (Optional but recommended)
                  </label>
                  <label className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-dashed border-[var(--apple-border)] hover:border-black/30 dark:hover:border-white/30 bg-black/[0.01] dark:bg-white/[0.02] transition-colors cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    {receiptPreview ? (
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={receiptPreview}
                          alt="Receipt preview"
                          className="w-12 h-12 object-cover rounded-xl border"
                        />
                        <div className="text-left text-xs">
                          <p className="font-semibold text-emerald-600 dark:text-emerald-400">Screenshot Attached</p>
                          <p className="text-[10px] text-[var(--apple-subtext)]">Tap to change</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-center">
                        <Upload size={18} className="text-[var(--apple-subtext)] group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-medium text-[var(--apple-text)]">
                          Tap to choose payment receipt screenshot
                        </span>
                        <span className="text-[10px] text-[var(--apple-muted)]">
                          PNG, JPG, or WEBP up to 5MB
                        </span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: PayMongo Flow */}
        {paymentMethod === 'paymongo' && (
          <div className="p-6 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-[var(--apple-border)] text-center space-y-3">
            <CreditCard size={32} className="mx-auto text-[var(--apple-subtext)]" />
            <h4 className="font-semibold text-sm text-[var(--apple-text)]">
              Instant Online Payment via PayMongo
            </h4>
            <p className="text-xs text-[var(--apple-subtext)] max-w-md mx-auto leading-relaxed">
              Upon clicking &quot;Complete Booking&quot;, you will be securely redirected to PayMongo to pay <span className="font-bold text-[var(--apple-text)]">{formatCurrency(totalAmount)}</span> via GCash, Maya, GrabPay, or Card.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--apple-border)]">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="btn-secondary !px-6 !py-3 text-xs sm:text-sm flex items-center gap-1.5"
        >
          <ChevronLeft size={16} />
          <span>Back to Details</span>
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || (paymentMethod === 'qr_code' && !referenceNumber.trim())}
          className="btn-primary !px-9 !py-3 text-xs sm:text-sm flex items-center gap-2 shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Confirming Reservation…</span>
            </>
          ) : (
            <>
              <span>Complete Booking · {formatCurrency(totalAmount)}</span>
              <CheckCircle2 size={16} strokeWidth={2.5} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
