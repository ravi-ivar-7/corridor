#!/usr/bin/env python3
import sys
import json
from datetime import datetime
import subprocess

try:
    import gi
    gi.require_version('Gtk', '3.0')
    from gi.repository import Gtk, Gdk, GLib
except ImportError:
    print("GTK3 not available, install python3-gi")
    sys.exit(1)

class HistoryDialog(Gtk.Window):
    def __init__(self, items, http_url, token):
        Gtk.Window.__init__(self, title="Clipboard History")
        self.set_default_size(1000, 700)
        self.set_border_width(10)
        self.items = items
        self.http_url = http_url
        self.token = token

        # Main container
        main_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=10)
        self.add(main_box)

        # Header box
        header = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        header.set_margin_bottom(10)

        # Left: Title
        title_label = Gtk.Label()
        title_label.set_markup("<b>Clipboard History</b>")
        title_label.set_halign(Gtk.Align.START)
        header.pack_start(title_label, False, False, 0)

        # Center: Total items
        total_label = Gtk.Label()
        total_label.set_markup(f"<span foreground='gray'>Total Items ({len(items)})</span>")
        header.pack_start(total_label, True, True, 0)

        # Right: Clear button
        clear_btn = Gtk.Button(label="🗑 Clear")
        clear_btn.connect("clicked", self.on_clear_clicked)
        header.pack_end(clear_btn, False, False, 0)

        main_box.pack_start(header, False, False, 0)

        # Separator
        sep = Gtk.Separator(orientation=Gtk.Orientation.HORIZONTAL)
        main_box.pack_start(sep, False, False, 0)

        # Scrolled window for items
        scrolled = Gtk.ScrolledWindow()
        scrolled.set_policy(Gtk.PolicyType.AUTOMATIC, Gtk.PolicyType.AUTOMATIC)
        main_box.pack_start(scrolled, True, True, 0)

        # Items box
        items_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=5)
        items_box.set_margin_top(10)
        scrolled.add(items_box)

        # Add each item
        for item in items:
            self.add_history_item(items_box, item)

    def add_history_item(self, container, item):
        # Item frame with light gray background
        frame = Gtk.Frame()
        frame.set_margin_bottom(10)

        # Item box
        item_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=5)
        item_box.set_margin_top(5)
        item_box.set_margin_bottom(5)
        item_box.set_margin_start(10)
        item_box.set_margin_end(10)
        frame.add(item_box)

        # Header row (time + copy button)
        header_row = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)

        # Time label (left)
        ts = datetime.fromtimestamp(item['timestamp'] / 1000)
        time_str = ts.strftime("%m/%d/%Y, %I:%M:%S %p")
        time_label = Gtk.Label()
        time_label.set_markup(f"<span foreground='gray'>🕒 {time_str}</span>")
        time_label.set_halign(Gtk.Align.START)
        header_row.pack_start(time_label, True, True, 0)

        # Copy button (right)
        copy_btn = Gtk.Button(label="📋 Copy")
        copy_btn.set_tooltip_text("Copy to clipboard")
        copy_btn.connect("clicked", self.on_copy_clicked, item['content'])
        header_row.pack_end(copy_btn, False, False, 0)

        item_box.pack_start(header_row, False, False, 0)

        # Scrolled window for content (with max height)
        content_scroll = Gtk.ScrolledWindow()
        content_scroll.set_policy(Gtk.PolicyType.AUTOMATIC, Gtk.PolicyType.AUTOMATIC)
        content_scroll.set_max_content_height(150)  # Max height in pixels
        content_scroll.set_propagate_natural_height(True)

        # Content label
        content_label = Gtk.Label()
        content_label.set_markup(f"<span foreground='gray'>{GLib.markup_escape_text(item['content'])}</span>")
        content_label.set_line_wrap(True)
        content_label.set_line_wrap_mode(2)  # WORD_CHAR
        content_label.set_halign(Gtk.Align.START)
        content_label.set_selectable(True)
        content_label.set_max_width_chars(100)
        content_label.set_margin_top(5)
        content_label.set_margin_bottom(5)

        content_scroll.add(content_label)
        item_box.pack_start(content_scroll, True, True, 0)

        container.pack_start(frame, False, False, 0)

    def on_copy_clicked(self, button, content):
        clipboard = Gtk.Clipboard.get(Gdk.SELECTION_CLIPBOARD)
        clipboard.set_text(content, -1)
        clipboard.store()

        # Show copied notification
        try:
            import subprocess
            preview = content[:50] + ("..." if len(content) > 50 else "")
            subprocess.run(
                ["notify-send", "-t", "2000", "-i", "edit-copy", "Copied", preview],
                capture_output=True
            )
        except:
            pass

    def on_clear_clicked(self, button):
        dialog = Gtk.MessageDialog(
            transient_for=self,
            flags=0,
            message_type=Gtk.MessageType.QUESTION,
            buttons=Gtk.ButtonsType.YES_NO,
            text="Clear History?",
        )
        dialog.format_secondary_text("This will clear all clipboard history.")
        response = dialog.run()
        dialog.destroy()

        if response == Gtk.ResponseType.YES:
            # Clear via API
            url = f"{self.http_url}/clipboard/{self.token}"
            try:
                subprocess.run(["curl", "-X", "DELETE", url], capture_output=True)
            except:
                pass
            self.destroy()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: show_history.py <fetch|items_json> <http_url> <token>")
        sys.exit(1)

    mode = sys.argv[1]

    if mode == "fetch":
        # Fetch from server
        http_url = sys.argv[2]
        token = sys.argv[3]

        try:
            import urllib.request
            url = f"{http_url}/clipboard/{token}"
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode())
                items = data.get('history', [])
        except Exception as e:
            print(f"Failed to fetch history: {e}")
            items = []
    else:
        # Use provided JSON
        items = json.loads(mode)
        http_url = sys.argv[2]
        token = sys.argv[3]

    if not items:
        # Show empty message
        dialog = Gtk.MessageDialog(
            flags=0,
            message_type=Gtk.MessageType.INFO,
            buttons=Gtk.ButtonsType.OK,
            text="No History Available",
        )
        dialog.format_secondary_text("Clipboard history is empty.")
        dialog.run()
        dialog.destroy()
        sys.exit(0)

    win = HistoryDialog(items, http_url, token)
    win.connect("destroy", Gtk.main_quit)
    win.show_all()
    Gtk.main()
