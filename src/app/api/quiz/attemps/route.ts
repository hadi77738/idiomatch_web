import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // Verifikasi sesi dan dapatkan user_id
    const sessionResult = await pool.query(
      'SELECT user_id FROM sessions WHERE token = $1 AND expires_at > NOW()',
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }
    const { user_id } = sessionResult.rows[0];

    // Ambil data skor dari body request
    const { score, total_questions } = await request.json();

    if (score === undefined || total_questions === undefined) {
        return NextResponse.json({ error: 'Score and total_questions are required' }, { status: 400 });
    }

    // Simpan hasil ke tabel quiz_attempts
    await pool.query(
      'INSERT INTO quiz_attempts (user_id, score, total_questions) VALUES ($1, $2, $3)',
      [user_id, score, total_questions]
    );

    return NextResponse.json({ success: true, message: 'Quiz attempt saved' });

  } catch (error) {
    console.error('Save quiz attempt error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
