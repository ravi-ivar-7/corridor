#!/usr/bin/env python3
"""
Notification Manager for Corridor Linux Client
Handles desktop notifications using libnotify
"""

import logging
import subprocess
from typing import Optional
from enum import Enum


logger = logging.getLogger(__name__)


class NotificationType(Enum):
    """Notification type"""
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"


class NotificationManager:
    """Desktop notification manager"""

    def __init__(self, app_name: str = "Corridor"):
        """Initialize notification manager

        Args:
            app_name: Application name for notifications
        """
        self.app_name = app_name
        self.enabled = True

        # Check if notify-send is available
        self.has_notify_send = self._check_notify_send()

        if not self.has_notify_send:
            logger.warning("notify-send not found, notifications disabled")

    def _check_notify_send(self) -> bool:
        """Check if notify-send command is available"""
        try:
            subprocess.run(
                ["which", "notify-send"],
                capture_output=True,
                check=True,
                timeout=1
            )
            return True
        except (subprocess.CalledProcessError, subprocess.TimeoutExpired, FileNotFoundError):
            return False

    def notify(
        self,
        title: str,
        message: str,
        notification_type: NotificationType = NotificationType.INFO,
        timeout: int = 5000
    ) -> bool:
        """Show desktop notification

        Args:
            title: Notification title
            message: Notification message
            notification_type: Type of notification (info/success/warning/error)
            timeout: Timeout in milliseconds

        Returns:
            True if notification was sent
        """
        if not self.enabled or not self.has_notify_send:
            return False

        try:
            # Map notification type to icon
            icon_map = {
                NotificationType.INFO: "dialog-information",
                NotificationType.SUCCESS: "dialog-information",
                NotificationType.WARNING: "dialog-warning",
                NotificationType.ERROR: "dialog-error"
            }
            icon = icon_map.get(notification_type, "dialog-information")

            # Map notification type to urgency
            urgency_map = {
                NotificationType.INFO: "normal",
                NotificationType.SUCCESS: "normal",
                NotificationType.WARNING: "normal",
                NotificationType.ERROR: "critical"
            }
            urgency = urgency_map.get(notification_type, "normal")

            # Send notification
            subprocess.run(
                [
                    "notify-send",
                    "--app-name", self.app_name,
                    "--icon", icon,
                    "--urgency", urgency,
                    "--expire-time", str(timeout),
                    title,
                    message
                ],
                timeout=2,
                check=False  # Don't raise on error
            )

            logger.debug(f"Notification sent: {title}")
            return True

        except Exception as e:
            logger.error(f"Failed to send notification: {e}")
            return False

    def notify_connected(self) -> None:
        """Notify when connected to server"""
        self.notify(
            "Connected",
            "Clipboard sync is now active",
            NotificationType.SUCCESS
        )

    def notify_disconnected(self) -> None:
        """Notify when disconnected from server"""
        self.notify(
            "Disconnected",
            "Clipboard sync is offline",
            NotificationType.WARNING
        )

    def notify_clipboard_update(self, content: str, is_local: bool = False) -> None:
        """Notify about clipboard update

        Args:
            content: Clipboard content
            is_local: True if this is a local copy
        """
        if is_local:
            title = "Clipboard Copied"
            message = f"Syncing: {content[:50]}..."
        else:
            title = "Clipboard Updated"
            message = f"From remote: {content[:50]}..."

        self.notify(title, message, NotificationType.INFO, timeout=3000)

    def notify_error(self, error: str) -> None:
        """Notify about error

        Args:
            error: Error message
        """
        self.notify(
            "Corridor Error",
            error,
            NotificationType.ERROR,
            timeout=10000
        )

    def set_enabled(self, enabled: bool) -> None:
        """Enable or disable notifications

        Args:
            enabled: True to enable notifications
        """
        self.enabled = enabled
        logger.info(f"Notifications {'enabled' if enabled else 'disabled'}")


def main():
    """Test notifications"""
    logging.basicConfig(level=logging.DEBUG)

    notifier = NotificationManager()

    print("Sending test notifications...")

    notifier.notify("Test Info", "This is an info notification", NotificationType.INFO)
    notifier.notify("Test Success", "This is a success notification", NotificationType.SUCCESS)
    notifier.notify("Test Warning", "This is a warning notification", NotificationType.WARNING)
    notifier.notify("Test Error", "This is an error notification", NotificationType.ERROR)

    notifier.notify_connected()
    notifier.notify_clipboard_update("Hello World!", is_local=True)
    notifier.notify_clipboard_update("Remote content", is_local=False)
    notifier.notify_error("Test error message")


if __name__ == "__main__":
    main()
