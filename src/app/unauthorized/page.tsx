'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShieldOff, ArrowLeft, Home } from 'lucide-react'

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-[var(--apple-bg)] text-[var(--apple-text)] flex items-center justify-center p-6 antialiased font-body transition-colors duration-200">
      <div className="max-w-md w-full rounded-3xl bg-[var(--apple-card)] border border-[var(--apple-border)] p-8 text-center space-y-6 shadow-sm">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#ff3b30]/10 border border-[#ff3b30]/20 flex items-center justify-center mx-auto text-[#ff3b30]">
          <ShieldOff size={28} />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#ff3b30]">
            403 · Access Restricted
          </p>
          <h1 className="font-display font-bold text-2xl text-[var(--apple-text)]">
            Restricted Clearance
          </h1>
          <p className="text-xs sm:text-sm text-[var(--apple-subtext)] leading-relaxed">
            This console is reserved for facility administrators and court managers.
            If you need staff privileges, ask your facility administrator to upgrade your account role.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] text-[var(--apple-text)] font-medium text-xs border border-[var(--apple-border)] transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Go Back</span>
          </button>
          <Link href="/" className="flex-1">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[var(--apple-pill-bg)] text-[var(--apple-pill-text)] font-semibold text-xs hover:opacity-90 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Home size={14} />
              <span>Return Home</span>
            </button>
          </Link>
        </div>
      </div>
    </main>
  )
}
