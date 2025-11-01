use crate::history::ClipboardHistory;
use chrono::DateTime;
use ksni;
use std::sync::{Arc, Mutex};
use tokio::sync::mpsc;

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
        // Using standard icon names as fallback
        if *self.connected.lock().unwrap() {
            "edit-copy".to_string()
        } else {
            "edit-copy".to_string()
        }
    }

    fn title(&self) -> String {
        "C".to_string()
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
        menu.push(
            StandardItem {
                label: format!(
                    "Status: {}",
                    if connected { "✓ Connected" } else { "✗ Disconnected" }
                ),
                enabled: false,
                ..Default::default()
            }
            .into(),
        );

        // 2. Send to Server
        menu.push(
            StandardItem {
                label: "Send to Server...".to_string(),
                activate: Box::new(|tray: &mut TrayIcon| {
                    use std::process::Command;
                    let output = Command::new("zenity")
                        .args(&[
                            "--text-info",
                            "--editable",
                            "--title=Send to Server",
                            "--width=600",
                            "--height=400"
                        ])
                        .output();

                    if let Ok(result) = output {
                        if result.status.success() {
                            let text = String::from_utf8_lossy(&result.stdout).trim().to_string();
                            if !text.is_empty() {
                                if let Some(ws_tx) = &tray.ws_tx {
                                    if let Ok(tx) = ws_tx.lock() {
                                        let _ = tx.send(text.clone());
                                        let _ = notify_rust::Notification::new()
                                            .summary("Corridor")
                                            .body("Text sent to server")
                                            .timeout(2000)
                                            .show();
                                    }
                                }
                            }
                        }
                    }
                }),
                ..Default::default()
            }
            .into(),
        );

        menu.push(MenuItem::Separator);

        // 3. Recent Clipboard
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
                        label: format!("{} 🗐", preview),
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
                label: "History ⮞".to_string(),
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
                                        .map(|p| p.join("../../show_history.py"))
                                        .unwrap_or_else(|| std::path::PathBuf::from("show_history.py"));

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
                                let mut hist = tray.history.lock().unwrap();
                                if hist.clear().is_ok() {
                                    drop(hist);
                                    let url = format!("{}/clipboard/{}", tray.http_url, tray.token);
                                    std::thread::spawn(move || {
                                        let _ = Command::new("curl").args(&["-X", "DELETE", &url]).output();
                                    });
                                    let _ = notify_rust::Notification::new()
                                        .summary("Corridor")
                                        .body("History cleared")
                                        .timeout(2000)
                                        .show();
                                }
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

        // 4. Application submenu (with chevron ⮞)
        menu.push(
            SubMenu {
                label: "Application ⮞".to_string(),
                submenu: vec![
                    StandardItem {
                        label: "Settings".to_string(),
                        activate: Box::new(|_tray: &mut TrayIcon| {
                            use std::process::Command;
                            let _ = Command::new("zenity")
                                .args(&["--info", "--title=Settings", "--text=Please edit:\n~/.config/corridor/config.json", "--width=400"])
                                .spawn();
                        }),
                        ..Default::default()
                    }
                    .into(),
                    StandardItem {
                        label: "Help".to_string(),
                        activate: Box::new(|_tray: &mut TrayIcon| {
                            use std::process::Command;
                            let _ = Command::new("zenity")
                                .args(&[
                                    "--info",
                                    "--title=Help",
                                    "--text=<b>Corridor Clipboard Sync</b>\n\n\
                                    • Copy text to sync across devices\n\
                                    • Click history items to copy\n\
                                    • Send to Server for manual push\n\n\
                                    Visit: https://corridor.rknain.com",
                                    "--width=400",
                                ])
                                .spawn();
                        }),
                        ..Default::default()
                    }
                    .into(),
                    StandardItem {
                        label: "About".to_string(),
                        activate: Box::new(|_tray: &mut TrayIcon| {
                            use std::process::Command;
                            let _ = Command::new("zenity")
                                .args(&[
                                    "--info",
                                    "--title=About",
                                    "--text=<b>Corridor Clipboard Sync</b>\nVersion 1.0.0\n\n\
                                    Real-time clipboard sync\n\
                                    Built with Rust\n\n\
                                    © 2024 Ravi Kumar",
                                    "--width=400",
                                ])
                                .spawn();
                        }),
                        ..Default::default()
                    }
                    .into(),
                ],
                ..Default::default()
            }
            .into(),
        );

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
