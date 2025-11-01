#!/usr/bin/env python3
import sys

try:
    import gi
    gi.require_version('Gtk', '3.0')
    from gi.repository import Gtk
except ImportError:
    print("GTK3 not available, install python3-gi")
    sys.exit(1)

class HelpDialog(Gtk.Window):
    def __init__(self):
        Gtk.Window.__init__(self, title="Corridor Help")
        self.set_default_size(550, 600)
        self.set_border_width(0)
        self.set_resizable(False)

        # Main container
        main_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=0)
        self.add(main_box)

        # Content area
        content = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=15)
        content.set_margin_top(20)
        content.set_margin_bottom(15)
        content.set_margin_start(40)
        content.set_margin_end(40)

        # Quick Start
        quick_start = Gtk.Label()
        quick_start.set_markup(
            "<b>Quick Start:</b>\n"
            "Copy text on any device and it automatically syncs across\n"
            "all your connected devices in real-time."
        )
        quick_start.set_line_wrap(True)
        quick_start.set_halign(Gtk.Align.START)
        quick_start.set_xalign(0)
        content.pack_start(quick_start, False, False, 0)

        # Resources section
        resources_label = Gtk.Label()
        resources_label.set_markup("<b>Documentation & Guides:</b>")
        resources_label.set_halign(Gtk.Align.START)
        resources_label.set_margin_top(5)
        content.pack_start(resources_label, False, False, 0)

        # First row of buttons
        button_row1 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        button_row1.set_margin_start(5)

        btn1 = Gtk.Button(label="All Resources")
        btn1.connect("clicked", lambda b: self.open_url("https://corridor.rknain.com/resources"))
        button_row1.pack_start(btn1, True, True, 0)

        btn2 = Gtk.Button(label="What is Clipboard Sync?")
        btn2.connect("clicked", lambda b: self.open_url("https://corridor.rknain.com/resources/what-is-clipboard-sync"))
        button_row1.pack_start(btn2, True, True, 0)

        content.pack_start(button_row1, False, False, 0)

        # Second row of buttons
        button_row2 = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        button_row2.set_margin_start(5)

        btn3 = Gtk.Button(label="How to Use Corridor")
        btn3.connect("clicked", lambda b: self.open_url("https://corridor.rknain.com/resources/how-to-use"))
        button_row2.pack_start(btn3, True, True, 0)

        btn4 = Gtk.Button(label="Official Website")
        btn4.connect("clicked", lambda b: self.open_url("https://corridor.rknain.com/"))
        button_row2.pack_start(btn4, True, True, 0)

        content.pack_start(button_row2, False, False, 0)

        # Tips section
        tips_label = Gtk.Label()
        tips_label.set_markup("<b>Quick Tips:</b>")
        tips_label.set_halign(Gtk.Align.START)
        tips_label.set_margin_top(10)
        content.pack_start(tips_label, False, False, 0)

        tips_text = Gtk.Label()
        tips_text.set_markup(
            "• Copy text to sync across devices\n"
            "• Click history items to copy them\n"
            "• Use Clipboard Broadcast to send text manually\n"
            "• Check connection status in tray icon"
        )
        tips_text.set_halign(Gtk.Align.START)
        tips_text.set_xalign(0)
        tips_text.set_margin_start(5)
        content.pack_start(tips_text, False, False, 0)

        main_box.pack_start(content, True, True, 0)

        # Separator
        separator = Gtk.Separator(orientation=Gtk.Orientation.HORIZONTAL)
        main_box.pack_start(separator, False, False, 0)

        # Button area
        button_box = Gtk.Box(orientation=Gtk.Orientation.HORIZONTAL, spacing=10)
        button_box.set_margin_top(15)
        button_box.set_margin_bottom(15)
        button_box.set_margin_start(40)
        button_box.set_margin_end(40)

        # Close button
        close_btn = Gtk.Button(label="Close")
        close_btn.connect("clicked", self.on_close_clicked)
        button_box.pack_end(close_btn, False, False, 0)

        main_box.pack_start(button_box, False, False, 0)

    def open_url(self, url):
        import subprocess
        subprocess.Popen(["xdg-open", url])

    def on_close_clicked(self, button):
        Gtk.main_quit()

if __name__ == "__main__":
    dialog = HelpDialog()
    dialog.connect("destroy", Gtk.main_quit)
    dialog.show_all()
    Gtk.main()
