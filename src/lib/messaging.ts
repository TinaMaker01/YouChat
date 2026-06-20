import { openDb } from './db';

/**
 * Fetches all conversations for a specific user.
 */
export async function getConversations(userId: string) {
  const db = await openDb();
  return db.all(
    'SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC',
    userId
  );
}

/**
 * Fetches all messages for a specific conversation, ensuring it belongs to the user.
 */
export async function getMessages(conversationId: number, userId: string) {
  const db = await openDb();

  // Verify ownership
  const conversation = await db.get(
    'SELECT id FROM conversations WHERE id = ? AND user_id = ?',
    conversationId, userId
  );

  if (!conversation) {
    throw new Error('Unauthorized or conversation not found');
  }

  return db.all(
    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
    conversationId
  );
}

/**
 * Creates a new message in a conversation.
 */
export async function createMessage(conversationId: number, text: string, sender: 'me' | 'them', userId?: string) {
  const db = await openDb();

  // If userId is provided, verify ownership
  if (userId) {
    const conversation = await db.get(
      'SELECT id FROM conversations WHERE id = ? AND user_id = ?',
      conversationId, userId
    );

    if (!conversation) {
      throw new Error('Unauthorized or conversation not found');
    }
  }

  const result = await db.run(
    'INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?)',
    conversationId, sender, text
  );

  // Update last_message in conversation
  await db.run(
    'UPDATE conversations SET last_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    text, conversationId
  );

  // Trigger automated chatbot response if the message is from 'me'
  if (sender === 'me') {
    // In a real application, this would call an external API like OpenAI
    // For now, we simulate a delay and then post a response
    setTimeout(async () => {
      const responses = [
        "That's interesting! Tell me more.",
        "I see. How does that make you feel?",
        "Got it! I'm on it.",
        "That sounds like a great idea!",
        "Can you clarify what you mean by that?",
        "Interesting perspective. I'll have to think about that."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      try {
        await createMessage(conversationId, randomResponse, 'them');
      } catch (err) {
        console.error('Chatbot failed to respond:', err);
      }
    }, 1500);
  }

  return {
    id: result.lastID,
    conversation_id: conversationId,
    sender,
    text,
    created_at: new Date().toISOString()
  };
}
