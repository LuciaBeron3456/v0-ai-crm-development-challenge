import { Client } from "@upstash/qstash"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Initialize Qstash client
    const qstash = new Client({
      token: process.env.QSTASH_TOKEN!,
    })

    const { schedule = "0 9 * * *" } = await request.json() // Default: daily at 9 AM

    // Get the base URL for the webhook
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXTAUTH_URL || "http://localhost:3000"

    const webhookUrl = `${baseUrl}/api/cron/check-inactive-clients?days=7`

    // Create or update the scheduled job
    const scheduleResponse = await qstash.schedules.create({
      destination: webhookUrl,
      cron: schedule, // Cron expression for scheduling
      body: JSON.stringify({
        action: "check_inactive_clients",
        daysThreshold: 7,
      }),
      headers: {
        "Content-Type": "application/json",
      },
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
