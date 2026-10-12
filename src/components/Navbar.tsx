'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import {
  Menu,
  X,
  LogOut,
  User,
  ChevronRight,
  Zap,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ThemeToggle from '@/components/ThemeToggle'
import type { Profile } from '@/types'

const BASE_NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/book', label: 'Book Court' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/dashboard', label: 'My Passes' },
  { href: '/about', label: 'Facility' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchProfile = useCallback(
    async (userId: string) => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
        if (data) setProfile(data as Profile)
      } catch (err) {
        // Silent catch for initial unconfigured auth
      }
    },
    [supabase],
  )

  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session?.user) await fetchProfile(session.user.id)
      } catch (err) {
        // Silent catch
      } finally {
        setLoading(false)
      }
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

  const isPrivileged = profile?.role === 'admin' || profile?.role === 'super_admin'

  const navLinks = BASE_NAV_LINKS

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
            ? 'bg-[var(--apple-nav-bg)] backdrop-blur-xl border-b border-[var(--apple-nav-border)] shadow-sm'
            : 'bg-transparent backdrop-blur-sm',
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-[#30d158] flex items-center justify-center text-black font-black text-xs shadow-sm">
                <Zap size={14} className="fill-black stroke-black" />
              </div>
              <span className="font-semibold text-base tracking-tight text-[var(--apple-text)]">
                PickCourt
              </span>
            </Link>

            {/* Desktop nav - Apple segmented pill */}
            <nav className="hidden md:flex items-center p-1 rounded-full bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06]">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'relative px-3.5 py-1 text-xs font-medium transition-colors rounded-full',
                      isActive
                        ? 'text-[var(--apple-text)] font-semibold'
                        : 'text-[var(--apple-subtext)] hover:text-[var(--apple-text)]',
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-full bg-white dark:bg-white/10 shadow-sm"
                        transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                      />
                    )}
                    <span className="relative z-10">{link.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-2.5">
              <ThemeToggle />
              {!loading && (
                <>
                  {profile ? (
                    <div className="flex items-center gap-3">
                      {isPrivileged && (
                        <Link
                          href={profile.role === 'super_admin' ? '/super-admin' : '/admin'}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 text-xs font-semibold text-amber-600 dark:text-amber-300 transition-all"
                        >
                          <Shield size={13} />
                          <span>Staff Console</span>
                        </Link>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-black/[0.06] dark:bg-white/10 border border-black/[0.08] dark:border-white/15 flex items-center justify-center text-xs font-semibold text-[var(--apple-text)]">
                          {initials}
                        </div>
                        <span className="text-xs text-[var(--apple-subtext)] max-w-[100px] truncate">
                          {profile.full_name}
                        </span>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="p-1.5 rounded-full text-[var(--apple-muted)] hover:text-[var(--apple-text)] hover:bg-black/[0.05] dark:hover:bg-white/5 transition-all"
                        title="Sign out"
                      >
                        <LogOut size={15} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Link
                        href="/auth/login"
                        className="px-3.5 py-1.5 text-xs font-medium text-[var(--apple-subtext)] hover:text-[var(--apple-text)] transition-colors"
                      >
                        Login
                      </Link>
                      <Link href="/book">
                        <button
                          type="button"
                          className="btn-primary text-xs !py-1.5 !px-4"
                        >
                          <span>Book Court</span>
                          <ChevronRight size={13} strokeWidth={2.5} />
                        </button>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Mobile actions */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <button
                className="p-2 rounded-full text-[var(--apple-subtext)] hover:text-[var(--apple-text)] hover:bg-black/[0.05] dark:hover:bg-white/10 transition-all"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
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
              {navLinks.map((link, i) => (
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
                      'block px-4 py-3 rounded-2xl text-sm font-medium transition-colors',
                      pathname === link.href
                        ? 'text-white bg-white/10 font-semibold'
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
                      <div className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-sm font-bold text-white">
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {profile.full_name}
                        </p>
                        <p className="text-xs text-white/40">{profile.email}</p>
                      </div>
                    </div>
                    {isPrivileged && (
                      <Link
                        href={profile.role === 'super_admin' ? '/super-admin' : '/admin'}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                      >
                        <Shield size={16} />
                        Staff Console
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 rounded-2xl text-sm text-white/70 hover:text-white hover:bg-white/5"
                    >
                      <User size={16} />
                      Login
                    </Link>
                    <Link href="/book" onClick={() => setMobileOpen(false)}>
                      <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-white text-black text-sm font-semibold active:scale-[0.98] transition-all">
                        Book Court
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
