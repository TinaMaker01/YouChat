import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hashPassword, verifyPassword } from './auth';

describe('Auth Utilities', () => {
  it('should hash and verify passwords correctly', async () => {
    const password = 'password123';
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(await verifyPassword(password, hash)).toBe(true);
    expect(await verifyPassword('wrongpassword', hash)).toBe(false);
  });
});
