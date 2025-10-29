import { ClipboardMessage, ClipboardItem, WebSocketConnection, ClipboardRoom } from '../types';

export class WebSocketHandler {
  private room: ClipboardRoom;
  private state: DurableObjectState;

  constructor(room: ClipboardRoom, state: DurableObjectState) {
    this.room = room;
    this.state = state;
  }

  async handleWebSocket(request: Request): Promise<Response> {
    try {
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
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error('WebSocket error:', error);
      return new Response(`WebSocket error: ${errMsg}`, { status: 500 });
    }
  }

  private async handleSession(websocket: WebSocket, token: string): Promise<void> {
    try {
      websocket.accept();
      
      const connectionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const connection: WebSocketConnection = {
        id: connectionId,
        websocket,
        token,
        lastPing: Date.now()
      };

      this.room.connections.set(connectionId, connection);

      websocket.addEventListener('message', (event) => {
        this.handleMessage(connectionId, event.data);
      });

      websocket.addEventListener('close', () => {
        this.handleDisconnect(connectionId);
      });

      await this.sendHistory(connectionId);
    } catch (error) {
      console.error('WebSocket session error:', error);
      throw error;
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
          await this.handleClearHistory();
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
    const connection = this.room.connections.get(connectionId);
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
      id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      content: message.data.content,
      timestamp: Date.now()
    };

    this.room.history.unshift(item);
    this.room.history = this.room.history.slice(0, 50);
    this.room.lastActivity = Date.now();

    await this.state.storage.put(`room:${this.room.token}`, {
      token: this.room.token,
      history: this.room.history,
      lastActivity: this.room.lastActivity
    });

    await this.broadcastToAll({
      type: 'clipboard_update',
      token: this.room.token,
      data: item
    });
  }

  private async sendHistory(connectionId: string): Promise<void> {
    const connection = this.room.connections.get(connectionId);
    if (connection) {
      connection.websocket.send(JSON.stringify({
        type: 'clipboard_history',
        token: this.room.token,
        history: this.room.history
      }));
    }
  }

  private async handleClearHistory(): Promise<void> {
    this.room.history = [];
    this.room.lastActivity = Date.now();
    
    await this.state.storage.put(`room:${this.room.token}`, {
      token: this.room.token,
      history: this.room.history,
      lastActivity: this.room.lastActivity
    });
    
    await this.broadcastToAll({
      type: 'clipboard_history',
      token: this.room.token,
      history: []
    });
  }

  private async broadcastToAll(message: ClipboardMessage): Promise<void> {
    for (const [id, connection] of this.room.connections) {
      try {
        connection.websocket.send(JSON.stringify(message));
      } catch (error) {
        this.room.connections.delete(id);
      }
    }
  }

  private async broadcastToOthers(senderId: string, message: ClipboardMessage): Promise<void> {
    for (const [id, connection] of this.room.connections) {
      if (id !== senderId) {
        try {
          connection.websocket.send(JSON.stringify(message));
        } catch (error) {
          this.room.connections.delete(id);
        }
      }
    }
  }

  private async sendError(connectionId: string, error: string): Promise<void> {
    const connection = this.room.connections.get(connectionId);
    if (connection) {
      connection.websocket.send(JSON.stringify({
        type: 'error',
        token: this.room.token,
        error
      }));
    }
  }

  private handleDisconnect(connectionId: string): void {
    this.room.connections.delete(connectionId);
  }

  private extractToken(request: Request): string | null {
    const url = new URL(request.url);
    return url.searchParams.get('token');
  }
}
