import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // 1. Ambil token dari cookie di sisi server
    const token = request.cookies.get('session_token')?.value;

    if (!token) {
      // Jika tidak ada token, pengguna tidak login
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2. Cari sesi di database berdasarkan token
    const sessionRes = await pool.query(
      'SELECT * FROM sessions WHERE token = $1',
      [token]
    );

    const session = sessionRes.rows[0];

    // 3. Cek apakah sesi valid dan belum kedaluwarsa
    if (!session || new Date(session.expires_at) < new Date()) {
      // Jika sesi tidak ada atau sudah kedaluwarsa, hapus dari DB (jika ada)
      if (session) {
        await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
      }
      return NextResponse.json({ error: 'Session expired' }, { status: 401 });
    }

    // 4. Ambil data pengguna berdasarkan user_id dari sesi
    const userRes = await pool.query(
      'SELECT id, full_name, is_admin FROM users WHERE id = $1',
      [session.user_id]
    );

    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userRes.rows[0];

    // 5. Kirim data pengguna sebagai respons
    return NextResponse.json({ user });

  } catch (error) {
    console.error('Authentication check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

