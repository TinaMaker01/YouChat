import { openDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * API route to fetch all conversations for the authenticated user.
 *
 * SECURITY:
 * 1. Checks for a valid user session.
 * 2. Filters the conversations in the database query by the authenticated user's ID.
 * This ensures data isolation between different users.
 */
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await openDb();
    const conversations = await db.all(
      'SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC',
      session.userId
    );
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}
