'use server';

import { createMessage } from '@/lib/messaging';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth';

/**
 * Server action to send a message.
 * It persists the message to the database and revalidates the home page path.
 * @param conversationId - The ID of the conversation.
 * @param text - The content of the message.
 * @returns A promise that resolves to the result of the message creation.
 * @throws Error if the message creation fails.
 */
export async function sendMessage(conversationId: number, text: string) {
  try {
    const session = await getSession();
    if (!session) {
      throw new Error('Unauthorized');
    }

    const result = await createMessage(conversationId, text, 'me', session.userId);

    // Revalidate the home page to update the conversation list (last message, etc.)
    revalidatePath('/');

    return result;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw new Error('Failed to send message');
  }
}
