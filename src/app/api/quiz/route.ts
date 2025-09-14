import { NextResponse } from 'next/server';
import pool from '@/lib/db';

function shuffle<T>(arr: T[]): T[] {
  return arr.sort(() => Math.random() - 0.5);
}

export async function GET() {
  try {
    // ambil semua idiom
    const all = await pool.query(
      'SELECT id, idioms, meaning_en, meaning_id FROM idioms'
    );
    if (all.rows.length === 0) return NextResponse.json([]);

    // ambil 5 random (atau semua jika <5)
    const count = Math.min(5, all.rows.length);
    const picked = shuffle(all.rows).slice(0, count);

    // bangun soal
    const questions = await Promise.all(
      picked.map(async (q) => {
        // 3 meaning_id salah dari pool lain
        const wrongs = await pool.query(
          'SELECT meaning_id FROM idioms WHERE id != $1 ORDER BY RANDOM() LIMIT 3',
          [q.id]
        );
        const options = shuffle([
          q.meaning_id,
          ...wrongs.rows.map((r) => r.meaning_id),
        ]);
        return {
          id: q.id,
          idioms: q.idioms,
          meaning_en: q.meaning_en,
          meaning_id: q.meaning_id,
          options,
          answer: q.meaning_id,
        };
      })
    );

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Quiz error:', error);
    return NextResponse.json({ error: 'Failed to load quiz' }, { status: 500 });
    }
}