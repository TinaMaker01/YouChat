import { openDb } from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { registerSchema } from '@/lib/validations';
import { ZodError } from 'zod';

/**
 * API route for user registration.
 * Validates email and password, hashes the password, and creates a new user and session.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = registerSchema.parse(body);

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
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
