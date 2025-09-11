/**
 * Shared TypeScript types for the CRM application
 * Centralized type definitions to avoid duplication and ensure consistency
 */

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

export interface Interaction {
  id: string
  fecha: number // timestamp
  descripcion: string
  tipo?: string
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

// Component prop types
export interface ClientDashboardProps {
  initialClients?: Client[]
  initialTotalCount?: number
  initialAllClients?: Client[]
}

export interface ClientListProps {
  clients: Client[] // Keep for backward compatibility but won't be used
  onUpdateClient: (id: string, updates: Partial<Client>) => void
  currentPage?: number
  itemsPerPage?: number
  searchTerm?: string
  statusFilter?: string
  sortBy?: string
  sortDirection?: string
  onTotalCountChange?: (count: number) => void
}

export interface AddClientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddClient: (client: Omit<Client, 'id' | 'interacciones' | 'aiRecommendations' | 'aiAnalyses'>) => void
}

export interface EditClientDialogProps {
  client: Client
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateClient: (id: string, updates: Partial<Client>) => void
}

export interface AIAnalysisModalProps {
  client: Client
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateClient: (id: string, updates: Partial<Client>) => void
  onSaveAnalysis: (clientId: string, analysis: string, priority?: ClientPriority) => void
}

export interface AIAnalysisDialogProps {
  client: Client & { aiAnalysis?: string }
  open: boolean
  onOpenChange: (open: boolean) => void
}

export interface ClientDetailDialogProps {
  client: Client
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateClient: (id: string, updates: Partial<Client>) => void
}

export interface ClientDetailClientProps {
  client: Client
}

export interface ClientDetailPageProps {
  params: {
    id: string
  }
}

export interface AdminDrawerProps {
  children: React.ReactNode
}

export interface ClientListSkeletonProps {
  rows?: number
}

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  itemsPerPage: number
  onItemsPerPageChange: (itemsPerPage: number) => void
  totalItems: number
}

