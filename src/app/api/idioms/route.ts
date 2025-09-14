// src/app/api/idioms/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// GET  |  return semua idiom (untuk admin)
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT
         id,
         unit_id,
         idioms,
         meaning_en,
         meaning_id,
         example_sentence,
         sentence_translation,
         example_conversation
       FROM idioms
       ORDER BY id`
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error('GET all idioms error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST |  tambah idiom baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      unit_id,
      idioms,
      meaning_en,
      meaning_id,
      example_sentence,
      sentence_translation,
      example_conversation,
    } = body;

    await pool.query(
      `INSERT INTO idioms
         (unit_id, idioms, meaning_en, meaning_id,
          example_sentence, sentence_translation, example_conversation)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [unit_id, idioms, meaning_en, meaning_id, example_sentence, sentence_translation, example_conversation]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('POST idiom error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}