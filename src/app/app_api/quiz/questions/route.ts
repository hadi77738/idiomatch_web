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
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-default-super-secret-key');
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (e) {
    return null;
  }
}


export async function GET(request: Request) {
  // Melindungi endpoint, hanya user terotentikasi yang bisa mengambil soal
  const userPayload = await verifyToken(request);
  if (!userPayload) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Ambil 5 idiom acak sebagai soal utama
    const correctIdiomsResult = await pool.query('SELECT * FROM idioms ORDER BY RANDOM() LIMIT 5;');
    const correctIdioms = correctIdiomsResult.rows;

    if (correctIdioms.length < 5) {
      return NextResponse.json({ error: 'Not enough idioms in the database to start a quiz.' }, { status: 500 });
    }

    const quizQuestions = [];

    // 2. Untuk setiap soal, cari 3 jawaban salah
    for (const idiom of correctIdioms) {
      const wrongAnswersResult = await pool.query(
        'SELECT meaning_id FROM idioms WHERE id != $1 ORDER BY RANDOM() LIMIT 3;',
        [idiom.id]
      );
      const wrongAnswers = wrongAnswersResult.rows.map(row => row.meaning_id);

      // 3. Gabungkan jawaban benar dan salah, lalu acak
      const allOptions = [idiom.meaning_id, ...wrongAnswers];
      allOptions.sort(() => Math.random() - 0.5); // Acak urutan jawaban

      quizQuestions.push({
        idiom: idiom.idioms,
        correct_answer: idiom.meaning_id,
        options: allOptions,
      });
    }

    return NextResponse.json({ questions: quizQuestions }, { status: 200 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to fetch quiz questions', details: errorMessage }, { status: 500 });
  }
}
