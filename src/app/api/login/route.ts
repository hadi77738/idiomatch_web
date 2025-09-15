import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { serialize } from 'cookie';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const res = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = res.rows[0];

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 1. Buat token acak yang aman
    const sessionToken = crypto.randomBytes(32).toString('hex');
    
    // 2. Tentukan waktu kedaluwarsa (misal: 1 jam dari sekarang)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // 3. Simpan sesi ke database
    await pool.query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, sessionToken, expiresAt]
    );
    
    // 4. Atur cookie di respons
    const response = NextResponse.json({ success: true, user: {id: user.id, full_name: user.full_name, is_admin: user.is_admin} });
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'strict',
      maxAge: 60 * 60, // 1 jam
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

