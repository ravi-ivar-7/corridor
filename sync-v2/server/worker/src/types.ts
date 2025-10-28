export interface ClipboardMessage {
  type: 'connect' | 'disconnect' | 'clipboard_update' | 'clipboard_history' | 'clear_history' | 'ping' | 'pong' | 'error';
  token: string;
  data?: {
    content: string;
    timestamp: number;
    id: string;
  };
  history?: ClipboardItem[];
  error?: string;
}

export interface ClipboardItem {
  id: string;
  content: string;
  timestamp: number;
}

export interface WebSocketConnection {
  id: string;
  websocket: WebSocket;
  token: string;
  lastPing: number;
}

export interface ClipboardRoom {
  token: string;
  connections: Map<string, WebSocketConnection>;
  history: ClipboardItem[];
  lastActivity: number;
}
