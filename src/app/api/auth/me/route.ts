import { getSession } from '@/lib/auth';
import { openDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await openDb();
  const user = await db.get('SELECT email FROM users WHERE id = ?', session.userId);

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}
