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
            fecha: i.fecha, // Keep as number (timestamp)
            descripcion: i.descripcion,
            tipo: i.tipo,
          })),
          ultimaInteraccion: client.ultimaInteraccion, // Keep as number (timestamp)
          aiAnalyses: client.aiAnalyses || [], // Include AI analyses
        }
      }),
    )

    return clientsWithInteractions
  },
})

// Get paginated clients
export const getClientsPaginated = query({
  args: {
    limit: v.number(),
    offset: v.number(),
  },
  handler: async (ctx, args) => {
    // Get all clients and manually paginate
    const allClients = await ctx.db.query("clients").order("desc").collect()
    
    // Manual pagination
    const startIndex = args.offset
    const endIndex = startIndex + args.limit
    const paginatedClients = allClients.slice(startIndex, endIndex)
    const isDone = endIndex >= allClients.length

    // Get interactions for each client
    const clientsWithInteractions = await Promise.all(
      paginatedClients.map(async (client) => {
        const interactions = await ctx.db
          .query("interactions")
          .withIndex("by_client", (q) => q.eq("clientId", client._id))
          .collect()

        return {
          ...client,
          id: client._id,
          interacciones: interactions.map((i) => ({
            id: i._id,
            fecha: i.fecha,
            descripcion: i.descripcion,
            tipo: i.tipo,
          })),
          ultimaInteraccion: client.ultimaInteraccion,
          aiAnalyses: client.aiAnalyses || [], // Include AI analyses
        }
      }),
    )

    return {
      clients: clientsWithInteractions,
      isDone,
      totalCount: allClients.length,
    }
  },
})

// Get total count for pagination
export const getClientsCount = query({
  handler: async (ctx) => {
    const clients = await ctx.db.query("clients").collect()
    return clients.length
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
      priority: "Media" as const,
      aiRecommendations: [],
      aiAnalyses: [],
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
    priority: v.optional(v.union(v.literal("Alta"), v.literal("Media"), v.literal("Baja"))),
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
    tipo: v.string(),
  },
  handler: async (ctx, args) => {
    // Add the interaction
    const interactionId = await ctx.db.insert("interactions", {
      clientId: args.clientId,
      fecha: Date.now(),
      descripcion: args.descripcion,
      tipo: args.tipo,
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

// Get automation configuration
export const getAutomationConfig = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const config = await ctx.db
      .query("automationConfig")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first()
    
    return config?.value
  },
})

// Get all automation configurations
export const getAllAutomationConfigs = query({
  handler: async (ctx) => {
    const configs = await ctx.db.query("automationConfig").collect()
    return configs.reduce((acc, config) => {
      acc[config.key] = config.value
      return acc
    }, {} as Record<string, any>)
  },
})

// Set automation configuration
export const setAutomationConfig = mutation({
  args: {
    key: v.string(),
    value: v.any(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("automationConfig")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first()
    
    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        description: args.description,
        updatedAt: Date.now(),
      })
    } else {
      await ctx.db.insert("automationConfig", {
        key: args.key,
        value: args.value,
        description: args.description,
        updatedAt: Date.now(),
      })
    }
  },
})

// Initialize default automation configurations
export const initializeAutomationConfigs = mutation({
  handler: async (ctx) => {
    const defaultConfigs = [
      {
        key: "inactive_days_threshold",
        value: 30,
        description: "Number of days after which a client is considered inactive",
      },
      {
        key: "check_frequency",
        value: "24h",
        description: "How often to check for inactive clients",
      },
      {
        key: "automation_enabled",
        value: true,
        description: "Whether automation is enabled",
      },
    ]
    
    for (const config of defaultConfigs) {
      const existing = await ctx.db
        .query("automationConfig")
        .withIndex("by_key", (q) => q.eq("key", config.key))
        .first()
      
      if (!existing) {
        await ctx.db.insert("automationConfig", {
          ...config,
          updatedAt: Date.now(),
        })
      }
    }
  },
})

// Add AI analysis to client
export const addAIAnalysis = mutation({
  args: {
    clientId: v.id("clients"),
    analysis: v.string(),
    priority: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.clientId)
    if (!client) {
      throw new Error("Client not found")
    }

    const newAnalysis = {
      id: crypto.randomUUID(),
      fecha: Date.now(),
      analysis: args.analysis,
      priority: args.priority,
    }

    const currentAnalyses = client.aiAnalyses || []
    const updatedAnalyses = [newAnalysis, ...currentAnalyses]

    await ctx.db.patch(args.clientId, {
      aiAnalyses: updatedAnalyses,
    })

    return newAnalysis.id
  },
})
