import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // Cari sesi di database berdasarkan token
    const sessionResult = await pool.query(
      'SELECT * FROM sessions WHERE token = $1 AND expires_at > NOW()',
      [token]
    );

    if (sessionResult.rows.length === 0) {
      // Token tidak ditemukan atau sudah kedaluwarsa
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    const session = sessionResult.rows[0];
    
    // Ambil data user yang terkait dengan sesi tersebut
    const userResult = await pool.query(
        'SELECT id, full_name, nim, username, is_admin FROM users WHERE id = $1', 
        [session.user_id]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: userResult.rows[0] });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

