import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // <-- await Promise
  try {
    const { name } = await req.json();
    await pool.query('UPDATE units SET name = $1 WHERE id = $2', [name, id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PUT unit error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // <-- await Promise
  try {
    await pool.query('DELETE FROM units WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE unit error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}