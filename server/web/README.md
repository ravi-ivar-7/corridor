# Corridor Web App

A Next.js web application for real-time clipboard synchronization.

## Environment Variables

Create a `.env.local` file in the `server/web` directory with the following variables:

```bash
# Worker URLs (required)
NEXT_PUBLIC_WORKER_URL=https://corridor-worker.corridor-sync.workers.dev
NEXT_PUBLIC_WEBSOCKET_URL=wss://corridor-worker.corridor-sync.workers.dev/ws

# App Configuration (optional)
NEXT_PUBLIC_APP_NAME=Corridor
NEXT_PUBLIC_APP_DESCRIPTION=Real-time clipboard synchronization across devices
```

### Development

For local development with a local worker:

```bash
NEXT_PUBLIC_WORKER_URL=http://localhost:8787
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8787/ws
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Configuration

The app uses environment variables for configuration. All URLs are configurable through environment variables:

- `NEXT_PUBLIC_WORKER_URL`: Base URL for the worker (API URLs are derived from this)
- `NEXT_PUBLIC_WEBSOCKET_URL`: WebSocket URL for real-time sync

These are defined in `src/lib/config.ts` and used throughout the application. The API URL is automatically derived as `${NEXT_PUBLIC_WORKER_URL}/api`.
