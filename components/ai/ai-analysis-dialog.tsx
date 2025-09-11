"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, Brain, TrendingUp, AlertCircle } from "lucide-react"
import type { Client, AIAnalysisDialogProps } from "@/lib/types"

export function AIAnalysisDialog({ client, open, onOpenChange }: AIAnalysisDialogProps) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            Análisis IA - {client.nombre}
            <Badge className={getStatusColor(client.estado)}>{client.estado}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Brain className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                <div className="space-y-2">
                  <h3 className="font-semibold text-blue-900">Análisis Inteligente</h3>
                  <div className="text-sm text-blue-800 whitespace-pre-wrap">
                    {client.aiAnalysis || "Análisis no disponible"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <h4 className="font-medium">Métricas del Cliente</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Interacciones:</span>
                    <span className="font-medium">{client.interacciones.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Días desde contacto:</span>
                    <span className="font-medium">
                      {Math.ceil((Date.now() - new Date(client.ultimaInteraccion).getTime()) / (1000 * 60 * 60 * 24))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado actual:</span>
                    <Badge className={getStatusColor(client.estado)} variant="outline">
                      {client.estado}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <h4 className="font-medium">Recomendaciones</h4>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Las recomendaciones específicas están incluidas en el análisis IA de arriba.</p>
                  <p className="mt-2">Considera las acciones sugeridas para optimizar la relación con este cliente.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
