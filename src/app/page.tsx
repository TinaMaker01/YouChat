import { getSession } from '@/lib/auth';
import { openDb } from '@/lib/db';
import { getConversations } from '@/lib/messaging';
import { MessengerClient } from './messenger-client';
import { redirect } from 'next/navigation';

export default async function MessengerPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const db = await openDb();
  const user = await db.get('SELECT email FROM users WHERE id = ?', session.userId);

  if (!user) {
    redirect('/login');
  }

  const conversations = await getConversations(session.userId);

  return (
    <MessengerClient
      initialConversations={conversations}
      user={user}
    />
  );
}
