import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { client } = await request.json()

    const prompt = `
Categoriza automáticamente este cliente basándote en su historial:

Cliente: ${client.nombre}
Estado actual: ${client.estado}
Última interacción: ${new Date(client.ultimaInteraccion).toLocaleDateString("es-AR")}
Días desde última interacción: ${Math.ceil((Date.now() - new Date(client.ultimaInteraccion).getTime()) / (1000 * 60 * 60 * 24))}
Número de interacciones: ${client.interacciones.length}
Historial: ${client.interacciones.map((i) => `${new Date(i.fecha).toLocaleDateString("es-AR")}: ${i.descripcion}`).join(", ")}

Basándote ÚNICAMENTE en estos criterios, determina la categoría:
- "Activo": Interacción en últimos 14 días O más de 3 interacciones registradas
- "Potencial": Interacción entre 15-30 días Y 1-3 interacciones
- "Inactivo": Más de 30 días sin interacción O sin interacciones registradas

Responde ÚNICAMENTE con una de estas palabras: Activo, Potencial, Inactivo
`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
      maxTokens: 10,
    })

    const category = text.trim()

    // Validate the response
    if (!["Activo", "Potencial", "Inactivo"].includes(category)) {
      throw new Error("Invalid category response")
    }

    return NextResponse.json({ category })
  } catch (error) {
    console.error("Error categorizing client:", error)
    return NextResponse.json({ error: "Error al categorizar cliente" }, { status: 500 })
  }
}
