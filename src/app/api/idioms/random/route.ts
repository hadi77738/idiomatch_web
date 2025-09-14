import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, idioms, meaning_id, meaning_en, example_sentence, sentence_translation, example_conversation
       FROM idioms
       ORDER BY RANDOM()
       LIMIT 3`
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Random error:', error);
    return NextResponse.json({ error: 'Failed to fetch random idiom' }, { status: 500 });
  }
}