import { ClipboardItem, ClipboardRoom } from '../types';

export class ApiHandler {
  private room: ClipboardRoom;
  private state: DurableObjectState;

  constructor(room: ClipboardRoom, state: DurableObjectState) {
    this.room = room;
    this.state = state;
  }

  async handleClipboardAPI(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const token = pathParts[pathParts.length - 1];

    if (!token) {
      return new Response(JSON.stringify({ error: 'Token required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    switch (request.method) {
      case 'GET':
        return this.handleGetClipboardHistory();
      case 'POST':
        return this.handlePostClipboardUpdate(request);
      case 'DELETE':
        return this.handleClearHistory();
      default:
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
          status: 405,
          headers: { 'Content-Type': 'application/json' }
        });
    }
  }

  private async handleGetClipboardHistory(): Promise<Response> {
    return new Response(JSON.stringify({
      type: 'clipboard_history',
      token: this.room.token,
      history: this.room.history
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  private async handlePostClipboardUpdate(request: Request): Promise<Response> {
    try {
      const body = await request.json();
      
      if (!body.data?.content) {
        return new Response(JSON.stringify({ error: 'Content required' }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const item: ClipboardItem = {
        id: crypto.randomUUID(),
        content: body.data.content,
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

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Clipboard updated successfully',
        data: item
      }), {
        headers: { 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({ 
        error: 'Invalid JSON or request format' 
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  private async handleClearHistory(): Promise<Response> {
    this.room.history = [];
    this.room.lastActivity = Date.now();
    
    await this.state.storage.put(`room:${this.room.token}`, {
      token: this.room.token,
      history: this.room.history,
      lastActivity: this.room.lastActivity
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'History cleared successfully' 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
