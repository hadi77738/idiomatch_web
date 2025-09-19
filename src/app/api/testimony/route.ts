import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { cookies } from "next/headers"; 

// Ambil semua testimony (public bisa akses)
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT t.id, t.content, t.created_at, u.name AS user_name
       FROM testimonies t
       JOIN users u ON t.user_id = u.id
       ORDER BY t.created_at DESC`
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("Error get testimonies:", err);
    return NextResponse.json({ error: "Failed to fetch testimonies" }, { status: 500 });
  }
}

// Tambah testimony (hanya jika login)
export async function POST(req: Request) {
  try {
    // Cek user login dari /api/auth/me
    const cookieStore = cookies();
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/me`, {
      headers: { Cookie: cookieStore.toString() },
    });

    if (!res.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { user } = await res.json();

    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { content } = await req.json();
    if (!content || content.trim() === "")
      return NextResponse.json({ error: "Content required" }, { status: 400 });

    await pool.query(
      "INSERT INTO testimonies (user_id, content) VALUES ($1, $2)",
      [user.id, content]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error add testimony:", err);
    return NextResponse.json({ error: "Failed to add testimony" }, { status: 500 });
  }
}
