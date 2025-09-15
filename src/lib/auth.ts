import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * Memverifikasi token sesi dari cookie dan memeriksa apakah pengguna adalah admin.
 * @param request Objek NextRequest yang masuk.
 * @returns NextResponse jika tidak terotentikasi/tidak diizinkan, atau null jika admin.
 */
export async function verifyAdmin(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Cari sesi yang valid di database
  const sessionRes = await pool.query(
    'SELECT user_id FROM sessions WHERE token = $1 AND expires_at > NOW()',
    [token]
  );

  if (sessionRes.rows.length === 0) {
    return NextResponse.json({ error: 'Session invalid or expired' }, { status: 401 });
  }

  const { user_id } = sessionRes.rows[0];

  // Periksa apakah pengguna adalah admin
  const userRes = await pool.query('SELECT is_admin FROM users WHERE id = $1', [user_id]);

  if (userRes.rows.length === 0 || !userRes.rows[0].is_admin) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }
  
  // Jika semua pemeriksaan lolos, kembalikan null
  return null;
}

