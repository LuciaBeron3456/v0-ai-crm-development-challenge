import { ConvexHttpClient } from "convex/browser"
import { type NextRequest, NextResponse } from "next/server"
import { api } from "../../../convex/_generated/api"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const offset = parseInt(searchParams.get("offset") || "0")

    const result = await convex.query(api.clients.getClientsPaginated, {
      limit,
      offset,
    })

    return NextResponse.json({
      success: true,
      clients: result.clients,
      isDone: result.isDone,
      nextCursor: result.nextCursor,
    })
  } catch (error) {
    console.error("Error fetching paginated clients:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch clients" },
      { status: 500 }
    )
  }
}
