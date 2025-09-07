import { verifySignatureAppRouter } from "@upstash/qstash/nextjs"
import { type NextRequest, NextResponse } from "next/server"

// Mock function - replace with actual Convex call when integrated
async function markInactiveClients(daysThreshold: number) {
  // This would normally call the Convex mutation
  // For now, we'll simulate the process
  console.log(`[CRON] Checking for clients inactive for more than ${daysThreshold} days`)

  // In a real implementation, this would:
  // 1. Query all clients from Convex
  // 2. Check their last interaction date
  // 3. Update status to "Inactivo" for clients exceeding threshold
  // 4. Return count of updated clients

  // Simulated response
  const updatedCount = Math.floor(Math.random() * 5) // Random for demo
  console.log(`[CRON] Marked ${updatedCount} clients as inactive`)

  return { updatedClients: updatedCount }
}

async function handler(request: NextRequest) {
  try {
    console.log("[CRON] Inactive clients check started")

    // Get threshold from query params or use default (7 days for demo, 30 for production)
    const url = new URL(request.url)
    const daysThreshold = Number.parseInt(url.searchParams.get("days") || "7")

    // Mark inactive clients
    const result = await markInactiveClients(daysThreshold)

    console.log(`[CRON] Successfully processed ${result.updatedClients} clients`)

    return NextResponse.json({
      success: true,
      message: `Processed ${result.updatedClients} clients`,
      timestamp: new Date().toISOString(),
      daysThreshold,
    })
  } catch (error) {
    console.error("[CRON] Error in inactive clients check:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process inactive clients",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// Verify Qstash signature for security
export const POST = verifySignatureAppRouter(handler)

// Allow GET for manual testing
export async function GET(request: NextRequest) {
  console.log("[CRON] Manual trigger via GET request")
  return handler(request)
}
