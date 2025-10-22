import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { salon } = body

    if (!salon) {
      return NextResponse.json({ success: false, error: "Falta el número de salón" }, { status: 400 })
    }

    const { data: openAccess, error: fetchError } = await supabase
      .from("accesos")
      .select("*")
      .eq("salon", salon)
      .eq("estado", "ABIERTO")
      .order("hora_apertura", { ascending: false })
      .limit(1)
      .single()

    if (fetchError || !openAccess) {
      return NextResponse.json({ success: false, error: "No hay acceso abierto para este salón" }, { status: 404 })
    }

    const { data, error } = await supabase
      .from("accesos")
      .update({
        hora_cierre: new Date().toISOString(),
        estado: "CERRADO",
      })
      .eq("id", openAccess.id)
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: "Salón cerrado correctamente",
      data,
    })
  } catch (error) {
    console.error("[v0] Error closing acceso:", error)
    return NextResponse.json({ success: false, error: "Error al cerrar el salón" }, { status: 500 })
  }
}
