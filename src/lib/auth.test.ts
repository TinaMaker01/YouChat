import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSession, createSession, deleteSession } from './auth';
import { cookies } from 'next/headers';

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

describe('auth.ts', () => {
  const mockCookieStore = {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (cookies as any).mockResolvedValue(mockCookieStore);
  });

  it('should return null if no session cookie exists', async () => {
    mockCookieStore.get.mockReturnValue(undefined);
    const session = await getSession();
    expect(session).toBeNull();
  });

  it('should create and then retrieve a valid session', async () => {
    const userId = 'test-user-123';
    await createSession(userId);
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      'session',
      expect.any(String),
      expect.objectContaining({ httpOnly: true })
    );

    const token = mockCookieStore.set.mock.calls[0][1];
    mockCookieStore.get.mockReturnValue({ value: token });

    const session = await getSession();
    expect(session).not.toBeNull();
    expect(session?.userId).toBe(userId);
  });

  it('should delete the session on logout', async () => {
    await deleteSession();
    expect(mockCookieStore.delete).toHaveBeenCalledWith('session');
  });

  it('should return null for an invalid JWT', async () => {
    mockCookieStore.get.mockReturnValue({ value: 'invalid-token' });
    const session = await getSession();
    expect(session).toBeNull();
  });
});
