'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global Error caught:', error)
  }, [error])

  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white flex items-center justify-center p-6 antialiased font-sans">
        <div className="max-w-md w-full rounded-3xl bg-[#1c1c1e] border border-white/10 p-8 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#ff453a] text-xl font-bold">
            !
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Application Error</h2>
            <p className="text-xs text-white/50 leading-relaxed">
              A critical issue occurred. Please reload to restore the session.
            </p>
          </div>

          <button
            type="button"
            onClick={() => reset()}
            className="w-full px-6 py-3 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all shadow-sm"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  )
}
