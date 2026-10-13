'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export type WizardStep = 1 | 2 | 3 | 4

interface WizardProgressBarProps {
  currentStep: WizardStep
  onStepClick?: (step: WizardStep) => void
  completedSteps?: WizardStep[]
}

const STEPS: { step: WizardStep; label: string }[] = [
  { step: 1, label: 'Date' },
  { step: 2, label: 'Slot' },
  { step: 3, label: 'Details' },
  { step: 4, label: 'Confirm' },
]

export default function WizardProgressBar({
  currentStep,
  onStepClick,
  completedSteps = [],
}: WizardProgressBarProps) {
  const effectiveCompleted =
    completedSteps.length > 0
      ? completedSteps
      : ([1, 2, 3, 4] as WizardStep[]).filter((s) => s < currentStep)
  return (
    <div className="w-full border-b border-[var(--apple-border)] bg-[var(--apple-card)]/50 backdrop-blur-md px-4 sm:px-8 py-4 transition-colors">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        {STEPS.map((s, index) => {
          const isCurrent = currentStep === s.step
          const isCompleted = effectiveCompleted.includes(s.step)
          const canClick = isCompleted && onStepClick

          return (
            <div key={s.step} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                disabled={!canClick && !isCurrent}
                onClick={() => canClick && onStepClick(s.step)}
                className={cn(
                  'flex items-center gap-2 sm:gap-2.5 transition-all outline-none',
                  canClick ? 'cursor-pointer group' : 'cursor-default'
                )}
              >
                <div
                  className={cn(
                    'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-semibold tabular-nums transition-all duration-300',
                    isCurrent
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-black ring-2 ring-[#30d158] ring-offset-2 ring-offset-[var(--apple-card)] shadow-sm'
                      : isCompleted
                      ? 'bg-[#30d158] text-black font-bold shadow-xs'
                      : 'bg-black/[0.04] dark:bg-white/[0.06] text-[var(--apple-muted)] border border-[var(--apple-border)]'
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <Check size={13} strokeWidth={3} />
                  ) : (
                    <span>{s.step}</span>
                  )}
                </div>

                <span
                  className={cn(
                    'text-xs sm:text-sm font-medium transition-colors tracking-tight',
                    isCurrent
                      ? 'text-[var(--apple-text)] font-semibold'
                      : isCompleted
                      ? 'text-[var(--apple-text)] group-hover:underline'
                      : 'hidden sm:inline-block text-[var(--apple-muted)]'
                  )}
                >
                  {s.label}
                </span>
              </button>

              {index < STEPS.length - 1 && (
                <div className="relative mx-2 sm:mx-4 h-px flex-1 bg-[var(--apple-border)] overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{
                      width: isCompleted ? '100%' : '0%',
                    }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    className="absolute inset-y-0 left-0 bg-[#30d158]"
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
