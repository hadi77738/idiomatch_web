import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT id, name FROM universities');
    const universities = result.rows;

    // Jika tidak ada data universitas, kirim response kosong
    if (universities.length === 0) {
      return NextResponse.json([]);
    }

    // Jika ada data, kirim sebagai array
    return NextResponse.json(universities);
  } catch (err) {
    console.error('Universities error:', err);
    return NextResponse.json({ error: 'Failed to fetch universities' }, { status: 500 });
  }
}