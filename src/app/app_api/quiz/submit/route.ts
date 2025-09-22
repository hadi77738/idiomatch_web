import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';

// Helper yang sama untuk verifikasi token
async function verifyToken(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-default-super-secret-key');
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (e) {
    return null;
  }
}


export async function POST(request: Request) {
  const userPayload = await verifyToken(request);
  if (!userPayload || typeof userPayload.userId !== 'number') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = userPayload.userId;

  try {
    const { score, total_questions } = await request.json();

    if (score == null || total_questions == null) {
      return NextResponse.json({ error: 'Score and total questions are required' }, { status: 400 });
    }

    // Simpan hasil ke database
    await pool.query(
      'INSERT INTO quiz_attempts (user_id, score, total_questions) VALUES ($1, $2, $3);',
      [userId, score, total_questions]
    );

    return NextResponse.json({ message: 'Quiz score submitted successfully' }, { status: 201 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to submit score', details: errorMessage }, { status: 500 });
  }
}
