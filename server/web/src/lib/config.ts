// Environment configuration for Corridor web app
export const config = {
  // Worker URLs
  workerUrl: process.env.NEXT_PUBLIC_WORKER_URL || 'https://corridor-worker.corridor-sync.workers.dev',
  websocketUrl: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'wss://corridor-worker.corridor-sync.workers.dev/ws',
  
  // App configuration
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Corridor',
  appDescription: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Real-time clipboard synchronization across devices',
} as const

// Helper functions
export const getWebSocketUrl = (token: string) => {
  return `${config.websocketUrl}?token=${encodeURIComponent(token)}`
}

export const getApiUrl = (endpoint: string) => {
  return `${config.workerUrl}/api${endpoint}`
}
