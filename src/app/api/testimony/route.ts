import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { cookies } from "next/headers";

// GET semua testimony (bisa diakses publik)
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT t.id, t.content, t.created_at, u.full_name AS user_name
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

// POST tambah testimony (hanya user login)
export async function POST(req: Request) {
  try {
    const cookieStore = cookies(); // ambil cookies sync
    const token = (await cookieStore).get("session_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // cek session
    const sessionRes = await pool.query(
      "SELECT * FROM sessions WHERE token = $1",
      [token]
    );
    const session = sessionRes.rows[0];

    if (!session || new Date(session.expires_at) < new Date()) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    // ambil user
    const userRes = await pool.query(
      "SELECT id FROM users WHERE id = $1",
      [session.user_id]
    );
    if (userRes.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ambil isi body
    const { content } = await req.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    // simpan testimony
    await pool.query(
      "INSERT INTO testimonies (user_id, content) VALUES ($1, $2)",
      [userRes.rows[0].id, content]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error add testimony:", err);
    return NextResponse.json({ error: "Failed to add testimony" }, { status: 500 });
  }
}
