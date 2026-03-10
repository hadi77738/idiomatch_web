import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  // Verifikasi Bearer Token dari Vercel Cron
  // https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
  const authHeader = request.headers.get('authorization');
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Invalid or missing CRON_SECRET' },
      { status: 401 }
    );
  }

  try {
    // Ping database sederhana untuk trigger "activity" di Supabase
    await pool.query('SELECT 1;');
    return NextResponse.json({ success: true, message: 'Supabase keep-alive successful' }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Cron job error:', errorMessage);
    return NextResponse.json(
      { success: false, error: 'Supabase keep-alive failed', details: errorMessage },
      { status: 500 }
    );
  }
}
