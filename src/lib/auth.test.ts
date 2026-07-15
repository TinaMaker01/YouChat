import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hashPassword, verifyPassword, createSession, getSession, deleteSession } from './auth';
import { cookies } from 'next/headers';

// Mock next/headers cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('auth.ts', () => {
  const mockCookieStore = {
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (cookies as any).mockResolvedValue(mockCookieStore);
  });

  describe('password hashing', () => {
    it('should hash a password and verify it', async () => {
      const password = 'mySecretPassword';
      const hash = await hashPassword(password);

      expect(hash).not.toBe(password);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword('wrongPassword', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('sessions', () => {
    it('should create a session cookie', async () => {
      const userId = 'user-123';
      await createSession(userId);

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        'session',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          path: '/',
        })
      );
    });

    it('should get a session from cookies', async () => {
      const userId = 'user-123';

      // First create a session to get a valid token
      // We need to capture the token passed to set
      let token = '';
      mockCookieStore.set.mockImplementation((name, value) => {
        if (name === 'session') token = value;
      });

      await createSession(userId);

      mockCookieStore.get.mockReturnValue({ value: token });

      const session = await getSession();
      expect(session).toMatchObject({ userId });
    });

    it('should return null for invalid or missing session', async () => {
      mockCookieStore.get.mockReturnValue(undefined);
      const session = await getSession();
      expect(session).toBeNull();

      mockCookieStore.get.mockReturnValue({ value: 'invalid-token' });
      const invalidSession = await getSession();
      expect(invalidSession).toBeNull();
    });

    it('should delete the session cookie', async () => {
      await deleteSession();
      expect(mockCookieStore.delete).toHaveBeenCalledWith('session');
    });
  });
});
