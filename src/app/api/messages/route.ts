import { getSession } from '@/lib/auth';
import { getMessages, createMessage } from '@/lib/messaging';
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
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    const message = error instanceof Error ? error.message : 'Failed to fetch messages';
    const status = message.includes('unauthorized') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversationId, text } = await request.json();
    const result = await createMessage(Number(conversationId), text, 'me', session.userId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to create message:', error);
    const message = error instanceof Error ? error.message : 'Failed to create message';
    const status = message.includes('unauthorized') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
