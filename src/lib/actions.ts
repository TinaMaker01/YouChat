'use server';

import { createMessage } from '@/lib/messaging';
import { revalidatePath } from 'next/cache';

export async function sendMessage(conversationId: number, text: string) {
  try {
    const result = await createMessage(conversationId, text, 'me');

    revalidatePath('/');

    return result;
  } catch (error) {
    console.error('Failed to send message:', error);
    throw new Error('Failed to send message');
  }
}
