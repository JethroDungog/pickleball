import type { Metadata, Viewport } from 'next'
import { Syne, Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import { ThemeProvider } from '@/context/ThemeContext'
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
  icons: {
    icon: '/icon.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

// ── Layout ────────────────────────────────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable}`}
      suppressHydrationWarning
    >
      <body className="font-body antialiased min-h-screen">
        <ThemeProvider>
          <Navbar />
          {children}
        <Toaster
          position="top-left"
          containerStyle={{
            top: 76,
            left: 20,
          }}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1c1c1e',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '1rem',
              fontSize: '0.8125rem',
              fontWeight: 500,
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
            },
            success: {
              iconTheme: {
                primary: '#30d158',
                secondary: '#1c1c1e',
              },
            },
            error: {
              iconTheme: {
                primary: '#ff3b30',
                secondary: '#1c1c1e',
              },
            },
          }}
        />
        </ThemeProvider>
      </body>
    </html>
  )
}
