'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import { Mail, Lock, User, Phone, ArrowRight, Loader2, CheckCircle2, X, HelpCircle, ChevronDown, ChevronUp, ExternalLink, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [signUpSuccess, setSignUpSuccess] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
  )

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    try {
      if (mode === 'signin') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          setErrorMsg(error.message)
          toast.error(error.message)
        } else if (data.session) {
          toast.success('Welcome back!')
          window.location.href = redirectTo
        }
      } else {
        if (!fullName.trim()) {
          setErrorMsg('Please enter your full name')
          setLoading(false)
          return
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
            },
          },
        })
        if (error) {
          setErrorMsg(error.message)
          toast.error(error.message)
        } else if (data.session) {
          toast.success('Account created!')
          window.location.href = redirectTo
        } else if (data.user) {
          setSignUpSuccess(true)
          toast.success('Account created! Please check your email to confirm.')
        }
      }
    } catch {
      setErrorMsg('An unexpected error occurred. Please try again.')
      toast.error('Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const [showGoogleModal, setShowGoogleModal] = useState(false)
  const [showSetupGuide, setShowSetupGuide] = useState(false)

  const isSupabasePlaceholder =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-supabase-project') ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

  const handleGoogleSignIn = async () => {
    if (isSupabasePlaceholder) {
      setShowGoogleModal(true)
      return
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
          queryParams: {
            prompt: 'select_account',
          },
        },
      })
      if (error) {
        toast.error(error.message)
      }
    } catch {
      toast.error('Unable to initialize Google Sign-In')
    }
  }

  const handleDemoGoogleSignIn = () => {
    document.cookie = 'preview_role=customer; path=/; max-age=86400'
    toast.success('Signed in with Google as Alex Morgan (Demo)')
    setShowGoogleModal(false)
    router.push(redirectTo || '/dashboard')
    router.refresh()
  }


  return (
    <div className="min-h-screen bg-[var(--apple-bg)] flex flex-col lg:flex-row text-[var(--apple-text)] pt-20 lg:pt-24 transition-colors duration-200">
      {/* Left Column: Athletic Branding & Visual Court Lines */}
      <div className="relative hidden lg:flex lg:w-1/2 bg-black/[0.02] dark:bg-white/[0.02] border-r border-[var(--apple-border)] flex-col justify-between p-12 overflow-hidden">
        {/* Subtle Court SVG background */}
        <div className="absolute inset-0 pointer-events-none opacity-10 dark:opacity-20">
          <svg className="w-full h-full" viewBox="0 0 600 600" fill="none">
            <rect x="50" y="50" width="500" height="500" rx="8" stroke="#34c759" strokeWidth="2" />
            <line x1="300" y1="50" x2="300" y2="550" stroke="#34c759" strokeWidth="4" />
            <line x1="180" y1="50" x2="180" y2="550" stroke="#34c759" strokeWidth="2" strokeDasharray="6 6" />
            <line x1="420" y1="50" x2="420" y2="550" stroke="#34c759" strokeWidth="2" strokeDasharray="6 6" />
            <circle cx="300" cy="50" r="8" fill="#34c759" />
            <circle cx="300" cy="550" r="8" fill="#34c759" />
          </svg>
        </div>

        {/* Top Tagline */}
        <div className="relative z-10 pt-2">
          <span className="text-xs uppercase tracking-widest text-[#34c759] font-semibold">
            Championship Facility · Member Access
          </span>
        </div>

        {/* Center Editorial Quote */}
        <div className="relative z-10 max-w-md my-auto">
          <p className="text-xs uppercase tracking-widest text-[var(--apple-subtext)] font-semibold mb-3">Athletic Excellence</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[var(--apple-text)] tracking-tight leading-tight">
            Your court is waiting. Lock in your session.
          </h2>
          <p className="mt-4 text-[var(--apple-subtext)] text-sm leading-relaxed">
            Instant booking, zero double-booking concurrency, tournament lighting, and pro-grade surfaces.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-[var(--apple-border)] pt-6">
            <div>
              <p className="font-display font-bold text-2xl text-[#34c759]">4</p>
              <p className="text-[11px] text-[var(--apple-subtext)] uppercase mt-0.5">Championship Courts</p>
            </div>
            <div>
              <p className="font-display font-bold text-2xl text-[#0071e3]">100%</p>
              <p className="text-[11px] text-[var(--apple-subtext)] uppercase mt-0.5">Atomic Locking</p>
            </div>
            <div>
              <p className="font-display font-bold text-2xl text-[#ff9f0a]">24/7</p>
              <p className="text-[11px] text-[var(--apple-subtext)] uppercase mt-0.5">Digital Access</p>
            </div>
          </div>
        </div>

        {/* Bottom footer credit */}
        <div className="relative z-10 text-xs text-[var(--apple-subtext)] flex items-center justify-between">
          <span>© {new Date().getFullYear()} PickCourt Inc.</span>
          <span>Fast · Frictionless · Tactile</span>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20 relative">
        <div className="w-full max-w-md mx-auto">
          {/* Staff Clearance Notice */}
          {redirectTo.includes('admin') && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-600 dark:text-amber-400">
              <Shield className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold uppercase tracking-wider text-[10px]">Staff Clearance Required</p>
                <p className="mt-0.5 text-xs text-amber-700/80 dark:text-amber-300/80 leading-relaxed">
                  You are accessing the {redirectTo.includes('super-admin') ? 'Super Admin Console' : 'Court Manager Portal'}. Please authenticate with an authorized staff account.
                </p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-6">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-[var(--apple-text)] tracking-tight">
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[var(--apple-subtext)]">
              {mode === 'signin'
                ? 'Sign in to access your digital court passes and reservations.'
                : 'Create an account to book courts and join the facility.'}
            </p>
          </div>

          {/* Apple Segmented Control */}
          <div className="flex rounded-full bg-black/[0.05] dark:bg-white/[0.06] p-1 border border-[var(--apple-border)] mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('signin')
                setErrorMsg(null)
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[var(--apple-card)] text-[var(--apple-text)] shadow-sm'
                  : 'text-[var(--apple-subtext)] hover:text-[var(--apple-text)]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setErrorMsg(null)
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[var(--apple-card)] text-[var(--apple-text)] shadow-sm'
                  : 'text-[var(--apple-subtext)] hover:text-[var(--apple-text)]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 px-4 rounded-2xl border border-[var(--apple-border)] bg-[var(--apple-card)] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] text-[var(--apple-text)] font-medium text-xs sm:text-sm flex items-center justify-center gap-3 transition-colors mb-6 shadow-sm cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-[var(--apple-border)] w-full" />
            <span className="bg-[var(--apple-bg)] px-3 text-[11px] uppercase tracking-widest text-[var(--apple-subtext)] font-medium">
              Or with email
            </span>
          </div>

          {/* Registration Confirmation Notice */}
          {signUpSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-[#34c759]/10 border border-[#34c759]/20 text-center space-y-3"
            >
              <CheckCircle2 className="w-10 h-10 text-[#34c759] mx-auto" />
              <h3 className="font-display font-bold text-lg text-[var(--apple-text)]">Check Your Inbox</h3>
              <p className="text-xs text-[var(--apple-subtext)] leading-relaxed">
                We sent a confirmation link to <span className="text-[#34c759] font-medium">{email}</span>. Click
                the link to activate your account and start booking courts.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSignUpSuccess(false)
                  setMode('signin')
                }}
                className="mt-2 px-5 py-2 rounded-full bg-[var(--apple-pill-bg)] text-[var(--apple-pill-text)] font-semibold text-xs transition-opacity hover:opacity-90 cursor-pointer"
              >
                Back to Sign In
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleAuth} className="space-y-4">
              <AnimatePresence mode="wait">
                {mode === 'signup' && (
                  <motion.div
                    key="signup-fields"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-medium text-[var(--apple-subtext)] mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--apple-subtext)]" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Alex Morgan"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-[var(--apple-border)] text-[var(--apple-text)] placeholder-[var(--apple-subtext)] text-xs sm:text-sm focus:outline-none focus:border-[#34c759] transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[var(--apple-subtext)] mb-1.5">
                        Phone Number (Optional)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--apple-subtext)]" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+63 917 123 4567"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-[var(--apple-border)] text-[var(--apple-text)] placeholder-[var(--apple-subtext)] text-xs sm:text-sm focus:outline-none focus:border-[#34c759] transition-colors"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-xs font-medium text-[var(--apple-subtext)] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--apple-subtext)]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="player@pickcourt.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-[var(--apple-border)] text-[var(--apple-text)] placeholder-[var(--apple-subtext)] text-xs sm:text-sm focus:outline-none focus:border-[#34c759] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--apple-subtext)] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--apple-subtext)]" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] border border-[var(--apple-border)] text-[var(--apple-text)] placeholder-[var(--apple-subtext)] text-xs sm:text-sm focus:outline-none focus:border-[#34c759] transition-colors"
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-500"
                >
                  {errorMsg}
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-full bg-[var(--apple-pill-bg)] text-[var(--apple-pill-text)] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing…</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-[11px] text-[var(--apple-subtext)]">
                By continuing, you agree to PickCourt&apos;s{' '}
                <Link href="/terms" className="underline hover:text-[var(--apple-text)]">
                  Terms of Service
                </Link>
                .
              </div>
            </form>
          )}

          {/* Real Staff & Test Accounts 1-Click Fill */}
          <div className="mt-8 pt-6 border-t border-[var(--apple-border)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold tracking-wider text-[var(--apple-subtext)] uppercase">
                Staff & Test Credentials
              </span>
              <span className="text-[10px] text-[#34c759] font-medium">1-Click Fill</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setMode('signin')
                  setEmail('superadmin@pickcourt.com')
                  setPassword('Password123!')
                  setErrorMsg(null)
                  toast.success('Loaded Super Admin credentials')
                }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[var(--apple-card)] border border-[var(--apple-border)] hover:border-black/20 dark:hover:border-white/20 transition-all group text-center shadow-sm cursor-pointer"
              >
                <span className="text-xs font-semibold text-[var(--apple-text)] group-hover:text-[#0071e3] transition-colors">
                  Super Admin
                </span>
                <span className="text-[10px] text-[var(--apple-subtext)] mt-0.5">Facility Director</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signin')
                  setEmail('admin@pickcourt.com')
                  setPassword('Password123!')
                  setErrorMsg(null)
                  toast.success('Loaded Court Manager credentials')
                }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[var(--apple-card)] border border-[var(--apple-border)] hover:border-black/20 dark:hover:border-white/20 transition-all group text-center shadow-sm cursor-pointer"
              >
                <span className="text-xs font-semibold text-[var(--apple-text)] group-hover:text-[#34c759] transition-colors">
                  Admin
                </span>
                <span className="text-[10px] text-[var(--apple-subtext)] mt-0.5">Court Marshal</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signin')
                  setEmail('player@pickcourt.com')
                  setPassword('Password123!')
                  setErrorMsg(null)
                  toast.success('Loaded Customer Player credentials')
                }}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[var(--apple-card)] border border-[var(--apple-border)] hover:border-black/20 dark:hover:border-white/20 transition-all group text-center shadow-sm cursor-pointer"
              >
                <span className="text-xs font-semibold text-[var(--apple-text)] group-hover:text-[#ff9f0a] transition-colors">
                  Customer
                </span>
                <span className="text-[10px] text-[var(--apple-subtext)] mt-0.5">Player Pass</span>
              </button>
            </div>
            <p className="mt-3 text-[11px] text-[var(--apple-subtext)] leading-relaxed text-center">
              Tap any role above to load its real Supabase account credentials with password <code className="font-mono text-[var(--apple-text)] font-semibold">Password123!</code>.
            </p>
          </div>
        </div>
      </div>

      {/* ── Google OAuth Helper & Demo Modal ───────────────────────────────── */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-3xl bg-[var(--apple-card)] border border-[var(--apple-border)] p-6 sm:p-7 shadow-2xl space-y-5 text-left"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-[var(--apple-border)] flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                      <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z" />
                      <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-[var(--apple-text)]">
                      Google Sign-In Configuration
                    </h3>
                    <p className="text-xs text-[var(--apple-subtext)]">
                      Supabase Environment Status
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="p-1.5 rounded-full hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-[var(--apple-subtext)] transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Notice Explanation */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-[var(--apple-text)] space-y-1.5">
                <p className="font-semibold text-amber-600 dark:text-amber-400">
                  Placeholder Supabase Credentials Active
                </p>
                <p className="text-[var(--apple-subtext)] leading-relaxed">
                  Your <code className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-[11px]">.env.local</code> currently contains <code className="font-mono text-[11px]">your-supabase-project.supabase.co</code>. Clicking Google Sign-In previously attempted to navigate to that non-existent address (<code className="font-mono text-[11px]">DNS_PROBE_FINISHED_NXDOMAIN</code>).
                </p>
              </div>

              {/* Option 1: Instant Test Demo */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-[var(--apple-text)]">Option A: Instant Demo Test</p>
                <button
                  type="button"
                  onClick={handleDemoGoogleSignIn}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[var(--apple-pill-bg)] text-[var(--apple-pill-text)] font-semibold text-xs hover:opacity-90 transition-all shadow-sm active:scale-98 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} />
                    <span>Continue with Demo Google Account (Alex Morgan)</span>
                  </div>
                  <ArrowRight size={14} />
                </button>
                <p className="text-[11px] text-[var(--apple-subtext)]">
                  Immediately logs in as an authenticated customer to test court booking, digital passes, and wallet access.
                </p>
              </div>

              {/* Option 2: Live Setup Guide */}
              <div className="border-t border-[var(--apple-border)] pt-4 space-y-3">
                <button
                  type="button"
                  onClick={() => setShowSetupGuide(!showSetupGuide)}
                  className="w-full flex items-center justify-between text-xs font-medium text-[var(--apple-text)] hover:text-[#0071e3] transition-colors py-1 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle size={14} />
                    <span>Option B: How to enable real Google Login (Production)</span>
                  </span>
                  {showSetupGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {showSetupGuide && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-[var(--apple-border)] space-y-2 text-[11px] text-[var(--apple-subtext)] leading-relaxed"
                  >
                    <p className="font-semibold text-[var(--apple-text)]">3-Step Production Setup:</p>
                    <ol className="list-decimal pl-4 space-y-1.5">
                      <li>
                        <strong>Create Google OAuth Client:</strong> In Google Cloud Console &gt; APIs &amp; Services &gt; Credentials, create an OAuth 2.0 Web Client. Set Authorized redirect URI to:
                        <br />
                        <code className="inline-block mt-1 px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-[10px] break-all">
                          https://&lt;your-supabase-project&gt;.supabase.co/auth/v1/callback
                        </code>
                      </li>
                      <li>
                        <strong>Enable in Supabase:</strong> In your Supabase Dashboard &gt; Authentication &gt; Providers &gt; Google, paste your Client ID and Client Secret, then click <em>Save</em>.
                      </li>
                      <li>
                        <strong>Update .env.local:</strong> Replace <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> with your live Supabase project credentials.
                      </li>
                    </ol>
                  </motion.div>
                )}
              </div>

              {/* Dismiss */}
              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-medium text-[var(--apple-subtext)] hover:text-[var(--apple-text)] transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--apple-bg)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#34c759]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
