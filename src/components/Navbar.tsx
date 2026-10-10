'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import {
  Menu,
  X,
  LogOut,
  User,
  BarChart3,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/book', label: 'Book a Court' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/about', label: 'About' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (data) setProfile(data as Profile)
    },
    [supabase],
  )

  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) await fetchProfile(session.user.id)
      setLoading(false)
    }
    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, fetchProfile])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    setMobileOpen(false)
  }

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]'
            : 'bg-transparent backdrop-blur-sm',
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1"
              >
                <Zap
                  size={18}
                  className="text-neon-green fill-neon-green drop-shadow-[0_0_6px_#39ff14]"
                />
                <span className="font-display font-black text-xl tracking-tight">
                  <span className="text-neon-green drop-shadow-[0_0_10px_#39ff14]">
                    PICK
                  </span>
                  <span className="text-white">COURT</span>
                </span>
              </motion.div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'relative px-4 py-2 text-sm font-medium transition-colors rounded-lg',
                      isActive
                        ? 'text-neon-green'
                        : 'text-white/60 hover:text-white',
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-lg bg-neon-green/10 border border-neon-green/20"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3">
              {!loading && (
                <>
                  {profile ? (
                    <div className="flex items-center gap-3">
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm text-white/80 hover:text-white"
                      >
                        <BarChart3 size={14} />
                        Dashboard
                      </Link>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-neon-green/20 border border-neon-green/40 flex items-center justify-center text-xs font-bold text-neon-green">
                          {initials}
                        </div>
                        <span className="text-sm text-white/70 max-w-[100px] truncate">
                          {profile.full_name}
                        </span>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-all"
                        title="Sign out"
                      >
                        <LogOut size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link
                        href="/login"
                        className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
                      >
                        Login
                      </Link>
                      <Link href="/book">
                        <motion.button
                          whileHover={{ scale: 1.04, boxShadow: '0 0 20px rgba(57,255,20,0.4)' }}
                          whileTap={{ scale: 0.97 }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neon-green text-black text-sm font-bold tracking-wide transition-all"
                        >
                          Book Now
                          <ChevronRight size={14} />
                        </motion.button>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-b border-white/10 md:hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'block px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                      pathname === link.href
                        ? 'text-neon-green bg-neon-green/10 border border-neon-green/20'
                        : 'text-white/70 hover:text-white hover:bg-white/5',
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}

              <div className="pt-3 border-t border-white/10 mt-2 flex flex-col gap-2">
                {profile ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-2">
                      <div className="w-9 h-9 rounded-full bg-neon-green/20 border border-neon-green/40 flex items-center justify-center text-sm font-bold text-neon-green">
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {profile.full_name}
                        </p>
                        <p className="text-xs text-white/40">{profile.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <BarChart3 size={16} />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5"
                    >
                      <User size={16} />
                      Login
                    </Link>
                    <Link href="/book" onClick={() => setMobileOpen(false)}>
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-neon-green text-black text-sm font-bold">
                        Book Now
                        <ChevronRight size={14} />
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
