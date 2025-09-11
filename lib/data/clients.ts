import { ConvexHttpClient } from "convex/browser"
import { api } from "../../convex/_generated/api"

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

/**
 * Server-side data fetching functions for client-related operations
 * Used for SSR (Server-Side Rendering) in Next.js pages
 */

export async function getInitialClients(limit: number = 20) {
  try {
    const result = await convex.query(api.clients.getClientsPaginated, { limit, offset: 0 })
    return result?.clients || []
  } catch (error) {
    console.error("Error fetching initial clients:", error)
    return []
  }
}

export async function getTotalClientsCount() {
  try {
    const count = await convex.query(api.clients.getClientsCount)
    return count || 0
  } catch (error) {
    console.error("Error fetching total clients count:", error)
    return 0
  }
}

export async function getAllClientsForStats() {
  try {
    const clients = await convex.query(api.clients.getClients)
    return clients || []
  } catch (error) {
    console.error("Error fetching all clients for stats:", error)
    return []
  }
}

export async function getClientById(clientId: string) {
  try {
    const clients = await convex.query(api.clients.getClients)
    return clients.find(client => client.id === clientId) || null
  } catch (error) {
    console.error("Error fetching client by ID:", error)
    return null
  }
}

