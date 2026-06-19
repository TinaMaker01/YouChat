import { openDb } from './db';

/**
 * Creates a new message in the database and updates the corresponding conversation's last message.
 * @param conversationId - The ID of the conversation.
 * @param text - The content of the message.
 * @param sender - The sender of the message ('me' or 'them').
 * @returns A promise that resolves to the newly created message object.
 */
export async function createMessage(conversationId: number, text: string, sender: 'me' | 'them') {
  const db = await openDb();

  const result = await db.run(
    'INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?)',
    conversationId, sender, text
  );

  // Update last_message in conversation to reflect the latest interaction
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
