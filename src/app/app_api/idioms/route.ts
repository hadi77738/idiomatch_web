import { NextResponse } from 'next/server';
// 1. Impor 'pool' dari file db.ts Anda
// Sesuaikan path jika perlu, '@/' biasanya menunjuk ke folder 'src/'
import pool from '@/lib/db'; 

export async function GET(request: Request) {
  try {
    // 2. Gunakan pool.query untuk menjalankan perintah SQL
    const idioms = await pool.query('SELECT * FROM idioms ORDER BY id;');

    // 3. Kembalikan 'idioms.rows' sebagai hasilnya
    return NextResponse.json({ idioms: idioms.rows }, { status: 200 });

  } catch (error) {
    // Tipe error perlu di-handle sebagai 'any' atau 'unknown'
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: 'Failed to fetch idioms', details: errorMessage }, { status: 500 });
  }
}