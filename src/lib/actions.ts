'use server';

import { openDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function sendMessage(conversationId: number, text: string) {
  try {
    const db = await openDb();

    const result = await db.run(
      'INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?)',
      conversationId, 'me', text
    );

    // Update last_message in conversation
    await db.run(
      'UPDATE conversations SET last_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      text, conversationId
    );

    revalidatePath('/');

    return {
      id: result.lastID,
      conversation_id: conversationId,
      sender: 'me',
      text,
      created_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Failed to send message:', error);
    throw new Error('Failed to send message');
  }
}
