// src/app/api/register/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { full_name, nim, password, university_id, username, new_university } =
      await req.json();

    /* ---------- 1. Validasi umum ---------- */
    if (!full_name || !nim || !password || !university_id || !username) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    /* ---------- 2. Cek NIM & username unik ---------- */
    const existingNim = await pool.query('SELECT id FROM users WHERE nim = $1', [nim]);
    if (existingNim.rows.length > 0) {
      return NextResponse.json({ error: 'NIM sudah terdaftar' }, { status: 409 });
    }
    const existingUsername = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    if (existingUsername.rows.length > 0) {
      return NextResponse.json({ error: 'Username sudah terdaftar' }, { status: 409 });
    }

    /* ---------- 3. Handle opsi "Tambahkan Universitas Anda" ---------- */
    let finalUniversityId: number;

    if (university_id === 'new') {
      if (!new_university || new_university.trim().length < 3) {
        return NextResponse.json(
          { error: 'Nama universitas minimal 3 karakter' },
          { status: 400 }
        );
      }
      // insert universitas baru → selalu unik (serial)
      const insertUni = await pool.query(
        'INSERT INTO universities (name) VALUES ($1) RETURNING id',
        [new_university.trim()]
      );
      finalUniversityId = insertUni.rows[0].id;
    } else {
      finalUniversityId = Number(university_id); // pilih yang sudah ada
    }

    /* ---------- 4. Hash password & insert user ---------- */
    const hashed = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (full_name, nim, password, university_id, is_admin, username)
       VALUES ($1, $2, $3, $4, false, $5)
       RETURNING id, full_name, nim, university_id, is_admin, username`,
      [full_name, nim, hashed, finalUniversityId, username]
    );

    return NextResponse.json({ user: result.rows[0] }, { status: 201 });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Gagal mendaftar' }, { status: 500 });
  }
}