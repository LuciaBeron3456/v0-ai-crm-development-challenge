"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Phone, Calendar, Bot, AlertTriangle, TrendingUp, Clock } from "lucide-react"
import type { Client, ClientPriority } from "./client-dashboard"

interface ClientDetailDialogProps {
  client: Client
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateClient: (id: string, updates: Partial<Client>) => void
}

export function ClientDetailDialog({ client, open, onOpenChange, onUpdateClient }: ClientDetailDialogProps) {
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
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatDateShort = (date: Date) => {
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  const latestRecommendation =
    client.aiRecommendations && client.aiRecommendations.length > 0
      ? client.aiRecommendations.sort((a, b) => b.fecha.getTime() - a.fecha.getTime())[0]
      : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalle del Cliente</span>
            <Badge className={getPriorityColor(client.priority)} variant="outline">
              {getPriorityIcon(client.priority)}
              <span className="ml-1">{client.priority}</span>
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Nombre</Label>
              <p className="text-lg font-semibold">{client.nombre}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Teléfono</Label>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p>{client.telefono}</p>
              </div>
            </div>
          </div>

          {/* Interaction History */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Historial de Interacciones</h3>

            {client.interacciones && client.interacciones.length === 0 ? (
              <Card>
                <CardContent className="py-6">
                  <p className="text-center text-muted-foreground">
                    No hay interacciones registradas
                    <br />
                    <span className="text-sm">Agrega la primera interacción usando el botón de la tarjeta</span>
                  </p>
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="h-[300px] w-full">
                <div className="space-y-3 pr-4">
                  {(client.interacciones || [])
                    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
                    .map((interaction, index) => (
                      <Card key={interaction.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="py-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium">
                                  {index === 0 ? "Última Interacción" : "Interacción"}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                {formatDate(interaction.fecha)}
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed">{interaction.descripcion}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* AI Recommendation */}
          {latestRecommendation && (
            <>
              <Separator />
              <Card className="border-l-4 border-l-red-500 bg-red-50">
                <CardContent className="py-2 px-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium">IA:</span>
                      <Badge variant="outline" className="text-xs">
                        {latestRecommendation.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDateShort(latestRecommendation.fecha)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mt-1">{latestRecommendation.recommendation}</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
