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

  // If the message is from 'me', trigger a mock chatbot response after a short delay
  if (sender === 'me') {
    // In a real app, this might be a background job or an async process
    // For this implementation, we'll simulate a response
    const botResponses = [
      "That's interesting! Tell me more.",
      "I see. What do you think about that?",
      "Got it. Is there anything else?",
      "That makes sense. How can I help further?",
      "I'm a chatbot, and I'm here to assist you!",
      "I'm processing your request. One moment...",
      "Can you elaborate on that?",
      "I understand. How does that make you feel?",
      "That is a great point!",
      "I'm here to help with whatever you need."
    ];

    const triggerBotResponse = async () => {
      // Simulate typing/thinking delay between 1.5 and 3 seconds
      const delay = Math.floor(Math.random() * 1500) + 1500;

      await new Promise(resolve => setTimeout(resolve, delay));

      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      await createMessage(conversationId, randomResponse, 'them');
    };

    // Execute bot response asynchronously without awaiting it here
    triggerBotResponse().catch(err => console.error('Bot response error:', err));
  }

  return newMessage;
}
