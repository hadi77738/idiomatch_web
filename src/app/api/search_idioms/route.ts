import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const keyword = (searchParams.get('keyword') || '').trim();

  if (!keyword) {
    return NextResponse.json(
      { status: 'error', message: 'Search keyword cannot be empty.' },
      { status: 400 }
    );
  }

  const searchTerm = `%${keyword}%`;

  try {
    const result = await pool.query(
      `SELECT
         i.id,
         i.idioms        AS idiom,
         i.unit_id,
         i.meaning_en,
         i.meaning_id,
         i.example_sentence,
         i.sentence_translation,
         i.example_conversation,
         u.name          AS unit_name
       FROM idioms i
       LEFT JOIN units u ON i.unit_id = u.id
       WHERE i.idioms ILIKE $1 OR i.meaning_id ILIKE $1
       ORDER BY i.idioms ASC`,
      [searchTerm]
    );

    return NextResponse.json({
      status: 'success',
      data: result.rows,
    });
  } catch (err: any) {
    console.error('search_idioms error:', err);
    return NextResponse.json(
      { status: 'error', message: 'Search failed: ' + err.message },
      { status: 500 }
    );
  }
}