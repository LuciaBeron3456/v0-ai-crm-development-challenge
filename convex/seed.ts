import { mutation } from "./_generated/server"
import { v } from "convex/values"

// Función para generar datos de prueba
export const seedClients = mutation({
  args: {},
  handler: async (ctx) => {
    const clients = [
      {
        nombre: "María González",
        telefono: "+54 11 1234-5678",
        estado: "Activo" as const,
        ultimaInteraccion: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 días atrás
        priority: "Alta" as const,
        aiRecommendations: [
          {
            id: "rec1",
            fecha: Date.now() - 1 * 24 * 60 * 60 * 1000,
            recommendation: "Cliente muy interesado en el producto premium. Seguimiento inmediato recomendado.",
            priority: "Alta"
          }
        ],
        aiAnalyses: []
      },
      {
        nombre: "Carlos Rodríguez",
        telefono: "+54 11 2345-6789",
        estado: "Potencial" as const,
        ultimaInteraccion: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 días atrás
        priority: "Media" as const,
        aiRecommendations: [],
        aiAnalyses: []
      },
      {
        nombre: "Ana Martínez",
        telefono: "+54 11 3456-7890",
        estado: "Inactivo" as const,
        ultimaInteraccion: Date.now() - 45 * 24 * 60 * 60 * 1000, // 45 días atrás
        priority: "Baja" as const,
        aiRecommendations: [],
        aiAnalyses: []
      },
      {
        nombre: "Luis Fernández",
        telefono: "+54 11 4567-8901",
        estado: "Activo" as const,
        ultimaInteraccion: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 días atrás
        priority: "Media" as const,
        aiRecommendations: [
          {
            id: "rec2",
            fecha: Date.now() - 3 * 24 * 60 * 60 * 1000,
            recommendation: "Cliente satisfecho con el servicio. Oportunidad de venta cruzada.",
            priority: "Media"
          }
        ],
        aiAnalyses: []
      },
      {
        nombre: "Sofia López",
        telefono: "+54 11 5678-9012",
        estado: "Potencial" as const,
        ultimaInteraccion: Date.now() - 8 * 24 * 60 * 60 * 1000, // 8 días atrás
        priority: "Alta" as const,
        aiRecommendations: [],
        aiAnalyses: []
      },
      {
        nombre: "Diego Pérez",
        telefono: "+54 11 6789-0123",
        estado: "Activo" as const,
        ultimaInteraccion: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 día atrás
        priority: "Alta" as const,
        aiRecommendations: [],
        aiAnalyses: []
      },
      {
        nombre: "Valentina García",
        telefono: "+54 11 7890-1234",
        estado: "Inactivo" as const,
        ultimaInteraccion: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 días atrás
        priority: "Baja" as const,
        aiRecommendations: [],
        aiAnalyses: []
      },
      {
        nombre: "Roberto Silva",
        telefono: "+54 11 8901-2345",
        estado: "Potencial" as const,
        ultimaInteraccion: Date.now() - 20 * 24 * 60 * 60 * 1000, // 20 días atrás
        priority: "Media" as const,
        aiRecommendations: [],
        aiAnalyses: []
      }
    ]

    const clientIds = []
    
    // Crear clientes
    for (const client of clients) {
      const clientId = await ctx.db.insert("clients", client)
      clientIds.push(clientId)
    }

    // Crear interacciones para algunos clientes
    const interactions = [
      {
        clientId: clientIds[0], // María González
        fecha: Date.now() - 2 * 24 * 60 * 60 * 1000,
        descripcion: "Llamada inicial para presentar el producto. Cliente muy interesado.",
        tipo: "Llamada"
      },
      {
        clientId: clientIds[0], // María González
        fecha: Date.now() - 1 * 24 * 60 * 60 * 1000,
        descripcion: "Envío de propuesta comercial por email. Esperando respuesta.",
        tipo: "Email"
      },
      {
        clientId: clientIds[1], // Carlos Rodríguez
        fecha: Date.now() - 15 * 24 * 60 * 60 * 1000,
        descripcion: "Reunión presencial. Cliente evaluando opciones.",
        tipo: "Reunión"
      },
      {
        clientId: clientIds[3], // Luis Fernández
        fecha: Date.now() - 5 * 24 * 60 * 60 * 1000,
        descripcion: "Seguimiento post-venta. Cliente satisfecho con el servicio.",
        tipo: "Llamada"
      },
      {
        clientId: clientIds[3], // Luis Fernández
        fecha: Date.now() - 3 * 24 * 60 * 60 * 1000,
        descripcion: "Propuesta de servicio adicional enviada.",
        tipo: "Email"
      },
      {
        clientId: clientIds[4], // Sofia López
        fecha: Date.now() - 8 * 24 * 60 * 60 * 1000,
        descripcion: "Primera llamada de prospección. Cliente potencial interesado.",
        tipo: "Llamada"
      },
      {
        clientId: clientIds[5], // Diego Pérez
        fecha: Date.now() - 1 * 24 * 60 * 60 * 1000,
        descripcion: "Cliente muy activo. Interesado en ampliar el contrato.",
        tipo: "WhatsApp"
      },
      {
        clientId: clientIds[5], // Diego Pérez
        fecha: Date.now() - 3 * 24 * 60 * 60 * 1000,
        descripcion: "Reunión de seguimiento. Excelente relación comercial.",
        tipo: "Reunión"
      }
    ]

    // Crear interacciones
    for (const interaction of interactions) {
      await ctx.db.insert("interactions", interaction)
    }

    return {
      message: "Datos de prueba creados exitosamente",
      clientsCreated: clients.length,
      interactionsCreated: interactions.length
    }
  }
})

// Función para limpiar todos los datos (útil para testing)
export const clearAllData = mutation({
  args: {},
  handler: async (ctx) => {
    // Eliminar todas las interacciones
    const interactions = await ctx.db.query("interactions").collect()
    for (const interaction of interactions) {
      await ctx.db.delete(interaction._id)
    }

    // Eliminar todos los clientes
    const clients = await ctx.db.query("clients").collect()
    for (const client of clients) {
      await ctx.db.delete(client._id)
    }

    return {
      message: "Todos los datos han sido eliminados",
      clientsDeleted: clients.length,
      interactionsDeleted: interactions.length
    }
  }
})

