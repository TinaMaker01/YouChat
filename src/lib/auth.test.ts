import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSession } from './auth';
import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

// Mock jose
vi.mock('jose', async (importOriginal) => {
  const actual = await importOriginal<typeof import('jose')>();
  return {
    ...actual,
    jwtVerify: vi.fn(),
  };
});

describe('auth.ts - getSession', () => {
  const secret = new TextEncoder().encode('dev-secret-at-least-32-chars-long');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null if no session cookie exists', async () => {
    const mockCookieStore = {
      get: vi.fn().mockReturnValue(undefined),
    };
    (cookies as any).mockResolvedValue(mockCookieStore);

    const session = await getSession();
    expect(session).toBeNull();
  });

  it('should return payload if session cookie is valid', async () => {
    const userId = 'user-123';
    const mockToken = 'valid-token';
    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: mockToken }),
    };
    (cookies as any).mockResolvedValue(mockCookieStore);

    (jwtVerify as any).mockResolvedValue({
      payload: { userId },
    });

    const session = await getSession();
    expect(session).toEqual({ userId });
    expect(jwtVerify).toHaveBeenCalledWith(mockToken, expect.any(Uint8Array), {
      algorithms: ['HS256'],
    });
  });

  it('should return null if jwtVerify throws error', async () => {
    const mockToken = 'invalid-token';
    const mockCookieStore = {
      get: vi.fn().mockReturnValue({ value: mockToken }),
    };
    (cookies as any).mockResolvedValue(mockCookieStore);

    (jwtVerify as any).mockRejectedValue(new Error('Invalid token'));

    const session = await getSession();
    expect(session).toBeNull();
  });
});
