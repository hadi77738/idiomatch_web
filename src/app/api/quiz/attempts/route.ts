// app/api/quiz/attempts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { cookies } from 'next/headers';

/* ----------------------------------------------------------
   GET  -> kirim 50 attempt terbaru (untuk admin dashboard)
   ---------------------------------------------------------- */
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        qa.id,
        json_build_object(
          'full_name', u.full_name,
          'nim', u.nim
        ) AS user,
        qa.score,
        qa.total_questions,
        qa.created_at
      FROM quiz_attempts qa
      JOIN users u ON u.id = qa.user_id
      ORDER BY qa.created_at DESC
      LIMIT 50
    `);
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error('GET /api/quiz/attempts error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/* ----------------------------------------------------------
   POST -> simpan attempt baru (dari halaman quiz)
   ---------------------------------------------------------- */
export async function POST(req: NextRequest) {
  try {
    // 1. ambil token dari cookie
    const cookieStore = cookies();
    const token = (await cookieStore).get('session_token')?.value;
    if (!token)
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    // 2. cari user_id lewat sessions
    const sessionRes = await pool.query(
      `SELECT user_id
         FROM sessions
        WHERE token = $1
          AND expires_at > NOW()`,
      [token]
    );
    if (sessionRes.rowCount === 0)
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const userId = sessionRes.rows[0].user_id;

    // 3. parse body
    const body = await req.json();
    const { score, total_questions } = body;

    // 4. insert
    await pool.query(
      `INSERT INTO quiz_attempts (user_id, score, total_questions)
       VALUES ($1, $2, $3)`,
      [userId, score, total_questions]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST /api/quiz/attempts error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}