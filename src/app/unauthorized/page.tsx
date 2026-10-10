'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShieldOff, ArrowLeft, Home } from 'lucide-react'

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <main className="relative min-h-screen bg-court-dark flex items-center justify-center overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 court-grid-bg opacity-60 pointer-events-none" />

      {/* Neon radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,0,110,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Decorative corner lines */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-neon-pink/30 rounded-tl-xl pointer-events-none" />
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-neon-pink/30 rounded-br-xl pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 glass rounded-xl3 p-10 md:p-14 max-w-lg w-full mx-4 text-center shadow-glass">
        {/* Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-neon-pink/10 border border-neon-pink/30">
            <ShieldOff className="w-9 h-9 text-neon-pink" strokeWidth={1.5} />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-pink opacity-60" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-pink" />
            </span>
          </div>
        </div>

        {/* Status code */}
        <p className="text-neon-pink font-display font-bold text-sm tracking-[0.25em] uppercase mb-2">
          Error 403
        </p>

        {/* Heading */}
        <h1 className="font-display font-extrabold text-3xl md:text-4xl text-white mb-3 leading-tight">
          Access Denied
        </h1>

        {/* Description */}
        <p className="text-slate-400 text-base leading-relaxed mb-8">
          You don&apos;t have permission to view this page. This area is restricted to
          authorized personnel only. If you believe this is a mistake, please contact your
          administrator.
        </p>

        {/* Divider */}
        <div className="border-t border-court-border mb-8" />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="btn-secondary gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link href="/" className="btn-primary gap-2">
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>

        {/* Footer note */}
        <p className="mt-8 text-xs text-slate-600">
          PickCourt &mdash; Premium Pickleball Booking Platform
        </p>
      </div>
    </main>
  )
}
