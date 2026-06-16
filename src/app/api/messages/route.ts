import { openDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');

  if (!conversationId) {
    return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
  }

  try {
    const db = await openDb();
    const messages = await db.all(
      'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC',
      conversationId
    );
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { conversationId, sender, text } = await request.json();
    const db = await openDb();

    const result = await db.run(
      'INSERT INTO messages (conversation_id, sender, text) VALUES (?, ?, ?)',
      conversationId, sender, text
    );

    // Update last_message in conversation
    await db.run(
      'UPDATE conversations SET last_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      text, conversationId
    );

    return NextResponse.json({
      id: result.lastID,
      conversation_id: conversationId,
      sender,
      text,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to create message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}
