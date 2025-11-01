#!/usr/bin/env python3
import sys
import json
import os
from pathlib import Path

try:
    import gi
    gi.require_version('Gtk', '3.0')
    from gi.repository import Gtk, Gdk
except ImportError:
    print("GTK3 not available, install python3-gi")
    sys.exit(1)

class SetupDialog(Gtk.Window):
    def __init__(self):
        Gtk.Window.__init__(self, title="Corridor Setup")
        self.set_default_size(550, 600)
        self.set_border_width(0)
        self.set_resizable(False)
        self.set_position(Gtk.WindowPosition.CENTER)

        # Load current config
        self.config_path = Path.home() / ".config" / "corridor" / "config.json"
        self.load_config()

        # Main container
        main_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=0)
        self.add(main_box)

        # Content area with scrolling
        scrolled = Gtk.ScrolledWindow()
        scrolled.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.AUTOMATIC)

        content = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=20)
        content.set_margin_top(20)
        content.set_margin_bottom(20)
        content.set_margin_start(25)
        content.set_margin_end(25)

        # Token section
        token_label = Gtk.Label()
        token_label.set_markup("<b>Token:</b>")
        token_label.set_halign(Gtk.Align.START)
        content.pack_start(token_label, False, False, 0)

        self.token_entry = Gtk.Entry()
        self.token_entry.set_text(self.config.get("token", ""))
        self.token_entry.set_placeholder_text("Enter your sync token")
        content.pack_start(self.token_entry, False, False, 0)

        # Connection section
        connection_label = Gtk.Label()
        connection_label.set_markup("<b>Connection:</b>")
        connection_label.set_halign(Gtk.Align.START)
        connection_label.set_margin_top(10)
        content.pack_start(connection_label, False, False, 0)

        # WebSocket URL row
        ws_box = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        ws_box.set_margin_start(5)

        ws_label = Gtk.Label(label="WebSocket URL:")
        ws_label.set_width_chars(15)
        ws_label.set_halign(Gtk.Align.START)
        ws_box.pack_start(ws_label, False, False, 0)

        self.ws_entry = Gtk.Entry()
        self.ws_entry.set_text(self.config.get("websocket_url", "wss://corridor.rknain.com/ws"))
        self.ws_entry.set_placeholder_text("wss://example.com/ws")
        ws_box.pack_start(self.ws_entry, True, True, 0)

        ws_clear_btn = Gtk.Button(label="Clear")
        ws_clear_btn.connect("clicked", lambda b: self.ws_entry.set_text(""))
        ws_box.pack_start(ws_clear_btn, False, False, 0)

        ws_default_btn = Gtk.Button(label="Default")
        ws_default_btn.connect("clicked", lambda b: self.ws_entry.set_text("wss://corridor.rknain.com/ws"))
        ws_box.pack_start(ws_default_btn, False, False, 0)

        content.pack_start(ws_box, False, False, 0)

        # HTTP URL row
        http_box = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        http_box.set_margin_start(5)

        http_label = Gtk.Label(label="HTTP URL:")
        http_label.set_width_chars(15)
        http_label.set_halign(Gtk.Align.START)
        http_box.pack_start(http_label, False, False, 0)

        self.http_entry = Gtk.Entry()
        self.http_entry.set_text(self.config.get("http_url", "https://corridor.rknain.com"))
        self.http_entry.set_placeholder_text("https://example.com")
        http_box.pack_start(self.http_entry, True, True, 0)

        http_clear_btn = Gtk.Button(label="Clear")
        http_clear_btn.connect("clicked", lambda b: self.http_entry.set_text(""))
        http_box.pack_start(http_clear_btn, False, False, 0)

        http_default_btn = Gtk.Button(label="Default")
        http_default_btn.connect("clicked", lambda b: self.http_entry.set_text("https://corridor.rknain.com"))
        http_box.pack_start(http_default_btn, False, False, 0)

        content.pack_start(http_box, False, False, 0)

        # Mode section
        mode_label = Gtk.Label()
        mode_label.set_markup("<b>Mode:</b>")
        mode_label.set_halign(Gtk.Align.START)
        mode_label.set_margin_top(10)
        content.pack_start(mode_label, False, False, 0)

        mode_box = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=30)
        mode_box.set_margin_start(5)

        # Interactive mode
        interactive_vbox = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=5)
        self.interactive_radio = Gtk.RadioButton(label="Interactive Mode")
        interactive_vbox.pack_start(self.interactive_radio, False, False, 0)

        interactive_help = Gtk.Label()
        interactive_help.set_markup("<span size='9000' foreground='#666666'>Tray icon, notifications, dialogs</span>")
        interactive_help.set_halign(Gtk.Align.START)
        interactive_help.set_margin_start(25)
        interactive_vbox.pack_start(interactive_help, False, False, 0)

        mode_box.pack_start(interactive_vbox, False, False, 0)

        # Silent mode
        silent_vbox = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=5)
        self.silent_radio = Gtk.RadioButton(label="Silent Mode", group=self.interactive_radio)
        silent_vbox.pack_start(self.silent_radio, False, False, 0)

        silent_help = Gtk.Label()
        silent_help.set_markup("<span size='9000' foreground='#666666'>No tray icon, no notifications</span>")
        silent_help.set_halign(Gtk.Align.START)
        silent_help.set_margin_start(25)
        silent_vbox.pack_start(silent_help, False, False, 0)

        mode_box.pack_start(silent_vbox, False, False, 0)

        content.pack_start(mode_box, False, False, 0)

        # Set current mode
        current_mode = self.config.get("mode", "interactive")
        if current_mode == "silent":
            self.silent_radio.set_active(True)
        else:
            self.interactive_radio.set_active(True)

        # AutoStart section
        autostart_label = Gtk.Label()
        autostart_label.set_markup("<b>AutoStart:</b>")
        autostart_label.set_halign(Gtk.Align.START)
        autostart_label.set_margin_top(10)
        content.pack_start(autostart_label, False, False, 0)

        autostart_box = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=30)
        autostart_box.set_margin_start(5)

        # Enable autostart
        enable_vbox = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=5)
        self.autostart_enable_radio = Gtk.RadioButton(label="Enable")
        enable_vbox.pack_start(self.autostart_enable_radio, False, False, 0)

        enable_help = Gtk.Label()
        enable_help.set_markup("<span size='9000' foreground='#666666'>Start Corridor on system boot</span>")
        enable_help.set_halign(Gtk.Align.START)
        enable_help.set_margin_start(25)
        enable_vbox.pack_start(enable_help, False, False, 0)

        autostart_box.pack_start(enable_vbox, False, False, 0)

        # Disable autostart
        disable_vbox = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=5)
        self.autostart_disable_radio = Gtk.RadioButton(label="Disable", group=self.autostart_enable_radio)
        disable_vbox.pack_start(self.autostart_disable_radio, False, False, 0)

        disable_help = Gtk.Label()
        disable_help.set_markup("<span size='9000' foreground='#666666'>Don't start on boot</span>")
        disable_help.set_halign(Gtk.Align.START)
        disable_help.set_margin_start(25)
        disable_vbox.pack_start(disable_help, False, False, 0)

        autostart_box.pack_start(disable_vbox, False, False, 0)

        content.pack_start(autostart_box, False, False, 0)

        # Check current autostart status
        autostart_file = Path.home() / ".config" / "autostart" / "corridor.desktop"
        if autostart_file.exists():
            self.autostart_enable_radio.set_active(True)
        else:
            self.autostart_disable_radio.set_active(True)

        scrolled.add(content)
        main_box.pack_start(scrolled, True, True, 0)

        # Separator
        separator = Gtk.Separator(orientation=Gtk.Orientation.HORIZONTAL)
        main_box.pack_start(separator, False, False, 0)

        # Button area
        button_box = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        button_box.set_margin_top(15)
        button_box.set_margin_bottom(15)
        button_box.set_margin_start(25)
        button_box.set_margin_end(25)

        # Cancel button
        cancel_btn = Gtk.Button(label="Cancel")
        cancel_btn.connect("clicked", self.on_cancel_clicked)
        button_box.pack_start(cancel_btn, True, True, 0)

        # Save and Start button
        save_btn = Gtk.Button(label="Save and Start")
        save_btn.get_style_context().add_class("suggested-action")
        save_btn.connect("clicked", self.on_save_start_clicked)
        button_box.pack_start(save_btn, True, True, 0)

        main_box.pack_start(button_box, False, False, 0)

    def load_config(self):
        """Load existing configuration"""
        try:
            if self.config_path.exists():
                with open(self.config_path, 'r') as f:
                    self.config = json.load(f)
            else:
                self.config = {}
        except Exception as e:
            print(f"Error loading config: {e}")
            self.config = {}

    def save_config(self):
        """Save configuration to file"""
        try:
            # Create config directory if needed
            self.config_path.parent.mkdir(parents=True, exist_ok=True)

            # Update config with form values
            self.config["token"] = self.token_entry.get_text().strip()
            self.config["websocket_url"] = self.ws_entry.get_text().strip()
            self.config["http_url"] = self.http_entry.get_text().strip()

            # Set mode
            if self.silent_radio.get_active():
                self.config["mode"] = "silent"
                # Disable notifications in silent mode
                self.config["notifications"] = {
                    "local_copy": False,
                    "remote_update": False,
                    "errors": False
                }
            else:
                self.config["mode"] = "interactive"
                # Enable notifications in interactive mode
                self.config["notifications"] = {
                    "local_copy": True,
                    "remote_update": True,
                    "errors": True
                }

            # Ensure other config fields exist with defaults
            if "clipboard" not in self.config:
                self.config["clipboard"] = {"history_size": 100}

            # Write config file
            with open(self.config_path, 'w') as f:
                json.dump(self.config, f, indent=2)

            return True
        except Exception as e:
            print(f"Error saving config: {e}")
            return False

    def setup_autostart(self, enable):
        """Enable or disable autostart"""
        autostart_dir = Path.home() / ".config" / "autostart"
        autostart_file = autostart_dir / "corridor.desktop"

        try:
            if enable:
                # Create autostart directory
                autostart_dir.mkdir(parents=True, exist_ok=True)

                # Find corridor binary
                import subprocess

                # First try which command
                result = subprocess.run(["which", "corridor"], capture_output=True, text=True)
                corridor_path = result.stdout.strip()

                # If not found, try common paths
                if not corridor_path or not Path(corridor_path).exists():
                    possible_paths = [
                        Path.home() / "Desktop" / "corridor" / "linux" / "target" / "release" / "corridor",
                        Path("/usr/local/bin/corridor"),
                        Path("/usr/bin/corridor"),
                    ]
                    for path in possible_paths:
                        if path.exists():
                            corridor_path = str(path)
                            break

                if not corridor_path:
                    corridor_path = "corridor"  # Fallback to PATH

                # Create desktop entry with --autostart flag
                desktop_entry = f"""[Desktop Entry]
Type=Application
Name=Corridor
Comment=Clipboard Sync
Exec={corridor_path} --autostart
Icon=edit-copy
Terminal=false
Categories=Utility;
X-GNOME-Autostart-enabled=true
"""
                with open(autostart_file, 'w') as f:
                    f.write(desktop_entry)

                # Make executable
                autostart_file.chmod(0o755)
                return True
            else:
                # Remove autostart file
                if autostart_file.exists():
                    autostart_file.unlink()
                return True
        except Exception as e:
            print(f"Error setting up autostart: {e}")
            return False

    def show_toast(self, message):
        """Show a small toast notification at bottom"""
        toast = Gtk.Label(label=message)
        toast.set_markup(f"<span size='10000'>{message}</span>")

        overlay = Gtk.Overlay()
        for child in self.get_children():
            self.remove(child)
            overlay.add(child)

        toast_box = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL)
        toast_box.set_halign(Gtk.Align.CENTER)
        toast_box.set_valign(Gtk.Align.END)
        toast_box.set_margin_bottom(20)

        toast_frame = Gtk.Frame()
        toast_frame.add(toast)
        toast_frame.set_margin_start(10)
        toast_frame.set_margin_end(10)
        toast_frame.set_margin_top(8)
        toast_frame.set_margin_bottom(8)

        toast_box.pack_start(toast_frame, False, False, 0)
        overlay.add_overlay(toast_box)

        self.add(overlay)
        self.show_all()

        # Auto-hide after 2 seconds
        from gi.repository import GLib
        GLib.timeout_add(2000, lambda: (self.remove(overlay), self.add(overlay.get_child()), self.show_all()))

    def on_save_start_clicked(self, button):
        """Handle save and start button click"""
        # Validate token
        if not self.token_entry.get_text().strip():
            self.show_toast("⚠ Token is required")
            return

        # Save config
        if not self.save_config():
            self.show_toast("✗ Failed to save settings")
            return

        # Setup autostart
        enable_autostart = self.autostart_enable_radio.get_active()
        self.setup_autostart(enable_autostart)

        # Exit with code 0 to signal success (start corridor)
        sys.exit(0)

    def on_cancel_clicked(self, button):
        """Handle cancel button click"""
        # Exit with code 1 to signal cancellation
        sys.exit(1)

if __name__ == "__main__":
    dialog = SetupDialog()
    # Connect destroy event to exit with code 1 (cancel)
    dialog.connect("destroy", lambda w: sys.exit(1))
    dialog.show_all()
    Gtk.main()
