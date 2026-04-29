

const path = require('path');

module.exports = {
apps: [
{
name: "RemindSync-n8n",
script: path.join(__dirname, "node_modules", "n8n", "bin", "n8n"),
// This is the "Leash" - limits Node to 512MB RAM
node_args: "--max-old-space-size=768",
env: {
N8N_PORT: "5678",
N8N_ENCRYPTION_KEY: "remindsync_prod_key_2026",

// --- DATA PRUNING (Saves Disk & RAM) ---
EXECUTIONS_DATA_SAVE_ON_SUCCESS: "none", // Don't save logs if it worked
EXECUTIONS_DATA_SAVE_ON_ERROR: "all", // Only save logs if it failed
EXECUTIONS_DATA_PRUNE: "true", // Auto-delete old logs
EXECUTIONS_DATA_MAX_AGE: "24", // Keep logs for only 24 hours

// --- PERFORMANCE TRIMMING ---
N8N_METRICS: "false", // Disables background tracking
N8N_USER_MANAGEMENT_DISABLED: "true" // Skips the login screen for clients
}
},
{
name: "RemindSync-WhatsApp",
script: path.join(__dirname, "server.js"),
node_args: "--max-old-space-size=256", // Limits WhatsApp API to 256MB
env: {
NODE_ENV: "production"
}
}
]
}
