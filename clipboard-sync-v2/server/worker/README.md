# Clipboard Sync Worker

Cloudflare Worker for real-time clipboard synchronization using WebSockets and Durable Objects.

## Authentication

```bash
# Login to Cloudflare (opens browser)
npx wrangler login

# Verify authentication
npx wrangler whoami

# Alternative: Use API token
export CLOUDFLARE_API_TOKEN=your-api-token-here

# Alternative: make a .env file in root dir of worker
CLOUDFLARE_API_TOKEN=your-api-token-here
```

## Deployment

```bash
# Install dependencies
npm install

# Deploy to Cloudflare
npx wrangler deploy

# Deploy with specific environment
npx wrangler deploy --env production
```

## Environment Variables

Required in `wrangler.toml`:

```toml
[env.production.vars]
# No additional vars needed for basic functionality
```

## API Endpoints

### Health Check
- **URL**: `GET /health`
- **Response**: `{ "status": "ok", "timestamp": 1234567890 }`

## WebSocket Endpoints

### WebSocket Connection
- **URL**: `wss://your-worker.workers.dev/ws?token=<token>`
- **Protocol**: WebSocket upgrade
- **Authentication**: Token-based via query parameter

## WebSocket Message Protocol

### Client → Server

#### Connect
```json
{
  "type": "connect",
  "token": "your-token-here"
}
```

#### Clipboard Update
```json
{
  "type": "clipboard_update",
  "token": "your-token-here",
  "data": {
    "content": "text content",
    "timestamp": 1234567890,
    "id": "unique-id"
  }
}
```

#### Request History
```json
{
  "type": "clipboard_history",
  "token": "your-token-here"
}
```

#### Clear History
```json
{
  "type": "clear_history",
  "token": "your-token-here"
}
```

#### Ping
```json
{
  "type": "ping",
  "token": "your-token-here"
}
```

### Server → Client

#### Pong
```json
{
  "type": "pong",
  "token": "your-token-here"
}
```

#### Clipboard History
```json
{
  "type": "clipboard_history",
  "token": "your-token-here",
  "history": [
    {
      "id": "unique-id",
      "content": "text content",
      "timestamp": 1234567890
    }
  ]
}
```

#### Error
```json
{
  "type": "error",
  "token": "your-token-here",
  "error": "error message"
}
```

## Durable Objects

### ClipboardSyncDurableObject
- **Binding**: `CLIPBOARD_SYNC`
- **Storage**: SQLite (free plan compatible)
- **Persistence**: Room data, clipboard history, last activity
- **Connections**: WebSocket connections per token

## Features

- Real-time WebSocket communication
- Token-based room isolation
- Clipboard history persistence
- Auto-cleanup of inactive rooms
- Ping/pong heartbeat
- Error handling and validation

## Development

```bash
# Start local development
npx wrangler dev

# Tail logs
npx wrangler tail

# View Durable Objects
npx wrangler durable-object list
```

## Testing & Information

### Check Authentication
```bash
npx wrangler whoami
```

### Test Health Endpoint
```bash
# Test deployed worker
curl https://clipboard-sync-worker.ravi404606.workers.dev/health

# Test local development
curl http://localhost:8787/health
```

### Test WebSocket Connection
```bash
# Using wscat (install: npm install -g wscat)
wscat -c "wss://clipboard-sync-worker.ravi404606.workers.dev/ws?token=test123"

# Send test message
{"type":"ping","token":"test123"}
```

### View Worker Information
```bash
# List all workers
npx wrangler list

# Get worker details
npx wrangler get clipboard-sync-worker

# View worker logs
npx wrangler tail clipboard-sync-worker
```

### Durable Object Management
```bash
# List Durable Objects
npx wrangler durable-object list

# Get Durable Object details
npx wrangler durable-object get CLIPBOARD_SYNC <object-id>

# View Durable Object logs
npx wrangler durable-object tail CLIPBOARD_SYNC <object-id>
```

## Configuration

### wrangler.toml
```toml
name = "clipboard-sync-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[durable_objects.bindings]]
name = "CLIPBOARD_SYNC"
class_name = "ClipboardSyncDurableObject"

[[migrations]]
tag = "v1"
new_sqlite_classes = ["ClipboardSyncDurableObject"]
```

## Limits

- **Connections per room**: Unlimited (practical limit ~100)
- **History per room**: 50 items (configurable)
- **Message size**: 128KB (Cloudflare limit)
- **Storage**: 100MB per Durable Object (free plan)
