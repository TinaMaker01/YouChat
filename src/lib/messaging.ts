import { openDb } from './db';

/**
 * Creates a new message in the database and updates the corresponding conversation's last message.
 * @param conversationId - The ID of the conversation.
 * @param text - The content of the message.
 * @param sender - The sender of the message ('me' or 'them').
 * @param userId - Optional user ID to verify ownership (required for 'me' sender).
 * @returns A promise that resolves to the newly created message object.
 */
export async function createMessage(conversationId: number, text: string, sender: 'me' | 'them', userId?: string) {
  const db = await openDb();

  // Security check: Verify conversation ownership if userId is provided or if sender is 'me'
  if (sender === 'me' || userId) {
    if (!userId) {
      throw new Error('User ID is required for sending messages');
    }
    const conversation = await db.get(
      'SELECT id FROM conversations WHERE id = ? AND user_id = ?',
      conversationId, userId
    );
    if (!conversation) {
      throw new Error('Conversation not found or access denied');
    }
  }

  const result = await db.run(
    'INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?)',
    conversationId, sender, text
  );

  // Update last_message in conversation to reflect the latest interaction
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

  // If the message is from 'me', trigger a mock chatbot response after a short delay
  if (sender === 'me') {
    // Simulate a slightly more sophisticated chatbot response
    const delay = Math.floor(Math.random() * 2000) + 500; // Random delay between 0.5s and 2.5s

    setTimeout(async () => {
      const responses = [
        "That's interesting! Tell me more.",
        "I see. What do you think about that?",
        "Got it. Is there anything else?",
        "That makes sense. How can I help further?",
        "I'm a chatbot, and I'm here to assist you!",
        "Could you elaborate on that?",
        "Interesting point. Have you considered other perspectives?",
        "I'm processing that information. One moment...",
        "That's a great question!",
        "I'm happy to help with that."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      // Note: For chatbot responses, we don't pass userId as the bot is not the user
      await createMessage(conversationId, randomResponse, 'them');
    }, delay);
  }

  return newMessage;
}
