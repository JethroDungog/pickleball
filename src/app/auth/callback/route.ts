import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'
    const redirectUrl = isLocalEnv
      ? `${origin}${next}`
      : forwardedHost
      ? `https://${forwardedHost}${next}`
      : `${origin}${next}`

    const response = NextResponse.redirect(redirectUrl)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options as any)
          })
        },
      },
    })

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data?.session) {
      // Ensure user profile exists in public.profiles to satisfy foreign keys
      const user = data.user || data.session.user
      if (user && user.email) {
        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email.split('@')[0] ||
          'Player'
        const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null

        try {
          await supabase.from('profiles').upsert(
            {
              id: user.id,
              email: user.email,
              full_name: fullName,
              avatar_url: avatarUrl,
              role: 'customer',
            },
            { onConflict: 'id', ignoreDuplicates: true },
          )
        } catch (profileErr) {
          console.error('[auth/callback] profile bootstrap warning:', profileErr)
        }
      }

      return response
    }
  }

  // Return user to login with error if exchange fails
  return NextResponse.redirect(`${origin}/auth/login?error=auth-code-exchange-failed`)
}
