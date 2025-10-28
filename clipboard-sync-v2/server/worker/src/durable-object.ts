import { ClipboardMessage, ClipboardItem, WebSocketConnection, ClipboardRoom } from './types';

export class ClipboardSyncDurableObject {
  private state: DurableObjectState;
  private env: any;
  private room: ClipboardRoom | null = null;
  private pingInterval: number | null = null;

  constructor(state: DurableObjectState, env: any) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/ws') {
      return this.handleWebSocket(request);
    }
    
    return new Response('Not Found', { status: 404 });
  }

  private async handleWebSocket(request: Request): Promise<Response> {
    const token = this.extractToken(request);
    if (!token) {
      return new Response('Token required', { status: 400 });
    }

    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    await this.handleSession(server, token);

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  private extractToken(request: Request): string | null {
    const url = new URL(request.url);
    return url.searchParams.get('token');
  }

  private async handleSession(websocket: WebSocket, token: string): Promise<void> {
    websocket.accept();
    
    const connectionId = crypto.randomUUID();
    const connection: WebSocketConnection = {
      id: connectionId,
      websocket,
      token,
      lastPing: Date.now()
    };

    await this.initializeRoom(token);
    this.room!.connections.set(connectionId, connection);

    websocket.addEventListener('message', (event) => {
      this.handleMessage(connectionId, event.data);
    });

    websocket.addEventListener('close', () => {
      this.handleDisconnect(connectionId);
    });

    await this.sendHistory(connectionId);
    this.startPingInterval();
  }

  private async initializeRoom(token: string): Promise<void> {
    if (!this.room) {
      const stored = await this.state.storage.get<{token: string, history: ClipboardItem[], lastActivity: number}>(`room:${token}`);
      this.room = {
        token,
        connections: new Map(),
        history: stored?.history || [],
        lastActivity: stored?.lastActivity || Date.now()
      };
    }
  }

  private async handleMessage(connectionId: string, data: string): Promise<void> {
    try {
      const message: ClipboardMessage = JSON.parse(data);
      
      switch (message.type) {
        case 'ping':
          await this.handlePing(connectionId);
          break;
        case 'clipboard_update':
          await this.handleClipboardUpdate(connectionId, message);
          break;
        case 'clipboard_history':
          await this.sendHistory(connectionId);
          break;
        case 'clear_history':
          await this.handleClearHistory(connectionId);
          break;
        default:
          await this.sendError(connectionId, `Unknown message type: ${message.type}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.sendError(connectionId, `JSON parse error: ${errorMessage}`);
    }
  }

  private async handlePing(connectionId: string): Promise<void> {
    const connection = this.room?.connections.get(connectionId);
    if (connection) {
      connection.lastPing = Date.now();
      connection.websocket.send(JSON.stringify({ type: 'pong' }));
    }
  }

  private async handleClipboardUpdate(connectionId: string, message: ClipboardMessage): Promise<void> {
    if (!message.data?.content) {
      return;
    }

    const item: ClipboardItem = {
      id: crypto.randomUUID(),
      content: message.data.content,
      timestamp: Date.now()
    };

    this.room!.history.unshift(item);
    this.room!.history = this.room!.history.slice(0, 50);
    this.room!.lastActivity = Date.now();

    await this.state.storage.put(`room:${this.room!.token}`, {
      token: this.room!.token,
      history: this.room!.history,
      lastActivity: this.room!.lastActivity
    });

    await this.broadcastToAll({
      type: 'clipboard_update',
      token: this.room!.token,
      data: item
    });
  }

  private async sendHistory(connectionId: string): Promise<void> {
    const connection = this.room?.connections.get(connectionId);
    if (connection) {
      connection.websocket.send(JSON.stringify({
        type: 'clipboard_history',
        token: this.room!.token,
        history: this.room!.history
      }));
    }
  }

  private async handleClearHistory(connectionId: string): Promise<void> {
    this.room!.history = [];
    this.room!.lastActivity = Date.now();
    
    await this.state.storage.put(`room:${this.room!.token}`, {
      token: this.room!.token,
      history: this.room!.history,
      lastActivity: this.room!.lastActivity
    });
    
    await this.broadcastToAll({
      type: 'clipboard_history',
      token: this.room!.token,
      history: []
    });
  }

  private async broadcastToAll(message: ClipboardMessage): Promise<void> {
    for (const [id, connection] of this.room!.connections) {
      try {
        connection.websocket.send(JSON.stringify(message));
      } catch (error) {
        this.room!.connections.delete(id);
      }
    }
  }

  private async broadcastToOthers(senderId: string, message: ClipboardMessage): Promise<void> {
    for (const [id, connection] of this.room!.connections) {
      if (id !== senderId) {
        try {
          connection.websocket.send(JSON.stringify(message));
        } catch (error) {
          this.room!.connections.delete(id);
        }
      }
    }
  }

  private async sendError(connectionId: string, error: string): Promise<void> {
    const connection = this.room?.connections.get(connectionId);
    if (connection) {
      connection.websocket.send(JSON.stringify({
        type: 'error',
        token: this.room!.token,
        error
      }));
    }
  }

  private handleDisconnect(connectionId: string): void {
    this.room?.connections.delete(connectionId);
    
    if (this.room && this.room.connections.size === 0) {
      this.stopPingInterval();
    }
  }

  private startPingInterval(): void {
    if (this.pingInterval) return;

    this.pingInterval = setInterval(() => {
      this.cleanupStaleConnections();
    }, 30000);
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private cleanupStaleConnections(): void {
    const now = Date.now();
    const staleThreshold = 60000;

    for (const [id, connection] of this.room!.connections) {
      if (now - connection.lastPing > staleThreshold) {
        connection.websocket.close();
        this.room!.connections.delete(id);
      }
    }
  }
}
