import { ClipboardItem, ClipboardRoom } from '../types';

export class RoomManager {
  private state: DurableObjectState;
  private pingInterval: number | null = null;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async initializeRoom(token: string): Promise<ClipboardRoom> {
    const stored = await this.state.storage.get<{token: string, history: ClipboardItem[], lastActivity: number}>(`room:${token}`);
    
    const room: ClipboardRoom = {
      token,
      connections: new Map(),
      history: stored?.history || [],
      lastActivity: stored?.lastActivity || Date.now()
    };

    return room;
  }

  async saveRoom(room: ClipboardRoom): Promise<void> {
    await this.state.storage.put(`room:${room.token}`, {
      token: room.token,
      history: room.history,
      lastActivity: room.lastActivity
    });
  }

  startPingInterval(room: ClipboardRoom): void {
    if (this.pingInterval) return;

    this.pingInterval = setInterval(() => {
      this.cleanupStaleConnections(room);
    }, 30000);
  }

  stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private cleanupStaleConnections(room: ClipboardRoom): void {
    const now = Date.now();
    const staleThreshold = 60000;

    for (const [id, connection] of room.connections) {
      if (now - connection.lastPing > staleThreshold) {
        connection.websocket.close();
        room.connections.delete(id);
      }
    }
  }
}
