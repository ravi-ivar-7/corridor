# Corridor Worker

A Cloudflare Worker that provides real-time clipboard synchronization using WebSockets and Durable Objects for the Corridor application.

## Features

- **Real-time WebSocket sync** - Instant clipboard synchronization across devices
- **HTTP API fallback** - REST endpoints for when WebSocket is unavailable
- **Token-based authentication** - Secure, isolated clipboard rooms
- **Persistent storage** - Clipboard history stored in Durable Objects
- **Modular architecture** - Clean separation of concerns for maintainability

## Deployment

### Prerequisites

- Node.js 18+
- Wrangler CLI
- Cloudflare account

### Environment Variables

Create a `.env` file in the worker directory:

```bash
# Cloudflare Account ID (required)
CLOUDFLARE_ACCOUNT_ID=your-account-id-here

# Worker name (configured in wrangler.toml)
# WORKER_NAME=corridor-worker

# Cloudflare API Token (required for deployment)
# Set this in your environment or create a .env file:
CLOUDFLARE_API_TOKEN=api-token

# Optional: Custom domain (if using custom domain)
# CUSTOM_DOMAIN=your-domain.com
```

Set these in your `wrangler.toml` or via `wrangler secret put`:

```bash
# No additional secrets required for basic functionality
# Durable Object bindings are configured in wrangler.toml
```

### Getting Your Cloudflare Account ID

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your account
3. Copy the Account ID from the right sidebar
4. Add it to your `.env` file

### Authentication

There are two ways to authenticate with Cloudflare:

#### Method 1: Direct Login (Recommended)
```bash
# Login to Cloudflare (if not already logged in)
wrangler auth login

# Verify authentication
npx wrangler whoami
```

#### Method 2: API Token (Alternative)
1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Create a custom token with:
   - **Permissions**: `Cloudflare Workers:Edit`
   - **Account Resources**: Include your account
   - **Zone Resources**: Include all zones (if needed)
3. Set the token as environment variable:
```bash
# Set API token
export CLOUDFLARE_API_TOKEN=your-api-token-here

# Or add to .env file
echo "CLOUDFLARE_API_TOKEN=api-token" >> .env

# Or set as environment variable (PowerShell)
$env:CLOUDFLARE_API_TOKEN="api-token"

# Or set as environment variable (Bash/Linux)
export CLOUDFLARE_API_TOKEN=api-token
```

### Deploy

```bash
# Install dependencies
npm install

# Deploy to Cloudflare
wrangler deploy

# Or deploy to staging
wrangler deploy --env staging
```

### Worker Name Configuration

Update the worker name in `wrangler.toml`:

```toml
name = "corridor-worker"
```

The domain will be automatically generated as: `https://corridor-worker.your-subdomain.workers.dev`

Where `your-subdomain` is your Cloudflare account subdomain (usually your account name).

### Custom Domain (Optional)

If you want to use a custom domain:

1. Add your domain to Cloudflare
2. Update `wrangler.toml` with custom routes
3. Set `CUSTOM_DOMAIN` in your `.env` file

## API Endpoints

### WebSocket
- **`/ws?token={token}`** - WebSocket connection for real-time sync

### HTTP API (NEW)
- **`GET /api/clipboard/{token}`** - Get clipboard history
- **`POST /api/clipboard/{token}`** - Send clipboard update
- **`DELETE /api/clipboard/{token}`** - Clear clipboard history

### Health Check
- **`GET /health`** - Service health status

## WebSocket Message Types

### Client → Server
- `ping` - Keep-alive ping
- `clipboard_update` - Send clipboard content
- `clipboard_history` - Request history
- `clear_history` - Clear history

### Server → Client
- `pong` - Ping response
- `clipboard_update` - New clipboard content
- `clipboard_history` - History data
- `error` - Error message

## HTTP API Examples

### Get Clipboard History
```bash
curl -X GET "https://corridor-worker.your-subdomain.workers.dev/api/clipboard/your-token"
```

### Send Clipboard Update
```bash
curl -X POST "https://corridor-worker.your-subdomain.workers.dev/api/clipboard/your-token" \
  -H "Content-Type: application/json" \
  -d '{"data": {"content": "Hello World"}}'
```

### Clear History
```bash
curl -X DELETE "https://corridor-worker.your-subdomain.workers.dev/api/clipboard/your-token"
```

## Architecture

The worker is organized into modular handlers for better maintainability:

### Core Files
- **`index.ts`** - Main entry point, handles routing and CORS
- **`durable-object.ts`** - Durable Object implementation, coordinates handlers
- **`types.ts`** - TypeScript type definitions

### Handler Modules
- **`handlers/websocket-handler.ts`** - WebSocket connection management
- **`handlers/api-handler.ts`** - HTTP API endpoints
- **`handlers/room-manager.ts`** - Room state management and persistence

## Testing

### Local Development
```bash
# Start local development server
wrangler dev

# Test WebSocket connection
wscat -c "wss://localhost:8787/ws?token=test123"

# Test HTTP API
curl -X GET "http://localhost:8787/api/clipboard/test123"
```

### Production Testing
```bash
# Test health endpoint
curl https://corridor-worker.your-subdomain.workers.dev/health

# Test WebSocket (requires WebSocket client)
# Test HTTP API
curl -X GET "https://corridor-worker.your-subdomain.workers.dev/api/clipboard/test123"
```

## Token Authentication

The worker uses token-based authentication:
- Tokens must be at least 3 characters long
- Only alphanumeric characters, hyphens, and underscores allowed
- Each token creates an isolated clipboard room
- No registration required - just use any valid token

### Token Format
- Minimum length: 3 characters
- Allowed characters: `a-z`, `A-Z`, `0-9`, `-`, `_`
- Examples: `abc123`, `my-token`, `device_1`

## Rate Limiting

- No built-in rate limiting (handled by Cloudflare)
- Durable Objects provide natural isolation per token
- Consider implementing rate limiting for production use

## Monitoring

- Check Cloudflare Workers dashboard for metrics
- Monitor Durable Object usage
- Set up alerts for error rates
- Use `wrangler tail` for real-time logs

## Troubleshooting

### Common Issues

1. **WebSocket connection fails**
   - Check if worker is deployed
   - Verify token format
   - Check browser console for errors

2. **HTTP API returns 404**
   - Ensure worker is deployed
   - Check endpoint URL format
   - Verify token in URL path

3. **Durable Object errors**
   - Check Cloudflare dashboard
   - Verify Durable Object bindings
   - Check storage limits

### Debug Commands

```bash
# View logs
wrangler tail

# Check deployment status
wrangler deployments list

# Test specific endpoint
wrangler dev --test-scheduled
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details