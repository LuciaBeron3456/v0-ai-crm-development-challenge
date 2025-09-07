import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { client } = await request.json()

    const prompt = `
Analiza este cliente de CRM y proporciona recomendaciones:

Cliente: ${client.nombre}
Estado actual: ${client.estado}
Última interacción: ${new Date(client.ultimaInteraccion).toLocaleDateString("es-AR")}
Días desde última interacción: ${Math.ceil((Date.now() - new Date(client.ultimaInteraccion).getTime()) / (1000 * 60 * 60 * 24))}
Número de interacciones: ${client.interacciones.length}
Historial de interacciones: ${client.interacciones.map((i) => `- ${new Date(i.fecha).toLocaleDateString("es-AR")}: ${i.descripcion}`).join("\n")}

Proporciona:
1. Un análisis del estado del cliente (2-3 oraciones)
2. Nivel de prioridad recomendado (Alta, Media, Baja)
3. Acciones sugeridas específicas
4. Predicción de probabilidad de conversión/retención

Responde en español de manera profesional y concisa.
`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      maxTokens: 300,
    })

    return NextResponse.json({ analysis: text })
  } catch (error) {
    console.error("Error analyzing client:", error)
    return NextResponse.json({ error: "Error al analizar cliente" }, { status: 500 })
  }
}
