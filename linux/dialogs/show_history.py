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
        self.main_box = main_box  # Store reference for toast
        self.add(main_box)

        # Header box with reduced height
        header = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=8)
        header.set_margin_bottom(3)
        header.set_margin_top(3)

        # Left: Title
        title_label = Gtk.Label()
        title_label.set_markup("<b>Clipboard History</b>")
        title_label.set_halign(Gtk.Align.START)
        header.pack_start(title_label, False, False, 0)

        # Center: Total items
        total_label = Gtk.Label()
        total_label.set_markup(f"<span foreground='gray'>Total Items ({len(items)})</span>")
        header.pack_start(total_label, True, True, 0)

        # Right: Clear button with premium icon
        clear_btn = Gtk.Button(label="✗ Clear")
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
        items_box.set_margin_top(5)
        scrolled.add(items_box)

        # Add each item
        for item in items:
            self.add_history_item(items_box, item)

    def add_history_item(self, container, item):
        # Item frame with light gray background
        frame = Gtk.Frame()
        frame.set_margin_bottom(5)

        # Item box - more compact
        item_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=2)
        item_box.set_margin_top(3)
        item_box.set_margin_bottom(3)
        item_box.set_margin_start(8)
        item_box.set_margin_end(8)
        frame.add(item_box)

        # Header row (time + copy button) - reduced spacing
        header_row = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)

        # Time label (left) with premium clock icon
        ts = datetime.fromtimestamp(item['timestamp'] / 1000)
        time_str = ts.strftime("%m/%d/%Y, %I:%M:%S %p")
        time_label = Gtk.Label()
        time_label.set_markup(f"<span foreground='gray'>🕒 {time_str}</span>")
        time_label.set_halign(Gtk.Align.START)
        header_row.pack_start(time_label, True, True, 0)

        # Copy button (right) with reduced padding
        copy_btn = Gtk.Button(label="🗐 Copy")
        copy_btn.set_tooltip_text("Copy to clipboard")

        # Get the button's style context and reduce padding
        style_context = copy_btn.get_style_context()
        css_provider = Gtk.CssProvider()
        css_provider.load_from_data(b"""
            button {
                padding: 2px 8px;
                min-height: 0;
            }
        """)
        style_context.add_provider(css_provider, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION)

        copy_btn.connect("clicked", self.on_copy_clicked, item['content'])
        header_row.pack_end(copy_btn, False, False, 0)

        item_box.pack_start(header_row, False, False, 0)

        # Separator line between header and content
        separator = Gtk.Separator(orientation=Gtk.Orientation.HORIZONTAL)
        separator.set_margin_top(2)
        separator.set_margin_bottom(2)
        item_box.pack_start(separator, False, False, 0)

        # Use TextView for proper height handling
        text_view = Gtk.TextView()
        text_buffer = text_view.get_buffer()
        text_buffer.set_text(item['content'])
        text_view.set_wrap_mode(Gtk.WrapMode.WORD_CHAR)
        text_view.set_editable(False)
        text_view.set_cursor_visible(False)
        text_view.set_left_margin(10)
        text_view.set_right_margin(10)
        text_view.set_top_margin(10)
        text_view.set_bottom_margin(10)

        # Apply gray background and white text to TextView
        content_css = Gtk.CssProvider()
        content_css.load_from_data(b"""
            textview {
                background-color: #505050;
                color: #FFFFFF;
            }
            textview text {
                background-color: #505050;
                color: #FFFFFF;
            }
        """)
        text_view.get_style_context().add_provider(content_css, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION)

        # Calculate natural height for text view based on content
        # Create a temporary layout to measure text height
        layout = text_view.create_pango_layout(item['content'])
        layout.set_width(900 * 1024)  # Set width in pango units (pixels * 1024)
        layout.set_wrap(2)  # WORD_CHAR
        natural_height = layout.get_pixel_size()[1] + 20  # Add margins

        # Limit height between min and max
        content_height = max(50, min(natural_height, 350))  # Min 50px, Max 350px

        # Scrolled window that adjusts to content height
        content_scroll = Gtk.ScrolledWindow()
        content_scroll.set_policy(Gtk.PolicyType.AUTOMATIC, Gtk.PolicyType.AUTOMATIC)
        content_scroll.add(text_view)
        content_scroll.set_size_request(-1, content_height)

        item_box.pack_start(content_scroll, False, False, 0)

        container.pack_start(frame, False, False, 0)

    def on_copy_clicked(self, button, content):
        clipboard = Gtk.Clipboard.get(Gdk.SELECTION_CLIPBOARD)
        clipboard.set_text(content, -1)
        clipboard.store()

        # Show inline toast message
        toast = Gtk.InfoBar()
        toast.set_message_type(Gtk.MessageType.INFO)
        toast.set_show_close_button(False)

        content_area = toast.get_content_area()
        label = Gtk.Label(label="✓ Copied to clipboard")
        content_area.add(label)

        # Add toast to window
        if hasattr(self, 'main_box'):
            # Insert at top after header
            self.main_box.pack_start(toast, False, False, 0)
            self.main_box.reorder_child(toast, 1)  # After header, before separator
            toast.show_all()

            # Remove after 2 seconds
            GLib.timeout_add_seconds(2, lambda: (toast.destroy(), False)[1])

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
            # Clear via API - server will broadcast clear to all connected clients
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
