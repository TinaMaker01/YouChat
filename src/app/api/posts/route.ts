import { openDb } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const db = await openDb();
  const posts = await db.all('SELECT * FROM posts');
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  const { title, content } = await request.json();
  const db = await openDb();
  const result = await db.run('INSERT INTO posts (title, content) VALUES (?, ?)', title, content);
  return NextResponse.json({ id: result.lastID, title, content });
}
