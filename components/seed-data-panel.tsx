"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, Trash2, Seedling, AlertTriangle } from "lucide-react"

export function SeedDataPanel() {
  const [isSeeding, setIsSeeding] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)

  const seedData = async () => {
    setIsSeeding(true)
    try {
      const response = await fetch("/api/seed-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed" }),
      })

      const result = await response.json()
      setLastResult(result)
      alert("✅ Datos de prueba creados exitosamente!")
    } catch (error) {
      console.error("Error:", error)
      alert("❌ Error creando datos de prueba")
    } finally {
      setIsSeeding(false)
    }
  }

  const clearData = async () => {
    if (!confirm("⚠️ ¿Estás seguro de que quieres eliminar TODOS los datos? Esta acción no se puede deshacer.")) {
      return
    }

    setIsClearing(true)
    try {
      const response = await fetch("/api/seed-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear" }),
      })

      const result = await response.json()
      setLastResult(result)
      alert("✅ Todos los datos han sido eliminados")
    } catch (error) {
      console.error("Error:", error)
      alert("❌ Error eliminando datos")
    } finally {
      setIsClearing(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Gestión de Datos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button
            onClick={seedData}
            disabled={isSeeding}
            className="w-full"
            variant="outline"
          >
            {isSeeding ? (
              <>
                <Seedling className="h-4 w-4 mr-2 animate-spin" />
                Creando datos...
              </>
            ) : (
              <>
                <Seedling className="h-4 w-4 mr-2" />
                Crear Datos de Prueba
              </>
            )}
          </Button>
          
          <p className="text-xs text-gray-600">
            Crea 8 clientes de ejemplo con diferentes estados y prioridades, 
            incluyendo interacciones y recomendaciones de IA.
          </p>
        </div>

        <div className="space-y-2">
          <Button
            onClick={clearData}
            disabled={isClearing}
            className="w-full"
            variant="destructive"
          >
            {isClearing ? (
              <>
                <Trash2 className="h-4 w-4 mr-2 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar Todos los Datos
              </>
            )}
          </Button>
          
          <p className="text-xs text-red-600 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            ⚠️ Esta acción elimina TODOS los clientes e interacciones
          </p>
        </div>

        {lastResult && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <h4 className="font-medium text-sm mb-2">Última operación:</h4>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>Clientes:</span>
                <Badge variant="outline">
                  {lastResult.clientsCreated || lastResult.clientsDeleted || 0}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Interacciones:</span>
                <Badge variant="outline">
                  {lastResult.interactionsCreated || lastResult.interactionsDeleted || 0}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

