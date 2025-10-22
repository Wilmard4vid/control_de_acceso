import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function POST(req: Request) {
  try {
    const { id, nombre, apellido } = await req.json();

    if (!id || !nombre || !apellido) {
      return NextResponse.json({ success: false, error: "Faltan datos" });
    }

    await pool.query(
      "INSERT INTO profesores (id, nombre, apellido) VALUES ($1, $2, $3)",
      [id, nombre, apellido]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Error al guardar:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Error al guardar los datos",
    });
  }
}
