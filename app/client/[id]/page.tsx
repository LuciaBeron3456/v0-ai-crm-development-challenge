import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Phone, Calendar, Bot, AlertTriangle, TrendingUp, Clock } from "lucide-react"
import { getClientById } from "@/components/client-detail-server"
import type { Client, ClientPriority } from "@/components/client-dashboard"
import { ClientDetailClient } from "./client-detail-client"

interface ClientDetailPageProps {
  params: {
    id: string
  }
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const client = await getClientById(params.id)

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

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getDaysAgo = (timestamp: number) => {
    const now = Date.now()
    const diffTime = Math.abs(now - timestamp)
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
    return <ClientDetailClient client={null} />
  }

  const daysAgo = getDaysAgo(client.ultimaInteraccion)
  const latestRecommendation = client.aiRecommendations?.[0]

  return (
    <>
      <ClientDetailClient client={client} />
    </>
  )
}
