import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const sendMessageSchema = z.object({
  conversationId: z.union([z.string(), z.number()]).transform((val) => Number(val)),
  text: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
});
