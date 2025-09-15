import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
    const token = request.cookies.get('session_token')?.value;

    try {
        if (token) {
            // Hapus token dari database
            await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
        }

        // Buat respons untuk menghapus cookie
        const response = NextResponse.json({ success: true, message: 'Logged out' });
        
        // Atur cookie agar kedaluwarsa
        response.cookies.set('session_token', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'strict',
            expires: new Date(0), // Atur tanggal kedaluwarsa ke masa lalu
        });

        return response;

    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
