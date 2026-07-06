'use server';

import { createMessage } from '@/lib/messaging';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';
import { openDb } from '@/lib/db';

/**
 * Server action to send a message.
 * It persists the message to the database and revalidates the home page path.
 * @param conversationId - The ID of the conversation.
 * @param text - The content of the message.
 * @returns A promise that resolves to the result of the message creation.
 * @throws Error if the message creation fails or if unauthorized.
 */
export async function sendMessage(conversationId: number, text: string) {
  try {
    const session = await getSession();
    if (!session) {
      throw new Error('Unauthorized');
    }

    const db = await openDb();
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
    throw error instanceof Error ? error : new Error('Failed to send message');
  }
}
