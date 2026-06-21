import { openDb } from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * API route for user registration.
 * Validates email and password, hashes the password, and creates a new user and session.
 */
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Password length validation
    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const db = await openDb();

    // Check if the user already exists
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', email);
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    // Hash the password and generate a unique user ID
    const hashedPassword = await hashPassword(password);
    const userId = crypto.randomUUID();

    // Insert the new user into the database
    await db.run(
      'INSERT INTO users (id, email, password) VALUES (?, ?, ?)',
      userId,
      email,
      hashedPassword
    );

    // Automatically log the user in after registration
    await createSession(userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
