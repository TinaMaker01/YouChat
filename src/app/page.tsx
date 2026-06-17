import { openDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MessengerClient } from './messenger-client';

export default async function MessengerPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const db = await openDb();

  const [conversations, user] = await Promise.all([
    db.all('SELECT * FROM conversations ORDER BY updated_at DESC'),
    db.get('SELECT email FROM users WHERE id = ?', session.userId)
  ]);

  if (!user) {
    redirect('/login');
  }

  return (
    <MessengerClient
      initialConversations={conversations}
      initialUser={user}
    />
  );
}
