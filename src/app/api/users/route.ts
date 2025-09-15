import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // Lindungi rute: hanya admin yang bisa mengakses
  const adminCheck = await verifyAdmin(request);
  if (adminCheck) return adminCheck;

  try {
    const res = await pool.query(
      'SELECT id, full_name, username, nim, is_admin FROM users ORDER BY id'
    );
    return NextResponse.json(res.rows);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Server error while fetching users' }, { status: 500 });
  }
}

