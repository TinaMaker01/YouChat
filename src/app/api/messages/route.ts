import { openDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { createMessage } from '@/lib/messaging';
import { getMessagesSchema, createMessageSchema } from '@/lib/validations';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

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
    const result = getMessagesSchema.safeParse({
      conversationId: searchParams.get('conversationId')
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { conversationId } = result.data;
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

    const body = await request.json();
    const result = createMessageSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { conversationId, text } = result.data;

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

    const messageResult = await createMessage(conversationId, text, actualSender);

    return NextResponse.json(messageResult);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Failed to create message:', error);
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}
