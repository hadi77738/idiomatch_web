import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query('SELECT id, name FROM universities ORDER BY name');
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error('Universities error:', err);
    return NextResponse.json({ error: 'Gagal memuat universitas' }, { status: 500 });
  }
}