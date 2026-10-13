'use client'

import { useState } from 'react'
import { ChevronLeft, ArrowRight, User, Phone, Mail, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface GuestDetails {
  fullName: string
  phone: string
  email: string
  agreedToTerms: boolean
}

interface Step3DetailsProps {
  details: GuestDetails
  onChange: (details: GuestDetails) => void
  onBack: () => void
  onContinue: () => void
}

export default function Step3Details({
  details,
  onChange,
  onBack,
  onContinue,
}: Step3DetailsProps) {
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {}
    if (!details.fullName.trim()) errs.fullName = 'Please enter your full name'
    if (!details.phone.trim()) {
      errs.phone = 'Please enter your mobile number'
    } else if (details.phone.replace(/\D/g, '').length < 10) {
      errs.phone = 'Please enter a valid 10 or 11 digit Philippine mobile number'
    }
    if (!details.email.trim()) {
      errs.email = 'Please enter your email address'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) {
      errs.email = 'Please enter a valid email address'
    }
    if (!details.agreedToTerms) {
      errs.terms = 'Please accept the terms to proceed'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (validate()) {
      onContinue()
    }
  }

  return (
    <div className="space-y-7 max-w-2xl mx-auto py-2">
      {/* Title */}
      <div className="text-center space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
          <User size={12} />
          <span>Step 3 · Player Information</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--apple-text)]">
          Contact & Reservation Details
        </h2>
        <p className="text-xs sm:text-sm text-[var(--apple-subtext)]">
          No sign-up required. We&apos;ll issue your digital pass and QR access code to your phone.
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[var(--apple-card)] border border-[var(--apple-border)] shadow-sm space-y-5">
        {/* Full Name & Phone Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--apple-text)]">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--apple-subtext)]" />
              <input
                type="text"
                placeholder="Juan dela Cruz"
                value={details.fullName}
                onChange={(e) => {
                  onChange({ ...details, fullName: e.target.value })
                  if (errors.fullName) setErrors({ ...errors, fullName: '' })
                }}
                className={cn(
                  'w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border text-xs sm:text-sm text-[var(--apple-text)] placeholder-[var(--apple-muted)] focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 transition-all',
                  errors.fullName ? 'border-rose-500' : 'border-[var(--apple-border)]'
                )}
              />
            </div>
            {errors.fullName && (
              <p className="text-[11px] text-rose-500 font-medium">{errors.fullName}</p>
            )}
          </div>

          {/* Mobile Number */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[var(--apple-text)]">
              Mobile Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--apple-subtext)]" />
              <input
                type="tel"
                placeholder="+63 917 000 0000"
                value={details.phone}
                onChange={(e) => {
                  onChange({ ...details, phone: e.target.value })
                  if (errors.phone) setErrors({ ...errors, phone: '' })
                }}
                className={cn(
                  'w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border text-xs sm:text-sm text-[var(--apple-text)] placeholder-[var(--apple-muted)] focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 transition-all',
                  errors.phone ? 'border-rose-500' : 'border-[var(--apple-border)]'
                )}
              />
            </div>
            {errors.phone && (
              <p className="text-[11px] text-rose-500 font-medium">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[var(--apple-text)]">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--apple-subtext)]" />
            <input
              type="email"
              placeholder="juan@example.com"
              value={details.email}
              onChange={(e) => {
                onChange({ ...details, email: e.target.value })
                if (errors.email) setErrors({ ...errors, email: '' })
              }}
              className={cn(
                'w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border text-xs sm:text-sm text-[var(--apple-text)] placeholder-[var(--apple-muted)] focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 transition-all',
                errors.email ? 'border-rose-500' : 'border-[var(--apple-border)]'
              )}
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-rose-500 font-medium">{errors.email}</p>
          )}
          <p className="text-[11px] text-[var(--apple-muted)] leading-relaxed pt-0.5">
            We only use this to email your booking confirmation pass and update you if schedules change. No promotional marketing.
          </p>
        </div>

        {/* Terms & Waiver Consent */}
        <div className="pt-3 border-t border-[var(--apple-border)]">
          <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-[var(--apple-border)] cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors">
            <input
              type="checkbox"
              checked={details.agreedToTerms}
              onChange={(e) => {
                onChange({ ...details, agreedToTerms: e.target.checked })
                if (errors.terms) setErrors({ ...errors, terms: '' })
              }}
              className="mt-0.5 w-4 h-4 rounded-md accent-[#30d158] cursor-pointer shrink-0"
            />
            <div className="text-xs text-[var(--apple-subtext)] leading-relaxed space-y-1">
              <p className="text-[var(--apple-text)] font-medium">
                I agree to the <a href="/terms" target="_blank" className="underline font-semibold text-[var(--apple-text)] hover:text-emerald-500">Terms of Use</a> and <a href="/privacy" target="_blank" className="underline font-semibold text-[var(--apple-text)] hover:text-emerald-500">Privacy Policy</a>, and consent to PickCourt processing my booking.
              </p>
              <p className="text-[11px] text-[var(--apple-muted)]">
                Pickleball carries physical activity risks, and our terms govern payments, cancellations, and facility etiquette.
              </p>
            </div>
          </label>
          {errors.terms && (
            <p className="text-[11px] text-rose-500 font-medium mt-1.5 pl-1">{errors.terms}</p>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-[var(--apple-border)]">
        <button
          type="button"
          onClick={onBack}
          className="btn-secondary !px-6 !py-3 text-xs sm:text-sm flex items-center gap-1.5"
        >
          <ChevronLeft size={16} />
          <span>Back to Slot</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="btn-primary !px-8 !py-3 text-xs sm:text-sm flex items-center gap-2 shadow-sm"
        >
          <span>Continue to Payment</span>
          <ArrowRight size={15} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
