"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { UserPlus, Edit, Trash2, Users } from "lucide-react"

interface Professor {
  id: number
  rfid: string
  nombre: string
}

export function ProfessorManagement() {
  const [professors, setProfessors] = useState<Professor[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
  })

  useEffect(() => {
    loadProfessors()
  }, [])

  const loadProfessors = async () => {
    try {
      const response = await fetch("/api/profesores")
      if (response.ok) {
        const data = await response.json()
        setProfessors(data)
      }
    } catch (error) {
      console.error("[v0] Error loading professors:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingProfessor ? `/api/profesores?id=${editingProfessor.id}` : "/api/profesores"
      const method = editingProfessor ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await loadProfessors()
        setIsDialogOpen(false)
        resetForm()
        alert(editingProfessor ? "Profesor actualizado correctamente" : "Profesor agregado correctamente")
      } else {
        const error = await response.json()
        alert("Error: " + error.error)
      }
    } catch (error) {
      console.error("[v0] Error saving professor:", error)
      alert("Error al guardar el profesor")
    }
  }

  const handleEdit = (professor: Professor) => {
    setEditingProfessor(professor)
    setFormData({
      nombre: professor.nombre,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este profesor?")) return

    try {
      const response = await fetch(`/api/profesores?id=${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await loadProfessors()
        alert("Profesor eliminado correctamente")
      } else {
        alert("Error al eliminar el profesor")
      }
    } catch (error) {
      console.error("[v0] Error deleting professor:", error)
      alert("Error al eliminar el profesor")
    }
  }

  const resetForm = () => {
    setFormData({ nombre: "" })
    setEditingProfessor(null)
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  return (
    <Card className="p-6 bg-white/95 backdrop-blur shadow-lg border-2 border-[#00bcd4]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-[#00bcd4] to-[#8bc34a] p-3 rounded-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-[#1e293b]">Gestión de Carnets de Profesores</h3>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button className="bg-[#00bcd4] hover:bg-[#0097a7] text-white font-semibold">
              <UserPlus className="w-4 h-4 mr-2" />
              Agregar Profesor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProfessor ? "Editar Profesor" : "Agregar Nuevo Profesor"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Dr. Juan Pérez"
                  required
                  className="border-[#00bcd4]"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1 bg-[#00bcd4] hover:bg-[#0097a7] text-white">
                  {editingProfessor ? "Actualizar" : "Agregar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogClose(false)}
                  className="flex-1 border-[#00bcd4] text-[#00bcd4]"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-[#00bcd4] to-[#8bc34a] text-white">
              <th className="p-3 text-left font-semibold">ID</th>
              <th className="p-3 text-left font-semibold">Nombre</th>
              <th className="p-3 text-center font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {professors.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-[#64748b]">
                  No hay profesores registrados
                </td>
              </tr>
            ) : (
              professors.map((professor, index) => (
                <tr
                  key={professor.id}
                  className={`border-b border-[#e2e8f0] ${
                    index % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"
                  } hover:bg-[#e0f2f1] transition-colors`}
                >
                  <td className="p-3 font-semibold text-[#1e293b]">{professor.id}</td>
                  <td className="p-3 text-[#1e293b] font-medium">{professor.nombre}</td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(professor)}
                        className="border-[#00bcd4] text-[#00bcd4] hover:bg-[#e0f2f1]"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(professor.id)}
                        className="border-red-500 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
