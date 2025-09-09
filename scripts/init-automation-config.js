#!/usr/bin/env node

const { ConvexHttpClient } = require("convex/browser");

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function initializeAutomationConfig() {
  try {
    console.log("🚀 Initializing automation configuration...");
    
    // Initialize default automation configurations
    await convex.mutation("clients:initializeAutomationConfigs");
    
    console.log("✅ Automation configuration initialized successfully!");
    console.log("📋 Default settings:");
    console.log("   - Inactive days threshold: 30 days");
    console.log("   - Automation enabled: true");
    
    // Display current configuration
    const configs = await convex.query("clients:getAllAutomationConfigs");
    console.log("\n📊 Current automation configuration:");
    console.log(JSON.stringify(configs, null, 2));
    
  } catch (error) {
    console.error("❌ Error initializing automation configuration:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeAutomationConfig();
}

module.exports = { initializeAutomationConfig };
