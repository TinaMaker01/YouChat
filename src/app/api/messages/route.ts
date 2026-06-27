import { openDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { createMessage } from '@/lib/messaging';
import { NextResponse } from 'next/server';

/**
 * API route to fetch messages for a specific conversation.
 * Requires a valid session and a conversationId query parameter.
 */
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
    }

    const db = await openDb();

    // Verify conversation belongs to user
    const conversation = await db.get(
      'SELECT id FROM conversations WHERE id = ? AND user_id = ?',
      conversationId,
      session.userId
    );

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 404 });
    }

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

/**
 * API route to create a new message.
 * Requires a valid session.
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId, text } = await request.json();

    const db = await openDb();
    // Verify conversation belongs to user
    const conversation = await db.get(
      'SELECT id FROM conversations WHERE id = ? AND user_id = ?',
      conversationId,
      session.userId
    );

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 404 });
    }

    // Force sender to 'me' if it's from the client, or handle according to app logic
    // Usually messages sent via this API are from the user
    const actualSender = 'me';

    const result = await createMessage(Number(conversationId), text, actualSender, session.userId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to create message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}
