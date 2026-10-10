'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, Loader2, Clock, MapPin, Zap } from 'lucide-react'
import { cn, formatHour } from '@/lib/utils'
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
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 32 }}
          className="fixed bottom-0 left-0 right-0 z-50"
        >
          {/* Neon top border pulse */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-px"
            style={{
              background: `linear-gradient(90deg, transparent, ${draft.courtColor}, #39ff14, ${draft.courtColor}, transparent)`,
            }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />

          <div className="bg-black/80 backdrop-blur-xl border-t border-white/10 shadow-[0_-8px_40px_rgba(0,0,0,0.7)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center gap-4 sm:gap-6">

                {/* Left: Court info */}
                <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: `${draft.courtColor}18`,
                        border: `1.5px solid ${draft.courtColor}50`,
                        boxShadow: `0 0 12px ${draft.courtColor}30`,
                      }}
                    >
                      <MapPin size={16} style={{ color: draft.courtColor }} />
                    </div>
                    <motion.div
                      className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: draft.courtColor }}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-white/40 font-medium">Court</p>
                    <p className="text-sm font-bold text-white truncate">{draft.courtName}</p>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-10 bg-white/10 flex-shrink-0" />

                {/* Center: Time display */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Clock size={14} className="text-neon-cyan flex-shrink-0" />
                    <span className="text-sm font-bold text-white tabular-nums">
                      {formatHour(draft.startHour)}
                    </span>
                    <span className="text-white/30 text-sm">—</span>
                    <span className="text-sm font-bold text-white tabular-nums">
                      {formatHour(draft.endHour)}
                    </span>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neon-cyan/10 border border-neon-cyan/30"
                    >
                      <Zap size={9} className="text-neon-cyan fill-neon-cyan" />
                      <span className="text-[10px] font-bold text-neon-cyan">
                        {duration} hr{duration !== 1 ? 's' : ''}
                      </span>
                    </motion.div>
                  </div>
                  <p className="text-xs text-white/30 mt-0.5 tabular-nums">
                    {new Date(draft.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-10 bg-white/10 flex-shrink-0" />

                {/* Right: Price + CTA */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-white/30 font-medium">Total</p>
                    <motion.p
                      key={draft.totalPrice}
                      initial={{ y: -6, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="text-xl font-black text-neon-green tabular-nums"
                      style={{ textShadow: '0 0 12px #39ff1480' }}
                    >
                      ${draft.totalPrice}
                    </motion.p>
                  </div>

                  <motion.button
                    onClick={onConfirm}
                    disabled={isLoading}
                    whileHover={
                      !isLoading
                        ? { scale: 1.03, boxShadow: '0 0 24px rgba(57,255,20,0.5)' }
                        : {}
                    }
                    whileTap={!isLoading ? { scale: 0.97 } : {}}
                    className={cn(
                      'flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all',
                      isLoading
                        ? 'bg-neon-green/50 text-black/60 cursor-not-allowed'
                        : 'bg-neon-green text-black hover:bg-neon-green cursor-pointer',
                    )}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        <span>Booking…</span>
                      </>
                    ) : (
                      <>
                        <span>Book Now</span>
                        <ChevronRight size={15} />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Clear button */}
          <motion.button
            onClick={onClear}
            disabled={isLoading}
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.12)' }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-3 right-4 sm:right-8 w-7 h-7 rounded-full bg-white/8 border border-white/15 flex items-center justify-center text-white/50 hover:text-white transition-colors"
            aria-label="Clear selection"
          >
            <X size={13} />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
