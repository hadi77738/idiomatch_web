import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAdmin } from '@/lib/auth'; // Hanya untuk GET

// GET: Admin mengambil semua riwayat kuis
export async function GET(request: NextRequest) {
  const adminCheck = await verifyAdmin(request);
  if (adminCheck) return adminCheck;

  try {
    const res = await pool.query(`
      SELECT qa.id, u.full_name, u.nim, qa.score, qa.total_questions, qa.created_at
      FROM quiz_attempts qa
      JOIN users u ON qa.user_id = u.id
      ORDER BY qa.created_at DESC
    `);
    return NextResponse.json(res.rows);
  } catch (err) {
    console.error('Failed to fetch quiz attempts', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST: Pengguna yang login menyimpan hasil kuis mereka
export async function POST(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // Verifikasi token dan dapatkan user_id dari sesi
    const sessionRes = await pool.query(
      'SELECT user_id FROM sessions WHERE token = $1 AND expires_at > NOW()',
      [token]
    );

    if (sessionRes.rows.length === 0) {
      return NextResponse.json({ error: 'Session invalid or expired' }, { status: 401 });
    }
    const { user_id } = sessionRes.rows[0];
    
    // Ambil data skor dari body request
    const { score, total_questions } = await request.json();
    if (typeof score !== 'number' || typeof total_questions !== 'number') {
        return NextResponse.json({ error: 'Invalid score or total_questions' }, { status: 400 });
    }

    // Simpan ke database
    await pool.query(
      'INSERT INTO quiz_attempts (user_id, score, total_questions) VALUES ($1, $2, $3)',
      [user_id, score, total_questions]
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('Failed to save quiz attempt', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

