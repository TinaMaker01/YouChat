import { openDb } from './db';

export interface Conversation {
  id: number;
  user_id: string;
  name: string;
  avatar: string;
  last_message: string;
  updated_at: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender: 'me' | 'them';
  text: string;
  created_at: string;
}

export async function getConversations(userId: string): Promise<Conversation[]> {
  const db = await openDb();
  return db.all(
    'SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC',
    userId
  );
}

export async function getMessages(conversationId: number, userId: string): Promise<Message[]> {
  const db = await openDb();

  // Verify ownership
  const conv = await db.get(
    'SELECT id FROM conversations WHERE id = ? AND user_id = ?',
    conversationId, userId
  );

  if (!conv) {
    throw new Error('Unauthorized or conversation not found');
  }

  return db.all(
    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
    conversationId
  );
}

export async function addMessage(conversationId: number, userId: string, text: string, sender: 'me' | 'them' = 'me') {
  const db = await openDb();

  // Verify ownership
  const conv = await db.get(
    'SELECT id FROM conversations WHERE id = ? AND user_id = ?',
    conversationId, userId
  );

  if (!conv) {
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

  return {
    id: result.lastID,
    conversation_id: conversationId,
    sender,
    text,
    created_at: new Date().toISOString()
  };
}
