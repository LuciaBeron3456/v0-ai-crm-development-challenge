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
})
