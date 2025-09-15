import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const res = await pool.query('SELECT id, username, password, is_admin, full_name FROM users WHERE username = $1', [username]);
    const user = res.rows[0];

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Buat token acak yang aman
    const sessionToken = crypto.randomBytes(32).toString('hex');
    
    // Tentukan waktu kedaluwarsa (1 jam dari sekarang)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Simpan sesi ke database
    await pool.query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, sessionToken, expiresAt]
    );
    
    // Kirim respons yang menyertakan status admin
    const response = NextResponse.json({ 
        success: true, 
        user: {
            isAdmin: user.is_admin 
        }
    });

    // Atur cookie di respons
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

