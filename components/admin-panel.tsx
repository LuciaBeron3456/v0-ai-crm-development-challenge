"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Clock, Play, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { SeedDataPanel } from "./seed-data-panel"

export function AdminPanel() {
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)
  const [inactiveDaysThreshold, setInactiveDaysThreshold] = useState(30)
  const [checkFrequency, setCheckFrequency] = useState("24h")
  const [automationEnabled, setAutomationEnabled] = useState(true)
  const [isUpdatingConfig, setIsUpdatingConfig] = useState(false)

  // Load automation configuration from database
  const automationConfigs = useQuery(api.clients.getAllAutomationConfigs)
  const setAutomationConfig = useMutation(api.clients.setAutomationConfig)

  // Update local state when config loads
  useEffect(() => {
    if (automationConfigs) {
      setInactiveDaysThreshold(automationConfigs.inactive_days_threshold || 30)
      setCheckFrequency(automationConfigs.check_frequency || "24h")
      setAutomationEnabled(automationConfigs.automation_enabled !== false)
    }
  }, [automationConfigs])

  const frequencyOptions = [
    { value: "1m", label: "Cada 1 minuto", cron: "* * * * *" },
    { value: "2m", label: "Cada 2 minutos", cron: "*/2 * * * *" },
    { value: "5m", label: "Cada 5 minutos", cron: "*/5 * * * *" },
    { value: "1h", label: "Cada 1 hora", cron: "0 * * * *" },
    { value: "6h", label: "Cada 6 horas", cron: "0 */6 * * *" },
    { value: "24h", label: "Cada 24 horas", cron: "0 9 * * *" },
  ]

  const getCurrentCron = () => {
    const option = frequencyOptions.find(opt => opt.value === checkFrequency)
    return option?.cron || "0 9 * * *"
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
      const response = await fetch("/api/cron/check-inactive-clients")
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

  const updateAutomationConfig = async () => {
    setIsUpdatingConfig(true)
    try {
      await setAutomationConfig({
        key: "inactive_days_threshold",
        value: inactiveDaysThreshold,
        description: "Number of days after which a client is considered inactive",
      })

      await setAutomationConfig({
        key: "check_frequency",
        value: checkFrequency,
        description: "How often to check for inactive clients",
      })
      
      await setAutomationConfig({
        key: "automation_enabled",
        value: automationEnabled,
        description: "Whether automation is enabled",
      })

      // Update Qstash schedule with new configuration
      if (automationEnabled) {
        const response = await fetch("/api/admin/setup-qstash", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ schedule: getCurrentCron() }),
        })

        const result = await response.json()
        if (!result.success) {
          console.warn("Warning: Could not update Qstash schedule:", result.error)
        }
      }

      alert("Configuración actualizada exitosamente!")
    } catch (error) {
      alert("Error al actualizar la configuración")
      console.error(error)
    } finally {
      setIsUpdatingConfig(false)
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
            <h3 className="font-semibold">Configuración de Automatización</h3>
            {/* Updated UI - Simple frequency select */}
            
            <div className="space-y-2">
              <Label>Días para considerar inactivo</Label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={inactiveDaysThreshold}
                  onChange={(e) => setInactiveDaysThreshold(Number(e.target.value))}
                  className="w-20 px-2 py-1 border rounded"
                  min="1"
                  max="365"
                />
                <span className="text-sm text-muted-foreground">días</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Frecuencia de revisión</Label>
              <Select value={checkFrequency} onValueChange={setCheckFrequency}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la frecuencia" />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <p className="text-xs text-slate-600">
                  Expresión cron: {getCurrentCron()}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Automatización</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={automationEnabled}
                  onChange={(e) => setAutomationEnabled(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">
                  {automationEnabled ? "Habilitada" : "Deshabilitada"}
                </span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              El sistema revisará automáticamente según la frecuencia seleccionada y marcará como inactivos a los clientes sin interacciones por más de {inactiveDaysThreshold} días.
            </p>
          </div>

            <Button 
              onClick={updateAutomationConfig} 
              disabled={isUpdatingConfig}
              className="w-full"
            >
              {isUpdatingConfig ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Guardar Configuración
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
              <strong>Detecta inactividad:</strong> Identifica clientes que no han tenido interacciones en los últimos {inactiveDaysThreshold} días.
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

      {/* Panel de Gestión de Datos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Gestión de Datos de Prueba
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SeedDataPanel />
        </CardContent>
      </Card>
    </div>
  )
}
