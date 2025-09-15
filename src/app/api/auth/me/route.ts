import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const decoded = verify(token, JWT_SECRET) as { userId: number };
    const result = await pool.query('SELECT id, full_name, nim, username, is_admin FROM users WHERE id = $1', [decoded.userId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: result.rows[0] });
  } catch (error) {
    // Token tidak valid atau kedaluwarsa
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
