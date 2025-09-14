import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const NUM_QUESTIONS = 5;
const NUM_OPTIONS = 4;

export async function GET() {
  try {
    const allRes = await pool.query('SELECT idioms AS idiom, meaning_id FROM idioms');
    const allIdioms = allRes.rows;
    if (allIdioms.length < NUM_OPTIONS) {
      return NextResponse.json(
        { error: `Not enough idioms to create a quiz. Minimum ${NUM_OPTIONS} required.` },
        { status: 400 }
      );
    }
    for (let i = allIdioms.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allIdioms[i], allIdioms[j]] = [allIdioms[j], allIdioms[i]];
    }
    const actualNum = Math.min(NUM_QUESTIONS, allIdioms.length);
    const quiz: {
      question_idiom: string;
      correct_answer: string;
      options: string[];
    }[] = [];
    for (let i = 0; i < actualNum; i++) {
      const correct = allIdioms[i];
      const options = new Set<string>([correct.meaning_id]);
      const others = allIdioms.filter((_, idx) => idx !== i);
      for (let k = 0; k < others.length && options.size < NUM_OPTIONS; k++) {
        options.add(others[k].meaning_id);
      }
      const shuffled = Array.from(options).sort(() => Math.random() - 0.5);
      quiz.push({
        question_idiom: correct.idiom,
        correct_answer: correct.meaning_id,
        options: shuffled,
      });
    }
    return NextResponse.json(quiz);
  } catch (err) {
    console.error('get_quiz error:', err);
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}