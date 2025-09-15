import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { verifyAdmin } from '@/lib/auth';

// --- EDIT PENGGUNA (mengubah status admin) ---
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Lindungi rute: hanya admin yang bisa mengakses
  const adminCheck = await verifyAdmin(request);
  if (adminCheck) return adminCheck;

  // Ambil 'id' dari params
  const { id } = params;
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

// --- HAPUS PENGGUNA ---
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Lindungi rute: hanya admin yang bisa mengakses
  const adminCheck = await verifyAdmin(request);
  if (adminCheck) return adminCheck;

  const { id } = params;

  try {
    // Hapus sesi terkait pengguna terlebih dahulu untuk menghindari error constraint
    await pool.query('DELETE FROM sessions WHERE user_id = $1', [id]);
    // Hapus riwayat kuis pengguna
    await pool.query('DELETE FROM quiz_attempts WHERE user_id = $1', [id]);
    // Hapus pengguna
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    return NextResponse.json({ success: true, message: `User ${id} and related data deleted.` });
  } catch (error) {
    console.error(`Failed to delete user ${id}:`, error);
    return NextResponse.json({ error: 'Server error while deleting user' }, { status: 500 });
  }
}

