import { openDb } from '@/lib/db';
import { verifyPassword, createSession } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { email, password } = result.data;

    const db = await openDb();
    const user = await db.get('SELECT * FROM users WHERE email = ?', email);

    if (!user) {
      return NextResponse.json({ error: 'Incorrect email or password' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) {
      return NextResponse.json({ error: 'Incorrect email or password' }, { status: 401 });
    }

    await createSession(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
