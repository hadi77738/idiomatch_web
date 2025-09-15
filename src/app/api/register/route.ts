import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { full_name, nim, password, university_id } = await req.json();

    const hashedPassword = bcrypt.hashSync(password, 10);

    await pool.query(
      'INSERT INTO users (full_name, nim, password, university_id, is_admin) VALUES ($1, $2, $3, $4, FALSE)',
      [full_name, nim, hashedPassword, university_id]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}