import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware — UX redirects only, NOT a security boundary.
 * Every Server Action / Route Handler must verify session independently.
 *
 * Responsibilities:
 * 1. Refresh Supabase session on every request (keeps cookies fresh)
 * 2. Redirect unauthenticated users away from protected routes → /login
 * 3. Redirect authenticated users to their role-appropriate home
 * 4. Cross-role redirects: ATHLETE on /portal → /dashboard, COACH on /dashboard → /portal
 */
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — MUST be called to keep auth cookies valid
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected routes — redirect to login if unauthenticated
  const protectedPrefixes = ['/dashboard', '/portal', '/family', '/onboarding'];
  const isProtected = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  // Role from user_metadata (set during registration)
  const role = user?.user_metadata?.role as string | undefined;

  // Cross-role redirects — ATHLETE can't access /portal, COACH can't access /dashboard
  if (user && role) {
    // ATHLETEs visiting coach routes → redirect to /dashboard
    if (role === 'ATHLETE' && pathname.startsWith('/portal')) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    // COACHes visiting athlete dashboard → redirect to /portal
    if (role === 'COACH' && pathname.startsWith('/dashboard')) {
      const url = request.nextUrl.clone();
      url.pathname = '/portal';
      return NextResponse.redirect(url);
    }

    // COACHes should not access /onboarding (athlete-only flow)
    if (role === 'COACH' && pathname.startsWith('/onboarding')) {
      const url = request.nextUrl.clone();
      url.pathname = '/portal';
      return NextResponse.redirect(url);
    }
  }

  // Auth routes — redirect to role-appropriate home if already authenticated
  const authRoutes = ['/login', '/register'];
  const isAuthRoute = authRoutes.includes(pathname);

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone();
    if (role === 'COACH') {
      url.pathname = '/portal';
    } else {
      url.pathname = '/dashboard';
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static assets (svg, png, jpg, etc.)
     * - API routes (handled by their own auth checks)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
