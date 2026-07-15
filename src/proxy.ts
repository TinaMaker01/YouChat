import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { JWT_SECRET } from '@/lib/config';

/**
 * Custom middleware (renamed to proxy.ts in Next.js 16) for route protection and session verification.
 * @param request - The incoming Next.js request object.
 * @returns A NextResponse object that either redirects the user or continues the request.
 */
export async function proxy(request: NextRequest) {
  const session = request.cookies.get('session')?.value;

  // Define protected routes that require a valid session
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                          request.nextUrl.pathname === '/';

  // Define authentication routes that should be inaccessible if already logged in
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/register');

  if (isProtectedRoute) {
    if (!session) {
      // Redirect to login if no session is present
      return NextResponse.redirect(new URL('/login', request.url));
    }
    try {
      // Verify the JWT session token
      await jwtVerify(session, JWT_SECRET, {
        algorithms: ['HS256'],
      });
    } catch {
      // Redirect to login if the session is invalid or expired
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (isAuthRoute && session) {
    try {
      // If user is already logged in, redirect away from login/register pages
      await jwtVerify(session, JWT_SECRET, {
        algorithms: ['HS256'],
      });
      return NextResponse.redirect(new URL('/', request.url));
    } catch {
      // Invalid session, let them go to auth routes to login again
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
