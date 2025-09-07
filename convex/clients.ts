import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

// Get all clients
export const getClients = query({
  handler: async (ctx) => {
    const clients = await ctx.db.query("clients").collect()

    // Get interactions for each client
    const clientsWithInteractions = await Promise.all(
      clients.map(async (client) => {
        const interactions = await ctx.db
          .query("interactions")
          .withIndex("by_client", (q) => q.eq("clientId", client._id))
          .collect()

        return {
          ...client,
          id: client._id,
          interacciones: interactions.map((i) => ({
            id: i._id,
            fecha: new Date(i.fecha),
            descripcion: i.descripcion,
          })),
          ultimaInteraccion: new Date(client.ultimaInteraccion),
        }
      }),
    )

    return clientsWithInteractions
  },
})

// Add new client
export const addClient = mutation({
  args: {
    nombre: v.string(),
    telefono: v.string(),
    estado: v.union(v.literal("Activo"), v.literal("Inactivo"), v.literal("Potencial")),
  },
  handler: async (ctx, args) => {
    const clientId = await ctx.db.insert("clients", {
      ...args,
      ultimaInteraccion: Date.now(),
    })
    return clientId
  },
})

// Update client
export const updateClient = mutation({
  args: {
    id: v.id("clients"),
    nombre: v.optional(v.string()),
    telefono: v.optional(v.string()),
    estado: v.optional(v.union(v.literal("Activo"), v.literal("Inactivo"), v.literal("Potencial"))),
    ultimaInteraccion: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    await ctx.db.patch(id, updates)
  },
})

// Add interaction
export const addInteraction = mutation({
  args: {
    clientId: v.id("clients"),
    descripcion: v.string(),
  },
  handler: async (ctx, args) => {
    // Add the interaction
    const interactionId = await ctx.db.insert("interactions", {
      clientId: args.clientId,
      fecha: Date.now(),
      descripcion: args.descripcion,
    })

    // Update client's last interaction date
    await ctx.db.patch(args.clientId, {
      ultimaInteraccion: Date.now(),
    })

    return interactionId
  },
})

// Mark inactive clients (for Qstash automation)
export const markInactiveClients = mutation({
  args: { daysThreshold: v.number() },
  handler: async (ctx, args) => {
    const threshold = Date.now() - args.daysThreshold * 24 * 60 * 60 * 1000

    const clients = await ctx.db.query("clients").collect()
    const updates = []

    for (const client of clients) {
      if (client.ultimaInteraccion < threshold && client.estado !== "Inactivo") {
        await ctx.db.patch(client._id, { estado: "Inactivo" })
        updates.push(client._id)
      }
    }

    return { updatedClients: updates.length }
  },
})
