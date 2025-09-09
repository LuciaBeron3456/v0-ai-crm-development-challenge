import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { client } = await request.json()

    const daysSinceLastInteraction = Math.ceil((Date.now() - new Date(client.ultimaInteraccion).getTime()) / (1000 * 60 * 60 * 24))
    const monthsSinceLastInteraction = Math.floor(daysSinceLastInteraction / 30)
    
    const prompt = `
Analiza este cliente y determina su estado correcto basándote en su historial de interacciones:

INFORMACIÓN DEL CLIENTE:
- Nombre: ${client.nombre}
- Estado actual: ${client.estado}
- Última interacción: ${new Date(client.ultimaInteraccion).toLocaleDateString("es-AR")}
- Días desde última interacción: ${daysSinceLastInteraction} días
- Meses sin contacto: ${monthsSinceLastInteraction} meses
- Número de interacciones: ${client.interacciones.length}

HISTORIAL DE INTERACCIONES:
${client.interacciones.length > 0 
  ? client.interacciones
      .sort((a: any, b: any) => b.fecha - a.fecha)
      .slice(0, 3)
      .map((i: any) => `- ${new Date(i.fecha).toLocaleDateString("es-AR")}: ${i.descripcion}`)
      .join("\n")
  : "Sin interacciones registradas"
}

CRITERIOS DE CATEGORIZACIÓN:
- "Activo": Interacción en últimos 14 días O más de 3 interacciones registradas
- "Potencial": Interacción entre 15-30 días Y 1-3 interacciones
- "Inactivo": Más de 30 días sin interacción O sin interacciones registradas

RESPUESTA REQUERIDA:
Proporciona tu respuesta en el siguiente formato JSON:
{
  "category": "Activo|Potencial|Inactivo",
  "justification": "Explicación breve de por qué se mantiene o cambia el estado actual"
}

La justificación debe explicar:
- Si el estado actual es correcto o necesita cambio
- Razón específica basada en el tiempo y frecuencia de interacciones
- Breve recomendación de seguimiento
`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      maxTokens: 200,
    })

    try {
      // Try to parse JSON response
      const response = JSON.parse(text.trim())
      
      // Validate the response
      if (!["Activo", "Potencial", "Inactivo"].includes(response.category)) {
        throw new Error("Invalid category response")
      }
      
      if (!response.justification) {
        throw new Error("Missing justification")
      }

      return NextResponse.json({ 
        category: response.category,
        justification: response.justification
      })
    } catch (parseError) {
      // Fallback: try to extract category from text if JSON parsing fails
      const categoryMatch = text.match(/(Activo|Potencial|Inactivo)/i)
      if (categoryMatch) {
        const category = categoryMatch[1]
        return NextResponse.json({ 
          category,
          justification: `Estado actualizado a ${category} basado en el análisis de interacciones.`
        })
      }
      throw new Error("Could not parse AI response")
    }
  } catch (error) {
    console.error("Error categorizing client:", error)
    return NextResponse.json({ error: "Error al categorizar cliente" }, { status: 500 })
  }
}
