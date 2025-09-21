import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import crypto from 'crypto';

// PENTING: Untuk aplikasi production, JANGAN PERNAH simpan password sebagai teks biasa.
// Gunakan library seperti 'bcrypt' untuk hashing dan verifikasi.
// import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // 1. Cari user berdasarkan username
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = userResult.rows[0];

    // 2. Verifikasi password (SANGAT TIDAK AMAN, HANYA UNTUK CONTOH)
    // Di aplikasi nyata, Anda harus menggunakan:
    // const isPasswordValid = await bcrypt.compare(password, user.password);
    const isPasswordValid = user.password === password;

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 3. Buat session token
    const token = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Token berlaku 24 jam

    // 4. Simpan session di database
    await pool.query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    );

    // 5. Kirim token dan data user (tanpa password) kembali ke client
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ 
      message: 'Login successful', 
      token,
      user: userWithoutPassword
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
