#!/usr/bin/env python3
"""
Corridor Linux Client - Main Entry Point
Real-time clipboard synchronization for Linux
"""

import sys
import asyncio
import logging
import signal
import argparse
from pathlib import Path
from typing import Optional

# Add src directory to path
sys.path.insert(0, str(Path(__file__).parent))

from config_manager import ConfigManager
from websocket_client import WebSocketClient, HistoryItem
from clipboard_manager import ClipboardManager
from notification import NotificationManager, NotificationType


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class CorridorApp:
    """Main Corridor application"""

    def __init__(self, config_manager: ConfigManager, silent: bool = False):
        """Initialize application

        Args:
            config_manager: Configuration manager
            silent: Run in silent mode (no GUI)
        """
        self.config_manager = config_manager
        self.silent = silent or config_manager.get("mode") == "silent"

        # Components
        self.ws_client: Optional[WebSocketClient] = None
        self.clipboard_manager: Optional[ClipboardManager] = None
        self.notifier: Optional[NotificationManager] = None

        # State
        self.is_running = False
        self.should_exit = False

    async def start(self) -> None:
        """Start the application"""
        logger.info("Starting Corridor Linux Client...")

        # Check if configured
        if not self.config_manager.is_configured():
            logger.error("Application not configured!")
            print("❌ Corridor is not configured.")
            print("Please run: corridor --setup")
            return

        # Initialize components
        self._initialize_components()

        # Start components
        await self._start_components()

        # Setup signal handlers
        self._setup_signal_handlers()

        # Run event loop
        self.is_running = True
        logger.info("✓ Corridor is running")

        if not self.silent:
            print("✓ Corridor clipboard sync is active")
            print("Press Ctrl+C to stop")

        # Keep running until stopped
        try:
            while self.is_running and not self.should_exit:
                await asyncio.sleep(1)
        except KeyboardInterrupt:
            logger.info("Received keyboard interrupt")

        # Cleanup
        await self.stop()

    async def stop(self) -> None:
        """Stop the application"""
        logger.info("Stopping Corridor...")
        self.is_running = False

        # Stop components
        if self.clipboard_manager:
            await self.clipboard_manager.stop_monitoring()

        if self.ws_client:
            await self.ws_client.disconnect()

        logger.info("✓ Corridor stopped")

    def _initialize_components(self) -> None:
        """Initialize application components"""
        # Notification manager
        self.notifier = NotificationManager("Corridor")

        # Configure notifications
        notif_config = self.config_manager.get("notifications", {})
        if not notif_config.get("remote_update", True) and not notif_config.get("errors", True):
            self.notifier.set_enabled(False)

        # Clipboard manager
        monitor_interval = self.config_manager.get("clipboard.monitor_interval", 500) / 1000.0
        self.clipboard_manager = ClipboardManager(
            on_clipboard_change=self._on_local_clipboard_change,
            monitor_interval=monitor_interval
        )

        # WebSocket client
        self.ws_client = WebSocketClient(
            token=self.config_manager.get("token"),
            websocket_url=self.config_manager.get("websocket_url"),
            on_clipboard_update=self._on_remote_clipboard_update,
            on_status_change=self._on_status_change,
            on_error=self._on_error,
            on_history=self._on_history
        )

    async def _start_components(self) -> None:
        """Start application components"""
        # Start clipboard monitoring
        await self.clipboard_manager.start_monitoring()

        # Connect to WebSocket
        connected = await self.ws_client.connect()
        if not connected:
            logger.error("Failed to connect to server")
            if self.notifier:
                self.notifier.notify_error("Failed to connect to server")

    def _on_local_clipboard_change(self, content: str) -> None:
        """Handle local clipboard change

        Args:
            content: Clipboard content
        """
        logger.debug(f"Local clipboard changed: {content[:50]}...")

        # Send to server
        if self.ws_client and self.ws_client.is_connected:
            asyncio.create_task(self.ws_client.send_clipboard_update(content))

            # Notify if enabled
            if self.config_manager.get("notifications.local_copy", False):
                if self.notifier:
                    self.notifier.notify_clipboard_update(content, is_local=True)

    def _on_remote_clipboard_update(self, content: str) -> None:
        """Handle remote clipboard update

        Args:
            content: Clipboard content from remote
        """
        logger.debug(f"Remote clipboard update: {content[:50]}...")

        # Update local clipboard
        if self.clipboard_manager:
            self.clipboard_manager.set_clipboard(content, from_remote=True)

        # Notify if enabled
        if self.config_manager.get("notifications.remote_update", True):
            if self.notifier:
                self.notifier.notify_clipboard_update(content, is_local=False)

    def _on_status_change(self, status: str) -> None:
        """Handle WebSocket status change

        Args:
            status: New status (connecting/connected/disconnected)
        """
        logger.info(f"Status: {status}")

        if status == "connected":
            if self.notifier and self.config_manager.get("notifications.remote_update", True):
                self.notifier.notify_connected()
        elif status == "disconnected":
            if self.notifier and self.config_manager.get("notifications.errors", True):
                self.notifier.notify_disconnected()

    def _on_error(self, error: str) -> None:
        """Handle error

        Args:
            error: Error message
        """
        logger.error(f"Error: {error}")

        if self.notifier and self.config_manager.get("notifications.errors", True):
            self.notifier.notify_error(error)

    def _on_history(self, items: list) -> None:
        """Handle clipboard history

        Args:
            items: List of HistoryItem objects
        """
        logger.info(f"Received clipboard history: {len(items)} items")
        # TODO: Store history locally for history viewer

    def _setup_signal_handlers(self) -> None:
        """Setup signal handlers for graceful shutdown"""
        def signal_handler(sig, frame):
            logger.info(f"Received signal {sig}")
            self.should_exit = True

        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)


