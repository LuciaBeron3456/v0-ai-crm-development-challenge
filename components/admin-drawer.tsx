"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../convex/_generated/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Settings, Clock, Play, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface AdminDrawerProps {
  children: React.ReactNode
}

export function AdminDrawer({ children }: AdminDrawerProps) {
  const [checkFrequency, setCheckFrequency] = useState("24h")
  const [customDays, setCustomDays] = useState("30")
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)
  const [isUpdatingConfig, setIsUpdatingConfig] = useState(false)

  // Load automation configuration from database
  const automationConfigs = useQuery(api.clients.getAllAutomationConfigs)
  const setAutomationConfig = useMutation(api.clients.setAutomationConfig)

  // Update local state when config loads
  useEffect(() => {
    if (automationConfigs) {
      setCustomDays(String(automationConfigs.inactive_days_threshold || 30))
      setCheckFrequency(automationConfigs.check_frequency || "24h")
    }
  }, [automationConfigs])

  const frequencyOptions = [
    { value: "1m", label: "Cada 1 minuto", cron: "* * * * *" },
    { value: "5m", label: "Cada 5 minutos", cron: "*/5 * * * *" },
    { value: "10m", label: "Cada 10 minutos", cron: "*/10 * * * *" },
    { value: "1h", label: "Cada 1 hora", cron: "0 * * * *" },
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
        body: JSON.stringify({
          schedule: getCurrentCron(),
          inactiveDays: Number.parseInt(customDays),
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("¡Automatización configurada exitosamente!")
        setLastResult(result)
      } else {
        toast.error(`Error: ${result.error}`)
      }
    } catch (error) {
      toast.error("Error al configurar la automatización")
      console.error(error)
    } finally {
      setIsSettingUp(false)
    }
  }

  const runManualCheck = async () => {
    setIsRunning(true)
    try {
      const response = await fetch(`/api/cron/check-inactive-clients`)
      const result = await response.json()

      if (result.success) {
        toast.success(`Verificación completada: ${result.message}`)
        setLastResult(result)
      } else {
        toast.error(`Error: ${result.error}`)
      }
    } catch (error) {
      toast.error("Error en la verificación")
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
        value: Number(customDays),
        description: "Number of days after which a client is considered inactive",
      })

      await setAutomationConfig({
        key: "check_frequency",
        value: checkFrequency,
        description: "How often to check for inactive clients",
      })

      toast.success("Configuración actualizada exitosamente!")
    } catch (error) {
      toast.error("Error al actualizar la configuración")
      console.error(error)
    } finally {
      setIsUpdatingConfig(false)
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto border-none">
        <SheetHeader className="pb-0">
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración de Automatización
          </SheetTitle>
          <SheetDescription className="mb-2">Configuración y automatización del sistema</SheetDescription>
        </SheetHeader>

        <div className="space-y-2">
          <Card className="pt-0 border-none">
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Días para considerar cliente inactivo</Label>
                  <Input
                    type="number"
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    min="1"
                    max="365"
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    Clientes sin interacciones por más de {customDays} días serán marcados como inactivos
                  </p>
                  <Button 
                    onClick={updateAutomationConfig} 
                    disabled={isUpdatingConfig}
                    size="sm"
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
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600">
                    Expresión cron: {getCurrentCron()}
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Configuración actual:</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Revisar cada {frequencyOptions.find((opt) => opt.value === checkFrequency)?.label.toLowerCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Marcar como inactivos después de {customDays} días sin interacción
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
                  Ejecuta una revisión inmediata con la configuración actual.
                </p>
                <Button
                  onClick={runManualCheck}
                  disabled={isRunning}
                  variant="outline"
                  className="w-full bg-transparent"
                >
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
                  <strong>Revisión automática:</strong> El sistema revisa todos tus clientes según la frecuencia que
                  elijas.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">
                  2
                </div>
                <div>
                  <strong>Detecta inactividad:</strong> Identifica clientes que no han tenido interacciones en los días
                  configurados.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold mt-0.5">
                  3
                </div>
                <div>
                  <strong>Actualiza automáticamente:</strong> Cambia el estado de esos clientes a "Inactivo" para que
                  puedas priorizarlos.
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
      </SheetContent>
    </Sheet>
  )
}
