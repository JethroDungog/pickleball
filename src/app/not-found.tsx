import Link from 'next/link'
import { ArrowLeft, MapPin } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--apple-bg)] text-[var(--apple-text)] flex items-center justify-center p-6 antialiased font-body">
      <div className="max-w-md w-full rounded-3xl bg-[var(--apple-card)] border border-[var(--apple-border)] p-8 text-center space-y-6 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-[#34c759]/10 border border-[#34c759]/20 flex items-center justify-center mx-auto text-[#34c759]">
          <MapPin size={26} />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--apple-subtext)]">404 · Out of Bounds</p>
          <h1 className="font-display font-bold text-2xl text-[var(--apple-text)]">Court Not Found</h1>
          <p className="text-xs sm:text-sm text-[var(--apple-subtext)] leading-relaxed">
            The page or court route you are looking for does not exist or has been relocated.
          </p>
        </div>

        <Link href="/" className="inline-block w-full">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[var(--apple-pill-bg)] text-[var(--apple-pill-text)] font-semibold text-xs hover:opacity-90 transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Return to Courts</span>
          </button>
        </Link>
      </div>
    </div>
  )
}

