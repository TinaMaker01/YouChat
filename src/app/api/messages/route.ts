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
    // Fetch all messages for the given conversation ID
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

    const { conversationId, sender, text } = await request.json();
    const result = await createMessage(Number(conversationId), text, sender);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to create message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}
