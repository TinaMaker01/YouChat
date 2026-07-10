import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = process.env.JWT_SECRET;
if (!secret && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production');
}
const JWT_SECRET = new TextEncoder().encode(secret || 'dev-secret-at-least-32-chars-long');

/**
 * Custom middleware for route protection and session verification.
 *
 * NOTE: In Next.js 16, the standard `middleware.ts` can be replaced or complemented
 * by a custom proxy pattern (often in `src/proxy.ts`) to handle advanced routing,
 * session verification, and request/response manipulation at the edge.
 *
 * This proxy function:
 * 1. Identifies protected routes vs. public/auth routes.
 * 2. Checks for a valid 'session' cookie (JWT).
 * 3. Redirects unauthenticated users from protected routes to '/login'.
 * 4. Redirects authenticated users away from '/login' or '/register' to the home page.
 *
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
