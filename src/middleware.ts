import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as any),
          )
        },
      },
    },
  )

  // Refresh session – must not run any supabase calls before this
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── Route protection helpers ────────────────────────────────────────────────
  const isDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/')
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/')
  const isSuperAdmin = pathname === '/super-admin' || pathname.startsWith('/super-admin/')
  const isProtected = isDashboard || isAdmin || isSuperAdmin

  if (!isProtected) return supabaseResponse

  // ── Require authentication ──────────────────────────────────────────────────
  if (!user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Fetch profile role for role-gated routes ────────────────────────────────
  if (isAdmin || isSuperAdmin) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role as string | undefined

    if (isSuperAdmin && role !== 'super_admin') {
      const unauthorizedUrl = request.nextUrl.clone()
      unauthorizedUrl.pathname = '/unauthorized'
      return NextResponse.redirect(unauthorizedUrl)
    }

    if (isAdmin && role !== 'admin' && role !== 'super_admin') {
      const unauthorizedUrl = request.nextUrl.clone()
      unauthorizedUrl.pathname = '/unauthorized'
      return NextResponse.redirect(unauthorizedUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico
     * - common static asset extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}
