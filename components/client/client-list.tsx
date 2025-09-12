"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
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
  MoreHorizontal,
  Brain,
} from "lucide-react"
import type { Client, ClientStatus, ClientPriority, ClientListProps } from "@/lib/types"
import { AIAnalysisModal } from "../ai/ai-analysis-modal"
import { ClientFormDialog } from "./client-form-dialog"
import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { useRouter } from "next/navigation"


export function ClientList({ 
  clients, 
  onUpdateClient, 
  currentPage = 1, 
  itemsPerPage = 20, 
  searchTerm = "", 
  statusFilter = "Todos", 
  sortBy = "ultimaInteraccion", 
  sortDirection = "desc",
  onTotalCountChange
}: ClientListProps) {
  const router = useRouter()
  const addInteractionMutation = useMutation(api.clients.addInteraction)
  const updateClientMutation = useMutation(api.clients.updateClient)
  const addAIAnalysisMutation = useMutation(api.clients.addAIAnalysis)
  
  // Use Convex query for real-time updates - this is the source of truth
  const realTimeClients = useQuery(api.clients.getClients)
  
  // Use real-time data when available, fallback to SSR initial data
  const allClients = realTimeClients || clients
  
  // Apply client-side filtering and sorting
  const filteredAndSortedClients = allClients
    .filter((client) => {
      const matchesSearch =
        client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        client.telefono.includes(searchTerm)
      const matchesStatus = statusFilter === "Todos" || client.estado === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let comparison = 0
      if (sortBy === "nombre") {
        comparison = a.nombre.localeCompare(b.nombre)
      } else if (sortBy === "ultimaInteraccion") {
        comparison = b.ultimaInteraccion - a.ultimaInteraccion
      } else if (sortBy === "priority") {
        const priorityOrder = { Alta: 3, Media: 2, Baja: 1 }
        comparison = priorityOrder[b.priority] - priorityOrder[a.priority]
      }
      return sortDirection === "asc" ? comparison : -comparison
    })
  
  // Apply pagination
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const displayClients = filteredAndSortedClients.slice(startIndex, endIndex)
  
  // Notify parent of total count for pagination
  useEffect(() => {
    if (onTotalCountChange) {
      onTotalCountChange(filteredAndSortedClients.length)
    }
  }, [filteredAndSortedClients.length, onTotalCountChange])

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])
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
  
  // AI Analysis Modal state
  const [isAIAnalysisModalOpen, setIsAIAnalysisModalOpen] = useState(false)
  const [selectedClientForAnalysis, setSelectedClientForAnalysis] = useState<Client | null>(null)

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

  const getDaysAgo = (timestamp: number) => {
    const now = Date.now()
    const diffTime = Math.abs(now - timestamp)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleStatusChange = async (clientId: string, newStatus: ClientStatus) => {
    try {
      await updateClientMutation({
        id: clientId as any,
        estado: newStatus,
      })
      // Also call the parent callback for consistency
    onUpdateClient(clientId, { estado: newStatus })
    } catch (error) {
      console.error("Error updating client status:", error)
    }
  }

  const handlePriorityChange = async (clientId: string, newPriority: ClientPriority) => {
    try {
      await updateClientMutation({
        id: clientId as any,
        priority: newPriority,
      })
      // Also call the parent callback for consistency
      onUpdateClient(clientId, { priority: newPriority })
    } catch (error) {
      console.error("Error updating client priority:", error)
    }
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
        fecha: Date.now(),
        recommendation: analysis.recommendation || analysis,
        priority: analysis.priority || "Media",
      }

      onUpdateClient(client.id, {
        aiRecommendations: [newRecommendation, ...client.aiRecommendations],
      })

      setAnalysisClient(client)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al analizar cliente. Intenta nuevamente.")
    } finally {
      setLoadingAnalysis(null)
    }
  }

  const handleAutoCategorize = async (client: Client) => {
    setLoadingCategorize(client.id)
    toast.info("Analizando cliente", {
      description: "Actualizando estado automáticamente...",
      duration: 3000,
    })
    try {
      const response = await fetch("/api/ai/categorize-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client }),
      })

      if (!response.ok) throw new Error("Error en actualización de estado")

      const result = await response.json()
      
      // Show toast with justification
      if (result.category && result.justification) {
        const newStatus = result.category as ClientStatus;
        const currentStatus = client.estado;
        
        if (newStatus !== currentStatus) {
          // State changed
          toast.success(`Estado actualizado de ${currentStatus} a ${newStatus}`, {
            description: result.justification,
            duration: 5000,
          });
          
          // Update the client state
          onUpdateClient(client.id, { estado: newStatus });
        } else {
          // State unchanged
          toast.info(`Estado mantenido como ${currentStatus}`, {
            description: result.justification,
            duration: 4000,
          });
        }
      } else {
        // Fallback for old API response
        const category = result.category || result;
        onUpdateClient(client.id, { estado: category as ClientStatus });
        toast.success(`Estado actualizado a: ${category}`);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar estado del cliente", {
        description: "Intenta nuevamente en unos momentos",
        duration: 4000,
      });
    } finally {
      setLoadingCategorize(null)
    }
  }

  const handleQuickInteraction = async (client: Client) => {
    if (!interactionDescription.trim() || (!interactionType && !customType.trim())) return

    const selectedDate = interactionDate ? new Date(interactionDate) : new Date()

    if (interactionTime) {
      const selectedTime = interactionTime.split(":")
      selectedDate.setHours(Number.parseInt(selectedTime[0]), Number.parseInt(selectedTime[1]))
    }

    const finalType = showCustomType && customType.trim() ? customType.trim() : interactionType

    try {
      await addInteractionMutation({
        clientId: client.id as any, // Convex ID type
      descripcion: interactionDescription.trim(),
      tipo: finalType,
      })
    } catch (error) {
      console.error("Error adding interaction:", error)
      toast.error("Error al agregar interacción")
    }

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

  const handleOpenAIAnalysis = (client: Client) => {
    setSelectedClientForAnalysis(client)
    setIsAIAnalysisModalOpen(true)
  }

  const handleSaveAIAnalysis = async (clientId: string, analysis: string, priority?: ClientPriority) => {
    try {
      await addAIAnalysisMutation({
        clientId: clientId as any,
        analysis,
        priority,
      })
    } catch (error) {
      console.error("Error saving AI analysis:", error)
      throw error
    }
  }

  // Show loading state only if we have no data at all (neither SSR nor Convex)
  if (realTimeClients === undefined && clients.length === 0) {
    return (
      <div className="border rounded-lg p-12 text-center">
        <div className="text-muted-foreground">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg mb-2">Cargando clientes...</p>
        </div>
      </div>
    )
  }

  if (displayClients.length === 0) {
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
    <TooltipProvider>
      <div className="border rounded-lg">
        <Table>
          <TableHeader 
            className="border-b shadow-sm"
            style={{ 
              position: 'sticky', 
              top: 0, 
              zIndex: 50, 
              backgroundColor: 'white' 
            }}
          >
            <TableRow>
              <TableHead className="w-[200px] pl-6" style={{ backgroundColor: 'white' }}>Cliente</TableHead>
              <TableHead className="w-[150px] pl-6" style={{ backgroundColor: 'white' }}>Contacto</TableHead>
              <TableHead className="w-[120px] pl-6" style={{ backgroundColor: 'white' }}>Estado</TableHead>
              <TableHead className="w-[100px] pl-6" style={{ backgroundColor: 'white' }}>Prioridad</TableHead>
              <TableHead className="w-[150px] pl-6" style={{ backgroundColor: 'white' }}>Última Interacción</TableHead>
              <TableHead className="w-[300px] pl-6" style={{ backgroundColor: 'white' }}>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayClients.map((client) => {
          const daysAgo = getDaysAgo(client.ultimaInteraccion)

          return (
                <TableRow 
              key={client.id}
                  className="cursor-pointer hover:bg-gray-50"
              onClick={() => handleCardClick(client)}
            >
                  {/* Cliente */}
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-semibold text-gray-900">{client.nombre}</div>
                        {client.priority === "Alta" && (
                          <Badge className="bg-red-500 text-white hover:bg-red-600 text-xs mt-1">
                            ¡Atención requerida!
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Contacto */}
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      {client.telefono}
                    </div>
                  </TableCell>

                  {/* Estado */}
                  <TableCell className="pl-6">
                    <Select
                      value={client.estado}
                      onValueChange={(value) => handleStatusChange(client.id, value as ClientStatus)}
                    >
                      <SelectTrigger
                        className="w-[110px] h-8 flex justiy-between"
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
                  </TableCell>

                  {/* Prioridad */}
                  <TableCell className="pl-6">
                    <Select
                      value={client.priority}
                      onValueChange={(value) => handlePriorityChange(client.id, value as ClientPriority)}
                    >
                      <SelectTrigger
                        className="w-[115px] h-8 flex justify-between pr-2"
                        onClick={(e) => e.stopPropagation()}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <Badge className={getPriorityColor(client.priority)} variant="outline">
                          {getPriorityIcon(client.priority)}
                          <span className="ml-1">{client.priority}</span>
                        </Badge>
                      </SelectTrigger>
                      <SelectContent className="pr-2">
                        <SelectItem value="Alta">
                          <Badge
                            className="bg-red-100 text-red-800 border-red-200 text-xs px-2 py-0.5"
                            variant="outline"
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Alta
                          </Badge>
                        </SelectItem>
                        <SelectItem value="Media">
                          <Badge
                            className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs px-2 py-0.5"
                            variant="outline"
                          >
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Media
                          </Badge>
                        </SelectItem>
                        <SelectItem value="Baja">
                          <Badge
                            className="bg-gray-100 text-gray-800 border-gray-200 text-xs px-2 py-0.5"
                            variant="outline"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            Baja
                          </Badge>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>

                  {/* Última Interacción */}
                  <TableCell className="pl-6">
                    <div className="flex items-start gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">{formatDate(new Date(client.ultimaInteraccion))}</div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span
                              className={`text-xs font-medium cursor-help ${
                                daysAgo > 30 ? "text-red-600" : daysAgo > 7 ? "text-orange-600" : "text-green-600"
                              }`}
                            >
                              {daysAgo === 1 ? "1 día" : `${daysAgo} días`}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Días desde la última interacción con el cliente</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                </div>
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
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
                            className="text-green-600 border-green-200 hover:bg-green-50 h-8 px-2"
                      >
                            <MessageSquarePlus className="h-3 w-3 mr-1" />
                            <span className="hidden sm:inline">Interacción</span>
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

                  {/* AI Analysis Button */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenAIAnalysis(client)
                        }}
                        className="text-purple-600 border-purple-200 hover:bg-purple-50 h-8 px-2"
                      >
                        <Brain className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Analizar con IA</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Genera un análisis completo del cliente con IA</p>
                      <p className="text-xs text-muted-foreground">Incluye recomendaciones de prioridad</p>
                    </TooltipContent>
                  </Tooltip>

                      {/* More Actions Dropdown */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <MoreHorizontal className="h-4 w-4" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Más acciones</p>
                              </TooltipContent>
                            </Tooltip>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e: React.MouseEvent) => {
                    e.stopPropagation()
                    handleAutoCategorize(client)
                  }}
                  disabled={loadingCategorize === client.id}
                            className="cursor-pointer"
                >
                  {loadingCategorize === client.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Zap className="h-4 w-4 mr-2" />
                            )}
                            Actualizar estado automáticamente
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e: React.MouseEvent) => {
                    e.stopPropagation()
                    setEditClient(client)
                  }}
                            className="cursor-pointer"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar cliente
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
              </div>
                  </TableCell>
                </TableRow>
          )
        })}
          </TableBody>
        </Table>
      </div>

      {editClient && (
        <ClientFormDialog
          client={editClient}
          open={!!editClient}
          onSave={() => {}}
          onOpenChange={(open) => !open && setEditClient(null)}
          onUpdate={onUpdateClient}
        />
      )}

      {selectedClientForAnalysis && (
        <AIAnalysisModal
          client={selectedClientForAnalysis}
          open={isAIAnalysisModalOpen}
          onOpenChange={(open) => {
            setIsAIAnalysisModalOpen(open)
            if (!open) setSelectedClientForAnalysis(null)
          }}
          onUpdateClient={onUpdateClient}
          onSaveAnalysis={handleSaveAIAnalysis}
        />
      )}
    </TooltipProvider>
  )
}
