#!/usr/bin/env python3
import sys

try:
    import gi
    gi.require_version('Gtk', '3.0')
    from gi.repository import Gtk, Gdk, GLib
except ImportError:
    print("GTK3 not available, install python3-gi")
    sys.exit(1)

class BroadcastDialog(Gtk.Window):
    def __init__(self):
        Gtk.Window.__init__(self, title="Add to Clipboard")
        self.set_default_size(800, 550)
        self.set_border_width(15)
        self.result_text = None

        # Main container
        main_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=12)
        self.add(main_box)

        # Text view with scrolled window
        scrolled = Gtk.ScrolledWindow()
        scrolled.set_policy(Gtk.PolicyType.AUTOMATIC, Gtk.PolicyType.AUTOMATIC)
        scrolled.set_size_request(-1, 150)

        self.text_view = Gtk.TextView()
        self.text_view.set_wrap_mode(Gtk.WrapMode.WORD_CHAR)
        self.text_view.set_margin_top(8)
        self.text_view.set_margin_bottom(8)
        self.text_view.set_margin_start(8)
        self.text_view.set_margin_end(8)

        self.buffer = self.text_view.get_buffer()

        # Style the text view with border
        text_css = Gtk.CssProvider()
        text_css.load_from_data(b"""
            textview {
                border: 1px solid #d0d0d0;
                border-radius: 3px;
            }
        """)
        self.text_view.get_style_context().add_provider(text_css, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION)

        # Handle keyboard shortcuts
        self.text_view.connect("key-press-event", self.on_key_press)

        scrolled.add(self.text_view)
        main_box.pack_start(scrolled, True, True, 0)

        # Button bar
        button_box = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        button_box.set_margin_top(10)

        # Copy button
        copy_btn = Gtk.Button(label="Copy")
        copy_btn.set_size_request(100, -1)
        copy_btn.connect("clicked", self.on_copy_clicked)
        button_box.pack_start(copy_btn, False, False, 0)

        # Clear button
        clear_btn = Gtk.Button(label="Clear")
        clear_btn.set_size_request(100, -1)
        clear_btn.connect("clicked", self.on_clear_clicked)
        button_box.pack_start(clear_btn, False, False, 0)

        # Shortcut hint label (between Clear and Sync)
        shortcut_label = Gtk.Label()
        shortcut_label.set_markup("<span foreground='#808080' size='small'>Ctrl+Enter or Shift+Enter to send</span>")
        button_box.pack_start(shortcut_label, False, False, 15)

        # Spacer to push Sync button to right
        spacer = Gtk.Box()
        button_box.pack_start(spacer, True, True, 0)

        # Sync button (wider, right aligned)
        sync_btn = Gtk.Button(label="Sync")
        sync_btn.set_size_request(150, -1)
        sync_btn.connect("clicked", self.on_sync_clicked)
        button_box.pack_end(sync_btn, False, False, 0)

        main_box.pack_start(button_box, False, False, 0)

        # Focus on text view
        self.text_view.grab_focus()

    def on_key_press(self, widget, event):
        # Check for Ctrl+Enter OR Shift+Enter
        is_ctrl_enter = (event.state & Gdk.ModifierType.CONTROL_MASK and
                        event.keyval == Gdk.KEY_Return)
        is_shift_enter = (event.state & Gdk.ModifierType.SHIFT_MASK and
                         event.keyval == Gdk.KEY_Return)

        if is_ctrl_enter or is_shift_enter:
            self.on_sync_clicked(None)
            return True
        return False

    def on_copy_clicked(self, button):
        # Copy text to clipboard (don't close)
        start, end = self.buffer.get_bounds()
        text = self.buffer.get_text(start, end, True)

        if text:
            clipboard = Gtk.Clipboard.get(Gdk.SELECTION_CLIPBOARD)
            clipboard.set_text(text, -1)
            clipboard.store()
            self.show_toast("Copied to clipboard")

    def on_clear_clicked(self, button):
        # Clear the text (don't close)
        self.buffer.set_text("")
        self.text_view.grab_focus()

    def on_sync_clicked(self, button):
        # Get text and send to output (don't close)
        start, end = self.buffer.get_bounds()
        text = self.buffer.get_text(start, end, True)

        if text.strip():
            self.result_text = text
            # Send as base64 to handle multiline text properly
            import base64
            encoded = base64.b64encode(text.encode('utf-8')).decode('utf-8')
            print(f"SYNC:{encoded}", flush=True)
            self.show_toast("✓ Synced successfully")
        else:
            self.show_toast("Please enter some text")

    def show_toast(self, message):
        # Create overlay label for toast notification
        overlay = Gtk.Overlay()

        # Toast label
        toast_label = Gtk.Label()
        toast_label.set_markup(f"<span size='small'>{message}</span>")
        toast_label.set_halign(Gtk.Align.CENTER)
        toast_label.set_valign(Gtk.Align.END)
        toast_label.set_margin_bottom(15)

        # Style toast with background - reduced padding
        toast_css = Gtk.CssProvider()
        toast_css.load_from_data(b"""
            label {
                background-color: rgba(50, 50, 50, 0.9);
                color: white;
                padding: 6px 12px;
                border-radius: 4px;
            }
        """)
        toast_label.get_style_context().add_provider(toast_css, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION)

        # Add to window temporarily
        main_box = self.get_child()
        current_child = main_box.get_children()[0]

        # Create temporary overlay container
        temp_overlay = Gtk.Overlay()
        main_box.remove(current_child)
        temp_overlay.add(current_child)
        temp_overlay.add_overlay(toast_label)
        main_box.pack_start(temp_overlay, True, True, 0)
        main_box.reorder_child(temp_overlay, 0)
        temp_overlay.show_all()

        # Remove after 2 seconds
        def remove_toast():
            temp_overlay.remove(current_child)
            main_box.remove(temp_overlay)
            main_box.pack_start(current_child, True, True, 0)
            main_box.reorder_child(current_child, 0)
            return False

        GLib.timeout_add_seconds(2, remove_toast)

if __name__ == "__main__":
    win = BroadcastDialog()
    win.connect("destroy", Gtk.main_quit)
    win.show_all()
    Gtk.main()
