// app/api/quiz-attempts/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET | return 50 quiz attempts terbaru
export async function GET() {
  try {
    // di /api/quiz-attempts/route.ts
const result = await pool.query(`
  SELECT
    qa.id,
    json_build_object('full_name', u.full_name, 'nim', u.nim) AS user,
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
    console.error('GET quiz attempts error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}