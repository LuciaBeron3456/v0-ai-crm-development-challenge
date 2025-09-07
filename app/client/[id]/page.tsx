"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Phone, Calendar, Bot, AlertTriangle, TrendingUp, Clock } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import type { Client, ClientPriority } from "@/components/client-dashboard"

// Mock data - in a real app, this would come from your database
const mockClients: Client[] = [
  {
    id: "1",
    nombre: "Juan López Sánchez",
    telefono: "+34 622 111 222",
    estado: "Activo",
    ultimaInteraccion: new Date("2024-03-09"),
    priority: "Baja",
    aiRecommendations: [
      {
        id: "1",
        fecha: new Date("2024-03-10"),
        recommendation: "Este cliente necesita atención inmediata. Contactar lo antes posible.",
        priority: "Alta",
      },
    ],
    interacciones: [
      {
        id: "1",
        fecha: new Date("2024-03-09"),
        descripcion: "Renovación de contrato",
        tipo: "Llamada",
      },
      {
        id: "2",
        fecha: new Date("2024-02-25"),
        descripcion: "Llamada de seguimiento mensual",
        tipo: "Llamada",
      },
      {
        id: "3",
        fecha: new Date("2024-02-10"),
        descripcion: "Reunión presencial para revisar servicios",
        tipo: "Reunión",
      },
      {
        id: "4",
        fecha: new Date("2024-01-28"),
        descripcion: "Consulta por email sobre facturación",
        tipo: "Email",
      },
    ],
  },
]

export default function ClientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [client, setClient] = useState<Client | null>(null)

  useEffect(() => {
    // In a real app, fetch client data from your database using the ID
    const foundClient = mockClients.find((c) => c.id === params.id)
    setClient(foundClient || null)
  }, [params.id])

  const getPriorityColor = (priority: ClientPriority) => {
    switch (priority) {
      case "Alta":
        return "bg-red-100 text-red-800 border-red-200"
      case "Media":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Baja":
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityIcon = (priority: ClientPriority) => {
    switch (priority) {
      case "Alta":
        return <AlertTriangle className="h-3 w-3" />
      case "Media":
        return <TrendingUp className="h-3 w-3" />
      case "Baja":
        return <Clock className="h-3 w-3" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Activo":
        return "bg-green-100 text-green-800 border-green-200"
      case "Potencial":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Inactivo":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getDaysAgo = (date: Date) => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getTypeColor = (tipo: string) => {
    const typeColors: { [key: string]: string } = {
      Llamada: "bg-green-100 text-green-800 border-green-200",
      Reunión: "bg-blue-100 text-blue-800 border-blue-200",
      Email: "bg-purple-100 text-purple-800 border-purple-200",
      WhatsApp: "bg-emerald-100 text-emerald-800 border-emerald-200",
      Visita: "bg-amber-100 text-amber-800 border-amber-200",
    }
    return typeColors[tipo] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  if (!client) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <p>Cliente no encontrado</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const daysAgo = getDaysAgo(client.ultimaInteraccion)
  const latestRecommendation = client.aiRecommendations?.[0]

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => router.push("/")} size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Detalle del Cliente</h1>
      </div>

      {/* Client Info Card */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">{client.nombre}</h2>
            <Badge className={getPriorityColor(client.priority)} variant="outline">
              {getPriorityIcon(client.priority)}
              <span className="ml-1">Prioridad {client.priority}</span>
            </Badge>
            <Badge className={getStatusColor(client.estado)} variant="outline">
              {client.estado}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="h-4 w-4" />
            <span>{client.telefono}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>Última interacción: {formatDate(client.ultimaInteraccion)}</span>
            <span
              className={`ml-1 font-medium ${
                daysAgo > 30 ? "text-red-600" : daysAgo > 7 ? "text-orange-600" : "text-green-600"
              }`}
            >
              ({daysAgo} días)
            </span>
          </div>
        </div>

        {/* AI Recommendation */}
        {latestRecommendation && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-start gap-2">
              <Bot className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-800 font-medium mb-1">Recomendación IA:</p>
                <p className="text-sm text-red-700">{latestRecommendation.recommendation}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interaction History Table */}
      <div className="bg-white border rounded-lg">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Historial de Interacciones</h3>
        </div>
        <div className="p-6">
          {client.interacciones && client.interacciones.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descripción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.interacciones.map((interaccion) => (
                  <TableRow key={interaccion.id}>
                    <TableCell className="font-medium">{formatDateTime(interaccion.fecha)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${getTypeColor(interaccion.tipo)}`}>
                        {interaccion.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell>{interaccion.descripcion}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No hay interacciones registradas para este cliente</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