def run_cli_setup() -> None:
    """Run CLI setup wizard"""
    print("=" * 50)
    print("Corridor Linux Client - Setup")
    print("=" * 50)

    config_manager = ConfigManager()

    # Token
    current_token = config_manager.get("token", "")
    if current_token:
        print(f"\nCurrent token: {current_token}")
        use_current = input("Keep current token? (Y/n): ").strip().lower()
        if use_current != 'n':
            token = current_token
        else:
            token = input("Enter your token: ").strip()
    else:
        token = input("Enter your token: ").strip()

    if not token:
        print("❌ Token is required!")
        sys.exit(1)

    # WebSocket URL
    default_ws_url = "wss://corridor-worker.corridor-sync.workers.dev/ws"
    current_ws_url = config_manager.get("websocket_url", default_ws_url)
    print(f"\nWebSocket URL (default: {default_ws_url})")
    print(f"Current: {current_ws_url}")
    ws_url = input("Press Enter to keep current, or enter new URL: ").strip()
    if not ws_url:
        ws_url = current_ws_url

    # HTTP URL
    default_http_url = "https://corridor-worker.corridor-sync.workers.dev/api"
    current_http_url = config_manager.get("http_url", default_http_url)
    print(f"\nHTTP URL (default: {default_http_url})")
    print(f"Current: {current_http_url}")
    http_url = input("Press Enter to keep current, or enter new URL: ").strip()
    if not http_url:
        http_url = current_http_url

    # Mode
    print("\nMode:")
    print("1. Interactive (with notifications)")
    print("2. Silent (no notifications, background only)")
    mode_choice = input("Choose mode (1/2): ").strip()
    mode = "silent" if mode_choice == "2" else "interactive"

    # Auto-start
    auto_start = input("\nEnable auto-start on login? (y/N): ").strip().lower() == 'y'

    # Save configuration
    config_manager.set("token", token)
    config_manager.set("websocket_url", ws_url)
    config_manager.set("http_url", http_url)
    config_manager.set("mode", mode)
    config_manager.set("auto_start", auto_start)

    if config_manager.save():
        print("\n✓ Configuration saved!")
        print(f"Config file: {config_manager.config_path}")

        if auto_start:
            print("\n⚠️  To enable auto-start, run:")
            print("  systemctl --user enable corridor")
            print("  systemctl --user start corridor")
    else:
        print("\n❌ Failed to save configuration")
        sys.exit(1)


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Corridor - Real-time clipboard synchronization for Linux"
    )
    parser.add_argument(
        "--setup",
        action="store_true",
        help="Run setup wizard"
    )
    parser.add_argument(
        "--silent",
        action="store_true",
        help="Run in silent mode (no notifications)"
    )
    parser.add_argument(
        "--daemon",
        action="store_true",
        help="Run as daemon (background process)"
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Enable debug logging"
    )
    parser.add_argument(
        "--version",
        action="version",
        version="Corridor Linux Client v1.0.0"
    )

    args = parser.parse_args()

    # Enable debug logging if requested
    if args.debug:
        logging.getLogger().setLevel(logging.DEBUG)

    # Run setup if requested
    if args.setup:
        run_cli_setup()
        return

    # Load configuration
    config_manager = ConfigManager()

    # Check if configured
    if not config_manager.is_configured():
        print("❌ Corridor is not configured.")
        print("Please run: corridor --setup")
        sys.exit(1)

    # Create and run app
    app = CorridorApp(config_manager, silent=args.silent or args.daemon)

    try:
        asyncio.run(app.start())
    except KeyboardInterrupt:
        logger.info("Interrupted by user")
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
