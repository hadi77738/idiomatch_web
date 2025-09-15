// app/api/users/route.ts
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
  created_at?: string;
  updated_at?: string;
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
    const { rows: sessionRows } = await query(
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'full_name';
    const sortOrder = searchParams.get('sortOrder') || 'ASC';

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, message: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    const offset = (page - 1) * limit;

    // Build dynamic query with search and filtering
    let whereClause = '';
    const queryParams: any[] = [];

    if (search) {
      whereClause = `
        WHERE (u.full_name ILIKE $1 OR u.username ILIKE $1 OR u.nim ILIKE $1)
      `;
      queryParams.push(`%${search}%`);
    }

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM users u
      ${whereClause}
    `;
    
    const { rows: countResult } = await query<{ total: string }>(countQuery, queryParams);
    const totalCount = parseInt(countResult[0].total);

    // Get users with university information
    const usersQuery = `
      SELECT 
        u.id,
        u.username,
        u.full_name,
        u.nim,
        u.is_admin,
        u.university_id,
        uni.name as university_name,
        u.created_at,
        u.updated_at
      FROM users u
      LEFT JOIN universities uni ON u.university_id = uni.id
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    queryParams.push(limit, offset);

    const { rows: users } = await query<User>(usersQuery, queryParams);

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate session and check admin privileges
    const { rows: sessionRows } = await query(
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

    const body = await request.json();

    // Validate required fields
    const { username, full_name, nim, university_id = 1, password } = body;

    if (!username || !full_name || !nim || !password) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate input data
    if (username.length < 3) {
      return NextResponse.json(
        { success: false, message: 'Username must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (nim.length < 5) {
      return NextResponse.json(
        { success: false, message: 'NIM must be at least 5 characters' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const { rows: existingUsername } = await query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existingUsername.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Username already exists' },
        { status: 409 }
      );
    }

    // Check if NIM already exists
    const { rows: existingNim } = await query(
      'SELECT id FROM users WHERE nim = $1',
      [nim]
    );

    if (existingNim.length > 0) {
      return NextResponse.json(
        { success: false, message: 'NIM already exists' },
        { status: 409 }
      );
    }

    // Hash password (you should implement proper password hashing)
    const hashedPassword = password; // Replace with proper hashing

    // Insert new user
    const { rows: newUsers } = await query(
      `INSERT INTO users (username, password, full_name, nim, university_id, is_admin)
       VALUES ($1, $2, $3, $4, $5, false)
       RETURNING id, username, full_name, nim, is_admin, university_id, created_at`,
      [username, hashedPassword, full_name, nim, university_id]
    );

    return NextResponse.json({
      success: true,
      data: newUsers[0],
      message: 'User created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}