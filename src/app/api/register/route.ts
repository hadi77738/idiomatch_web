// src/app/api/register/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { full_name, nim, password, university_id } = await req.json();

    if (!full_name || !nim || !password || !university_id) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const existing = await pool.query('SELECT id FROM users WHERE nim = $1', [nim]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Student ID already registered' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const result = await pool.query(
      `INSERT INTO users (full_name, nim, password, university_id, is_admin)
       VALUES ($1, $2, $3, $4, false)
       RETURNING id, full_name, nim, university_id, is_admin`,
      [full_name, nim, hashed, university_id]
    );

    return NextResponse.json({ user: result.rows[0] }, { status: 201 });
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}