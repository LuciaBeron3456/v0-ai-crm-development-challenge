"use client"

import type React from "react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Client, ClientStatus } from "@/lib/types"
import { toast } from "sonner"

// Zod schema for form validation
const clientFormSchema = z.object({
  nombre: z.string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras y espacios"),
  telefono: z.string()
    .min(1, "El teléfono es requerido")
    .regex(/^[\+]?[0-9\s\-\(\)]+$/, "Formato de teléfono inválido")
    .min(8, "El teléfono debe tener al menos 8 dígitos"),
  estado: z.enum(["Potencial", "Activo", "Inactivo"], {
    required_error: "Debe seleccionar un estado",
  }),
})

type ClientFormData = z.infer<typeof clientFormSchema>

interface ClientFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  client?: Client | null // null for add mode, Client for edit mode
  onSave: (clientData: Omit<Client, "id" | "interacciones" | "aiRecommendations" | "aiAnalyses">) => void
  onUpdate?: (id: string, updates: Partial<Client>) => void
}

export function ClientFormDialog({ 
  open, 
  onOpenChange, 
  client, 
  onSave, 
  onUpdate 
}: ClientFormDialogProps) {
  const isEditMode = !!client
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      nombre: "",
      telefono: "",
      estado: "Potencial",
    }
  })

  const watchedEstado = watch("estado")

  useEffect(() => {
    if (client) {
      setValue("nombre", client.nombre)
      setValue("telefono", client.telefono)
      setValue("estado", client.estado)
    } else {
      // Reset form for add mode
      reset({
        nombre: "",
        telefono: "",
        estado: "Potencial",
      })
    }
  }, [client, open, setValue, reset])

  const onSubmit = (data: ClientFormData) => {
    if (isEditMode && client && onUpdate) {
      onUpdate(client.id, {
        nombre: data.nombre.trim(),
        telefono: data.telefono.trim(),
        estado: data.estado,
      })
    } else {
      onSave({
        nombre: data.nombre.trim(),
        telefono: data.telefono.trim(),
        estado: data.estado,
        ultimaInteraccion: Date.now(),
        priority: "Media" as const,
      })
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Cliente" : "Agregar Nuevo Cliente"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre Completo *</Label>
            <Input
              id="nombre"
              {...register("nombre")}
              placeholder="Ej: Juan Pérez"
              className={errors.nombre ? "border-red-500" : ""}
            />
            {errors.nombre && (
              <p className="text-sm text-red-500">{errors.nombre.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Número de Teléfono *</Label>
            <Input
              id="telefono"
              {...register("telefono")}
              placeholder="Ej: +54 11 1234-5678"
              className={errors.telefono ? "border-red-500" : ""}
            />
            {errors.telefono && (
              <p className="text-sm text-red-500">{errors.telefono.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado de Relación</Label>
            <Select
              value={watchedEstado}
              onValueChange={(value) => setValue("estado", value as ClientStatus)}
            >
              <SelectTrigger className={errors.estado ? "border-red-500" : ""}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Potencial">Potencial</SelectItem>
                <SelectItem value="Activo">Activo</SelectItem>
                <SelectItem value="Inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
            {errors.estado && (
              <p className="text-sm text-red-500">{errors.estado.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting 
                ? "Guardando..." 
                : isEditMode 
                  ? "Guardar Cambios" 
                  : "Agregar Cliente"
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
