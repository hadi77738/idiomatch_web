// src/app/app_api/quiz/submit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

/* -------------------------------------------------
   1. Cookie-first (web), fallback Bearer (flutter)
   ------------------------------------------------- */
async function getUserId(req: NextRequest): Promise<number | null> {
  // 1. coba cookie dulu (supaya web tetap jalan)
  const cookieStore = cookies();
  const sessionToken = (await cookieStore).get('session_token')?.value;
  if (sessionToken) {
    const r = await pool.query(
      `SELECT user_id
         FROM sessions
        WHERE token = $1
          AND expires_at > NOW()`,
      [sessionToken]
    );
    if (r.rowCount) return r.rows[0].user_id;
  }

  // 2. coba Bearer JWT (flutter lama)
  const authHeader = req.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const jwt = authHeader.split(' ')[1];
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET ?? 'your-default-super-secret-key'
      );
      const { payload } = await jwtVerify(jwt, secret);
const uid = payload.userId;
return (typeof uid === 'number') ? uid : null;
    } catch {
      /* JWT invalid */
    }
  }
  return null;
}

/* -------------------------------------------------
   2. Handler POST – sekali panggil saja
   ------------------------------------------------- */
export async function POST(req: NextRequest) {
  const userId = await getUserId(req);
  if (!userId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { score, total_questions } = await req.json();
    if (score == null || total_questions == null)
      return NextResponse.json(
        { error: 'Score and total questions are required' },
        { status: 400 }
      );

    // Ambil nama & NIM (opsional, untuk backward-compatibility)
    const userRes = await pool.query(
      'SELECT full_name, nim FROM users WHERE id = $1',
      [userId]
    );
    if (userRes.rowCount === 0)
      return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const { full_name, nim } = userRes.rows[0];

    // Insert – kolom full_name & nim tetap diisi (biar tidak break API lama)
    await pool.query(
  'INSERT INTO quiz_attempts (user_id, score, total_questions) VALUES ($1,$2,$3)',
  [userId, score, total_questions]
);

    return NextResponse.json(
      { message: 'Quiz score submitted successfully' },
      { status: 201 }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    console.error('POST /app_api/quiz/submit :', msg);
    return NextResponse.json(
      { error: 'Failed to submit score', details: msg },
      { status: 500 }
    );
  }
}