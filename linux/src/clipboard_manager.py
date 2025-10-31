#!/usr/bin/env python3
"""
Clipboard Manager for Corridor Linux Client
Handles clipboard monitoring and updates for both X11 and Wayland
"""

import asyncio
import logging
import subprocess
import platform
from typing import Optional, Callable
from enum import Enum


logger = logging.getLogger(__name__)


class ClipboardBackend(Enum):
    """Clipboard backend types"""
    PYPERCLIP = "pyperclip"
    XCLIP = "xclip"
    XSEL = "xsel"
    WL_CLIPBOARD = "wl-clipboard"
    UNKNOWN = "unknown"


class ClipboardManager:
    """Cross-platform clipboard manager for Linux"""

    def __init__(
        self,
        on_clipboard_change: Optional[Callable[[str], None]] = None,
        monitor_interval: float = 0.5
    ):
        """Initialize clipboard manager

        Args:
            on_clipboard_change: Callback when clipboard changes
            monitor_interval: How often to check clipboard (seconds)
        """
        self.on_clipboard_change = on_clipboard_change
        self.monitor_interval = monitor_interval

        self.last_content = ""
        self.is_monitoring = False
        self.should_run = True
        self._monitor_task: Optional[asyncio.Task] = None
        self._ignore_next_change = False  # Prevent feedback loops

        # Detect backend
        self.backend = self._detect_backend()
        logger.info(f"Using clipboard backend: {self.backend.value}")

    def _detect_backend(self) -> ClipboardBackend:
        """Detect available clipboard backend

        Returns:
            Available clipboard backend
        """
        # Try pyperclip first (easiest)
        try:
            import pyperclip
            pyperclip.paste()  # Test if it works
            return ClipboardBackend.PYPERCLIP
        except (ImportError, Exception):
            pass

        # Check for Wayland
        if self._is_wayland():
            if self._command_exists("wl-paste"):
                return ClipboardBackend.WL_CLIPBOARD

        # Check for X11 tools
        if self._command_exists("xclip"):
            return ClipboardBackend.XCLIP
        elif self._command_exists("xsel"):
            return ClipboardBackend.XSEL

        logger.warning("No clipboard backend found!")
        return ClipboardBackend.UNKNOWN

    def _is_wayland(self) -> bool:
        """Check if running on Wayland"""
        import os
        wayland_display = os.environ.get("WAYLAND_DISPLAY")
        xdg_session_type = os.environ.get("XDG_SESSION_TYPE")
        return bool(wayland_display) or xdg_session_type == "wayland"

    def _command_exists(self, command: str) -> bool:
        """Check if command exists in PATH"""
        try:
            subprocess.run(
                ["which", command],
                capture_output=True,
                check=True,
                timeout=1
            )
            return True
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired, FileNotFoundError):
            return False

    def get_clipboard(self) -> str:
        """Get current clipboard content

        Returns:
            Clipboard text content
        """
        try:
            if self.backend == ClipboardBackend.PYPERCLIP:
                import pyperclip
                return pyperclip.paste() or ""

            elif self.backend == ClipboardBackend.WL_CLIPBOARD:
                result = subprocess.run(
                    ["wl-paste", "-n"],
                    capture_output=True,
                    text=True,
                    timeout=2
                )
                return result.stdout if result.returncode == 0 else ""

            elif self.backend == ClipboardBackend.XCLIP:
                result = subprocess.run(
                    ["xclip", "-o", "-selection", "clipboard"],
                    capture_output=True,
                    text=True,
                    timeout=2
                )
                return result.stdout if result.returncode == 0 else ""

            elif self.backend == ClipboardBackend.XSEL:
                result = subprocess.run(
                    ["xsel", "--clipboard", "--output"],
                    capture_output=True,
                    text=True,
                    timeout=2
                )
                return result.stdout if result.returncode == 0 else ""

        except Exception as e:
            logger.error(f"Failed to get clipboard: {e}")

        return ""

    def set_clipboard(self, content: str, from_remote: bool = False) -> bool:
        """Set clipboard content

        Args:
            content: Text to set
            from_remote: True if this is from remote update (prevents feedback loop)

        Returns:
            True if successful
        """
        try:
            if from_remote:
                # Prevent triggering change event for remote updates
                self._ignore_next_change = True

            if self.backend == ClipboardBackend.PYPERCLIP:
                import pyperclip
                pyperclip.copy(content)
                return True

            elif self.backend == ClipboardBackend.WL_CLIPBOARD:
                result = subprocess.run(
                    ["wl-copy"],
                    input=content,
                    text=True,
                    timeout=2
                )
                return result.returncode == 0

            elif self.backend == ClipboardBackend.XCLIP:
                result = subprocess.run(
                    ["xclip", "-selection", "clipboard"],
                    input=content,
                    text=True,
                    timeout=2
                )
                return result.returncode == 0

            elif self.backend == ClipboardBackend.XSEL:
                result = subprocess.run(
                    ["xsel", "--clipboard", "--input"],
                    input=content,
                    text=True,
                    timeout=2
                )
                return result.returncode == 0

        except Exception as e:
            logger.error(f"Failed to set clipboard: {e}")
            self._ignore_next_change = False

        return False

    async def start_monitoring(self) -> None:
        """Start monitoring clipboard for changes"""
        if self.is_monitoring:
            logger.warning("Already monitoring clipboard")
            return

        self.is_monitoring = True
        self.should_run = True
        self.last_content = self.get_clipboard()

        logger.info("Started clipboard monitoring")
        self._monitor_task = asyncio.create_task(self._monitor_loop())

    async def stop_monitoring(self) -> None:
        """Stop monitoring clipboard"""
        self.should_run = False
        self.is_monitoring = False

        if self._monitor_task and not self._monitor_task.done():
            self._monitor_task.cancel()
            try:
                await self._monitor_task
            except asyncio.CancelledError:
                pass

        logger.info("Stopped clipboard monitoring")

    async def _monitor_loop(self) -> None:
        """Monitor clipboard for changes"""
        try:
            while self.should_run:
                await asyncio.sleep(self.monitor_interval)

                try:
                    current_content = self.get_clipboard()

                    # Check if content changed
                    if current_content != self.last_content:
                        # Handle ignore flag (from remote updates)
                        if self._ignore_next_change:
                            logger.debug("Ignoring clipboard change (from remote)")
                            self._ignore_next_change = False
                            self.last_content = current_content
                            continue

                        logger.debug(f"Clipboard changed: {current_content[:50]}...")
                        self.last_content = current_content

                        # Notify callback
                        if self.on_clipboard_change and current_content:
                            self.on_clipboard_change(current_content)

                except Exception as e:
                    logger.error(f"Error in monitor loop: {e}")

        except asyncio.CancelledError:
            pass


async def main():
    """Test clipboard manager"""
    logging.basicConfig(level=logging.DEBUG)

    def on_change(content: str):
        print(f"📋 Clipboard changed: {content[:100]}")

    manager = ClipboardManager(on_clipboard_change=on_change)

    # Test get
    print(f"Current clipboard: {manager.get_clipboard()[:100]}")

    # Test set
    manager.set_clipboard("Hello from Corridor Linux!")
    print(f"After set: {manager.get_clipboard()}")

    # Test monitoring
    print("\n🔍 Monitoring clipboard (copy something)...")
    await manager.start_monitoring()
    await asyncio.sleep(30)
    await manager.stop_monitoring()


if __name__ == "__main__":
    asyncio.run(main())
