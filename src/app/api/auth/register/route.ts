import { openDb } from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
    }

    const db = await openDb();
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', email);

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const userId = crypto.randomUUID();

    await db.run(
      'INSERT INTO users (id, email, password) VALUES (?, ?, ?)',
      userId,
      email,
      hashedPassword
    );

    await createSession(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
