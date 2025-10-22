import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString:'postgresql://neondb_owner:npg_IrWQBC3GYT4A@ep-winter-surf-aebwgg7p-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false },
});

export async function POST(request: Request) {
  try {
    const { rfid, nombre, apellido } = await request.json();
    const result = await pool.query(
      "INSERT INTO registros (rfid, nombre, apellido) VALUES ($1, $2, $3) RETURNING *",
      [rfid, nombre, apellido]
    );
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM registros ORDER BY fecha_registro DESC");
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}