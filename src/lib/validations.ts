import { z } from 'zod';

/**
 * Schema for creating a new message.
 */
export const createMessageSchema = z.object({
  conversationId: z.union([z.string(), z.number()]).transform((val) => Number(val)),
  text: z.string().min(1, 'Message text cannot be empty').max(2000, 'Message is too long'),
});

/**
 * Schema for fetching messages.
 */
export const getMessagesSchema = z.object({
  conversationId: z.string().min(1, 'conversationId is required'),
});

/**
 * Schema for conversation operations.
 */
export const conversationSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  name: z.string().min(1),
  avatar: z.string().url().optional().or(z.literal('')),
  last_message: z.string().optional(),
});
