import { z } from 'zod';

/**
 * Schema for user login.
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Schema for user registration.
 */
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

/**
 * Schema for sending a message.
 */
export const sendMessageSchema = z.object({
  conversationId: z.union([z.number(), z.string().transform((val) => Number(val))]),
  text: z.string().min(1, 'Message text cannot be empty').max(2000, 'Message too long'),
});

/**
 * Schema for fetching messages (query params).
 */
export const fetchMessagesSchema = z.object({
  conversationId: z.string().transform((val) => Number(val)).refine((val) => !isNaN(val), {
    message: 'conversationId must be a valid number',
  }),
});
