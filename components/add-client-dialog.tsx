"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Client, ClientStatus } from "./client-dashboard"
import { toast } from "sonner"

interface AddClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddClient: (client: Omit<Client, "id" | "interacciones">) => void
}

export function AddClientDialog({ open, onOpenChange, onAddClient }: AddClientDialogProps) {
  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    estado: "Potencial" as ClientStatus,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre.trim() || !formData.telefono.trim()) {
      toast.error("Por favor completa todos los campos requeridos")
      return
    }

    onAddClient({
      ...formData,
      ultimaInteraccion: new Date(),
    })

    // Reset form
    setFormData({
      nombre: "",
      telefono: "",
      estado: "Potencial",
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Cliente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre Completo *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Número de Teléfono *</Label>
            <Input
              id="telefono"
              value={formData.telefono}
              onChange={(e) => setFormData((prev) => ({ ...prev, telefono: e.target.value }))}
              placeholder="Ej: +54 11 1234-5678"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado de Relación</Label>
            <Select
              value={formData.estado}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, estado: value as ClientStatus }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Potencial">Potencial</SelectItem>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Agregar Cliente</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
