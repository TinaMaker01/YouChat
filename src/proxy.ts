import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = process.env.JWT_SECRET;
if (!secret && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production');
}
const JWT_SECRET = new TextEncoder().encode(secret || 'dev-secret-at-least-32-chars-long');

export async function proxy(request: NextRequest) {
  const session = request.cookies.get('session')?.value;

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
                          request.nextUrl.pathname === '/';

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/register');

  if (isProtectedRoute) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    try {
      await jwtVerify(session, JWT_SECRET, {
        algorithms: ['HS256'],
      });
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (isAuthRoute && session) {
    try {
      await jwtVerify(session, JWT_SECRET, {
        algorithms: ['HS256'],
      });
      return NextResponse.redirect(new URL('/', request.url));
    } catch {
      // Invalid session, let them go to auth routes
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
