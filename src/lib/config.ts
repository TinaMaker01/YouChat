/**
 * Centralized configuration for the application.
 */

const secret = process.env.JWT_SECRET;
if (!secret && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production');
}

export const JWT_SECRET = new TextEncoder().encode(secret || 'dev-secret-at-least-32-chars-long');
