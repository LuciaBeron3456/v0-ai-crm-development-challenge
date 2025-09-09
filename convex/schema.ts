import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  clients: defineTable({
    nombre: v.string(),
    telefono: v.string(),
    estado: v.union(v.literal("Activo"), v.literal("Inactivo"), v.literal("Potencial")),
    ultimaInteraccion: v.number(), // timestamp
    priority: v.union(v.literal("Alta"), v.literal("Media"), v.literal("Baja")),
    aiRecommendations: v.array(
      v.object({
        id: v.string(),
        fecha: v.number(), // timestamp
        recommendation: v.string(),
        priority: v.string(),
      }),
    ),
    aiAnalyses: v.optional(v.array(
      v.object({
        id: v.string(),
        fecha: v.number(), // timestamp
        analysis: v.string(),
        priority: v.optional(v.string()), // priority at time of analysis
      }),
    )),
  }),

  interactions: defineTable({
    clientId: v.id("clients"),
    fecha: v.number(), // timestamp with time
    descripcion: v.string(),
    tipo: v.string(), // flexible type system for tags
  }).index("by_client", ["clientId"]),

  interactionTypes: defineTable({
    name: v.string(),
    color: v.string(), // hex color for the tag
    isDefault: v.boolean(), // whether it's a default type
  }),

  automationConfig: defineTable({
    key: v.string(), // e.g., "inactive_days_threshold"
    value: v.any(), // flexible value type
    description: v.optional(v.string()),
    updatedAt: v.number(), // timestamp
  }).index("by_key", ["key"]),
})
