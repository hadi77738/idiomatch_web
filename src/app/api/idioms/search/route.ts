import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();

  if (!q) return NextResponse.json([]);

  try {
    const result = await pool.query(
      `SELECT id, idioms, meaning_id, meaning_en, example_sentence, sentence_translation, example_conversation
       FROM idioms
       WHERE LOWER(idioms) LIKE $1
          OR LOWER(meaning_id) LIKE $1
       LIMIT 10`,
      [`%${q}%`]
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}