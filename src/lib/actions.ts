'use server';

import { createMessage } from '@/lib/messaging';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function sendMessage(conversationId: number, text: string) {
  try {
    const session = await getSession();
    if (!session) {
      throw new Error('Unauthorized');
    }

    const result = await createMessage(conversationId, text, 'me', session.userId);

    revalidatePath('/');

    return result;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw new Error('Failed to send message');
  }
}
