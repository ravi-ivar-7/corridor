use crate::history::ClipboardHistory;
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

    pub fn set_connected(&self, connected: bool) {
        *self.connected.lock().unwrap() = connected;
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

        let mut menu = vec![
            StandardItem {
                label: format!(
                    "Status: {} [Click to {}]",
                    if connected {
                        "✓ Connected"
                    } else {
                        "✗ Disconnected"
                    },
                    if connected {
                        "disconnect"
                    } else {
                        "reconnect"
                    }
                ),
                activate: Box::new(|_tray: &mut TrayIcon| {
                    log::info!("Connection control: Please restart application");
                    let _ = notify_rust::Notification::new()
                        .summary("Corridor")
                        .body("Please restart the application to change connection")
                        .icon("dialog-information")
                        .timeout(3000)
                        .show();
                }),
                ..Default::default()
            }
            .into(),
        ];

        if !recent_items.is_empty() {
            menu.push(
                StandardItem {
                    label: "Recent Clipboard:".to_string(),
                    enabled: false,
                    ..Default::default()
                }
                .into(),
            );

            for item in recent_items {
                // Truncate to single line (first 50 chars, no newlines)
                let single_line = item.content
                    .lines()
                    .next()
                    .unwrap_or("")
                    .chars()
                    .take(50)
                    .collect::<String>();

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
                                log::info!("Copied from history: {}...", &content_copy.chars().take(20).collect::<String>());
                            }
                        }),
                        ..Default::default()
                    }
                    .into(),
                );
            }

            menu.push(MenuItem::Separator);
        }

        menu.push(
            StandardItem {
                label: "Send to Server...".to_string(),
                activate: Box::new(|tray: &mut TrayIcon| {
                    use std::process::Command;

                    let output = Command::new("zenity")
                        .args(&[
                            "--entry",
                            "--title=Send to Server",
                            "--text=Enter text to send to server:",
                            "--width=400",
                        ])
                        .output();

                    match output {
                        Ok(result) if result.status.success() => {
                            let text = String::from_utf8_lossy(&result.stdout)
                                .trim()
                                .to_string();

                            if !text.is_empty() {
                                if let Some(ws_tx) = &tray.ws_tx {
                                    if let Ok(tx) = ws_tx.lock() {
                                        if tx.send(text.clone()).is_ok() {
                                            log::info!("Sent text to server: {}...", &text.chars().take(50).collect::<String>());
                                            let _ = notify_rust::Notification::new()
                                                .summary("Corridor")
                                                .body("Text sent to server")
                                                .icon("document-send")
                                                .timeout(2000)
                                                .show();
                                        } else {
                                            log::error!("Failed to send text to server");
                                            let _ = notify_rust::Notification::new()
                                                .summary("Corridor")
                                                .body("Failed to send text to server")
                                                .icon("dialog-error")
                                                .timeout(2000)
                                                .show();
                                        }
                                    }
                                } else {
                                    log::warn!("WebSocket sender not available");
                                }
                            }
                        }
                        Ok(_) => {
                            log::debug!("User cancelled input dialog");
                        }
                        Err(e) => {
                            log::error!("Failed to run zenity: {}", e);
                            let _ = notify_rust::Notification::new()
                                .summary("Corridor")
                                .body("Input dialog not available. Install 'zenity' package.")
                                .icon("dialog-error")
                                .timeout(3000)
                                .show();
                        }
                    }
                }),
                ..Default::default()
            }
            .into(),
        );

        menu.push(MenuItem::Separator);

        menu.push(
            StandardItem {
                label: "View Full History".to_string(),
                activate: Box::new(|tray: &mut TrayIcon| {
                    use std::process::Command;

                    let history = tray.history.lock().unwrap();
                    let all_items = history.get_all();

                    if all_items.is_empty() {
                        drop(history);
                        let _ = Command::new("zenity")
                            .args(&[
                                "--info",
                                "--title=Clipboard History",
                                "--text=No clipboard history available",
                                "--width=400",
                            ])
                            .spawn();
                        return;
                    }

                    let mut text = format!("<b>Clipboard History ({} items)</b>\n\n", all_items.len());
                    for (i, item) in all_items.iter().enumerate() {
                        let preview = if item.content.len() > 100 {
                            format!("{}...", &item.content.chars().take(100).collect::<String>())
                        } else {
                            item.content.clone()
                        };
                        let escaped = preview.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
                        text.push_str(&format!("{}. {}\n\n", i + 1, escaped));
                    }

                    drop(history);

                    let _ = Command::new("zenity")
                        .args(&[
                            "--text-info",
                            "--title=Clipboard History",
                            &format!("--width=600"),
                            &format!("--height=500"),
                        ])
                        .arg("--html")
                        .stdin(std::process::Stdio::piped())
                        .spawn()
                        .and_then(|mut child| {
                            use std::io::Write;
                            if let Some(stdin) = child.stdin.as_mut() {
                                let _ = stdin.write_all(text.as_bytes());
                            }
                            child.wait()
                        });
                }),
                ..Default::default()
            }
            .into(),
        );

        menu.push(
            StandardItem {
                label: "Clear History".to_string(),
                activate: Box::new(|tray: &mut TrayIcon| {
                    use std::process::Command;

                    // Clear local history
                    let mut hist = tray.history.lock().unwrap();
                    match hist.clear() {
                        Ok(_) => {
                            log::info!("✓ Local clipboard history cleared");
                            drop(hist);

                            // Clear server history via DELETE API
                            let url = format!("{}/clipboard/{}", tray.http_url, tray.token);
                            std::thread::spawn(move || {
                                let output = Command::new("curl")
                                    .args(&["-X", "DELETE", &url])
                                    .output();

                                match output {
                                    Ok(result) if result.status.success() => {
                                        log::info!("✓ Server clipboard history cleared");
                                    }
                                    Ok(_) => {
                                        log::warn!("Failed to clear server history");
                                    }
                                    Err(e) => {
                                        log::error!("Failed to call clear history API: {}", e);
                                    }
                                }
                            });

                            if let Err(e) = notify_rust::Notification::new()
                                .summary("Corridor")
                                .body("Clipboard history cleared")
                                .icon("edit-clear")
                                .timeout(2000)
                                .show()
                            {
                                log::warn!("Failed to show notification: {}", e);
                            }
                        }
                        Err(e) => {
                            log::error!("Failed to clear local history: {}", e);
                        }
                    }
                }),
                ..Default::default()
            }
            .into(),
        );

        menu.push(MenuItem::Separator);

        menu.push(
            StandardItem {
                label: "About".to_string(),
                activate: Box::new(|_tray: &mut TrayIcon| {
                    use std::process::Command;
                    let _ = Command::new("zenity")
                        .args(&[
                            "--info",
                            "--title=About Corridor",
                            "--text=<b>Corridor Clipboard Sync</b>\n\
                            Version 1.0.0\n\n\
                            Real-time clipboard synchronization\n\
                            across all your devices.\n\n\
                            Built with Rust for performance and reliability.\n\n\
                            © 2024 Ravi Kumar\n\
                            https://corridor.rknain.com",
                            "--width=400",
                        ])
                        .spawn();
                }),
                ..Default::default()
            }
            .into(),
        );

        menu.push(
            StandardItem {
                label: "Quit".to_string(),
                activate: Box::new(|_| {
                    log::info!("Quitting Corridor...");
                    std::process::exit(0);
                }),
                ..Default::default()
            }
            .into(),
        );

        menu
    }
}
