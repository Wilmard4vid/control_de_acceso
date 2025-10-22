"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, DoorOpen, DoorClosed, RefreshCw, Plus, Pencil, Trash2, UserCircle } from "lucide-react"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type RoomStatus = "DISPONIBLE" | "OCUPADO" | "RESERVADO"

interface Room {
  id: string
  number: string
  status: RoomStatus
  capacity: number
  floor: string
  building: string
  professor?: string
}

interface AccessRecord {
  id: number
  rfid: string
  nombre_profesor: string
  salon: string
  hora_apertura: string | null
  hora_cierre: string | null
  estado: "ABIERTO" | "CERRADO"
}

interface Professor {
  id: number
  nombre: string
  apellido: string
  rfid: string
}

export default function AccessControlPage() {
  const [selectedProfessor, setSelectedProfessor] = useState<string>("")
  const [professors, setProfessors] = useState<Professor[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    rfid: "",
  })

  const [rooms, setRooms] = useState<Room[]>([
    { id: "1", number: "A-101", status: "DISPONIBLE", capacity: 40, floor: "1er Piso", building: "Edificio A" },
    {
      id: "2",
      number: "A-102",
      status: "OCUPADO",
      capacity: 35,
      floor: "1er Piso",
      building: "Edificio A",
      professor: "Dr. Carlos Ruiz",
    },
    { id: "3", number: "A-201", status: "DISPONIBLE", capacity: 50, floor: "2do Piso", building: "Edificio A" },
    {
      id: "4",
      number: "B-101",
      status: "RESERVADO",
      capacity: 30,
      floor: "1er Piso",
      building: "Edificio B",
      professor: "Dra. Patricia López",
    },
    { id: "5", number: "B-102", status: "DISPONIBLE", capacity: 45, floor: "1er Piso", building: "Edificio B" },
    { id: "6", number: "B-201", status: "DISPONIBLE", capacity: 60, floor: "2do Piso", building: "Edificio B" },
  ])

  const [accessRecords, setAccessRecords] = useState<AccessRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchAccessRecords()
    fetchProfessors()
  }, [])

  const fetchProfessors = async () => {
    try {
      const response = await fetch("/api/profesores")
      if (response.ok) {
        const data = await response.json()
        setProfessors(data)
      }
    } catch (error) {
      console.error("Error fetching professors:", error)
    }
  }

  const handleAddProfessor = () => {
    setEditingProfessor(null)
    setFormData({ nombre: "", apellido: "", rfid: "" })
    setIsDialogOpen(true)
  }

  const handleEditProfessor = (professor: Professor) => {
    setEditingProfessor(professor)
    setFormData({
      nombre: professor.nombre,
      apellido: professor.apellido,
      rfid: professor.rfid,
    })
    setIsDialogOpen(true)
  }

  const handleDeleteProfessor = async (id: number) => {
    if (!confirm("¿Está seguro de eliminar este profesor?")) return

    try {
      const response = await fetch(`/api/profesores?id=${id}`, { method: "DELETE" })
      if (response.ok) {
        fetchProfessors()
        alert("Profesor eliminado correctamente")
      }
    } catch (error) {
      console.error("Error deleting professor:", error)
      alert("Error al eliminar profesor")
    }
  }

  const handleSubmitProfessor = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingProfessor ? `/api/profesores?id=${editingProfessor.id}` : "/api/profesores"
      const method = editingProfessor ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success || response.ok) {
        fetchProfessors()
        setIsDialogOpen(false)
        alert(editingProfessor ? "Profesor actualizado correctamente" : "Profesor agregado correctamente")
      } else {
        alert("Error: " + result.error)
      }
    } catch (error) {
      console.error("Error saving professor:", error)
      alert("Error al guardar profesor")
    }
  }

  const fetchAccessRecords = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/accesos")
      const result = await response.json()

      if (result.success) {
        setAccessRecords(result.data)
      }
    } catch (error) {
      console.error("Error fetching access records:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenRoom = async (roomId: string) => {
    if (!selectedProfessor) {
      alert("Por favor seleccione un profesor primero")
      return
    }

    const room = rooms.find((r) => r.id === roomId)
    if (!room) return

    const professorData = professors.find((p) => `${p.nombre} ${p.apellido}` === selectedProfessor)
    if (!professorData) return

    try {
      const response = await fetch("/api/accesos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rfid: professorData.rfid,
          nombre_profesor: selectedProfessor,
          salon: room.number,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setRooms(
          rooms.map((r) =>
            r.id === roomId ? { ...r, status: "OCUPADO" as RoomStatus, professor: selectedProfessor } : r,
          ),
        )
        fetchAccessRecords()
        alert("Salón abierto correctamente")
      } else {
        alert("Error al abrir el salón: " + result.error)
      }
    } catch (error) {
      console.error("Error opening room:", error)
      alert("Error al conectar con la base de datos")
    }
  }

  const handleCloseRoom = async (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId)
    if (!room || !room.professor) return

    try {
      const response = await fetch("/api/accesos/cerrar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salon: room.number,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setRooms(
          rooms.map((r) => (r.id === roomId ? { ...r, status: "DISPONIBLE" as RoomStatus, professor: undefined } : r)),
        )
        fetchAccessRecords()
        alert("Salón cerrado correctamente")
      } else {
        alert("Error al cerrar el salón: " + result.error)
      }
    } catch (error) {
      console.error("Error closing room:", error)
      alert("Error al conectar con la base de datos")
    }
  }

  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case "DISPONIBLE":
        return "border-l-[#4ade80] bg-white"
      case "OCUPADO":
        return "border-l-[#f87171] bg-white"
      case "RESERVADO":
        return "border-l-[#fb923c] bg-white"
    }
  }

  const getStatusBadgeColor = (status: RoomStatus) => {
    switch (status) {
      case "DISPONIBLE":
        return "bg-[#dcfce7] text-[#166534] hover:bg-[#dcfce7]"
      case "OCUPADO":
        return "bg-[#fee2e2] text-[#991b1b] hover:bg-[#fee2e2]"
      case "RESERVADO":
        return "bg-[#fed7aa] text-[#9a3412] hover:bg-[#fed7aa]"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#00bcd4] via-[#26c6da] to-[#8bc34a]">
      <header className="bg-white text-[#475569] py-6 px-6 shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
            <Image
              src="/logo-ucc.png"
              alt="Universidad Cooperativa de Colombia"
              width={100}
              height={100}
              className="object-contain"
            />
            <div>
              <h1 className="text-3xl font-bold text-[#334155]">Control de Acceso a Salones</h1>
              <p className="text-base text-[#64748b] mt-1">Universidad Cooperativa de Colombia - Sede Santa Marta</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-6">
          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-[#00bcd4] to-[#8bc34a] p-3 rounded-lg">
                  <UserCircle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#1e293b]">Gestión de Profesores</h2>
              </div>
              <Button onClick={handleAddProfessor} className="bg-[#00bcd4] hover:bg-[#0097a7] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Profesor
              </Button>
            </div>

            <div className="mb-6">
              <Label htmlFor="professor-select" className="text-base font-semibold text-[#1e293b] mb-2 block">
                Seleccionar Profesor para Abrir Salón
              </Label>
              <Select value={selectedProfessor} onValueChange={setSelectedProfessor}>
                <SelectTrigger id="professor-select" className="w-full">
                  <SelectValue placeholder="Seleccionar Profesor" />
                </SelectTrigger>
                <SelectContent>
                  {professors.map((prof) => (
                    <SelectItem key={prof.id} value={`${prof.nombre} ${prof.apellido}`}>
                      {prof.nombre} {prof.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-[#00bcd4] to-[#8bc34a] text-white">
                    <th className="p-3 text-left font-semibold">Nombre Completo</th>
                    <th className="p-3 text-center font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {professors.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="p-6 text-center text-[#64748b]">
                        No hay profesores registrados
                      </td>
                    </tr>
                  ) : (
                    professors.map((prof, index) => (
                      <tr
                        key={prof.id}
                        className={`border-b border-[#e2e8f0] ${
                          index % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"
                        } hover:bg-[#e0f2f1] transition-colors`}
                      >
                        <td className="p-3 text-[#1e293b] font-medium">
                          {prof.nombre} {prof.apellido}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              onClick={() => handleEditProfessor(prof)}
                              size="sm"
                              className="bg-[#00bcd4] hover:bg-[#0097a7] text-white"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteProfessor(prof.id)}
                              size="sm"
                              className="bg-[#f87171] hover:bg-[#ef4444] text-white"
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

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <Card
                key={room.id}
                className={`border-l-[6px] ${getStatusColor(room.status)} p-5 shadow-md hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-2xl font-bold text-[#1e293b]">{room.number}</h3>
                  <Badge className={`${getStatusBadgeColor(room.status)} font-semibold`}>{room.status}</Badge>
                </div>

                <div className="space-y-2 text-sm text-[#475569] mb-4">
                  <div className="flex justify-between">
                    <span>Capacidad:</span>
                    <span className="font-semibold">{room.capacity} personas</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ubicación:</span>
                    <span className="font-semibold">{room.floor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Edificio:</span>
                    <span className="font-semibold">{room.building}</span>
                  </div>
                  {room.professor && (
                    <div className="flex justify-between">
                      <span>Profesor:</span>
                      <span className="font-semibold">{room.professor}</span>
                    </div>
                  )}
                </div>

                {room.status === "DISPONIBLE" || room.status === "RESERVADO" ? (
                  <Button
                    onClick={() => handleOpenRoom(room.id)}
                    className="w-full bg-[#4ade80] hover:bg-[#22c55e] text-white font-semibold"
                  >
                    ABRIR SALÓN
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleCloseRoom(room.id)}
                    className="w-full bg-[#f87171] hover:bg-[#ef4444] text-white font-semibold"
                  >
                    CERRAR SALÓN
                  </Button>
                )}
              </Card>
            ))}
          </div>

          <Card className="p-6 bg-white shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-r from-[#00bcd4] to-[#8bc34a] p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-[#1e293b]">Registro de Accesos a Salones</h2>
              </div>
              <Button
                onClick={fetchAccessRecords}
                disabled={isLoading}
                className="bg-[#00bcd4] hover:bg-[#0097a7] text-white"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                Actualizar
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-[#00bcd4] to-[#8bc34a] text-white">
                    <th className="p-3 text-left font-semibold">ID</th>
                    <th className="p-3 text-left font-semibold">Nombre Profesor</th>
                    <th className="p-3 text-left font-semibold">Salón</th>
                    <th className="p-3 text-left font-semibold">Hora Apertura</th>
                    <th className="p-3 text-left font-semibold">Hora Cierre</th>
                    <th className="p-3 text-left font-semibold">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-[#64748b]">
                        Cargando registros...
                      </td>
                    </tr>
                  ) : accessRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-[#64748b]">
                        No hay registros de acceso
                      </td>
                    </tr>
                  ) : (
                    accessRecords.map((record, index) => (
                      <tr
                        key={record.id}
                        className={`border-b border-[#e2e8f0] ${
                          index % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"
                        } hover:bg-[#e0f2f1] transition-colors`}
                      >
                        <td className="p-3 font-semibold text-[#1e293b]">{record.id}</td>
                        <td className="p-3 text-[#1e293b] font-medium">{record.nombre_profesor}</td>
                        <td className="p-3 text-[#1e293b] font-bold">{record.salon}</td>
                        <td className="p-3 text-[#475569] text-sm">
                          {record.hora_apertura
                            ? new Date(record.hora_apertura).toLocaleString("es-CO", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })
                            : "-"}
                        </td>
                        <td className="p-3 text-[#475569] text-sm">
                          {record.hora_cierre
                            ? new Date(record.hora_cierre).toLocaleString("es-CO", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })
                            : "-"}
                        </td>
                        <td className="p-3">
                          <Badge
                            className={`${
                              record.estado === "ABIERTO"
                                ? "bg-[#dcfce7] text-[#166534]"
                                : "bg-[#fee2e2] text-[#991b1b]"
                            } font-semibold`}
                          >
                            {record.estado === "ABIERTO" ? (
                              <DoorOpen className="w-3 h-3 mr-1 inline" />
                            ) : (
                              <DoorClosed className="w-3 h-3 mr-1 inline" />
                            )}
                            {record.estado}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingProfessor ? "Editar Profesor" : "Agregar Profesor"}</DialogTitle>
            <DialogDescription>
              {editingProfessor ? "Modifica los datos del profesor" : "Completa los datos del nuevo profesor"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitProfessor}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rfid">RFID (oculto en consultas)</Label>
                <Input
                  id="rfid"
                  value={formData.rfid}
                  onChange={(e) => setFormData({ ...formData, rfid: e.target.value })}
                  required
                  placeholder="Ej: RFID-001-CR"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#00bcd4] hover:bg-[#0097a7] text-white">
                {editingProfessor ? "Actualizar" : "Agregar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
