// lib/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { query } from './db';

export interface AuthUser {
  id: number;
  username: string;
  full_name: string;
  nim: string;
  is_admin: boolean;
  university_id: number;
}

export async function authenticateRequest(request: NextRequest): Promise<{
  user: AuthUser;
  isAdmin: boolean;
} | null> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7)
      : request.cookies.get('token')?.value;

    if (!token) {
      return null;
    }

    const { rows: sessions } = await query<{
      user_id: number;
      is_admin: boolean;
      full_name: string;
      username: string;
      nim: string;
      university_id: number;
    }>(
      `SELECT s.user_id, u.is_admin, u.full_name, u.username, u.nim, u.university_id
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.token = $1 AND s.expires_at > NOW()`,
      [token]
    );

    if (sessions.length === 0) {
      return null;
    }

    const session = sessions[0];
    
    return {
      user: {
        id: session.user_id,
        username: session.username,
        full_name: session.full_name,
        nim: session.nim,
        is_admin: session.is_admin,
        university_id: session.university_id
      },
      isAdmin: session.is_admin
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export function withAuth(handler: (request: NextRequest, user: AuthUser, isAdmin: boolean) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const auth = await authenticateRequest(request);
    
    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    return handler(request, auth.user, auth.isAdmin);
  };
}

export function withAdminAuth(handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>) {
  return withAuth(async (request, user, isAdmin) => {
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }
    
    return handler(request, user);
  });
}