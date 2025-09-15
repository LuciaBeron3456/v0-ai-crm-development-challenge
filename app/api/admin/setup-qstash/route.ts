import { Client } from "@upstash/qstash"
import { type NextRequest, NextResponse } from "next/server"
import { ConvexHttpClient } from "convex/browser"
import { api } from "../../../../convex/_generated/api"

export async function POST(request: NextRequest) {
  try {
    // Initialize Qstash client
    const qstash = new Client({
      token: process.env.QSTASH_TOKEN!,
    })

    // Initialize Convex client to get automation config
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
    const automationConfigs = await convex.query(api.clients.getAllAutomationConfigs)

    const { schedule = "0 9 * * *" } = await request.json() // Default: daily at 9 AM
    const daysThreshold = automationConfigs?.inactive_days_threshold || 30

    // Get the base URL for the webhook
    const host = request.headers.get("host")
    const protocol = request.headers.get("x-forwarded-proto") || "http"
    
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : host
      ? `${protocol}://${host}`
      : "http://192.168.0.188:3000"

    console.log("baseUrl", baseUrl)

    const webhookUrl = `${baseUrl}/api/cron/check-inactive-clients?days=${daysThreshold}`
    console.log("webhookUrl", webhookUrl)
    console.log("daysThreshold", daysThreshold)
    // Create or update the scheduled job
    const scheduleResponse = await qstash.schedules.create({
      destination: webhookUrl,
      cron: schedule, // Cron expression for scheduling
      method: "GET", // Explicitly set method to GET
    })

    console.log("[QSTASH] Scheduled job created:", scheduleResponse)

    return NextResponse.json({
      success: true,
      message: "Qstash automation configured successfully",
      scheduleId: scheduleResponse.scheduleId,
      schedule,
      webhookUrl,
      nextRun: "Based on cron schedule",
    })
  } catch (error) {
    console.error("[QSTASH] Setup error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to setup Qstash automation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Get current schedules
export async function GET() {
  try {
    const qstash = new Client({
      token: process.env.QSTASH_TOKEN!,
    })

    const schedules = await qstash.schedules.list()

    return NextResponse.json({
      success: true,
      schedules: schedules.map((s) => ({
        id: s.scheduleId,
        cron: s.cron,
        destination: s.destination,
        created: s.createdAt,
      })),
    })
  } catch (error) {
    console.error("[QSTASH] List error:", error)
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 })
  }
}
