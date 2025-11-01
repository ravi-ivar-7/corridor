mod clipboard;
mod config;
mod history;
mod tray;
mod websocket;

use anyhow::{Context, Result};
use clipboard::{ClipboardEvent, ClipboardManager};
use config::{AppMode, Config};
use history::ClipboardHistory;
use std::sync::{Arc, Mutex};
use tokio::sync::mpsc;
use tray::TrayIcon;
use websocket::{WebSocketClient, WsEvent};

#[tokio::main]
async fn main() -> Result<()> {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    log::info!("Starting Corridor Linux Client v1.0.0");

    let config = Config::load().context("Failed to load configuration")?;

    if !config.is_configured() {
        eprintln!("❌ Corridor is not configured.");
        eprintln!("Please create a config file at: {:?}", Config::config_path()?);
        eprintln!("\nExample config:");
        eprintln!("{}", serde_json::to_string_pretty(&Config::default())?);
        eprintln!("\nSet your 'token' field to get started.");
        std::process::exit(1);
    }

    log::info!("Configuration loaded. Token: {}", &config.token);
    log::info!("Mode: {:?}", config.mode);

    let history = Arc::new(Mutex::new(
        ClipboardHistory::load(config.clipboard.history_size)
            .context("Failed to load clipboard history")?,
    ));

    let clipboard_manager =
        ClipboardManager::new().context("Failed to create clipboard manager")?;

    let (clipboard_tx, mut clipboard_rx) = mpsc::unbounded_channel::<ClipboardEvent>();
    let (ws_tx, mut ws_rx) = mpsc::unbounded_channel::<WsEvent>();
    let (clipboard_to_ws_tx, clipboard_to_ws_rx) = mpsc::unbounded_channel::<String>();

    clipboard_manager
        .start_monitoring(clipboard_tx)
        .context("Failed to start clipboard monitoring")?;

    let ws_client = WebSocketClient::new(config.token.clone(), config.websocket_url.clone());
    let ws_handle = tokio::spawn(async move {
        ws_client
            .connect_and_run(clipboard_to_ws_rx, ws_tx)
            .await
    });

    let tray_connected = if matches!(config.mode, AppMode::Interactive) {
        let tray = TrayIcon::new(
            history.clone(),
            Some(clipboard_to_ws_tx.clone()),
            config.http_url.clone(),
            config.token.clone(),
        );
        let connected_handle = tray.get_connected_handle();
        tray.spawn();
        Some(connected_handle)
    } else {
        None
    };

    let clipboard_manager_for_remote = ClipboardManager::new()?;
    let history_for_clipboard = history.clone();
    let notify_enabled = config.notifications.remote_update;

    log::info!("✓ Corridor is running");
    println!("✓ Corridor clipboard sync is active");
    println!("Press Ctrl+C to stop");

    loop {
        tokio::select! {
            Some(event) = clipboard_rx.recv() => {
                match event {
                    ClipboardEvent::LocalChange(content) => {
                        log::info!("Local clipboard changed");

                        // Check if this is different from the last item to avoid duplicates
                        let should_send = {
                            let hist = history.lock().unwrap();
                            let recent = hist.get_recent(1);
                            recent.is_empty() || recent[0].content != content
                        };

                        if should_send {
                            history.lock().unwrap().add_local(content.clone());

                            if clipboard_to_ws_tx.send(content.clone()).is_err() {
                                log::error!("Failed to send clipboard to WebSocket");
                            }

                            if config.notifications.local_copy {
                                notify("Copied", &format!("{}", &content.chars().take(50).collect::<String>()));
                            }
                        } else {
                            log::debug!("Skipping duplicate local clipboard update");
                        }
                    }
                    ClipboardEvent::Error(err) => {
                        log::error!("Clipboard error: {}", err);
                        if config.notifications.errors {
                            notify("Clipboard Error", &err);
                        }
                    }
                }
            }

            Some(event) = ws_rx.recv() => {
                match event {
                    WsEvent::Connected => {
                        log::info!("✓ WebSocket connected");
                        if let Some(ref tray_conn) = tray_connected {
                            *tray_conn.lock().unwrap() = true;
                        }
                        if config.notifications.remote_update {
                            notify("Corridor", "Connected to sync server");
                        }
                    }
                    WsEvent::Disconnected => {
                        log::warn!("✗ WebSocket disconnected");
                        if let Some(ref tray_conn) = tray_connected {
                            *tray_conn.lock().unwrap() = false;
                        }
                        if config.notifications.errors {
                            notify("Corridor", "Disconnected from sync server");
                        }
                    }
                    WsEvent::ClipboardUpdate(content) => {
                        log::info!("Remote clipboard update received");

                        // Check if this is different from current content to avoid duplicates
                        let should_update = {
                            let hist = history_for_clipboard.lock().unwrap();
                            let recent = hist.get_recent(1);
                            recent.is_empty() || recent[0].content != content
                        };

                        if should_update {
                            if let Err(e) = clipboard_manager_for_remote.set_text(content.clone(), true) {
                                log::error!("Failed to update local clipboard: {}", e);
                            } else {
                                history_for_clipboard.lock().unwrap().add_remote(
                                    format!("remote-{}", chrono::Utc::now().timestamp_millis()),
                                    content.clone(),
                                    chrono::Utc::now().timestamp_millis()
                                );
                                log::info!("✓ Updated local clipboard from remote");

                                if notify_enabled {
                                    notify("Remote Clipboard", &format!("{}", &content.chars().take(50).collect::<String>()));
                                }
                            }
                        } else {
                            log::debug!("Skipping duplicate clipboard update");
                        }
                    }
                    WsEvent::ClipboardHistory(items) => {
                        log::info!("Received {} history items", items.len());
                        let mut hist = history.lock().unwrap();
                        for item in items {
                            hist.add_remote(item.id, item.content, item.timestamp);
                        }
                    }
                    WsEvent::Error(err) => {
                        log::error!("WebSocket error: {}", err);
                        if config.notifications.errors {
                            notify("Connection Error", &err);
                        }
                    }
                }
            }

            else => {
                log::info!("All channels closed, shutting down");
                break;
            }
        }
    }

    ws_handle.abort();
    log::info!("Corridor stopped");
    Ok(())
}

fn notify(title: &str, body: &str) {
    use notify_rust::Notification;

    if let Err(e) = Notification::new()
        .summary(title)
        .body(body)
        .icon("edit-copy")
        .timeout(3000)
        .show()
    {
        log::warn!("Failed to show notification: {}", e);
    }
}
