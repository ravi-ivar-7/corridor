import { ClipboardSyncDurableObject } from './durable-object';
import { WebSocketHandler } from './handlers/websocket-handler';
import { ApiHandler } from './handlers/api-handler';
import { RoomManager } from './handlers/room-manager';
import { handleLandingPage } from './handlers/landing-page-handler';

export { ClipboardSyncDurableObject };

export interface Env {
  CLIPBOARD_SYNC: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    if (url.pathname === '/ws') {
      return handleWebSocket(request, env);
    }

    if (url.pathname.startsWith('/api/clipboard/')) {
      return handleClipboardAPI(request, env);
    }

    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: Date.now() }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname === '/') {
      return handleLandingPage();
    }

    return new Response('Not Found', { status: 404 });
  },
};

async function handleWebSocket(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return new Response('Token required', { status: 400 });
  }

  if (!isValidToken(token)) {
    return new Response('Invalid token', { status: 401 });
  }

  const id = env.CLIPBOARD_SYNC.idFromName(token);
  const durableObject = env.CLIPBOARD_SYNC.get(id);
  
  return durableObject.fetch(request);
}

async function handleClipboardAPI(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/');
  const token = pathParts[pathParts.length - 1];

  if (!token) {
    return new Response(JSON.stringify({ error: 'Token required' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!isValidToken(token)) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const id = env.CLIPBOARD_SYNC.idFromName(token);
  const durableObject = env.CLIPBOARD_SYNC.get(id);
  
  return durableObject.fetch(request);
}

function handleCORS(): Response {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}


function isValidToken(token: string): boolean {
  if (!token || token.length < 3) return false;
  
  const tokenPattern = /^[a-zA-Z0-9_-]+$/;
  return tokenPattern.test(token);
}