#!/usr/bin/env python3
import sys

try:
    import gi
    gi.require_version('Gtk', '3.0')
    from gi.repository import Gtk, GdkPixbuf
except ImportError:
    print("GTK3 not available, install python3-gi")
    sys.exit(1)

class AboutDialog(Gtk.Window):
    def __init__(self):
        Gtk.Window.__init__(self, title="About Corridor")
        self.set_default_size(550, 450)
        self.set_border_width(0)
        self.set_resizable(False)

        # Main container
        main_box = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=0)
        self.add(main_box)

        # Header with simple background
        header = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=5)
        header.set_margin_top(15)
        header.set_margin_bottom(10)

        # App name
        app_name = Gtk.Label()
        app_name.set_markup("<span size='20000' weight='bold'>Corridor</span>")
        header.pack_start(app_name, False, False, 0)

        # Tagline
        tagline = Gtk.Label()
        tagline.set_markup("<span size='10000' foreground='#666666'>Real-time Cross-Device Clipboard Synchronization</span>")
        header.pack_start(tagline, False, False, 0)

        main_box.pack_start(header, False, False, 0)

        # Separator after header
        header_sep = Gtk.Separator(orientation=Gtk.Orientation.HORIZONTAL)
        main_box.pack_start(header_sep, False, False, 0)

        # Content area
        content = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=15)
        content.set_margin_top(25)
        content.set_margin_bottom(20)
        content.set_margin_start(40)
        content.set_margin_end(40)

        # Version
        version_label = Gtk.Label()
        version_label.set_markup("<b>Version:</b> 1.0.0 (Linux Edition)")
        version_label.set_halign(Gtk.Align.START)
        content.pack_start(version_label, False, False, 0)

        # Description
        desc_label = Gtk.Label()
        desc_label.set_markup(
            "<b>Description:</b>\n"
            "Production-ready clipboard synchronization for Linux.\n"
            "Fast, lightweight, and reliable with real-time WebSocket sync."
        )
        desc_label.set_line_wrap(True)
        desc_label.set_halign(Gtk.Align.START)
        desc_label.set_xalign(0)
        content.pack_start(desc_label, False, False, 0)

        # Features
        features_label = Gtk.Label()
        features_label.set_markup(
            "<b>Key Features:</b>\n"
            "• Event-based clipboard monitoring (&lt;10ms latency)\n"
            "• Real-time WebSocket synchronization\n"
            "• System tray integration with quick access\n"
            "• Clipboard history (last 100 items)\n"
            "• Desktop notifications\n"
            "• Single binary (~5MB), minimal RAM usage"
        )
        features_label.set_line_wrap(True)
        features_label.set_halign(Gtk.Align.START)
        features_label.set_xalign(0)
        content.pack_start(features_label, False, False, 0)

        # Built with
        built_label = Gtk.Label()
        built_label.set_markup(
            "<b>Built with:</b> Rust, Tokio, WebSockets, GTK3"
        )
        built_label.set_halign(Gtk.Align.START)
        content.pack_start(built_label, False, False, 0)

        # Copyright
        copyright_label = Gtk.Label()
        copyright_label.set_markup(
            "<b>Copyright:</b> © 2024 Ravi Kumar\n"
            "<b>License:</b> MIT"
        )
        copyright_label.set_halign(Gtk.Align.START)
        copyright_label.set_xalign(0)
        content.pack_start(copyright_label, False, False, 0)

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

        # Website button
        website_btn = Gtk.Button(label="🌐 Website")
        website_btn.connect("clicked", self.on_website_clicked)
        button_box.pack_start(website_btn, True, True, 0)

        # GitHub button
        github_btn = Gtk.Button(label="💻 GitHub")
        github_btn.connect("clicked", self.on_github_clicked)
        button_box.pack_start(github_btn, True, True, 0)

        # Documentation button
        docs_btn = Gtk.Button(label="📖 Docs")
        docs_btn.connect("clicked", self.on_docs_clicked)
        button_box.pack_start(docs_btn, True, True, 0)

        # Close button
        close_btn = Gtk.Button(label="Close")
        close_btn.connect("clicked", self.on_close_clicked)
        button_box.pack_end(close_btn, False, False, 0)

        main_box.pack_start(button_box, False, False, 0)

    def on_website_clicked(self, button):
        import subprocess
        subprocess.Popen(["xdg-open", "https://corridor.rknain.com"])

    def on_github_clicked(self, button):
        import subprocess
        subprocess.Popen(["xdg-open", "https://github.com/ravikumar-ravi/corridor"])

    def on_docs_clicked(self, button):
        import subprocess
        subprocess.Popen(["xdg-open", "https://corridor.rknain.com/docs"])

    def on_close_clicked(self, button):
        Gtk.main_quit()

if __name__ == "__main__":
    dialog = AboutDialog()
    dialog.connect("destroy", Gtk.main_quit)
    dialog.show_all()
    Gtk.main()
