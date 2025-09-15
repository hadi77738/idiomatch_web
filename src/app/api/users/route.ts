// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

interface User {
  id: number;
  username: string;
  full_name: string;
  nim: string;
  is_admin: boolean;
  university_id: number;
  university_name?: string;
}

interface SessionValidation {
  user_id: number;
  is_admin: boolean;
}

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
  try {
    // Get authentication token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate session and check admin privileges
    const { rows: sessionRows } = await query<SessionValidation>(
      `SELECT s.user_id, u.is_admin 
       FROM sessions s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.token = $1 AND s.expires_at > NOW()`,
      [token]
    );

    if (sessionRows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const { is_admin } = sessionRows[0];

    if (!is_admin) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get all users with university information
    const { rows: users } = await query<User>(`
      SELECT 
        u.id,
        u.username,
        u.full_name,
        u.nim,
        u.is_admin,
        u.university_id,
        uni.name as university_name
      FROM users u
      LEFT JOIN universities uni ON u.university_id = uni.id
      ORDER BY u.full_name ASC
    `);

    return NextResponse.json({
      success: true,
      data: users,
      count: users.length
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}