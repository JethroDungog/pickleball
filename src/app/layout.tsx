import type { Metadata, Viewport } from 'next'
import { Syne, Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import './globals.css'

// ── Fonts ─────────────────────────────────────────────────────────────────────
const displayFont = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})

const bodyFont = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

// ── Metadata ──────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'PickCourt | Premium Pickleball Booking',
  description:
    'Reserve your pickleball court online in seconds. Real-time availability, instant confirmation, and a seamless booking experience.',
  keywords: ['pickleball', 'court booking', 'sports', 'reservation', 'PickCourt'],
  authors: [{ name: 'PickCourt Team' }],
  openGraph: {
    title: 'PickCourt | Premium Pickleball Booking',
    description: 'Reserve your pickleball court online in seconds.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0d0d0d',
}

// ── Layout ────────────────────────────────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${displayFont.variable} ${bodyFont.variable}`}
      suppressHydrationWarning
    >
      <body className="font-body bg-court-dark text-slate-100 antialiased min-h-screen">
        <Navbar />
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#161616',
              color: '#f1f5f9',
              border: '1px solid #242424',
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
            },
            success: {
              iconTheme: {
                primary: '#39ff14',
                secondary: '#0d0d0d',
              },
            },
            error: {
              iconTheme: {
                primary: '#ff006e',
                secondary: '#0d0d0d',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
