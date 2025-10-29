var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/handlers/websocket-handler.ts
var WebSocketHandler = class {
  static {
    __name(this, "WebSocketHandler");
  }
  room;
  state;
  constructor(room, state) {
    this.room = room;
    this.state = state;
  }
  async handleWebSocket(request) {
    try {
      const token = this.extractToken(request);
      if (!token) {
        return new Response("Token required", { status: 400 });
      }
      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);
      await this.handleSession(server, token);
      return new Response(null, {
        status: 101,
        webSocket: client
      });
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error("WebSocket error:", error);
      return new Response(`WebSocket error: ${errMsg}`, { status: 500 });
    }
  }
  async handleSession(websocket, token) {
    try {
      websocket.accept();
      const connectionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const connection = {
        id: connectionId,
        websocket,
        token,
        lastPing: Date.now()
      };
      this.room.connections.set(connectionId, connection);
      websocket.addEventListener("message", (event) => {
        this.handleMessage(connectionId, event.data);
      });
      websocket.addEventListener("close", () => {
        this.handleDisconnect(connectionId);
      });
      await this.sendHistory(connectionId);
    } catch (error) {
      console.error("WebSocket session error:", error);
      throw error;
    }
  }
  async handleMessage(connectionId, data) {
    try {
      const message = JSON.parse(data);
      switch (message.type) {
        case "ping":
          await this.handlePing(connectionId);
          break;
        case "clipboard_update":
          await this.handleClipboardUpdate(connectionId, message);
          break;
        case "clipboard_history":
          await this.sendHistory(connectionId);
          break;
        case "clear_history":
          await this.handleClearHistory();
          break;
        default:
          await this.sendError(connectionId, `Unknown message type: ${message.type}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      await this.sendError(connectionId, `JSON parse error: ${errorMessage}`);
    }
  }
  async handlePing(connectionId) {
    const connection = this.room.connections.get(connectionId);
    if (connection) {
      connection.lastPing = Date.now();
      connection.websocket.send(JSON.stringify({ type: "pong" }));
    }
  }
  async handleClipboardUpdate(connectionId, message) {
    if (!message.data?.content) {
      return;
    }
    const item = {
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
      type: "clipboard_update",
      token: this.room.token,
      data: item
    });
  }
  async sendHistory(connectionId) {
    const connection = this.room.connections.get(connectionId);
    if (connection) {
      connection.websocket.send(JSON.stringify({
        type: "clipboard_history",
        token: this.room.token,
        history: this.room.history
      }));
    }
  }
  async handleClearHistory() {
    this.room.history = [];
    this.room.lastActivity = Date.now();
    await this.state.storage.put(`room:${this.room.token}`, {
      token: this.room.token,
      history: this.room.history,
      lastActivity: this.room.lastActivity
    });
    await this.broadcastToAll({
      type: "clipboard_history",
      token: this.room.token,
      history: []
    });
  }
  async broadcastToAll(message) {
    for (const [id, connection] of this.room.connections) {
      try {
        connection.websocket.send(JSON.stringify(message));
      } catch (error) {
        this.room.connections.delete(id);
      }
    }
  }
  async broadcastToOthers(senderId, message) {
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
  async sendError(connectionId, error) {
    const connection = this.room.connections.get(connectionId);
    if (connection) {
      connection.websocket.send(JSON.stringify({
        type: "error",
        token: this.room.token,
        error
      }));
    }
  }
  handleDisconnect(connectionId) {
    this.room.connections.delete(connectionId);
  }
  extractToken(request) {
    const url = new URL(request.url);
    return url.searchParams.get("token");
  }
};

// src/handlers/api-handler.ts
var ApiHandler = class {
  static {
    __name(this, "ApiHandler");
  }
  room;
  state;
  constructor(room, state) {
    this.room = room;
    this.state = state;
  }
  async handleClipboardAPI(request) {
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    const token = pathParts[pathParts.length - 1];
    if (!token) {
      return new Response(JSON.stringify({ error: "Token required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    switch (request.method) {
      case "GET":
        return this.handleGetClipboardHistory();
      case "POST":
        return this.handlePostClipboardUpdate(request);
      case "DELETE":
        return this.handleClearHistory();
      default:
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
          status: 405,
          headers: { "Content-Type": "application/json" }
        });
    }
  }
  async handleGetClipboardHistory() {
    return new Response(JSON.stringify({
      type: "clipboard_history",
      token: this.room.token,
      history: this.room.history
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }
  async handlePostClipboardUpdate(request) {
    try {
      const body = await request.json();
      if (!body.data?.content) {
        return new Response(JSON.stringify({ error: "Content required" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      const item = {
        id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
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
        message: "Clipboard updated successfully",
        data: item
      }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        error: "Invalid JSON or request format"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
  async handleClearHistory() {
    this.room.history = [];
    this.room.lastActivity = Date.now();
    await this.state.storage.put(`room:${this.room.token}`, {
      token: this.room.token,
      history: this.room.history,
      lastActivity: this.room.lastActivity
    });
    return new Response(JSON.stringify({
      success: true,
      message: "History cleared successfully"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }
};

// src/handlers/room-manager.ts
var RoomManager = class {
  static {
    __name(this, "RoomManager");
  }
  state;
  pingInterval = null;
  constructor(state) {
    this.state = state;
  }
  async initializeRoom(token) {
    const stored = await this.state.storage.get(`room:${token}`);
    const room = {
      token,
      connections: /* @__PURE__ */ new Map(),
      history: stored?.history || [],
      lastActivity: stored?.lastActivity || Date.now()
    };
    return room;
  }
  async saveRoom(room) {
    await this.state.storage.put(`room:${room.token}`, {
      token: room.token,
      history: room.history,
      lastActivity: room.lastActivity
    });
  }
  startPingInterval(room) {
    if (this.pingInterval) return;
    this.pingInterval = setInterval(() => {
      this.cleanupStaleConnections(room);
    }, 3e4);
  }
  stopPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
  cleanupStaleConnections(room) {
    const now = Date.now();
    const staleThreshold = 6e4;
    for (const [id, connection] of room.connections) {
      if (now - connection.lastPing > staleThreshold) {
        connection.websocket.close();
        room.connections.delete(id);
      }
    }
  }
};

// src/durable-object.ts
var ClipboardSyncDurableObject = class {
  static {
    __name(this, "ClipboardSyncDurableObject");
  }
  state;
  env;
  room = null;
  roomManager;
  websocketHandler = null;
  apiHandler = null;
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.roomManager = new RoomManager(state);
  }
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/ws") {
      return this.handleWebSocket(request);
    }
    if (url.pathname.startsWith("/api/clipboard/")) {
      return this.handleClipboardAPI(request);
    }
    return new Response("Not Found", { status: 404 });
  }
  async handleWebSocket(request) {
    const token = this.extractToken(request);
    if (!token) {
      return new Response("Token required", { status: 400 });
    }
    if (!this.room) {
      this.room = await this.roomManager.initializeRoom(token);
    }
    this.websocketHandler = new WebSocketHandler(this.room, this.state);
    this.roomManager.startPingInterval(this.room);
    return this.websocketHandler.handleWebSocket(request);
  }
  async handleClipboardAPI(request) {
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    const token = pathParts[pathParts.length - 1];
    if (!token) {
      return new Response(JSON.stringify({ error: "Token required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!this.room) {
      this.room = await this.roomManager.initializeRoom(token);
    }
    this.apiHandler = new ApiHandler(this.room, this.state);
    const response = await this.apiHandler.handleClipboardAPI(request);
    await this.roomManager.saveRoom(this.room);
    return response;
  }
  extractToken(request) {
    const url = new URL(request.url);
    return url.searchParams.get("token");
  }
};

// src/handlers/landing-page-handler.ts
function handleLandingPage() {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Corridor - Real-time Clipboard Sync</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .container {
            max-width: 800px;
            padding: 2rem;
            text-align: center;
        }
        .logo { font-size: 3rem; font-weight: bold; margin-bottom: 1rem; }
        .subtitle { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9; }
        .card {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 2rem;
            margin: 2rem 0;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .feature { margin: 1rem 0; }
        .feature h3 { margin-bottom: 0.5rem; }
        .links { margin-top: 2rem; }
        .link {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            text-decoration: none;
            padding: 0.8rem 1.5rem;
            border-radius: 10px;
            margin: 0.5rem;
            transition: all 0.3s ease;
        }
        .link:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
        .api-info {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 10px;
            padding: 1rem;
            margin: 1rem 0;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
        }
        .status { 
            display: inline-block;
            background: #4ade80;
            color: #065f46;
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: bold;
            margin-bottom: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="status">\u{1F7E2} ONLINE</div>
        <h1 class="logo">Corridor</h1>
        <p class="subtitle">Real-time clipboard synchronization across devices</p>
        
        <div class="card">
            <h2>\u{1F680} Features</h2>
            <div class="feature">
                <h3>Real-time Sync</h3>
                <p>Instant clipboard synchronization across all your devices</p>
            </div>
            <div class="feature">
                <h3>WebSocket & HTTP</h3>
                <p>Dual communication protocols for maximum reliability</p>
            </div>
            <div class="feature">
                <h3>Token-based Security</h3>
                <p>Secure, isolated clipboard rooms with simple token authentication</p>
            </div>
            <div class="feature">
                <h3>Cross-platform</h3>
                <p>Works on Windows, Web, and any device with a browser</p>
            </div>
        </div>

        <div class="card">
            <h2>\u{1F517} Quick Links</h2>
            <div class="links">
                <a href="https://corridor-web.vercel.app" class="link">\u{1F310} Web App</a>
                <a href="https://github.com/yourusername/corridor" class="link">\u{1F4F1} Windows Client</a>
                <a href="/health" class="link">\u2764\uFE0F Health Check</a>
            </div>
        </div>

        <div class="card">
            <h2>\u{1F527} API Endpoints</h2>
            <div class="api-info">
                <strong>WebSocket:</strong> wss://corridor-worker.corridor-sync.workers.dev/ws?token=YOUR_TOKEN<br>
                <strong>HTTP API:</strong> https://corridor-worker.corridor-sync.workers.dev/api/clipboard/YOUR_TOKEN<br>
                <strong>Health:</strong> https://corridor-worker.corridor-sync.workers.dev/health
            </div>
        </div>

        <div class="card">
            <h2>\u{1F4D6} How to Use</h2>
            <p>1. Visit the <a href="https://corridor-web.vercel.app" style="color: #93c5fd;">web app</a> or download the Windows client</p>
            <p>2. Create or enter a token to join a clipboard room</p>
            <p>3. Start copying and pasting - it syncs in real-time!</p>
        </div>
    </div>
</body>
</html>`;
  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
__name(handleLandingPage, "handleLandingPage");

// src/index.ts
var src_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return handleCORS();
    }
    if (url.pathname === "/ws") {
      return handleWebSocket(request, env);
    }
    if (url.pathname.startsWith("/api/clipboard/")) {
      return handleClipboardAPI(request, env);
    }
    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok", timestamp: Date.now() }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    if (url.pathname === "/") {
      return handleLandingPage();
    }
    return new Response("Not Found", { status: 404 });
  }
};
async function handleWebSocket(request, env) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return new Response("Token required", { status: 400 });
  }
  if (!isValidToken(token)) {
    return new Response("Invalid token", { status: 401 });
  }
  const id = env.CLIPBOARD_SYNC.idFromName(token);
  const durableObject = env.CLIPBOARD_SYNC.get(id);
  return durableObject.fetch(request);
}
__name(handleWebSocket, "handleWebSocket");
async function handleClipboardAPI(request, env) {
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/");
  const token = pathParts[pathParts.length - 1];
  if (!token) {
    return new Response(JSON.stringify({ error: "Token required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }
  if (!isValidToken(token)) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }
  const id = env.CLIPBOARD_SYNC.idFromName(token);
  const durableObject = env.CLIPBOARD_SYNC.get(id);
  return durableObject.fetch(request);
}
__name(handleClipboardAPI, "handleClipboardAPI");
function handleCORS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    }
  });
}
__name(handleCORS, "handleCORS");
function isValidToken(token) {
  if (!token || token.length < 3) return false;
  const tokenPattern = /^[a-zA-Z0-9_-]+$/;
  return tokenPattern.test(token);
}
__name(isValidToken, "isValidToken");

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-BgEtyy/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-BgEtyy/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  ClipboardSyncDurableObject,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
