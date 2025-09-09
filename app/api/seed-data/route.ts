import { ConvexHttpClient } from "convex/browser"
import { type NextRequest, NextResponse } from "next/server"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === "seed") {
      const result = await convex.mutation("seed:seedClients", {})
      return NextResponse.json(result)
    } else if (action === "clear") {
      const result = await convex.mutation("seed:clearAllData", {})
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { error: "Acción no válida" },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error("Error en seed-data API:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

