#!/usr/bin/env python3
"""
WebSocket Client for Corridor Linux Client
Handles real-time clipboard synchronization via WebSocket
"""

import asyncio
import json
import logging
from typing import Optional, Callable, Dict, Any, List
from datetime import datetime
import websockets
from websockets.client import WebSocketClientProtocol
from websockets.exceptions import ConnectionClosed, WebSocketException


logger = logging.getLogger(__name__)


class HistoryItem:
    """Represents a clipboard history item"""

    def __init__(self, id: str, content: str, timestamp: int):
        self.id = id
        self.content = content
        self.timestamp = timestamp

    def __repr__(self) -> str:
        return f"HistoryItem(id={self.id}, timestamp={self.timestamp}, content={self.content[:50]}...)"


class WebSocketClient:
    """WebSocket client for clipboard synchronization"""

    PING_INTERVAL = 30  # seconds
    PONG_TIMEOUT = 60   # seconds
    RECONNECT_DELAY = 5 # seconds

    def __init__(
        self,
        token: str,
        websocket_url: str,
        on_clipboard_update: Optional[Callable[[str], None]] = None,
        on_status_change: Optional[Callable[[str], None]] = None,
        on_error: Optional[Callable[[str], None]] = None,
        on_history: Optional[Callable[[List[HistoryItem]], None]] = None
    ):
        """Initialize WebSocket client

        Args:
            token: Authentication token
            websocket_url: Base WebSocket URL (e.g., wss://server/ws)
            on_clipboard_update: Callback for clipboard updates
            on_status_change: Callback for status changes (connecting/connected/disconnected)
            on_error: Callback for errors
            on_history: Callback for clipboard history
        """
        self.token = token
        self.websocket_url = websocket_url
        self.on_clipboard_update = on_clipboard_update
        self.on_status_change = on_status_change
        self.on_error = on_error
        self.on_history = on_history

        self.ws: Optional[WebSocketClientProtocol] = None
        self.is_connected = False
        self.should_run = True
        self.last_pong_time = 0

        self._ping_task: Optional[asyncio.Task] = None
        self._receive_task: Optional[asyncio.Task] = None
        self._pong_timeout_task: Optional[asyncio.Task] = None

    async def connect(self) -> bool:
        """Connect to WebSocket server

        Returns:
            True if connected successfully
        """
        try:
            url = f"{self.websocket_url}?token={self.token}"
            logger.info(f"Connecting to WebSocket: {url}")
            self._emit_status("connecting")

            self.ws = await websockets.connect(url)
            self.is_connected = True
            self.last_pong_time = asyncio.get_event_loop().time()

            logger.info("WebSocket connected")
            self._emit_status("connected")

            # Start background tasks
            self._ping_task = asyncio.create_task(self._ping_loop())
            self._pong_timeout_task = asyncio.create_task(self._pong_timeout_loop())
            self._receive_task = asyncio.create_task(self._receive_loop())

            return True
        except Exception as e:
            logger.error(f"Connection failed: {e}")
            self._emit_error(f"Connection failed: {e}")
            self.is_connected = False
            return False

    async def disconnect(self) -> None:
        """Disconnect from WebSocket server"""
        self.should_run = False

        # Cancel tasks
        for task in [self._ping_task, self._receive_task, self._pong_timeout_task]:
            if task and not task.done():
                task.cancel()
                try:
                    await task
                except asyncio.CancelledError:
                    pass

        # Close connection
        if self.ws:
            try:
                await self.ws.close()
            except Exception as e:
                logger.warning(f"Error closing WebSocket: {e}")

        self.is_connected = False
        self._emit_status("disconnected")
        logger.info("WebSocket disconnected")

    async def send_clipboard_update(self, content: str) -> bool:
        """Send clipboard update to server

        Args:
            content: Clipboard content

        Returns:
            True if sent successfully
        """
        if not self.is_connected or not self.ws:
            logger.warning("Cannot send: not connected")
            return False

        try:
            message = {
                "type": "clipboard_update",
                "data": {
                    "content": content,
                    "timestamp": int(datetime.now().timestamp() * 1000)
                }
            }
            await self.ws.send(json.dumps(message))
            logger.debug(f"Sent clipboard update: {content[:50]}...")
            return True
        except Exception as e:
            logger.error(f"Failed to send clipboard update: {e}")
            self._emit_error(f"Send failed: {e}")
            return False

    async def _receive_loop(self) -> None:
        """Receive messages from WebSocket"""
        try:
            async for message in self.ws:
                try:
                    data = json.loads(message)
                    await self._handle_message(data)
                except json.JSONDecodeError as e:
                    logger.error(f"Invalid JSON received: {e}")
                    self._emit_error(f"Invalid message: {e}")
        except ConnectionClosed:
            logger.warning("WebSocket connection closed")
            self.is_connected = False
            self._emit_status("disconnected")
        except Exception as e:
            logger.error(f"Receive loop error: {e}")
            self._emit_error(f"Connection error: {e}")
            self.is_connected = False
            self._emit_status("disconnected")

    async def _handle_message(self, data: Dict[str, Any]) -> None:
        """Handle received WebSocket message

        Args:
            data: Parsed JSON message
        """
        msg_type = data.get("type")

        if msg_type == "clipboard_update":
            # Remote clipboard update
            msg_data = data.get("data", {})
            content = msg_data.get("content", "")
            logger.debug(f"Received clipboard update: {content[:50]}...")

            if self.on_clipboard_update:
                self.on_clipboard_update(content)

        elif msg_type == "pong":
            # Pong response to ping
            self.last_pong_time = asyncio.get_event_loop().time()
            logger.debug("Received pong")

        elif msg_type == "clipboard_history":
            # Clipboard history
            history_data = data.get("history", [])
            history_items = [
                HistoryItem(
                    id=item.get("id", ""),
                    content=item.get("content", ""),
                    timestamp=item.get("timestamp", 0)
                )
                for item in history_data
            ]
            logger.info(f"Received clipboard history: {len(history_items)} items")

            if self.on_history:
                self.on_history(history_items)

        elif msg_type == "error":
            # Error message from server
            error = data.get("error", "Unknown error")
            logger.error(f"Server error: {error}")
            self._emit_error(f"Server error: {error}")

        else:
            logger.warning(f"Unknown message type: {msg_type}")

    async def _ping_loop(self) -> None:
        """Send periodic ping messages"""
        try:
            while self.should_run and self.is_connected:
                await asyncio.sleep(self.PING_INTERVAL)

                if self.ws and self.is_connected:
                    try:
                        await self.ws.send(json.dumps({"type": "ping"}))
                        logger.debug("Ping sent")
                    except Exception as e:
                        logger.error(f"Failed to send ping: {e}")
        except asyncio.CancelledError:
            pass

    async def _pong_timeout_loop(self) -> None:
        """Monitor pong responses and disconnect if timeout"""
        try:
            while self.should_run and self.is_connected:
                await asyncio.sleep(10)  # Check every 10 seconds

                if self.is_connected:
                    time_since_pong = asyncio.get_event_loop().time() - self.last_pong_time

                    if time_since_pong > self.PONG_TIMEOUT:
                        logger.warning(f"Pong timeout ({time_since_pong:.0f}s), disconnecting")
                        await self.disconnect()
                        break
        except asyncio.CancelledError:
            pass

    def _emit_status(self, status: str) -> None:
        """Emit status change event"""
        if self.on_status_change:
            self.on_status_change(status)

    def _emit_error(self, error: str) -> None:
        """Emit error event"""
        if self.on_error:
            self.on_error(error)


async def main():
    """Test WebSocket client"""
    logging.basicConfig(level=logging.DEBUG)

    def on_clipboard(content: str):
        print(f"📋 Clipboard update: {content[:100]}")

    def on_status(status: str):
        print(f"📶 Status: {status}")

    def on_error(error: str):
        print(f"❌ Error: {error}")

    def on_history(items: List[HistoryItem]):
        print(f"📚 History: {len(items)} items")
        for item in items[:5]:
            print(f"  - {item}")

    client = WebSocketClient(
        token="test-token",
        websocket_url="wss://corridor-worker.corridor-sync.workers.dev/ws",
        on_clipboard_update=on_clipboard,
        on_status_change=on_status,
        on_error=on_error,
        on_history=on_history
    )

    await client.connect()
    await asyncio.sleep(5)
    await client.send_clipboard_update("Hello from Linux!")
    await asyncio.sleep(60)
    await client.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
