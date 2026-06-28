import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const messageSchema = z.object({
  conversationId: z.coerce.number().int().positive('Invalid conversation ID'),
  text: z.string().min(1, 'Message text cannot be empty'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
