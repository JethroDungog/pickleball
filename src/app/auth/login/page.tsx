'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import { Zap, Mail, Lock, User, Phone, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react'
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
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
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
          router.push(redirectTo)
          router.refresh()
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
              phone: phone.trim() || undefined,
            },
          },
        })

        if (error) {
          setErrorMsg(error.message)
          toast.error(error.message)
        } else {
          if (data.session) {
            toast.success('Account created!')
            router.push(redirectTo)
            router.refresh()
          } else {
            setSignUpSuccess(true)
            toast.success('Registration successful! Please check your email to confirm.')
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    const origin = window.location.origin
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    })
    if (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-court-dark flex flex-col lg:flex-row text-slate-100">
      {/* Left Column: Athletic Branding & Visual Court Lines */}
      <div className="relative hidden lg:flex lg:w-1/2 bg-[#090e0a] border-r border-white/10 flex-col justify-between p-12 overflow-hidden">
        {/* Animated Court SVG background */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full" viewBox="0 0 600 600" fill="none">
            <rect x="50" y="50" width="500" height="500" rx="8" stroke="#39ff14" strokeWidth="2" />
            <line x1="300" y1="50" x2="300" y2="550" stroke="#39ff14" strokeWidth="4" />
            <line x1="180" y1="50" x2="180" y2="550" stroke="#39ff14" strokeWidth="2" strokeDasharray="6 6" />
            <line x1="420" y1="50" x2="420" y2="550" stroke="#39ff14" strokeWidth="2" strokeDasharray="6 6" />
            <circle cx="300" cy="50" r="8" fill="#39ff14" />
            <circle cx="300" cy="550" r="8" fill="#39ff14" />
          </svg>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, #39ff1410 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        {/* Top Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2">
            <Zap className="w-7 h-7 text-neon-green fill-neon-green drop-shadow-[0_0_8px_#39ff14]" />
            <span className="font-display font-black text-3xl tracking-tight text-white">
              <span className="text-neon-green">PICK</span>COURT
            </span>
          </Link>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-green/10 border border-neon-green/20">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-neon-green font-semibold">24/7 Premium Facility</span>
          </div>
        </div>

        {/* Center Editorial Quote */}
        <div className="relative z-10 max-w-md my-auto">
          <p className="text-xs uppercase tracking-[4px] text-neon-green/70 font-bold mb-3">Athletic Excellence</p>
          <h2 className="font-display font-black text-4xl text-white tracking-tight leading-tight">
            YOUR COURT IS WAITING. LOCK IN YOUR SESSION.
          </h2>
          <p className="mt-4 text-slate-400 text-sm leading-relaxed">
            Instant booking, zero double-booking guarantee, high-visibility tournament lighting, and pro-grade surfaces.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
            <div>
              <p className="font-display font-black text-2xl text-neon-green">4</p>
              <p className="text-xs text-slate-500 uppercase">Championship Courts</p>
            </div>
            <div>
              <p className="font-display font-black text-2xl text-neon-cyan">100%</p>
              <p className="text-xs text-slate-500 uppercase">Atomic Concurrency</p>
            </div>
            <div>
              <p className="font-display font-black text-2xl text-amber-400">24/7</p>
              <p className="text-xs text-slate-500 uppercase">Digital Access</p>
            </div>
          </div>
        </div>

        {/* Bottom footer credit */}
        <div className="relative z-10 text-xs text-slate-600 flex items-center justify-between">
          <span>© {new Date().getFullYear()} PickCourt Inc.</span>
          <span className="text-slate-500">Fast · Frictionless · Tactile</span>
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-16 sm:px-12 lg:px-20 relative">
        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
              {mode === 'signin' ? 'WELCOME BACK' : 'JOIN PICKCOURT'}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {mode === 'signin'
                ? 'Sign in to access your digital court passes and reservations.'
                : 'Create an account to book courts and join the facility.'}
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex rounded-xl bg-court-surface p-1 border border-white/10 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('signin')
                setErrorMsg(null)
              }}
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-neon-green text-black shadow-[0_0_12px_rgba(57,255,20,0.4)]'
                  : 'text-slate-400 hover:text-white'
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
              className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-neon-green text-black shadow-[0_0_12px_rgba(57,255,20,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-medium text-sm flex items-center justify-center gap-3 transition-colors mb-6 group"
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
            <div className="border-t border-white/10 w-full" />
            <span className="bg-court-dark px-3 text-xs uppercase tracking-widest text-slate-500 font-semibold">
              Or with email
            </span>
          </div>

          {/* Registration Confirmation Notice */}
          {signUpSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl bg-neon-green/10 border border-neon-green/30 text-center"
            >
              <CheckCircle2 className="w-12 h-12 text-neon-green mx-auto mb-3" />
              <h3 className="font-display font-bold text-lg text-white">Check Your Inbox</h3>
              <p className="text-sm text-slate-300 mt-2">
                We sent a confirmation link to <span className="text-neon-green font-semibold">{email}</span>. Click
                the link to activate your account and start booking courts.
              </p>
              <button
                onClick={() => {
                  setSignUpSuccess(false)
                  setMode('signin')
                }}
                className="mt-4 px-4 py-2 rounded-lg bg-neon-green text-black font-bold text-xs uppercase tracking-wider"
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
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Alex Morgan"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-court-surface border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-neon-green transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                        Phone Number (Optional)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 019-2834"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-court-surface border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-neon-green transition-colors"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="player@pickcourt.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-court-surface border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-neon-green transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-court-surface border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-neon-green transition-colors"
                  />
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400"
                >
                  {errorMsg}
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-neon-green text-black font-display font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-[#32e012] transition-all shadow-[0_0_20px_rgba(57,255,20,0.4)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
                By continuing, you agree to PickCourt's{' '}
                <Link href="/terms" className="text-slate-400 underline hover:text-white">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-slate-400 underline hover:text-white">
                  Privacy Policy
                </Link>
                .
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-court-dark flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-neon-green" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
