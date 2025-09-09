import { verifySignatureAppRouter } from "@upstash/qstash/nextjs"
import { type NextRequest, NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "../../../../convex/_generated/api"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

async function markInactiveClients(daysThreshold: number) {
  console.log(`[CRON] Checking for clients inactive for more than ${daysThreshold} days`)

  try {
    // Call the Convex mutation to mark inactive clients
    const result = await convex.mutation(api.clients.markInactiveClients, {
      daysThreshold,
    })

    console.log(`[CRON] Marked ${result.updatedClients} clients as inactive`)
    return result
  } catch (error) {
    console.error("[CRON] Error marking inactive clients:", error)
    throw error
  }
}

async function handler(request: NextRequest) {
  try {
    console.log("[CRON] Inactive clients check started")

    // Get threshold from database configuration
    let daysThreshold: number
    try {
      const configValue = await convex.query(api.clients.getAutomationConfig, {
        key: "inactive_days_threshold"
      })
      daysThreshold = configValue || 30 // fallback to 30 days if not configured
    } catch (error) {
      console.warn("[CRON] Could not get automation config, using default 30 days")
      daysThreshold = 30
    }

    // Check if automation is enabled
    let automationEnabled = true
    try {
      const enabledValue = await convex.query(api.clients.getAutomationConfig, {
        key: "automation_enabled"
      })
      automationEnabled = enabledValue !== false // default to true if not configured
    } catch (error) {
      console.warn("[CRON] Could not check automation status, proceeding")
    }

    if (!automationEnabled) {
      console.log("[CRON] Automation is disabled, skipping inactive clients check")
      return NextResponse.json({
        success: true,
        message: "Automation disabled",
        timestamp: new Date().toISOString(),
        daysThreshold,
        automationEnabled: false,
      })
    }

    // Mark inactive clients
    const result = await markInactiveClients(daysThreshold)

    console.log(`[CRON] Successfully processed ${result.updatedClients} clients`)

    return NextResponse.json({
      success: true,
      message: `Processed ${result.updatedClients} clients`,
      timestamp: new Date().toISOString(),
      daysThreshold,
      automationEnabled: true,
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
