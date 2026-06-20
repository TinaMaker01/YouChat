import { getSession } from '@/lib/auth';
import { createMessage, getMessages } from '@/lib/messaging';
import { NextResponse } from 'next/server';

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

    const messages = await getMessages(Number(conversationId), session.userId);
    return NextResponse.json(messages);
  } catch (error: unknown) {
    console.error('Failed to fetch messages:', error);
    if (error instanceof Error && error.message === 'Unauthorized or conversation not found') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId, text } = await request.json();

    // Ensure the user can only send messages as 'me' via the API
    const result = await createMessage(Number(conversationId), text, 'me', session.userId);

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('Failed to create message:', error);
    if (error instanceof Error && error.message === 'Unauthorized or conversation not found') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}
