'use server';

import { getSession } from '@/lib/auth';
import { addMessage } from '@/lib/messaging';
import { revalidatePath } from 'next/cache';

export async function sendMessage(conversationId: number, text: string) {
  try {
    const session = await getSession();
    if (!session) {
      throw new Error('Unauthorized');
    }

    const message = await addMessage(conversationId, session.userId, text, 'me');

    revalidatePath('/');

    return message;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw new Error('Failed to send message');
  }
}
