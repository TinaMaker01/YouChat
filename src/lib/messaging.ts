import { openDb } from './db';

/**
 * Fetches all conversations for a specific user.
 * @param userId The ID of the logged-in user.
 */
export async function getConversations(userId: string) {
  const db = await openDb();
  return db.all(
    'SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC',
    userId
  );
}

/**
 * Fetches all messages for a specific conversation, verifying user ownership.
 * @param conversationId The ID of the conversation.
 * @param userId The ID of the logged-in user.
 */
export async function getMessages(conversationId: number, userId: string) {
  const db = await openDb();

  // Verify that the conversation belongs to the user
  const conversation = await db.get(
    'SELECT id FROM conversations WHERE id = ? AND user_id = ?',
    conversationId,
    userId
  );

  if (!conversation) {
    throw new Error('Conversation not found or unauthorized');
  }

  return db.all(
    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
    conversationId
  );
}

/**
 * Creates a new message in a conversation, verifying user ownership.
 * @param conversationId The ID of the conversation.
 * @param text The message content.
 * @param sender Whether the sender is 'me' (the user) or 'them' (the contact/bot).
 * @param userId The ID of the logged-in user (optional if sender is 'them').
 */
export async function createMessage(
  conversationId: number,
  text: string,
  sender: 'me' | 'them',
  userId?: string
) {
  const db = await openDb();

  if (sender === 'me') {
    if (!userId) throw new Error('userId is required for user messages');

    // Verify ownership
    const conversation = await db.get(
      'SELECT id FROM conversations WHERE id = ? AND user_id = ?',
      conversationId,
      userId
    );

    if (!conversation) {
      throw new Error('Conversation not found or unauthorized');
    }
  }

  const result = await db.run(
    'INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?)',
    conversationId,
    sender,
    text
  );

  // Update last_message in conversation
  await db.run(
    'UPDATE conversations SET last_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    text,
    conversationId
  );

  return {
    id: result.lastID,
    conversation_id: conversationId,
    sender,
    text,
    created_at: new Date().toISOString(),
  };
}
