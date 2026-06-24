import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from './auth';

describe('Auth Utilities', () => {
  describe('password hashing', () => {
    it('should hash a password and verify it correctly', async () => {
      const password = 'mySecurePassword123';
      const hash = await hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20);

      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = await verifyPassword('wrongPassword', hash);
      expect(isInvalid).toBe(false);
    });
  });
});
