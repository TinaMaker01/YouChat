import { openDb } from './db';

export async function createMessage(conversationId: number, text: string, sender: 'me' | 'them') {
  const db = await openDb();

  const result = await db.run(
    'INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?)',
    conversationId, sender, text
  );

  // Update last_message in conversation
  await db.run(
    'UPDATE conversations SET last_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    text, conversationId
  );

  return {
    id: result.lastID,
    conversation_id: conversationId,
    sender,
    text,
    created_at: new Date().toISOString()
  };
}
