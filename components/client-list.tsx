"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  Phone,
  Calendar,
  Bot,
  Zap,
  Loader2,
  AlertTriangle,
  TrendingUp,
  Clock,
  MessageSquarePlus,
  Edit,
} from "lucide-react"
import type { Client, ClientStatus, ClientPriority } from "./client-dashboard"
import { AIAnalysisDialog } from "./ai-analysis-dialog"
import { EditClientDialog } from "./edit-client-dialog"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface ClientListProps {
  clients: Client[]
  onUpdateClient: (id: string, updates: Partial<Client>) => void
}

export function ClientList({ clients, onUpdateClient }: ClientListProps) {
  const router = useRouter()
  const [analysisClient, setAnalysisClient] = useState<Client | null>(null)
  const [editClient, setEditClient] = useState<Client | null>(null)
  const [loadingAnalysis, setLoadingAnalysis] = useState<string | null>(null)
  const [loadingCategorize, setLoadingCategorize] = useState<string | null>(null)
  const [quickInteractionClient, setQuickInteractionClient] = useState<Client | null>(null)
  const [interactionDescription, setInteractionDescription] = useState("")
  const [interactionType, setInteractionType] = useState("")
  const [interactionDate, setInteractionDate] = useState("")
  const [interactionTime, setInteractionTime] = useState("")
  const [customType, setCustomType] = useState("")
  const [showCustomType, setShowCustomType] = useState(false)

  const defaultInteractionTypes = [
    { name: "Llamada", color: "#10b981" },
    { name: "Reunión", color: "#3b82f6" },
    { name: "Email", color: "#8b5cf6" },
    { name: "WhatsApp", color: "#059669" },
    { name: "Visita", color: "#f59e0b" },
  ]

  const getStatusColor = (status: ClientStatus) => {
    switch (status) {
      case "Activo":
        return "bg-green-100 text-green-800 border-green-200"
      case "Potencial":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Inactivo":
        return "bg-red-100 text-red-800 border-red-200"
    }
  }

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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  const getDaysAgo = (date: Date) => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleStatusChange = (clientId: string, newStatus: ClientStatus) => {
    onUpdateClient(clientId, { estado: newStatus })
  }

  const handleAnalyzeClient = async (client: Client) => {
    setLoadingAnalysis(client.id)
    try {
      const response = await fetch("/api/ai/analyze-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client }),
      })

      if (!response.ok) throw new Error("Error en análisis")

      const { analysis } = await response.json()

      const newRecommendation = {
        id: Date.now().toString(),
        fecha: new Date(),
        recommendation: analysis.recommendation || analysis,
        priority: analysis.priority || "Media",
      }

      onUpdateClient(client.id, {
        aiRecommendations: [newRecommendation, ...client.aiRecommendations],
      })

      setAnalysisClient({ ...client, aiAnalysis: analysis })
    } catch (error) {
      console.error("Error:", error)
      alert("Error al analizar cliente. Intenta nuevamente.")
    } finally {
      setLoadingAnalysis(null)
    }
  }

  const handleAutoCategorize = async (client: Client) => {
    setLoadingCategorize(client.id)
    try {
      const response = await fetch("/api/ai/categorize-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client }),
      })

      if (!response.ok) throw new Error("Error en categorización")

      const { category } = await response.json()
      onUpdateClient(client.id, { estado: category as ClientStatus })
      alert(`IA ha categorizado al cliente como: ${category}`)
    } catch (error) {
      console.error("Error:", error)
      alert("Error al categorizar cliente. Intenta nuevamente.")
    } finally {
      setLoadingCategorize(null)
    }
  }

  const handleQuickInteraction = (client: Client) => {
    if (!interactionDescription.trim() || (!interactionType && !customType.trim())) return

    const selectedDate = interactionDate ? new Date(interactionDate) : new Date()

    if (interactionTime) {
      const selectedTime = interactionTime.split(":")
      selectedDate.setHours(Number.parseInt(selectedTime[0]), Number.parseInt(selectedTime[1]))
    }

    const finalType = showCustomType && customType.trim() ? customType.trim() : interactionType

    const newInteraction = {
      id: Date.now().toString(),
      fecha: selectedDate,
      descripcion: interactionDescription.trim(),
      tipo: finalType,
    }

    onUpdateClient(client.id, {
      interacciones: [newInteraction, ...(client.interacciones || [])],
      ultimaInteraccion: selectedDate,
    })

    setInteractionDescription("")
    setInteractionType("")
    setInteractionDate("")
    setInteractionTime("")
    setCustomType("")
    setShowCustomType(false)
    setQuickInteractionClient(null)
  }

  const handleCardClick = (client: Client) => {
    router.push(`/client/${client.id}`)
  }

  if (clients.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <div className="text-muted-foreground">
          <p className="text-lg mb-2">No se encontraron clientes</p>
          <p className="text-sm">Intenta ajustar los filtros o agregar un nuevo cliente</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {clients.map((client) => {
          const daysAgo = getDaysAgo(client.ultimaInteraccion)
          const latestRecommendation = client.aiRecommendations?.[0]

          return (
            <div
              key={client.id}
              className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleCardClick(client)}
            >
              {/* Header Section */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-gray-900 text-lg">{client.nombre}</h3>
                  <Badge className={getPriorityColor(client.priority)} variant="outline">
                    {getPriorityIcon(client.priority)}
                    <span className="ml-1">{client.priority}</span>
                  </Badge>
                  {client.priority === "Alta" && (
                    <Badge className="bg-red-500 text-white hover:bg-red-600">¡Atención requerida!</Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {/* Quick Interaction Button */}
                  <Dialog
                    open={quickInteractionClient?.id === client.id}
                    onOpenChange={(open) => {
                      if (!open) {
                        setQuickInteractionClient(null)
                        setInteractionDescription("")
                        setInteractionType("")
                        setInteractionDate("")
                        setInteractionTime("")
                        setCustomType("")
                        setShowCustomType(false)
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setQuickInteractionClient(client)
                          const now = new Date()
                          setInteractionDate(now.toISOString().split("T")[0])
                          setInteractionTime(
                            `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`,
                          )
                        }}
                        className="text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <MessageSquarePlus className="h-4 w-4 mr-1" />
                        Interacción
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Agregar Interacción - {client.nombre}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Fecha</label>
                            <input
                              type="date"
                              value={interactionDate}
                              onChange={(e) => setInteractionDate(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Hora (opcional)</label>
                            <input
                              type="time"
                              value={interactionTime}
                              onChange={(e) => setInteractionTime(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Tipo de Interacción</label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {defaultInteractionTypes.map((type) => (
                              <button
                                key={type.name}
                                type="button"
                                onClick={() => {
                                  setInteractionType(type.name)
                                  setShowCustomType(false)
                                }}
                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                  interactionType === type.name && !showCustomType
                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                                style={{
                                  borderColor:
                                    interactionType === type.name && !showCustomType ? type.color : undefined,
                                  backgroundColor:
                                    interactionType === type.name && !showCustomType ? `${type.color}20` : undefined,
                                }}
                              >
                                {type.name}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                setShowCustomType(true)
                                setInteractionType("")
                              }}
                              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                showCustomType
                                  ? "border-purple-500 bg-purple-50 text-purple-700"
                                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              + Personalizado
                            </button>
                          </div>

                          {showCustomType && (
                            <input
                              type="text"
                              placeholder="Escribe el tipo de interacción..."
                              value={customType}
                              onChange={(e) => setCustomType(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                          )}
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">Descripción</label>
                          <Textarea
                            placeholder="Describe la interacción con el cliente..."
                            value={interactionDescription}
                            onChange={(e) => setInteractionDescription(e.target.value)}
                            className="min-h-[100px]"
                          />
                        </div>

                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setQuickInteractionClient(null)
                              setInteractionDescription("")
                              setInteractionType("")
                              setInteractionDate("")
                              setInteractionTime("")
                              setCustomType("")
                              setShowCustomType(false)
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={() => handleQuickInteraction(client)}
                            disabled={!interactionDescription.trim() || (!interactionType && !customType.trim())}
                          >
                            Guardar Interacción
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Edit Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditClient(client)
                    }}
                    className="text-gray-600 border-gray-200 hover:bg-gray-50"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>

                  <div className="border-l border-gray-200 pl-2">
                    <Select
                      value={client.estado}
                      onValueChange={(value) => handleStatusChange(client.id, value as ClientStatus)}
                    >
                      <SelectTrigger
                        className="w-[120px] h-8"
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <Badge className={getStatusColor(client.estado)} variant="outline">
                          {client.estado}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Activo">
                          <Badge
                            className="bg-green-100 text-green-800 border-green-200 text-xs px-2 py-0.5"
                            variant="outline"
                          >
                            Activo
                          </Badge>
                        </SelectItem>
                        <SelectItem value="Potencial">
                          <Badge
                            className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs px-2 py-0.5"
                            variant="outline"
                          >
                            Potencial
                          </Badge>
                        </SelectItem>
                        <SelectItem value="Inactivo">
                          <Badge
                            className="bg-red-100 text-red-800 border-red-200 text-xs px-2 py-0.5"
                            variant="outline"
                          >
                            Inactivo
                          </Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {client.telefono}
                </div>
                <div className="flex items-center gap-1">
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
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
                  <div className="flex items-start gap-2">
                    <Bot className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-800">{latestRecommendation.recommendation}</p>
                  </div>
                </div>
              )}

              {/* AI Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAnalyzeClient(client)
                  }}
                  disabled={loadingAnalysis === client.id}
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                >
                  {loadingAnalysis === client.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Bot className="h-4 w-4 mr-1" />
                  )}
                  Analizar Cliente
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAutoCategorize(client)
                  }}
                  disabled={loadingCategorize === client.id}
                  className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                >
                  {loadingCategorize === client.id ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Zap className="h-4 w-4 mr-1" />
                  )}
                  Categorizar Auto
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {analysisClient && (
        <AIAnalysisDialog
          client={analysisClient}
          open={!!analysisClient}
          onOpenChange={(open) => !open && setAnalysisClient(null)}
        />
      )}

      {editClient && (
        <EditClientDialog
          client={editClient}
          open={!!editClient}
          onOpenChange={(open) => !open && setEditClient(null)}
          onUpdateClient={onUpdateClient}
        />
      )}
    </>
  )
}
