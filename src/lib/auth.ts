import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { JWT_SECRET } from './config';

/**
 * Hashes a plain text password using bcrypt.
 * @param password - The plain text password to hash.
 * @returns A promise that resolves to the hashed password.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Verifies a plain text password against a hashed password.
 * @param password - The plain text password.
 * @param hash - The hashed password to compare against.
 * @returns A promise that resolves to true if the password matches, false otherwise.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Creates a new session by signing a JWT and setting it as an HttpOnly cookie.
 * @param userId - The ID of the user for whom the session is being created.
 */
export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });
}

/**
 * Retrieves the current session from the cookies and verifies the JWT.
 * @returns A promise that resolves to the session payload if valid, or null otherwise.
 */
export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;

  try {
    const { payload } = await jwtVerify(session, JWT_SECRET, {
      algorithms: ['HS256'],
    });
    return payload as { userId: string };
  } catch {
    return null;
  }
}

/**
 * Deletes the session cookie, effectively logging out the user.
 */
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}
