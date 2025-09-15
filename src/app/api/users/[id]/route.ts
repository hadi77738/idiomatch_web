// src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

interface UpdateUserRequest {
  is_admin?: boolean;
  full_name?: string;
  username?: string;
  nim?: string;
  university_id?: number;
}

interface SessionValidation {
  user_id: number;
  is_admin: boolean;
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const body: UpdateUserRequest = await request.json();

    // Validate input data
    if (body.username && body.username.length < 3) {
      return NextResponse.json(
        { success: false, message: 'Username must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (body.nim && body.nim.length < 5) {
      return NextResponse.json(
        { success: false, message: 'NIM must be at least 5 characters' },
        { status: 400 }
      );
    }

    if (body.university_id && body.university_id < 1) {
      return NextResponse.json(
        { success: false, message: 'Invalid university ID' },
        { status: 400 }
      );
    }

    // Build dynamic update query
    const updateFields: string[] = [];
    const updateValues: unknown[] = [];
    let paramCount = 1;

    if (body.is_admin !== undefined) {
      updateFields.push(`is_admin = $${paramCount}`);
      updateValues.push(body.is_admin);
      paramCount++;
    }

    if (body.full_name !== undefined) {
      updateFields.push(`full_name = $${paramCount}`);
      updateValues.push(body.full_name);
      paramCount++;
    }

    if (body.username !== undefined) {
      // Check if username already exists
      const { rows: existingUser } = await query<{ id: number }>(
        'SELECT id FROM users WHERE username = $1 AND id != $2',
        [body.username, userId]
      );

      if (existingUser.length > 0) {
        return NextResponse.json(
          { success: false, message: 'Username already exists' },
          { status: 409 }
        );
      }
      updateFields.push(`username = $${paramCount}`);
      updateValues.push(body.username);
      paramCount++;
    }

    if (body.nim !== undefined) {
      // Check if NIM already exists
      const { rows: existingUser } = await query<{ id: number }>(
        'SELECT id FROM users WHERE nim = $1 AND id != $2',
        [body.nim, userId]
      );

      if (existingUser.length > 0) {
        return NextResponse.json(
          { success: false, message: 'NIM already exists' },
          { status: 409 }
        );
      }
      updateFields.push(`nim = $${paramCount}`);
      updateValues.push(body.nim);
      paramCount++;
    }

    if (body.university_id !== undefined) {
      updateFields.push(`university_id = $${paramCount}`);
      updateValues.push(body.university_id);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No fields to update' },
        { status: 400 }
      );
    }

    // Add updated_at timestamp
    updateFields.push(`updated_at = NOW()`);

    updateValues.push(userId); // for WHERE clause

    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, username, full_name, nim, is_admin, university_id
    `;

    const { rows: updatedUsers } = await query<{
      id: number;
      username: string;
      full_name: string;
      nim: string;
      is_admin: boolean;
      university_id: number;
    }>(updateQuery, updateValues);

    if (updatedUsers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedUsers[0],
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}