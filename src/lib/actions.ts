'use server';

import { createMessage, verifyConversationOwnership } from '@/lib/messaging';
import { revalidatePath } from 'next/cache';
import { getSession } from './auth';

/**
 * Server action to send a message.
 * It persists the message to the database and revalidates the home page path.
 * Verifies that the user has access to the conversation before sending.
 * @param conversationId - The ID of the conversation.
 * @param text - The content of the message.
 * @returns A promise that resolves to the result of the message creation.
 * @throws Error if the message creation fails or unauthorized.
 */
export async function sendMessage(conversationId: number, text: string) {
  try {
    const session = await getSession();
    if (!session) {
      throw new Error('Unauthorized');
    }

    // Verify conversation belongs to user
    const hasAccess = await verifyConversationOwnership(conversationId, session.userId);

    if (!hasAccess) {
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
