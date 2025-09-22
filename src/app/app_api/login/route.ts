import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs'; // Diubah dari 'bcrypt' menjadi 'bcryptjs'
import { SignJWT } from 'jose';

// Fungsi untuk membuat JWT Token
async function createToken(userId: number, username: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-default-super-secret-key');
  const token = await new SignJWT({ userId, username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // Token berlaku selama 24 jam
    .sign(secret);
  return token;
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // 1. Ambil data user HANYA berdasarkan username
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1;', [username]);

    if (userResult.rowCount === 0) {
      // Username tidak ditemukan
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = userResult.rows[0];

    // 2. Bandingkan password yang diinput dengan hash di database
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // Password tidak cocok
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 3. Jika berhasil, buat dan kirim token
    const token = await createToken(user.id, user.username);
    
    // Jangan kirim password kembali ke client
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ 
      message: 'Login successful', 
      user: userWithoutPassword, 
      token 
    }, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}

