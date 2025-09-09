import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { client } = await request.json()

    const daysSinceLastInteraction = Math.ceil((Date.now() - new Date(client.ultimaInteraccion).getTime()) / (1000 * 60 * 60 * 24))
    const monthsSinceLastInteraction = Math.floor(daysSinceLastInteraction / 30)
    
    const prompt = `
Analiza este cliente de CRM y proporciona un resumen de estado y recomendación de prioridad:

INFORMACIÓN DEL CLIENTE:
- Nombre: ${client.nombre}
- Estado actual: ${client.estado}
- Prioridad actual: ${client.priority}
- Teléfono: ${client.telefono}
- Última interacción: ${new Date(client.ultimaInteraccion).toLocaleDateString("es-AR")}
- Días desde última interacción: ${daysSinceLastInteraction} días
- Meses sin contacto: ${monthsSinceLastInteraction} meses
- Número total de interacciones: ${client.interacciones.length}

HISTORIAL DE INTERACCIONES:
${client.interacciones.length > 0 
  ? client.interacciones
      .sort((a: any, b: any) => b.fecha - a.fecha)
      .slice(0, 5)
      .map((i: any) => `- ${new Date(i.fecha).toLocaleDateString("es-AR")}: ${i.descripcion}`)
      .join("\n")
  : "Sin interacciones registradas"
}

ANÁLISIS REQUERIDO:
1. RESUMEN DE ESTADO: Analiza el estado actual del cliente basándote en:
   - Tiempo transcurrido desde la última interacción
   - Frecuencia de interacciones
   - Estado actual vs. actividad
   - Patrones de comportamiento

2. RECOMENDACIÓN DE PRIORIDAD: Sugiere una nueva prioridad (Alta, Media, Baja) considerando:
   - Riesgo de pérdida del cliente
   - Potencial de conversión/venta
   - Urgencia de seguimiento
   - Valor del cliente

3. JUSTIFICACIÓN: Explica brevemente por qué recomiendas esa prioridad

FORMATO DE RESPUESTA:
Responde en español, máximo 80 palabras, de manera profesional y directa. Incluye:
- Estado actual del cliente (1-2 líneas)
- Prioridad recomendada (Alta/Media/Baja)
- Justificación breve (1 línea)
- Acción sugerida (1 línea)

Ejemplo: "Cliente activo con interacciones recientes. Prioridad recomendada: Media. Mantiene interés pero sin urgencia. Seguimiento programado en 1 semana."
`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
    })

    return NextResponse.json({ analysis: text })
  } catch (error) {
    console.error("Error analyzing client:", error)
    return NextResponse.json({ error: "Error al analizar cliente" }, { status: 500 })
  }
}
