import { describe, it, expect, vi, type Mock } from 'vitest';
import { hashPassword, verifyPassword } from '../lib/auth';
import bcrypt from 'bcryptjs';

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

describe('Auth Library', () => {
  it('should hash password correctly', async () => {
    const password = 'my-password';
    const hashedPassword = 'hashed-password';
    (bcrypt.hash as Mock).mockResolvedValue(hashedPassword);

    const result = await hashPassword(password);

    expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
    expect(result).toBe(hashedPassword);
  });

  it('should verify password correctly', async () => {
    const password = 'my-password';
    const hash = 'hashed-password';
    (bcrypt.compare as Mock).mockResolvedValue(true);

    const result = await verifyPassword(password, hash);

    expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
    expect(result).toBe(true);
  });
});
