"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Brain, Loader2, Save, AlertTriangle, TrendingUp, Clock } from "lucide-react"
import { toast } from "sonner"
import type { Client, ClientPriority, AIAnalysisModalProps } from "@/lib/types"

export function AIAnalysisModal({ 
  client, 
  open, 
  onOpenChange, 
  onUpdateClient,
  onSaveAnalysis 
}: AIAnalysisModalProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState("")
  const [selectedPriority, setSelectedPriority] = useState<ClientPriority>(client.priority)
  const [isSaving, setIsSaving] = useState(false)

  // Auto-analyze when modal opens
  useEffect(() => {
    if (open && !analysis && !isAnalyzing) {
      handleAnalyze()
    }
  }, [open])

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setAnalysis("")
      setIsAnalyzing(false)
      setIsSaving(false)
      setSelectedPriority(client.priority)
    }
  }, [open, client.priority])

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setAnalysis("")
    
    try {
      const response = await fetch("/api/ai/analyze-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client }),
      })

      if (!response.ok) throw new Error("Error en análisis")

      const result = await response.json()
      
      if (result.analysis) {
        setAnalysis(result.analysis)
        
        // Simple priority extraction
        const text = result.analysis.toLowerCase()
        if (text.includes('alta') || text.includes('urgente') || text.includes('crítico')) {
          setSelectedPriority("Alta")
        } else if (text.includes('baja') || text.includes('no urgente')) {
          setSelectedPriority("Baja")
        } else {
          setSelectedPriority("Media")
        }
      } else {
        throw new Error("No se recibió análisis válido")
      }
    } catch (error) {
      console.error("Error en análisis:", error)
      toast.error("Error al analizar cliente", {
        description: "Intenta nuevamente en unos momentos",
        duration: 4000,
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSave = async () => {
    if (!analysis.trim()) {
      toast.error("No hay análisis para guardar")
      return
    }

    setIsSaving(true)
    try {
      await onSaveAnalysis(client.id, analysis, selectedPriority)
      
      if (selectedPriority !== client.priority) {
        await onUpdateClient(client.id, { priority: selectedPriority })
        toast.success("Análisis guardado y prioridad actualizada", {
          description: `Prioridad cambiada a ${selectedPriority}`,
          duration: 4000,
        })
      } else {
        toast.success("Análisis guardado exitosamente", {
          description: "El resumen se ha guardado en la vista del cliente",
          duration: 4000,
        })
      }
      
      onOpenChange(false)
    } catch (error) {
      console.error("Error guardando análisis:", error)
      toast.error("Error al guardar análisis", {
        description: "Intenta nuevamente",
        duration: 4000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getPriorityColor = (priority: ClientPriority) => {
    switch (priority) {
      case "Alta":
        return "bg-red-100 text-red-800 border-red-200"
      case "Media":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Baja":
        return "bg-green-100 text-green-800 border-green-200"
      default:
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

  if (!client) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Análisis de IA - {client.nombre}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Info */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(client.nombre)}&background=6366f1&color=fff&size=48`}
              alt={client.nombre}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h3 className="font-semibold text-slate-900">{client.nombre}</h3>
              <p className="text-sm text-slate-600">{client.telefono}</p>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                {client.estado}
              </Badge>
            </div>
          </div>

          {/* Analysis Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-slate-900">Análisis de IA</h4>
              {isAnalyzing && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analizando...
                </div>
              )}
            </div>

            {analysis ? (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-line text-purple-800 leading-relaxed">
                    {analysis}
                  </div>
                </div>
              </div>
            ) : isAnalyzing ? (
              <div className="p-8 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
                <p className="text-slate-600">Generando análisis con IA...</p>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
                <p className="text-slate-600">El análisis se generará automáticamente</p>
              </div>
            )}
          </div>

          {/* Priority Selection - Only show after analysis is completed */}
          {analysis && !isAnalyzing && (
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900">Prioridad Recomendada</h4>
              <div className="flex gap-3">
                {(["Alta", "Media", "Baja"] as ClientPriority[]).map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => setSelectedPriority(priority)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                      selectedPriority === priority
                        ? "border-2 border-blue-500 bg-blue-50"
                        : "border border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <Badge className={getPriorityColor(priority)} variant="outline">
                      {getPriorityIcon(priority)}
                      <span className="ml-1">{priority}</span>
                    </Badge>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={handleSave}
              disabled={!analysis || isSaving}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}