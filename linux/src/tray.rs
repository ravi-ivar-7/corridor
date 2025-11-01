use crate::history::ClipboardHistory;
use ksni;
use std::sync::{Arc, Mutex};
use tokio::sync::mpsc;
use base64::{Engine as _, engine::general_purpose};

pub struct TrayIcon {
    connected: Arc<Mutex<bool>>,
    history: Arc<Mutex<ClipboardHistory>>,
    ws_tx: Option<Arc<Mutex<mpsc::UnboundedSender<String>>>>,
    http_url: String,
    token: String,
}

impl TrayIcon {
    pub fn new(
        history: Arc<Mutex<ClipboardHistory>>,
        ws_tx: Option<mpsc::UnboundedSender<String>>,
        http_url: String,
        token: String,
    ) -> Self {
        Self {
            connected: Arc::new(Mutex::new(false)),
            history,
            ws_tx: ws_tx.map(|tx| Arc::new(Mutex::new(tx))),
            http_url,
            token,
        }
    }

    pub fn get_connected_handle(&self) -> Arc<Mutex<bool>> {
        self.connected.clone()
    }

    pub fn spawn(self) {
        std::thread::spawn(move || {
            let service = ksni::TrayService::new(self);
            let handle = service.handle();
            service.spawn();

            loop {
                std::thread::sleep(std::time::Duration::from_secs(1));
                handle.update(|_tray: &mut TrayIcon| {});
            }
        });
    }
}

impl ksni::Tray for TrayIcon {
    fn icon_name(&self) -> String {
        String::new()
    }

    fn title(&self) -> String {
        "C".to_string()
    }

    fn icon_pixmap(&self) -> Vec<ksni::Icon> {
        // Create a simple 22x22 icon with letter "C"
        let size = 22;
        let mut data = Vec::with_capacity((size * size * 4) as usize);

        // Simple letter C pattern (white on transparent)
        // Rows representing a "C" shape
        let c_pattern = [
            "     CCCCCCC     ",
            "   CCCCCCCCCCC   ",
            "  CCCCC   CCCCC  ",
            " CCCC       CCCC ",
            " CCC         CCC ",
            "CCC           CCC",
            "CCC              ",
            "CCC              ",
            "CCC              ",
            "CCC              ",
            "CCC              ",
            "CCC              ",
            "CCC              ",
            "CCC           CCC",
            " CCC         CCC ",
            " CCCC       CCCC ",
            "  CCCCC   CCCCC  ",
            "   CCCCCCCCCCC   ",
            "     CCCCCCC     ",
        ];

        for y in 0..size {
            for x in 0..size {
                let (r, g, b, a) = if y < 19 && x < 17 {
                    let row = c_pattern.get(y as usize).unwrap_or(&"");
                    if row.chars().nth(x as usize).unwrap_or(' ') == 'C' {
                        (255u8, 255u8, 255u8, 255u8) // White
                    } else {
                        (0u8, 0u8, 0u8, 0u8) // Transparent
                    }
                } else {
                    (0u8, 0u8, 0u8, 0u8) // Transparent
                };

                data.push(a);
                data.push(r);
                data.push(g);
                data.push(b);
            }
        }

        vec![ksni::Icon {
            width: size,
            height: size,
            data,
        }]
    }

    fn id(&self) -> String {
        "corridor".to_string()
    }

    fn category(&self) -> ksni::Category {
        ksni::Category::ApplicationStatus
    }

