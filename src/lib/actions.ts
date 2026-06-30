'use server';

import { createMessage } from '@/lib/messaging';
import { getSession } from '@/lib/auth';
import { openDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * Server action to send a message.
 * It validates the session and conversation ownership before persisting the message.
 * @param conversationId - The ID of the conversation.
 * @param text - The content of the message.
 * @returns A promise that resolves to the result of the message creation.
 * @throws Error if the session is invalid, ownership is not verified, or message creation fails.
 */
export async function sendMessage(conversationId: number, text: string) {
  try {
    // 1. Validate session
    const session = await getSession();
    if (!session) {
      throw new Error('Unauthorized');
    }

    // 2. Verify conversation ownership
    const db = await openDb();
    const conversation = await db.get(
      'SELECT id FROM conversations WHERE id = ? AND user_id = ?',
      conversationId,
      session.userId
    );

    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }

    // 3. Create the message
    const result = await createMessage(conversationId, text, 'me');

    // 4. Revalidate the home page
    revalidatePath('/');

    return result;
  } catch (error) {
    console.error('Failed to send message:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to send message');
  }
}
