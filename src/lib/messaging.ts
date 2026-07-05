import { openDb } from './db';
import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

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

  // If the message is from 'me', trigger a chatbot response after a short delay
  if (sender === 'me') {
    // In a real app, this might be a background job or an async process
    // For this implementation, we'll simulate a response
    setTimeout(async () => {
      let responseText = "";

      if (openai) {
        try {
          const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: text }],
            model: 'gpt-3.5-turbo',
          });
          responseText = completion.choices[0].message.content || "I'm sorry, I couldn't understand that.";
        } catch (error) {
          console.error('OpenAI Error:', error);
          responseText = "I'm having trouble connecting to my brain right now. Try again later?";
        }
      } else {
        const responses = [
          "That's interesting! Tell me more.",
          "I see. What do you think about that?",
          "Got it. Is there anything else?",
          "That makes sense. How can I help further?",
          "I'm a chatbot, and I'm here to assist you!"
        ];
        responseText = responses[Math.floor(Math.random() * responses.length)];
      }

      await createMessage(conversationId, responseText, 'them');
    }, 1000);
  }

  return newMessage;
}
