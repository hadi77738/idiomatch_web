import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { Unit } from '@/types';

export async function GET() {
  try {
    const result = await pool.query<Unit>('SELECT * FROM units ORDER BY id');
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching units:', error);
    return NextResponse.json({ error: 'Failed to fetch units' }, { status: 500 });
  }
}