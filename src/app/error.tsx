'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { RefreshCw, Home, AlertCircle } from 'lucide-react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App Router Caught Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[var(--apple-bg)] text-[var(--apple-text)] flex items-center justify-center p-6 antialiased font-body">
      <div className="max-w-md w-full rounded-3xl bg-[var(--apple-card)] border border-[var(--apple-border)] p-8 text-center space-y-6 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-[#ff3b30]/10 border border-[#ff3b30]/20 flex items-center justify-center mx-auto text-[#ff3b30]">
          <AlertCircle size={28} />
        </div>

        <div className="space-y-2">
          <h2 className="font-display font-bold text-2xl text-[var(--apple-text)]">Something went wrong</h2>
          <p className="text-xs sm:text-sm text-[var(--apple-subtext)] leading-relaxed">
            An unexpected error occurred. You can retry the action or return to the main court facility.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[var(--apple-pill-bg)] text-[var(--apple-pill-text)] font-semibold text-xs hover:opacity-90 transition-all active:scale-95 shadow-sm"
          >
            <RefreshCw size={14} />
            <span>Try Again</span>
          </button>
          <Link href="/" className="flex-1">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-[var(--apple-text)] font-medium text-xs border border-[var(--apple-border)] transition-all"
            >
              <Home size={14} />
              <span>Go Home</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

