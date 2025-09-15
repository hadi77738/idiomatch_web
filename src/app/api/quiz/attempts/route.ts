// app/api/quiz/attempts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface QuizAttempt {
  id: number;
  full_name: string;
  nim: string;
  score: number;
  total_questions: number;
  created_at: string;
  username?: string;
  university_name?: string;
}

interface QuizAttemptStats {
  total_attempts: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
}

// GET /api/quiz/attempts - Get all quiz attempts with optional filtering
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate session
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

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';

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
        WHERE (u.full_name ILIKE $1 OR u.nim ILIKE $1 OR u.username ILIKE $1)
      `;
      queryParams.push(`%${search}%`);
    }

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM quiz_attempts qa
      JOIN users u ON qa.user_id = u.id
      ${whereClause}
    `;
    
    const { rows: countResult } = await query<{ total: string }>(countQuery, queryParams);
    const totalCount = parseInt(countResult[0].total);

    // Get quiz attempts with user information
    const attemptsQuery = `
      SELECT 
        qa.id,
        u.full_name,
        u.nim,
        u.username,
        uni.name as university_name,
        qa.score,
        qa.total_questions,
        qa.created_at
      FROM quiz_attempts qa
      JOIN users u ON qa.user_id = u.id
      LEFT JOIN universities uni ON u.university_id = uni.id
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    queryParams.push(limit, offset);

    const { rows: attempts } = await query<QuizAttempt>(attemptsQuery, queryParams);

    // Get statistics if requested
    let stats: QuizAttemptStats | null = null;
    if (searchParams.get('includeStats') === 'true' && is_admin) {
      const statsQuery = `
        SELECT 
          COUNT(*) as total_attempts,
          AVG(score) as average_score,
          MAX(score) as highest_score,
          MIN(score) as lowest_score
        FROM quiz_attempts qa
        JOIN users u ON qa.user_id = u.id
        ${whereClause}
      `;
      
      const { rows: statsResult } = await query<QuizAttemptStats>(statsQuery, queryParams.slice(0, -2)); // Remove limit/offset
      stats = statsResult[0];
    }

    return NextResponse.json({
      success: true,
      data: {
        attempts,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1
        },
        stats
      }
    });

  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function for database queries
async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[] }> {
  // Implementation depends on your database client
  // This is a placeholder - replace with your actual database query function
  throw new Error('Database query function not implemented');
}