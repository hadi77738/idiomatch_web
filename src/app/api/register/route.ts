import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { full_name, nim, password, university_id } = await req.json();

    const hashedPassword = bcrypt.hashSync(password, 10);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const insertUser = await client.query(
        'INSERT INTO users (full_name, nim, password, university_id, is_admin) VALUES ($1, $2, $3, $4, FALSE) RETURNING id',
        [full_name, nim, hashedPassword, university_id]
      );
      await client.query('COMMIT');
      return NextResponse.json({ success: true, userId: insertUser.rows[0].id });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}