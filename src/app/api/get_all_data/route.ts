import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const unitsRes = await pool.query('SELECT id, name FROM units ORDER BY id ASC');
    const idiomsRes = await pool.query(
      `SELECT
         id,
         unit_id,
         idioms        AS idiom,
         meaning_en,
         meaning_id,
         example_sentence,
         sentence_translation,
         example_conversation
       FROM idioms
       ORDER BY idiom ASC`
    );
    return NextResponse.json({
      status: 'success',
      units: unitsRes.rows,
      idioms: idiomsRes.rows,
    });
  } catch (err) {
    console.error('get_all_data error:', err);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}