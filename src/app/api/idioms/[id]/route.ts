import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // <-- await Promise
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
      `UPDATE idioms
       SET unit_id = $1,
           idioms = $2,
           meaning_en = $3,
           meaning_id = $4,
           example_sentence = $5,
           sentence_translation = $6,
           example_conversation = $7
       WHERE id = $8`,
      [unit_id, idioms, meaning_en, meaning_id, example_sentence, sentence_translation, example_conversation, id]
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('PUT idiom error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // <-- await Promise
  try {
    await pool.query('DELETE FROM idioms WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('DELETE idiom error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}