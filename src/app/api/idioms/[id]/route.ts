import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { name } = await req.json();
    await pool.query('INSERT INTO units (name) VALUES ($1)', [name]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST unit error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}