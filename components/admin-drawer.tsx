"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Settings, Clock, Play, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"

interface AdminDrawerProps {
  children: React.ReactNode
}

export function AdminDrawer({ children }: AdminDrawerProps) {
  const [selectedSchedule, setSelectedSchedule] = useState("daily")
  const [customDays, setCustomDays] = useState("7")
  const [customHour, setCustomHour] = useState("9")
  const [customMinute, setCustomMinute] = useState("0")
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)

  const scheduleOptions = [
    { value: "daily", label: "Una vez al día", cron: `0 ${customHour} * * *` },
    {
      value: "twice-daily",
      label: "Dos veces al día",
      cron: `0 ${customHour},${Number.parseInt(customHour) + 9} * * *`,
    },
    { value: "weekly", label: "Una vez por semana", cron: `0 ${customHour} * * 1` },
    { value: "every-6h", label: "Cada 6 horas", cron: "0 */6 * * *" },
    { value: "every-12h", label: "Cada 12 horas", cron: "0 */12 * * *" },
    { value: "custom", label: "Personalizado", cron: `${customMinute} ${customHour} * * *` },
  ]

  const getCurrentCron = () => {
    const option = scheduleOptions.find((opt) => opt.value === selectedSchedule)
    if (selectedSchedule === "custom") {
      return `${customMinute} ${customHour} * * *`
    }
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
      const response = await fetch(`/api/cron/check-inactive-clients?days=${customDays}`)
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
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Administración CRM
          </SheetTitle>
          <SheetDescription className="mb-2">Configuración y automatización del sistema</SheetDescription>
        </SheetHeader>

        <div className="space-y-2">
          <Card className="pt-0">
            <CardHeader>
              <CardTitle className="text-lg">Configuración de Automatización</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
                </div>

                <div className="space-y-2">
                  <Label>Frecuencia de revisión</Label>
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
                </div>

                {(selectedSchedule === "custom" || selectedSchedule === "daily" || selectedSchedule === "weekly") && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>Hora</Label>
                      <Select value={customHour} onValueChange={setCustomHour}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => (
                            <SelectItem key={i} value={i.toString()}>
                              {i.toString().padStart(2, "0")}:00
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedSchedule === "custom" && (
                      <div className="space-y-2">
                        <Label>Minuto</Label>
                        <Select value={customMinute} onValueChange={setCustomMinute}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[0, 15, 30, 45].map((minute) => (
                              <SelectItem key={minute} value={minute.toString()}>
                                :{minute.toString().padStart(2, "0")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Configuración actual:</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Revisar cada {scheduleOptions.find((opt) => opt.value === selectedSchedule)?.label.toLowerCase()}
                    {(selectedSchedule === "custom" || selectedSchedule === "daily" || selectedSchedule === "weekly") &&
                      ` a las ${customHour.padStart(2, "0")}:${customMinute.padStart(2, "0")}`}
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
