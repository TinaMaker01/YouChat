'use server';

import { createMessage } from '@/lib/messaging';
import { revalidatePath } from 'next/cache';
import { getSession } from './auth';
import { openDb } from './db';

/**
 * Server action to send a message in a conversation.
 *
 * This function performs the following steps:
 * 1. Verifies the user's session.
 * 2. Checks if the conversation exists and belongs to the authenticated user.
 * 3. Persists the new message to the database.
 * 4. Triggers a Next.js path revalidation for the home page to ensure the UI stays in sync.
 *
 * @param conversationId - The unique identifier of the conversation.
 * @param text - The text content of the message to be sent.
 * @returns A promise that resolves to the newly created message object.
 * @throws Error if the user is unauthorized, the conversation is not found, or database insertion fails.
 */
export async function sendMessage(conversationId: number, text: string) {
  try {
    const session = await getSession();
    if (!session) {
      throw new Error('Unauthorized');
    }

    const db = await openDb();
    // Verify conversation belongs to user
    const conversation = await db.get(
      'SELECT id FROM conversations WHERE id = ? AND user_id = ?',
      conversationId,
      session.userId
    );

    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }

    const result = await createMessage(conversationId, text, 'me');

    // Revalidate the home page to update the conversation list (last message, etc.)
    revalidatePath('/');

    return result;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
}
