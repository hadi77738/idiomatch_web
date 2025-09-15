import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

// Tipe data untuk konteks, termasuk params
interface RouteContext {
  params: {
    id: string;
  };
}

export async function PUT(request: NextRequest, context: RouteContext) {
  // Lindungi rute: hanya admin yang bisa mengakses
  const adminCheck = await verifyAdmin(request);
  if (adminCheck) return adminCheck;

  // Ambil 'id' dari objek 'context'
  const { id } = context.params;
  const { is_admin } = await request.json();

  if (typeof is_admin !== 'boolean') {
    return NextResponse.json({ error: 'Invalid value for is_admin' }, { status: 400 });
  }

  try {
    await pool.query('UPDATE users SET is_admin = $1 WHERE id = $2', [is_admin, id]);
    return NextResponse.json({ success: true, message: `User ${id} updated.` });
  } catch (error) {
    console.error(`Failed to update user ${id}:`, error);
    return NextResponse.json({ error: 'Server error while updating user' }, { status: 500 });
  }
}

