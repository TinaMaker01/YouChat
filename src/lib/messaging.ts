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

  const newMessage = {
    id: result.lastID,
    conversation_id: conversationId,
    sender,
    text,
    created_at: new Date().toISOString()
  };

  // If the message is from 'me', trigger a mock chatbot response after a short delay.
  // Note: This is an unawaited asynchronous side-effect for demonstration purposes.
  if (sender === 'me') {
    // In a real app, this might be a background job, webhook, or an external AI service call.
    // For this implementation, we simulate an asynchronous response using setTimeout.
    setTimeout(async () => {
      const responses = [
        "That's interesting! Tell me more.",
        "I see. What do you think about that?",
        "Got it. Is there anything else?",
        "That makes sense. How can I help further?",
        "I'm a chatbot, and I'm here to assist you!"
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      await createMessage(conversationId, randomResponse, 'them');
    }, 1000);
  }

  return newMessage;
}
