"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../convex/_generated/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter, Users, UserCheck, UserX, Clock, ArrowUp, ArrowDown, Settings } from "lucide-react"
import { ClientList } from "./client-list"
import { ClientListSkeleton } from "./client-list-skeleton"
import { AddClientDialog } from "./add-client-dialog"
import { Pagination } from "./pagination"
import { Badge } from "@/components/ui/badge"

export type ClientStatus = "Activo" | "Inactivo" | "Potencial"
export type ClientPriority = "Alta" | "Media" | "Baja"

export interface AIRecommendation {
  id: string
  fecha: number // timestamp
  recommendation: string
  priority: string
}

export interface AIAnalysis {
  id: string
  fecha: number // timestamp
  analysis: string
  priority?: string // priority at time of analysis
}

export interface Client {
  id: string
  nombre: string
  telefono: string
  estado: ClientStatus
  ultimaInteraccion: number // timestamp
  interacciones: Interaction[]
  priority: ClientPriority
  aiRecommendations: AIRecommendation[]
  aiAnalyses: AIAnalysis[]
}

export interface Interaction {
  id: string
  fecha: number // timestamp
  descripcion: string
  tipo?: string
}

interface ClientDashboardProps {
  initialClients?: Client[]
  initialTotalCount?: number
  initialAllClients?: Client[]
}

export function ClientDashboard({ initialClients = [], initialTotalCount = 0, initialAllClients = [] }: ClientDashboardProps) {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [allClients, setAllClients] = useState<Client[]>(initialAllClients)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [totalCount, setTotalCount] = useState(initialTotalCount)
  const [filteredTotalCount, setFilteredTotalCount] = useState(0)
  
  // Local state for filters and search
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "Todos">("Todos")
  const [sortBy, setSortBy] = useState<"nombre" | "ultimaInteraccion" | "priority">("ultimaInteraccion")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [itemsPerPage, setItemsPerPage] = useState(20)
  
  const addClientMutation = useMutation(api.clients.addClient)
  const updateClientMutation = useMutation(api.clients.updateClient)
  const addInteractionMutation = useMutation(api.clients.addInteraction)
  
  // Use Convex query for real-time updates - this is the source of truth
  const realTimeClients = useQuery(api.clients.getClients)
  const totalCountQuery = useQuery(api.clients.getClientsCount)
  
  // Update total count when Convex query returns (for real-time updates)
  useEffect(() => {
    if (totalCountQuery !== undefined) {
      setTotalCount(totalCountQuery)
    }
  }, [totalCountQuery])
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  // Load all clients once on mount
  useEffect(() => {
    if (initialClients.length > 0) {
      setClients(initialClients)
    }
  }, [initialClients])

  // Reset to page 1 when items per page or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage, searchTerm, statusFilter, sortBy, sortDirection])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Use real-time data when available, fallback to SSR initial data
  const currentAllClients = realTimeClients || allClients
  const currentClients = realTimeClients || clients

  // Filter and sort all clients (for stats and fallback)
  const allFilteredClients = (currentAllClients || [])
    .filter((client) => {
      const matchesSearch =
        client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || client.telefono.includes(searchTerm)
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

  // Use the filtered count from ClientList for pagination
  const filteredTotalPages = Math.ceil(filteredTotalCount / itemsPerPage)

  const stats = {
    total: (currentAllClients || []).length,
    activos: (currentAllClients || []).filter((c) => c.estado === "Activo").length,
    potenciales: (currentAllClients || []).filter((c) => c.estado === "Potencial").length,
    inactivos: (currentAllClients || []).filter((c) => c.estado === "Inactivo").length,
  }

  const addClient = async (newClient: Omit<Client, "id" | "interacciones" | "priority" | "aiRecommendations">) => {
    try {
      await addClientMutation({
        nombre: newClient.nombre,
        telefono: newClient.telefono,
        estado: newClient.estado,
      })
    } catch (error) {
      console.error("Error adding client:", error)
      alert("Error al agregar cliente")
    }
  }

  const handleSortChange = (newSortBy: "nombre" | "ultimaInteraccion" | "priority") => {
    if (sortBy === newSortBy) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(newSortBy)
      setSortDirection("desc")
    }
  }

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      await updateClientMutation({
        id: id as any, // Convex ID type
        ...updates,
        ultimaInteraccion: updates.ultimaInteraccion,
      })
    } catch (error) {
      console.error("Error updating client:", error)
      alert("Error al actualizar cliente")
    }
  }

  // Show loading state only if we're loading more pages and have no clients
  if (isLoading && (!currentClients || currentClients.length === 0)) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando clientes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potenciales</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.potenciales}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactivos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ClientStatus | "Todos")}>
            <SelectTrigger className="w-[210px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos los estados</SelectItem>
              <SelectItem value="Activo">
                <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
                  Activo
                </Badge>
              </SelectItem>
              <SelectItem value="Potencial">
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200" variant="outline">
                  Potencial
                </Badge>
              </SelectItem>
              <SelectItem value="Inactivo">
                <Badge className="bg-red-100 text-red-800 border-red-200" variant="outline">
                  Inactivo
                </Badge>
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ultimaInteraccion">Última interacción</SelectItem>
                <SelectItem value="nombre">Nombre</SelectItem>
                <SelectItem value="priority">Prioridad</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
              className="px-3"
            >
              {sortDirection === "asc" ? (
                <>
                  <ArrowUp className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Ascendente</span>
                </>
              ) : (
                <>
                  <ArrowDown className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Descendente</span>
                </>
              )}
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Cliente
          </Button>
        </div>
      </div>


      {/* Client List */}
      <ClientList
        clients={currentClients} // Pass real-time data as primary source
        onUpdateClient={updateClient}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onTotalCountChange={setFilteredTotalCount}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={Math.max(filteredTotalPages, 1)}
        onPageChange={handlePageChange}
        isLoading={false}
        hasNextPage={currentPage < filteredTotalPages}
        hasPrevPage={currentPage > 1}
        totalItems={filteredTotalCount}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {/* Add Client Dialog */}
      <AddClientDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onAddClient={addClient} />
    </div>
  )
}
