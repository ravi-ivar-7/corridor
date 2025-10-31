#!/usr/bin/env python3
"""
Configuration Manager for Corridor Linux Client
Handles reading/writing configuration to JSON file
"""

import json
import os
from pathlib import Path
from typing import Dict, Any, Optional


class ConfigManager:
    """Manages application configuration"""

    DEFAULT_CONFIG = {
        "token": "",
        "websocket_url": "wss://corridor-worker.corridor-sync.workers.dev/ws",
        "http_url": "https://corridor-worker.corridor-sync.workers.dev/api",
        "mode": "interactive",  # "interactive" or "silent"
        "auto_start": False,
        "notifications": {
            "local_copy": False,
            "remote_update": True,
            "errors": True
        },
        "clipboard": {
            "monitor_interval": 500,  # milliseconds
            "history_size": 100
        }
    }

    def __init__(self, config_path: Optional[str] = None):
        """Initialize config manager

        Args:
            config_path: Optional custom config file path
        """
        if config_path:
            self.config_path = Path(config_path)
        else:
            # Default: ~/.config/corridor/config.json
            config_dir = Path.home() / ".config" / "corridor"
            config_dir.mkdir(parents=True, exist_ok=True)
            self.config_path = config_dir / "config.json"

        self._config: Dict[str, Any] = {}
        self.load()

    def load(self) -> Dict[str, Any]:
        """Load configuration from file

        Returns:
            Configuration dictionary
        """
        if self.config_path.exists():
            try:
                with open(self.config_path, 'r', encoding='utf-8') as f:
                    self._config = json.load(f)
                # Merge with defaults (in case new keys were added)
                self._config = self._merge_with_defaults(self._config)
            except (json.JSONDecodeError, IOError) as e:
                print(f"Error loading config: {e}")
                self._config = self.DEFAULT_CONFIG.copy()
        else:
            self._config = self.DEFAULT_CONFIG.copy()

        return self._config

    def save(self, config: Optional[Dict[str, Any]] = None) -> bool:
        """Save configuration to file

        Args:
            config: Configuration to save (uses current if None)

        Returns:
            True if successful, False otherwise
        """
        if config is not None:
            self._config = config

        try:
            # Ensure directory exists
            self.config_path.parent.mkdir(parents=True, exist_ok=True)

            # Write with pretty formatting
            with open(self.config_path, 'w', encoding='utf-8') as f:
                json.dump(self._config, f, indent=2, ensure_ascii=False)

            # Set restrictive permissions (0600 - user only)
            os.chmod(self.config_path, 0o600)
            return True
        except IOError as e:
            print(f"Error saving config: {e}")
            return False

    def get(self, key: str, default: Any = None) -> Any:
        """Get configuration value

        Args:
            key: Configuration key (supports dot notation, e.g., 'notifications.errors')
            default: Default value if key not found

        Returns:
            Configuration value
        """
        keys = key.split('.')
        value = self._config

        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default

        return value

    def set(self, key: str, value: Any) -> None:
        """Set configuration value

        Args:
            key: Configuration key (supports dot notation)
            value: Value to set
        """
        keys = key.split('.')
        config = self._config

        for k in keys[:-1]:
            if k not in config or not isinstance(config[k], dict):
                config[k] = {}
            config = config[k]

        config[keys[-1]] = value

    def is_configured(self) -> bool:
        """Check if application is configured with required values

        Returns:
            True if token and URLs are set
        """
        return (
            bool(self._config.get("token")) and
            bool(self._config.get("websocket_url")) and
            bool(self._config.get("http_url"))
        )

    def _merge_with_defaults(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Merge user config with defaults (preserves user values)

        Args:
            config: User configuration

        Returns:
            Merged configuration
        """
        result = self.DEFAULT_CONFIG.copy()

        def deep_merge(target: dict, source: dict) -> dict:
            for key, value in source.items():
                if key in target and isinstance(target[key], dict) and isinstance(value, dict):
                    target[key] = deep_merge(target[key], value)
                else:
                    target[key] = value
            return target

        return deep_merge(result, config)

    @property
    def config(self) -> Dict[str, Any]:
        """Get current configuration dictionary"""
        return self._config.copy()

    def reset(self) -> None:
        """Reset configuration to defaults"""
        self._config = self.DEFAULT_CONFIG.copy()
        self.save()


if __name__ == "__main__":
    # Test
    cm = ConfigManager()
    print("Current config:", json.dumps(cm.config, indent=2))
    print("Is configured:", cm.is_configured())
    print("Token:", cm.get("token"))
    print("Remote update notifications:", cm.get("notifications.remote_update"))
