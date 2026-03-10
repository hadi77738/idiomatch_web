import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();

  if (!q) return NextResponse.json([]);

  try {
    const result = await pool.query(
      `SELECT idioms.id, idioms.idioms, idioms.meaning_id, idioms.meaning_en, idioms.example_sentence, idioms.sentence_translation, idioms.example_conversation, u.name as unit_name
       FROM idioms
       LEFT JOIN units u ON idioms.unit_id = u.id
       WHERE LOWER(idioms.idioms) LIKE $1
          OR LOWER(idioms.meaning_id) LIKE $1
          OR LOWER(idioms.meaning_en) LIKE $1
          OR LOWER(u.name) LIKE $1
       LIMIT 10`,
      [`%${q}%`]
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}