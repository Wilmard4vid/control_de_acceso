import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("profesores").select("*").order("id", { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error("[v0] Database error:", error)
    return NextResponse.json({ error: "Error al obtener profesores" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { rfid, nombre, apellido } = body

    if (!rfid || !nombre || !apellido) {
      return NextResponse.json({ error: "RFID, nombre y apellido son requeridos" }, { status: 400 })
    }

    const { data, error } = await supabase.from("profesores").insert([{ rfid, nombre, apellido }]).select()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "El RFID ya está registrado" }, { status: 400 })
      }
      throw error
    }

    return NextResponse.json({ success: true, message: "Profesor agregado correctamente", data })
  } catch (error: any) {
    console.error("[v0] Database error:", error)
    return NextResponse.json({ error: "Error al agregar profesor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const body = await request.json()
    const { rfid, nombre, apellido } = body

    if (!id || !rfid || !nombre || !apellido) {
      return NextResponse.json({ error: "ID, RFID, nombre y apellido son requeridos" }, { status: 400 })
    }

    const { data, error } = await supabase.from("profesores").update({ rfid, nombre, apellido }).eq("id", id).select()

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "El RFID ya está registrado" }, { status: 400 })
      }
      throw error
    }

    return NextResponse.json({ success: true, message: "Profesor actualizado correctamente", data })
  } catch (error: any) {
    console.error("[v0] Database error:", error)
    return NextResponse.json({ error: "Error al actualizar profesor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID es requerido" }, { status: 400 })
    }

    const { error } = await supabase.from("profesores").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true, message: "Profesor eliminado correctamente" })
  } catch (error) {
    console.error("[v0] Database error:", error)
    return NextResponse.json({ error: "Error al eliminar profesor" }, { status: 500 })
  }
}