    fn menu(&self) -> Vec<ksni::MenuItem<Self>> {
        use ksni::menu::*;

        let connected = *self.connected.lock().unwrap();
        let history = self.history.lock().unwrap();
        let recent_items = history.get_recent(5);

        let mut menu = vec![];

        // 1. Status (non-clickable)
        let pending_count = history.pending_sync_count();
        let status_label = if connected {
            if pending_count > 0 {
                format!("Status: ✓ Connected (Syncing {} items...)", pending_count)
            } else {
                "Status: ✓ Connected".to_string()
            }
        } else {
            if pending_count > 0 {
                format!("Status: ✗ Disconnected ({} pending)", pending_count)
            } else {
                "Status: ✗ Disconnected".to_string()
            }
        };

        menu.push(
            StandardItem {
                label: status_label,
                enabled: false,
                ..Default::default()
            }
            .into(),
        );

        // 2. Clipboard Broadcast
        menu.push(
            StandardItem {
                label: "Clipboard Broadcast...".to_string(),
                activate: Box::new(|tray: &mut TrayIcon| {
                    use std::process::Command;
                    use std::io::{BufRead, BufReader};

                    // Launch custom broadcast dialog
                    let script_path = std::env::current_exe()
                        .ok()
                        .and_then(|p| p.parent().map(|p| p.to_path_buf()))
                        .map(|p| p.join("../../dialogs/broadcast_dialog.py"))
                        .unwrap_or_else(|| std::path::PathBuf::from("dialogs/broadcast_dialog.py"));

                    let ws_tx_clone = tray.ws_tx.clone();
                    std::thread::spawn(move || {
                        // Run dialog as a persistent process to read multiple outputs
                        if let Ok(mut child) = Command::new("python3")
                            .arg(&script_path)
                            .stdout(std::process::Stdio::piped())
                            .spawn()
                        {
                            if let Some(stdout) = child.stdout.take() {
                                let reader = BufReader::new(stdout);
                                for line in reader.lines() {
                                    if let Ok(line_text) = line {
                                        let line_text = line_text.trim();
                                        // Check for SYNC: prefix with base64 encoded content
                                        if line_text.starts_with("SYNC:") {
                                            if let Some(encoded) = line_text.strip_prefix("SYNC:") {
                                                // Decode base64 to get full text
                                                if let Ok(decoded_bytes) = general_purpose::STANDARD.decode(encoded) {
                                                    if let Ok(text) = String::from_utf8(decoded_bytes) {
                                                        if !text.is_empty() {
                                                            if let Some(ws_tx) = &ws_tx_clone {
                                                                if let Ok(tx) = ws_tx.lock() {
                                                                    let _ = tx.send(text);
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            let _ = child.wait();
                        }
                    });
                }),
                ..Default::default()
            }
            .into(),
        );

        menu.push(MenuItem::Separator);

        // 3. Application submenu
        menu.push(
            SubMenu {
                label: "App Menu".to_string(),
                submenu: vec![
                    StandardItem {
                        label: "Settings".to_string(),
                        activate: Box::new(|_tray: &mut TrayIcon| {
                            use std::process::Command;

                            let script_path = std::env::current_exe()
                                .ok()
                                .and_then(|p| p.parent().map(|p| p.to_path_buf()))
                                .map(|p| p.join("../../dialogs/settings_dialog.py"))
                                .unwrap_or_else(|| std::path::PathBuf::from("dialogs/settings_dialog.py"));

                            std::thread::spawn(move || {
                                let _ = Command::new("python3")
                                    .arg(&script_path)
                                    .spawn();
                            });
                        }),
                        ..Default::default()
                    }
                    .into(),
                    StandardItem {
                        label: "Help".to_string(),
                        activate: Box::new(|_tray: &mut TrayIcon| {
                            use std::process::Command;

                            let script_path = std::env::current_exe()
                                .ok()
                                .and_then(|p| p.parent().map(|p| p.to_path_buf()))
                                .map(|p| p.join("../../dialogs/help_dialog.py"))
                                .unwrap_or_else(|| std::path::PathBuf::from("dialogs/help_dialog.py"));

                            std::thread::spawn(move || {
                                let _ = Command::new("python3")
                                    .arg(&script_path)
                                    .spawn();
                            });
                        }),
                        ..Default::default()
                    }
                    .into(),
                    StandardItem {
                        label: "About".to_string(),
                        activate: Box::new(|_tray: &mut TrayIcon| {
                            use std::process::Command;

                            let script_path = std::env::current_exe()
                                .ok()
                                .and_then(|p| p.parent().map(|p| p.to_path_buf()))
                                .map(|p| p.join("../../dialogs/about_dialog.py"))
                                .unwrap_or_else(|| std::path::PathBuf::from("dialogs/about_dialog.py"));

                            std::thread::spawn(move || {
                                let _ = Command::new("python3")
                                    .arg(&script_path)
                                    .spawn();
                            });
                        }),
                        ..Default::default()
                    }
                    .into(),
                ],
                ..Default::default()
            }
            .into(),
        );

        menu.push(MenuItem::Separator);

        // 4. Recent Clipboard
        menu.push(
            StandardItem {
                label: "Recent Clipboard:".to_string(),
                enabled: false,
                ..Default::default()
            }
            .into(),
        );

        if !recent_items.is_empty() {
            for item in recent_items {
                let single_line = item.content.lines().next().unwrap_or("").chars().take(50).collect::<String>();
                let preview = if item.content.len() > 50 || item.content.contains('\n') {
                    format!("{}...", single_line)
                } else {
                    single_line
                };

                let content_copy = item.content.clone();
                menu.push(
                    StandardItem {
                        label: format!("🗐 {}", preview),
                        activate: Box::new(move |_tray: &mut TrayIcon| {
                            if let Ok(mut clipboard) = arboard::Clipboard::new() {
                                let _ = clipboard.set_text(&content_copy);
                            }
                        }),
                        ..Default::default()
                    }
                    .into(),
                );
            }
        } else {
            menu.push(
                StandardItem {
                    label: "  No history available".to_string(),
                    enabled: false,
                    ..Default::default()
                }
                .into(),
            );
        }

        // History submenu (with chevron ⮞)
        menu.push(
            SubMenu {
                label: "Manage History".to_string(),
                submenu: vec![
                        StandardItem {
                            label: "View Full History".to_string(),
                            activate: Box::new(|tray: &mut TrayIcon| {
                                use std::process::Command;

                                let http_url = tray.http_url.clone();
                                let token = tray.token.clone();

                                std::thread::spawn(move || {
                                    let script_path = std::env::current_exe()
                                        .ok()
                                        .and_then(|p| p.parent().map(|p| p.to_path_buf()))
                                        .map(|p| p.join("../../dialogs/show_history.py"))
                                        .unwrap_or_else(|| std::path::PathBuf::from("dialogs/show_history.py"));

                                    // Pass "fetch" as first arg to fetch from server
                                    let _ = Command::new("python3")
                                        .arg(&script_path)
                                        .arg("fetch")
                                        .arg(&http_url)
                                        .arg(&token)
                                        .spawn();
                                });
                            }),
                            ..Default::default()
                        }
                        .into(),
                        StandardItem {
                            label: "Clear History".to_string(),
                            activate: Box::new(|tray: &mut TrayIcon| {
                                use std::process::Command;
                                // Clear on server - server will broadcast clear_history to all clients
                                let url = format!("{}/clipboard/{}", tray.http_url, tray.token);
                                std::thread::spawn(move || {
                                    let _ = Command::new("curl").args(&["-X", "DELETE", &url]).output();
                                });
                                let _ = notify_rust::Notification::new()
                                    .summary("Corridor")
                                    .body("Clearing history...")
                                    .timeout(2000)
                                    .show();
                            }),
                            ..Default::default()
                        }
                        .into(),
                    ],
                    ..Default::default()
                }
                .into(),
            );

        menu.push(MenuItem::Separator);

        // 5. Quit
        menu.push(
            StandardItem {
                label: "Quit".to_string(),
                activate: Box::new(|_| {
                    std::process::exit(0);
                }),
                ..Default::default()
            }
            .into(),
        );

        menu
    }
}
