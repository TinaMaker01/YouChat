import { openDb } from './db';

/**
 * Fetches all conversations for a specific user.
 * @param userId The ID of the user whose conversations to fetch.
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
 * @param userId The ID of the user requesting the messages.
 */
export async function getMessages(conversationId: number, userId: string) {
  const db = await openDb();

  // Verify conversation belongs to user
  const conversation = await db.get(
    'SELECT id FROM conversations WHERE id = ? AND user_id = ?',
    conversationId,
    userId
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
 * Creates a new message in a conversation, verifying user ownership.
 * @param conversationId The ID of the conversation.
 * @param text The message text.
 * @param sender The sender ('me' or 'them').
 * @param userId The ID of the user sending the message.
 */
export async function createMessage(conversationId: number, text: string, sender: 'me' | 'them', userId: string) {
  const db = await openDb();

  // Verify conversation belongs to user
  const conversation = await db.get(
    'SELECT id FROM conversations WHERE id = ? AND user_id = ?',
    conversationId,
    userId
  );

  if (!conversation) {
    throw new Error('Unauthorized or conversation not found');
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

  const newMessage = {
    id: result.lastID,
    conversation_id: conversationId,
    sender,
    text,
    created_at: new Date().toISOString()
  };

  // Automated chatbot response logic
  if (sender === 'me') {
    // Simulate a delay for the chatbot response
    setTimeout(async () => {
      try {
        const botResponses = [
          "That's interesting! Tell me more.",
          "I see. How does that make you feel?",
          "Got it! I'm here if you need anything else.",
          "That makes sense. What's next on your mind?",
          "Thanks for sharing that with me."
        ];
        const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];

        // Re-open DB for the background task if needed, but since it's a simple app, we just use the same logic
        const db2 = await openDb();
        await db2.run(
          'INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?)',
          conversationId, 'them', randomResponse
        );
        await db2.run(
          'UPDATE conversations SET last_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          randomResponse, conversationId
        );
      } catch (error) {
        console.error('Error in automated response:', error);
      }
    }, 1500);
  }

  return newMessage;
}
