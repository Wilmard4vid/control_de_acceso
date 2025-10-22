import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("accesos")
      .select("id, rfid, nombre_profesor, salon, hora_apertura, hora_cierre, estado")
      .order("hora_apertura", { ascending: false })
      .limit(100)

    if (error) throw error

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error) {
    console.error("[v0] Error fetching accesos:", error)
    return NextResponse.json({ success: false, error: "Error al obtener los accesos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { rfid, nombre_profesor, salon } = body

    if (!rfid || !nombre_profesor || !salon) {
      return NextResponse.json({ success: false, error: "Faltan datos requeridos" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("accesos")
      .insert([
        {
          rfid,
          nombre_profesor,
          salon,
          estado: "ABIERTO",
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: "Acceso registrado correctamente",
      data,
    })
  } catch (error) {
    console.error("[v0] Error creating acceso:", error)
    return NextResponse.json({ success: false, error: "Error al registrar el acceso" }, { status: 500 })
  }
}
