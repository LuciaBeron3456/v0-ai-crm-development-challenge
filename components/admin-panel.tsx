"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Clock, Play, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"

export function AdminPanel() {
  const [selectedSchedule, setSelectedSchedule] = useState("daily")
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)

  const scheduleOptions = [
    { value: "daily", label: "Una vez al día (9:00 AM)", cron: "0 9 * * *" },
    { value: "twice-daily", label: "Dos veces al día (9 AM y 6 PM)", cron: "0 9,18 * * *" },
    { value: "weekly", label: "Una vez por semana (Lunes 9 AM)", cron: "0 9 * * 1" },
    { value: "every-6h", label: "Cada 6 horas", cron: "0 */6 * * *" },
  ]

  const getCurrentCron = () => {
    return scheduleOptions.find((opt) => opt.value === selectedSchedule)?.cron || "0 9 * * *"
  }

  const setupQstash = async () => {
    setIsSettingUp(true)
    try {
      const response = await fetch("/api/admin/setup-qstash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule: getCurrentCron() }),
      })

      const result = await response.json()

      if (result.success) {
        alert("¡Automatización configurada exitosamente!")
        setLastResult(result)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      alert("Error al configurar la automatización")
      console.error(error)
    } finally {
      setIsSettingUp(false)
    }
  }

  const runManualCheck = async () => {
    setIsRunning(true)
    try {
      const response = await fetch("/api/cron/check-inactive-clients?days=7")
      const result = await response.json()

      if (result.success) {
        alert(`Verificación completada: ${result.message}`)
        setLastResult(result)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      alert("Error en la verificación")
      console.error(error)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="space-y-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración de Automatización
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">¿Con qué frecuencia revisar clientes inactivos?</h3>
            <div className="space-y-2">
              <Label htmlFor="schedule">Frecuencia de revisión</Label>
              <Select value={selectedSchedule} onValueChange={setSelectedSchedule}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la frecuencia" />
                </SelectTrigger>
                <SelectContent>
                  {scheduleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                El sistema revisará automáticamente y marcará como inactivos a los clientes sin interacciones por más de
                7 días.
              </p>
            </div>

            <Button onClick={setupQstash} disabled={isSettingUp} className="w-full">
              {isSettingUp ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Configurando...
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Activar Automatización
                </>
              )}
            </Button>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-semibold">Probar ahora</h3>
            <p className="text-sm text-muted-foreground">
              Ejecuta una revisión inmediata para ver cómo funciona antes de activar la automatización.
            </p>
            <Button onClick={runManualCheck} disabled={isRunning} variant="outline" className="w-full bg-transparent">
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Revisando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Revisar Clientes Ahora
                </>
              )}
            </Button>
          </div>

          {/* Last Result */}
          {lastResult && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  {lastResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  Último Resultado
                </h3>
                <Card className={lastResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  <CardContent className="pt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Estado:</span>
                        <Badge variant={lastResult.success ? "default" : "destructive"}>
                          {lastResult.success ? "Exitoso" : "Error"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Resultado:</span>
                        <span className="font-medium">{lastResult.message || lastResult.error}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">¿Cómo funciona?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">
              1
            </div>
            <div>
              <strong>Revisión automática:</strong> El sistema revisa todos tus clientes según la frecuencia que elijas.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">
              2
            </div>
            <div>
              <strong>Detecta inactividad:</strong> Identifica clientes que no han tenido interacciones en los últimos 7
              días.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">
              3
            </div>
            <div>
              <strong>Actualiza automáticamente:</strong> Cambia el estado de esos clientes a "Inactivo" para que puedas
              priorizarlos.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">
              4
            </div>
            <div>
              <strong>Te mantiene informado:</strong> Puedes ver el resultado de cada revisión aquí mismo.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
