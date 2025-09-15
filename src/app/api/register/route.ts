import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { full_name, nim, password, university_id } = await req.json();

    if (!full_name || !nim || !password || !university_id) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    // Cek NIM sudah terdaftar
    const existing = await pool.query('SELECT id FROM users WHERE nim = $1', [nim]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'NIM sudah terdaftar' }, { status: 409 });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 12);

    // Buat username dari full_name dengan menghilangkan spasi
    const username = full_name.replace(/\s+/g, '').toLowerCase();

    // Insert user baru
    const result = await pool.query(
      `INSERT INTO users (full_name, nim, password, university_id, is_admin, username)
       VALUES ($1, $2, $3, $4, false, $5) RETURNING id, full_name, nim, university_id, is_admin, username`,
      [full_name, nim, hashed, university_id, username]
    );

    return NextResponse.json({ user: result.rows[0] }, { status: 201 });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Gagal mendaftar' }, { status: 500 });
  }
}