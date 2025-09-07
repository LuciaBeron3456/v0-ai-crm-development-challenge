"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter, Users, UserCheck, UserX, Clock, ArrowUp, ArrowDown, Settings } from "lucide-react"
import { ClientList } from "./client-list"
import { AddClientDialog } from "./add-client-dialog"
import { Badge } from "@/components/ui/badge"

export type ClientStatus = "Activo" | "Inactivo" | "Potencial"
export type ClientPriority = "Alta" | "Media" | "Baja"

export interface AIRecommendation {
  id: string
  fecha: Date
  recommendation: string
  priority: string
}

export interface Client {
  id: string
  nombre: string
  telefono: string
  estado: ClientStatus
  ultimaInteraccion: Date
  interacciones: Interaction[]
  priority: ClientPriority
  aiRecommendations: AIRecommendation[]
}

export interface Interaction {
  id: string
  fecha: Date
  descripcion: string
}

const mockClients: Client[] = [
  {
    id: "1",
    nombre: "Juan Pérez",
    telefono: "+54 11 1234-5678",
    estado: "Activo",
    ultimaInteraccion: new Date("2024-12-01"),
    priority: "Alta",
    aiRecommendations: [
      {
        id: "1",
        fecha: new Date("2024-12-01"),
        recommendation: "Cliente muy activo. Mantener comunicación regular y ofrecer nuevos servicios.",
        priority: "Alta",
      },
    ],
    interacciones: [
      { id: "1", fecha: new Date("2024-12-01"), descripcion: "Llamada de seguimiento" },
      { id: "2", fecha: new Date("2024-11-15"), descripcion: "Reunión inicial" },
    ],
  },
  {
    id: "2",
    nombre: "María García",
    telefono: "+54 11 9876-5432",
    estado: "Potencial",
    ultimaInteraccion: new Date("2024-11-28"),
    priority: "Media",
    aiRecommendations: [
      {
        id: "2",
        fecha: new Date("2024-11-28"),
        recommendation: "Cliente potencial con buen perfil. Programar seguimiento en 1 semana.",
        priority: "Media",
      },
    ],
    interacciones: [{ id: "3", fecha: new Date("2024-11-28"), descripcion: "Primer contacto" }],
  },
  {
    id: "3",
    nombre: "Carlos López",
    telefono: "+54 11 5555-1234",
    estado: "Inactivo",
    ultimaInteraccion: new Date("2024-10-15"),
    priority: "Baja",
    aiRecommendations: [
      {
        id: "3",
        fecha: new Date("2024-10-15"),
        recommendation: "Cliente inactivo por más de 30 días. Considerar campaña de reactivación.",
        priority: "Baja",
      },
    ],
    interacciones: [{ id: "4", fecha: new Date("2024-10-15"), descripcion: "Última comunicación" }],
  },
]

export function ClientDashboard() {
  const [clients, setClients] = useState<Client[]>(mockClients)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "Todos">("Todos")
  const [sortBy, setSortBy] = useState<"nombre" | "ultimaInteraccion" | "priority">("ultimaInteraccion")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredClients = clients
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
        comparison = b.ultimaInteraccion.getTime() - a.ultimaInteraccion.getTime()
      } else if (sortBy === "priority") {
        const priorityOrder = { Alta: 3, Media: 2, Baja: 1 }
        comparison = priorityOrder[b.priority] - priorityOrder[a.priority]
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

  const stats = {
    total: clients.length,
    activos: clients.filter((c) => c.estado === "Activo").length,
    potenciales: clients.filter((c) => c.estado === "Potencial").length,
    inactivos: clients.filter((c) => c.estado === "Inactivo").length,
  }

  const addClient = (newClient: Omit<Client, "id" | "interacciones" | "priority" | "aiRecommendations">) => {
    const daysSinceInteraction = Math.ceil(
      (new Date().getTime() - newClient.ultimaInteraccion.getTime()) / (1000 * 60 * 60 * 24),
    )
    const priority: ClientPriority = daysSinceInteraction > 30 ? "Baja" : daysSinceInteraction > 7 ? "Media" : "Alta"

    const client: Client = {
      ...newClient,
      id: Date.now().toString(),
      interacciones: [],
      priority,
      aiRecommendations: [],
    }
    setClients((prev) => [...prev, client])
  }

  const handleSortChange = (newSortBy: "nombre" | "ultimaInteraccion" | "priority") => {
    if (sortBy === newSortBy) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortBy(newSortBy)
      setSortDirection("desc")
    }
  }

  const updateClientPriority = (clientId: string) => {
    setClients((prev) =>
      prev.map((client) => {
        if (client.id === clientId) {
          const daysSinceInteraction = Math.ceil(
            (new Date().getTime() - client.ultimaInteraccion.getTime()) / (1000 * 60 * 60 * 24),
          )
          const newPriority: ClientPriority =
            daysSinceInteraction > 30 ? "Baja" : daysSinceInteraction > 7 ? "Media" : "Alta"
          return { ...client, priority: newPriority }
        }
        return client
      }),
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
            <SelectTrigger className="w-[180px]">
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
              {sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
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
        clients={filteredClients}
        onUpdateClient={(id, updates) => {
          setClients((prev) => prev.map((client) => (client.id === id ? { ...client, ...updates } : client)))
          if (updates.ultimaInteraccion) {
            updateClientPriority(id)
          }
        }}
      />

      {/* Add Client Dialog */}
      <AddClientDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} onAddClient={addClient} />
    </div>
  )
}
