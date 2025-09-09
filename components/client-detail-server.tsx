import { ConvexHttpClient } from "convex/browser"
import { api } from "../convex/_generated/api"
import type { Client } from "./client-dashboard"

export async function getClientById(clientId: string): Promise<Client | null> {
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)
  
  try {
    const clients = await convex.query(api.clients.getClients)
    const client = clients.find((c) => c.id === clientId)
    return client || null
  } catch (error) {
    console.error("Error fetching client:", error)
    return null
  }
}

