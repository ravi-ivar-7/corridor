import { ClipboardMessage, ClipboardItem, WebSocketConnection, ClipboardRoom } from './types';
import { WebSocketHandler } from './handlers/websocket-handler';
import { ApiHandler } from './handlers/api-handler';
import { RoomManager } from './handlers/room-manager';

export class ClipboardSyncDurableObject {
  private state: DurableObjectState;
  private env: any;
  private room: ClipboardRoom | null = null;
  private roomManager: RoomManager;
  private websocketHandler: WebSocketHandler | null = null;
  private apiHandler: ApiHandler | null = null;

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
    this.roomManager = new RoomManager(state);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/ws') {
      return this.handleWebSocket(request);
    }
    
    if (url.pathname.startsWith('/api/clipboard/')) {
      return this.handleClipboardAPI(request);
    }
    
    return new Response('Not Found', { status: 404 });
  }

  private async handleWebSocket(request: Request): Promise<Response> {
    const token = this.extractToken(request);
    if (!token) {
      return new Response('Token required', { status: 400 });
    }

    // Initialize room if not exists
    if (!this.room) {
      this.room = await this.roomManager.initializeRoom(token);
    }

    // Create WebSocket handler
    this.websocketHandler = new WebSocketHandler(this.room, this.state);
    
    // Start ping interval for this room
    this.roomManager.startPingInterval(this.room);

    return this.websocketHandler.handleWebSocket(request);
  }

  private async handleClipboardAPI(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const token = pathParts[pathParts.length - 1];

    if (!token) {
      return new Response(JSON.stringify({ error: 'Token required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Initialize room if not exists
    if (!this.room) {
      this.room = await this.roomManager.initializeRoom(token);
    }

    // Create API handler
    this.apiHandler = new ApiHandler(this.room, this.state);

    const response = await this.apiHandler.handleClipboardAPI(request);
    
    // Save room state after API operations
    await this.roomManager.saveRoom(this.room);
    
    return response;
  }

  private extractToken(request: Request): string | null {
    const url = new URL(request.url);
    return url.searchParams.get('token');
  }
}