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

  // Update last_message and updated_at in conversation
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

  // If the message is from 'me', trigger a mock chatbot response after a human-like delay
  if (sender === 'me') {
    /**
     * Simulate a response delay.
     * 1. Short delay before "typing" starts (handled in client UI)
     * 2. Longer delay before the message is actually "sent" by the bot
     */
    const responseDelay = 2000 + Math.random() * 2000; // 2-4 seconds

    setTimeout(async () => {
      const responses = [
        "That's interesting! Tell me more.",
        "I see. What do you think about that?",
        "Got it. Is there anything else?",
        "That makes sense. How can I help further?",
        "I'm a chatbot, and I'm here to assist you!",
        "Messenger is looking great, isn't it?",
        "Have you tried the new search feature yet?",
        "I like how the messages are grouped now."
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      // Re-open db in the timeout scope to ensure it's fresh
      const timeoutDb = await openDb();
      await timeoutDb.run(
        'INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?)',
        conversationId, 'them', randomResponse
      );
      await timeoutDb.run(
        'UPDATE conversations SET last_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        randomResponse, conversationId
      );
    }, responseDelay);
  }

  return newMessage;
}
