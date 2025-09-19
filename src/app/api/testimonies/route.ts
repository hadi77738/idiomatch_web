import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  // 1. ambil token dari cookie
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. validasi token & ambil user_id
  const { rows } = await pool.query(
    `SELECT user_id
     FROM sessions
     WHERE token = $1
       AND expires_at > NOW()
     LIMIT 1`,
    [token]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
  }
  const user_id = rows[0].user_id;

  // 3. baca body
  const body = await req.json();
  const content = (body.content || '').trim();
  if (!content) {
    return NextResponse.json({ error: 'Empty content' }, { status: 400 });
  }

  // 4. simpan testimony
  await pool.query(
    'INSERT INTO testimonies (user_id, content) VALUES ($1, $2)',
    [user_id, content]
  );

  return NextResponse.json({ success: true });
}

export async function GET() {
  const { rows } = await pool.query(`
    SELECT t.id,
           t.content,
           t.created_at,
           u.full_name
    FROM testimonies t
    JOIN users u ON u.id = t.user_id
    ORDER BY t.created_at DESC
  `);
  return NextResponse.json(rows);
}