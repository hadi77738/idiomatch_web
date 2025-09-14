import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT
         id,
         idioms        AS idiom,
         meaning_id,
         example_sentence,
         sentence_translation,
         example_conversation
       FROM idioms
       ORDER BY idioms ASC`
    );
    if (result.rows.length === 0) {
      return NextResponse.json({
        status: 'success',
        message: 'No idioms found.',
        data: [],
      });
    }
    return NextResponse.json({
      status: 'success',
      data: result.rows,
    });
  } catch (err) {
    console.error('get_idioms error:', err);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch idioms' },
      { status: 500 }
    );
  }
}