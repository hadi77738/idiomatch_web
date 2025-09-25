import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';

// Helper untuk verifikasi token
async function verifyToken(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    const secret = new TextEncoder().encode(process.env.jwt_secret || 'your-default-super-secret-key');
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (e) {
    return null;
  }
}

// Mengambil semua testimoni (Publik)
export async function GET(request: Request) {
  try {
    // Ambil data testimoni dan gabungkan dengan nama pengguna dari tabel users
    const testimoniesResult = await pool.query(`
      SELECT 
        t.id, 
        t.content, 
        t.created_at, 
        u.full_name 
      FROM 
        testimonies t 
      JOIN 
        users u ON t.user_id = u.id 
      ORDER BY 
        t.created_at DESC;
    `);
    
    return NextResponse.json({ testimonies: testimoniesResult.rows }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch testimonies', details: errorMessage }, { status: 500 });
  }
}

// Mengirim testimoni baru (Perlu Login)
export async function POST(request: Request) {
  const userPayload = await verifyToken(request);
  if (!userPayload || typeof userPayload.userId !== 'number') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const userId = userPayload.userId;

  try {
    const { content } = await request.json();

    if (!content || content.trim() === '') {
      return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 });
    }

    await pool.query(
      'INSERT INTO testimonies (user_id, content) VALUES ($1, $2);',
      [userId, content]
    );

    return NextResponse.json({ message: 'Testimony submitted successfully' }, { status: 201 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to submit testimony', details: errorMessage }, { status: 500 });
  }
}
