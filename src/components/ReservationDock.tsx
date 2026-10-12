'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, Loader2, Clock, MapPin } from 'lucide-react'
import { cn, formatHour, formatCurrency } from '@/lib/utils'
import type { BookingDraft } from '@/types'

interface ReservationDockProps {
  draft: BookingDraft | null
  onConfirm: () => void
  onClear: () => void
  isLoading: boolean
}

export default function ReservationDock({
  draft,
  onConfirm,
  onClear,
  isLoading,
}: ReservationDockProps) {
  const duration = draft ? draft.endHour - draft.startHour : 0

  return (
    <AnimatePresence>
      {draft && (
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-50 px-3 sm:px-4 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]"
        >
          <div className="max-w-2xl mx-auto rounded-3xl bg-[var(--apple-card)] backdrop-blur-2xl border border-[var(--apple-border)] shadow-xl p-3 sm:p-4 pointer-events-auto relative">
            <div className="flex items-center justify-between gap-3 sm:gap-5">

              {/* Left: Court info */}
              <div className="flex items-center gap-2.5 min-w-0 flex-shrink-0">
                <div
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${draft.courtColor}20`,
                    border: `1px solid ${draft.courtColor}40`,
                  }}
                >
                  <MapPin size={14} style={{ color: draft.courtColor }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-[var(--apple-subtext)] font-medium">Court</p>
                  <p className="text-xs sm:text-sm font-semibold text-[var(--apple-text)] truncate max-w-[80px] sm:max-w-none">
                    {draft.courtName}
                  </p>
                </div>
              </div>

              {/* Center: Time display */}
              <div className="flex-1 min-w-0 px-1">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <Clock size={12} className="text-[var(--apple-subtext)] shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-[var(--apple-text)] tabular-nums">
                    {formatHour(draft.startHour)} – {formatHour(draft.endHour)}
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/10 text-[10px] font-semibold text-[var(--apple-text)]">
                    {duration}h
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-[var(--apple-subtext)] mt-0.5 tabular-nums truncate">
                  {new Date(draft.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {/* Right: Total + Apple Pill Button */}
              <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                <div className="text-right">
                  <p className="text-[10px] text-[var(--apple-subtext)] font-medium">Total</p>
                  <motion.p
                    key={draft.totalPrice}
                    initial={{ y: -3, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-sm sm:text-base font-bold text-[var(--apple-text)] tabular-nums"
                  >
                    {formatCurrency(draft.totalPrice)}
                  </motion.p>
                </div>

                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="btn-primary text-xs sm:text-sm !py-2 sm:!py-2.5 !px-4 sm:!px-5 whitespace-nowrap shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Reserving…</span>
                    </>
                  ) : (
                    <>
                      <span>Reserve</span>
                      <ChevronRight size={13} strokeWidth={2.5} />
                    </>
                  )}
                </button>

                {/* Dismiss button */}
                <button
                  type="button"
                  onClick={onClear}
                  disabled={isLoading}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer"
                  aria-label="Dismiss reservation"
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
              </div>

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
