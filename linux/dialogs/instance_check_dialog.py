#!/usr/bin/env python3
import sys

try:
    import gi
    gi.require_version('Gtk', '3.0')
    from gi.repository import Gtk
except ImportError:
    print("GTK3 not available")
    sys.exit(1)

class InstanceDialog(Gtk.Dialog):
    def __init__(self):
        Gtk.Dialog.__init__(self, title="Corridor Already Running")
        self.set_default_size(400, 150)
        self.set_border_width(10)

        # Content area
        content = self.get_content_area()
        content.set_spacing(10)

        # Message
        message_label = Gtk.Label()
        message_label.set_markup("<b>Corridor is already running</b>\n\nAnother instance of Corridor is already active.")
        message_label.set_line_wrap(True)
        message_label.set_halign(Gtk.Align.CENTER)
        content.pack_start(message_label, True, True, 10)

        # Button box
        button_box = self.get_action_area()

        # Cancel button
        cancel_btn = Gtk.Button(label="Cancel")
        cancel_btn.connect("clicked", self.on_cancel)
        button_box.pack_start(cancel_btn, False, False, 0)

        # Terminate button
        terminate_btn = Gtk.Button(label="Terminate and Start Again")
        terminate_btn.connect("clicked", self.on_terminate)

        # Style terminate button
        terminate_css = Gtk.CssProvider()
        terminate_css.load_from_data(b"""
            button {
                background-color: #e74c3c;
                color: white;
            }
        """)
        terminate_btn.get_style_context().add_provider(terminate_css, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION)

        button_box.pack_end(terminate_btn, False, False, 0)

        self.result = "cancel"

    def on_cancel(self, button):
        self.result = "cancel"
        Gtk.main_quit()

    def on_terminate(self, button):
        self.result = "terminate"
        Gtk.main_quit()

if __name__ == "__main__":
    dialog = InstanceDialog()
    dialog.show_all()
    Gtk.main()

    # Print result for Rust to read
    print(dialog.result)
