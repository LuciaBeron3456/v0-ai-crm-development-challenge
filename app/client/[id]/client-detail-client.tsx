"use client"

import { useState } from "react";
import { ArrowLeft, Phone, Clock, Calendar, Check, X, Edit2, RefreshCw, Brain, Loader2, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import type { Client, ClientPriority, ClientStatus, ClientDetailClientProps } from "@/lib/types";


export function ClientDetailClient({ client }: ClientDetailClientProps) {
  const router = useRouter();
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [isEditingPriority, setIsEditingPriority] = useState(false);
  
  const [tempName, setTempName] = useState("");
  const [tempPhone, setTempPhone] = useState("");
  const [tempStatus, setTempStatus] = useState<ClientStatus>("Activo");
  const [tempPriority, setTempPriority] = useState<ClientPriority>("Media");
  
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  
  // Interaction state
  const [isAddInteractionOpen, setIsAddInteractionOpen] = useState(false);
  const [interactionDescription, setInteractionDescription] = useState("");
  const [interactionType, setInteractionType] = useState("");
  const [interactionDate, setInteractionDate] = useState("");
  const [interactionTime, setInteractionTime] = useState("");
  const [customType, setCustomType] = useState("");
  const [showCustomType, setShowCustomType] = useState(false);

  // Get real-time client data
  const realTimeClients = useQuery(api.clients.getClients);
  const currentClient = realTimeClients?.find(c => c.id === client?.id) || client;
  
  // Mutations
  const addInteractionMutation = useMutation(api.clients.addInteraction);
  const updateClientMutation = useMutation(api.clients.updateClient);
  
  // Default interaction types
  const defaultInteractionTypes = [
    { name: "Llamada", color: "#10b981" },
    { name: "Reunión", color: "#3b82f6" },
    { name: "Email", color: "#8b5cf6" },
    { name: "WhatsApp", color: "#059669" },
    { name: "Visita", color: "#f59e0b" },
  ];

  // Initialize temp values when client data is available
  useState(() => {
    if (currentClient) {
      setTempName(currentClient.nombre);
      setTempPhone(currentClient.telefono);
      setTempStatus(currentClient.estado);
    }
  });

  const getTypeColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'llamada':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'email':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reunión virtual':
      case 'reunión':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'whatsapp':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'activo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactivo':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'potencial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: ClientPriority) => {
    switch (priority.toLowerCase()) {
      case 'alta':
        return 'bg-red-100 text-red-800';
      case 'media':
        return 'bg-yellow-100 text-yellow-800';
      case 'baja':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatDateShort = (timestamp: number) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const handleNameSave = async () => {
    if (!currentClient || tempName.trim() === currentClient.nombre) {
      setIsEditingName(false);
      return;
    }

    try {
      await updateClientMutation({
        id: currentClient.id as any,
        nombre: tempName.trim()
      });
      setIsEditingName(false);
      toast.success("Nombre actualizado exitosamente");
    } catch (error) {
      console.error("Error updating name:", error);
      toast.error("Error al actualizar el nombre");
      setTempName(currentClient.nombre); // Reset to original value
    }
  };

  const handleNameCancel = () => {
    if (currentClient) {
      setTempName(currentClient.nombre);
    }
    setIsEditingName(false);
  };

  const handlePhoneSave = async () => {
    if (!currentClient || tempPhone.trim() === currentClient.telefono) {
      setIsEditingPhone(false);
      return;
    }

    try {
      await updateClientMutation({
        id: currentClient.id as any,
        telefono: tempPhone.trim()
      });
      setIsEditingPhone(false);
      toast.success("Teléfono actualizado exitosamente");
    } catch (error) {
      console.error("Error updating phone:", error);
      toast.error("Error al actualizar el teléfono");
      setTempPhone(currentClient.telefono); // Reset to original value
    }
  };

  const handlePhoneCancel = () => {
    if (currentClient) {
      setTempPhone(currentClient.telefono);
    }
    setIsEditingPhone(false);
  };

  const handleStatusSave = async () => {
    if (!currentClient || tempStatus === currentClient.estado) {
      setIsEditingStatus(false);
      return;
    }

    try {
      await updateClientMutation({
        id: currentClient.id as any,
        estado: tempStatus
      });
      setIsEditingStatus(false);
      toast.success(`Estado actualizado a ${tempStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error al actualizar el estado");
      setTempStatus(currentClient.estado); // Reset to original value
    }
  };

  const handleStatusCancel = () => {
    if (currentClient) {
      setTempStatus(currentClient.estado);
    }
    setIsEditingStatus(false);
  };

  const handlePrioritySave = async () => {
    if (!currentClient || tempPriority === currentClient.priority) {
      setIsEditingPriority(false);
      return;
    }

    try {
      await updateClientMutation({
        id: currentClient.id as any,
        priority: tempPriority
      });
      setIsEditingPriority(false);
      toast.success(`Prioridad actualizada a ${tempPriority}`);
    } catch (error) {
      console.error("Error updating priority:", error);
      toast.error("Error al actualizar la prioridad");
      setTempPriority(currentClient.priority); // Reset to original value
    }
  };

  const handlePriorityCancel = () => {
    if (currentClient) {
      setTempPriority(currentClient.priority);
    }
    setIsEditingPriority(false);
  };

  const handleAutoUpdateStatus = async () => {
    if (!currentClient) return;
    
    setIsUpdatingStatus(true);
    try {
      const response = await fetch("/api/ai/categorize-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client: currentClient }),
      });

      if (!response.ok) throw new Error("Error en actualización de estado");

      const result = await response.json();
      console.log("Estado actualizado:", result);
      
      // Show toast with justification
      if (result.category && result.justification) {
        const newStatus = result.category as ClientStatus;
        const currentStatus = currentClient.estado;
        
        if (newStatus !== currentStatus) {
          // State changed - update directly via Convex
          try {
            await updateClientMutation({
              id: currentClient.id as any,
              estado: newStatus
            });
            
            toast.success(`Estado actualizado de ${currentStatus} a ${newStatus}`, {
              description: result.justification,
              duration: 5000,
            });
          } catch (updateError) {
            console.error("Error updating client state:", updateError);
            toast.error("Error al actualizar el estado en la base de datos", {
              description: "El análisis se completó pero no se pudo guardar el cambio",
              duration: 4000,
            });
          }
        } else {
          // State unchanged
          toast.info(`Estado mantenido como ${currentStatus}`, {
            description: result.justification,
            duration: 4000,
          });
        }
      } else {
        toast.success("Estado actualizado exitosamente");
      }
    } catch (error) {
      console.error("Error en actualización de estado:", error);
      toast.error("Error al actualizar estado del cliente", {
        description: "Intenta nuevamente en unos momentos",
        duration: 4000,
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAnalyzeWithAI = async () => {
    if (!currentClient) return;
    
    setIsAnalyzing(true);
    setAiSummary(""); // Clear previous analysis
    
    try {
      const response = await fetch("/api/ai/analyze-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client: currentClient }),
      });

      if (!response.ok) throw new Error("Error en análisis");

      const result = await response.json();
      console.log("Análisis completado:", result);
      
      // Use the AI-generated analysis directly
      if (result.analysis) {
        setAiSummary(result.analysis);
        toast.success("Análisis completado exitosamente", {
          description: "El análisis de estado y prioridad está listo",
          duration: 4000,
        });
      } else {
        throw new Error("No se recibió análisis válido");
      }
    } catch (error) {
      console.error("Error en análisis:", error);
      toast.error("Error al analizar cliente", {
        description: "Intenta nuevamente en unos momentos",
        duration: 4000,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };


  const handleAddInteraction = async () => {
    if (!currentClient || !interactionDescription.trim() || (!interactionType && !customType.trim())) return;

    const finalType = showCustomType && customType.trim() ? customType.trim() : interactionType;

    try {
      await addInteractionMutation({
        clientId: currentClient.id as any, // Convex ID type
        descripcion: interactionDescription.trim(),
        tipo: finalType,
      });

      // Reset form
      setInteractionDescription("");
      setInteractionType("");
      setInteractionDate("");
      setInteractionTime("");
      setCustomType("");
      setShowCustomType(false);
      setIsAddInteractionOpen(false);

      toast.success("Interacción agregada exitosamente", {
        description: `Se registró una nueva ${finalType} para ${currentClient.nombre}`,
        duration: 4000,
      });
    } catch (error) {
      console.error("Error adding interaction:", error);
      toast.error("Error al agregar interacción", {
        description: "Intenta nuevamente en unos momentos",
        duration: 4000,
      });
    }
  };

  if (!client || !currentClient) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mx-auto px-6 py-8">
          <div className="text-center">
            <p>Cliente no encontrado</p>
            <Button onClick={() => router.push("/")} className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const interactions = currentClient.interacciones || [];
  const latestRecommendation = currentClient.aiRecommendations && currentClient.aiRecommendations.length > 0
    ? currentClient.aiRecommendations.sort((a, b) => b.fecha - a.fecha)[0]
    : null;
  const latestAnalysis = currentClient.aiAnalyses && currentClient.aiAnalyses.length > 0
    ? currentClient.aiAnalyses.sort((a, b) => b.fecha - a.fecha)[0]
    : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="mx-auto px-6 py-4">
          <div className="flex items-center md:mx-8 justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => router.push("/")}>
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
              <h1 className="text-2xl font-semibold text-slate-900">Detalle del Cliente</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                className="gap-2" 
                onClick={handleAutoUpdateStatus}
                disabled={isUpdatingStatus}
              >
                {isUpdatingStatus ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Actualizar estado automáticamente
              </Button>
              <Button 
                className="gap-2 bg-purple-600 hover:bg-purple-700" 
                onClick={handleAnalyzeWithAI}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Brain className="w-4 h-4" />
                )}
                Analizar con IA
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto px-6 py-8 md:mx-8">
        <div className="space-y-6">
          {/* Client Information Card */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentClient.nombre)}&background=random&color=fff&size=64&bold=true`}
                    alt={`Avatar de ${currentClient.nombre}`}
                    className="w-16 h-16 rounded-full"
                  />
                  <div className="space-y-2">
                    {/* Editable Name */}
                    <div className="flex items-center gap-2">
                      {isEditingName ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            className="text-xl font-semibold"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleNameSave();
                              if (e.key === 'Escape') handleNameCancel();
                            }}
                            autoFocus
                          />
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={handleNameSave}>
                              <Check className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleNameCancel}>
                              <X className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="text-xl font-semibold cursor-pointer hover:bg-slate-50 px-2 py-1 rounded-md transition-colors flex items-center gap-2 group"
                          onClick={() => {
                            setTempName(currentClient.nombre);
                            setIsEditingName(true);
                          }}
                        >
                          {currentClient.nombre}
                          <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </div>
                    
                    {/* Status and Priority */}
                    <div className="flex items-center gap-3">
                      {/* Editable Status */}
                      {isEditingStatus ? (
                        <div className="flex items-center gap-2">
                          <Select value={tempStatus} onValueChange={(value) => setTempStatus(value as ClientStatus)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Activo">Activo</SelectItem>
                              <SelectItem value="Inactivo">Inactivo</SelectItem>
                              <SelectItem value="Potencial">Potencial</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={handleStatusSave}>
                              <Check className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleStatusCancel}>
                              <X className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Badge 
                          className={`cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(currentClient.estado)}`}
                          onClick={() => {
                            setTempStatus(currentClient.estado);
                            setIsEditingStatus(true);
                          }}
                        >
                          {currentClient.estado}
                        </Badge>
                      )}
                      
                      {isEditingPriority ? (
                        <div className="flex items-center gap-2">
                          <Select value={tempPriority} onValueChange={(value) => setTempPriority(value as ClientPriority)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Alta">Alta</SelectItem>
                              <SelectItem value="Media">Media</SelectItem>
                              <SelectItem value="Baja">Baja</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={handlePrioritySave}>
                              <Check className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handlePriorityCancel}>
                              <X className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Badge 
                          variant="outline" 
                          className={`cursor-pointer hover:opacity-80 transition-opacity ${getPriorityColor(currentClient.priority)}`}
                          onClick={() => {
                            setTempPriority(currentClient.priority);
                            setIsEditingPriority(true);
                          }}
                        >
                          Prioridad: {currentClient.priority}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Editable Phone */}
                <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Phone className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-600 mb-1">Teléfono</p>
                    {isEditingPhone ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={tempPhone}
                          onChange={(e) => setTempPhone(e.target.value)}
                          className="font-medium"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handlePhoneSave();
                            if (e.key === 'Escape') handlePhoneCancel();
                          }}
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={handlePhoneSave}>
                            <Check className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handlePhoneCancel}>
                            <X className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p 
                        className="font-medium cursor-pointer hover:bg-slate-50 px-2 py-1 rounded transition-colors"
                        onClick={() => {
                          setTempPhone(currentClient.telefono);
                          setIsEditingPhone(true);
                        }}
                      >
                        {currentClient.telefono}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Last Interaction */}
                <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Última interacción</p>
                    <p className="font-medium">{formatDate(currentClient.ultimaInteraccion)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Analysis Results */}
          {aiSummary ? (
            <Card className="shadow-sm border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Brain className="w-5 h-5" />
                  Análisis de Estado y Prioridad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-line text-purple-700 leading-relaxed">
                    {aiSummary}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : latestAnalysis ? (
            <Card className="shadow-sm border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Brain className="w-5 h-5" />
                  Análisis de IA Más Reciente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-line text-purple-700 leading-relaxed">
                    {latestAnalysis.analysis}
                  </div>
                  <div className="text-xs text-purple-600 mt-2">
                    Análisis del {formatDateShort(latestAnalysis.fecha)}
                    {latestAnalysis.priority && (
                      <span className="ml-2">
                        • Prioridad: {latestAnalysis.priority}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : latestRecommendation ? (
            <Card className="shadow-sm border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800">
                  <Brain className="w-5 h-5" />
                  Recomendación IA Anterior
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-line text-purple-700 leading-relaxed">
                    {latestRecommendation.recommendation}
                  </div>
                  <div className="text-xs text-purple-600 mt-2">
                    Análisis del {formatDateShort(latestRecommendation.fecha)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm border-dashed border-2 border-gray-200 bg-gray-50">
              <CardContent className="py-8 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Análisis de Cliente</h3>
                <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                  Obtén un análisis inteligente del estado actual del cliente y recomendaciones de prioridad basadas en su historial de interacciones.
                </p>
                <Button
                  onClick={handleAnalyzeWithAI}
                  disabled={isAnalyzing}
                  className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4" />
                  )}
                  {isAnalyzing ? "Analizando..." : "Analizar Cliente"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Interaction History Card */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Historial de interacciones
                </div>
                <Dialog open={isAddInteractionOpen} onOpenChange={setIsAddInteractionOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <MessageSquarePlus className="w-4 h-4" />
                      Agregar interacción
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Agregar Interacción - {currentClient.nombre}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">Fecha</label>
                          <input
                            type="date"
                            value={interactionDate}
                            onChange={(e) => setInteractionDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">Hora (opcional)</label>
                          <input
                            type="time"
                            value={interactionTime}
                            onChange={(e) => setInteractionTime(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Tipo de Interacción</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {defaultInteractionTypes.map((type) => (
                            <button
                              key={type.name}
                              type="button"
                              onClick={() => {
                                setInteractionType(type.name);
                                setShowCustomType(false);
                              }}
                              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                interactionType === type.name && !showCustomType
                                  ? "border-blue-500 bg-blue-50 text-blue-700"
                                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                              }`}
                              style={{
                                borderColor:
                                  interactionType === type.name && !showCustomType ? type.color : undefined,
                                backgroundColor:
                                  interactionType === type.name && !showCustomType ? `${type.color}20` : undefined,
                              }}
                            >
                              {type.name}
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setShowCustomType(true);
                              setInteractionType("");
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                              showCustomType
                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            + Personalizado
                          </button>
                        </div>
                        {showCustomType && (
                          <input
                            type="text"
                            placeholder="Tipo personalizado..."
                            value={customType}
                            onChange={(e) => setCustomType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Descripción</label>
                        <Textarea
                          placeholder="Describe la interacción con el cliente..."
                          value={interactionDescription}
                          onChange={(e) => setInteractionDescription(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsAddInteractionOpen(false);
                            setInteractionDescription("");
                            setInteractionType("");
                            setInteractionDate("");
                            setInteractionTime("");
                            setCustomType("");
                            setShowCustomType(false);
                          }}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleAddInteraction}
                          disabled={!interactionDescription.trim() || (!interactionType && !customType.trim())}
                        >
                          Guardar Interacción
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {interactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No hay interacciones registradas</h3>
                  <p className="text-slate-600 mb-6 max-w-md mx-auto">
                    Las interacciones con este cliente aparecerán aquí una vez que se registren desde el dashboard principal.
                  </p>
                  <Dialog open={isAddInteractionOpen} onOpenChange={setIsAddInteractionOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="gap-2">
                        <MessageSquarePlus className="w-4 h-4" />
                        Agregar interacción
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Agregar Interacción - {currentClient.nombre}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Fecha</label>
                            <input
                              type="date"
                              value={interactionDate}
                              onChange={(e) => setInteractionDate(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Hora (opcional)</label>
                            <input
                              type="time"
                              value={interactionTime}
                              onChange={(e) => setInteractionTime(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-2 block">Tipo de Interacción</label>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {defaultInteractionTypes.map((type) => (
                              <button
                                key={type.name}
                                type="button"
                                onClick={() => {
                                  setInteractionType(type.name);
                                  setShowCustomType(false);
                                }}
                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                  interactionType === type.name && !showCustomType
                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                                style={{
                                  borderColor:
                                    interactionType === type.name && !showCustomType ? type.color : undefined,
                                  backgroundColor:
                                    interactionType === type.name && !showCustomType ? `${type.color}20` : undefined,
                                }}
                              >
                                {type.name}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                setShowCustomType(true);
                                setInteractionType("");
                              }}
                              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                showCustomType
                                  ? "border-blue-500 bg-blue-50 text-blue-700"
                                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              + Personalizado
                            </button>
                          </div>
                          {showCustomType && (
                            <input
                              type="text"
                              placeholder="Tipo personalizado..."
                              value={customType}
                              onChange={(e) => setCustomType(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          )}
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 block">Descripción</label>
                          <Textarea
                            placeholder="Describe la interacción con el cliente..."
                            value={interactionDescription}
                            onChange={(e) => setInteractionDescription(e.target.value)}
                            className="min-h-[100px]"
                          />
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsAddInteractionOpen(false);
                              setInteractionDescription("");
                              setInteractionType("");
                              setInteractionDate("");
                              setInteractionTime("");
                              setCustomType("");
                              setShowCustomType(false);
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={handleAddInteraction}
                            disabled={!interactionDescription.trim() || (!interactionType && !customType.trim())}
                          >
                            Guardar Interacción
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="relative">
                  {interactions
                    .sort((a, b) => b.fecha - a.fecha)
                    .map((interaction, index) => (
                    <div key={interaction.id} className="relative flex gap-4 pb-6">
                      {/* Timeline line and dot */}
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-sm"></div>
                        {index !== interactions.length - 1 && (
                          <div className="w-px h-full bg-slate-200 mt-2"></div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 -mt-1">
                        <div className="p-4 border border-slate-200 rounded-lg bg-white">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 mr-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getTypeColor(interaction.tipo || "Llamada")}>
                                  {interaction.tipo || "Llamada"}
                                </Badge>
                                {index === 0 && (
                                  <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                                    Más reciente
                                  </Badge>
                                )}
                              </div>
                              <p className="text-slate-700">{interaction.descripcion}</p>
                            </div>
                            <div className="text-right text-sm text-slate-500 min-w-0">
                              <div>{formatDateShort(interaction.fecha)}</div>
                              <div>{formatTime(interaction.fecha)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}