#!/usr/bin/env node

const { ConvexHttpClient } = require("convex/browser");

async function seedData() {
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
  
  try {
    console.log("🌱 Creando datos de prueba...");
    
    const result = await client.mutation("seed:seedClients", {});
    
    console.log("✅ Datos creados exitosamente:");
    console.log(`   - ${result.clientsCreated} clientes creados`);
    console.log(`   - ${result.interactionsCreated} interacciones creadas`);
    
  } catch (error) {
    console.error("❌ Error creando datos:", error);
  }
}

async function clearData() {
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
  
  try {
    console.log("🧹 Limpiando todos los datos...");
    
    const result = await client.mutation("seed:clearAllData", {});
    
    console.log("✅ Datos eliminados:");
    console.log(`   - ${result.clientsDeleted} clientes eliminados`);
    console.log(`   - ${result.interactionsDeleted} interacciones eliminadas`);
    
  } catch (error) {
    console.error("❌ Error eliminando datos:", error);
  }
}

const command = process.argv[2];

if (command === "seed") {
  seedData();
} else if (command === "clear") {
  clearData();
} else {
  console.log("Uso:");
  console.log("  node scripts/seed-data.js seed   - Crear datos de prueba");
  console.log("  node scripts/seed-data.js clear  - Limpiar todos los datos");
}

