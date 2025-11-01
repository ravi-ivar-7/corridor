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

    // Check for single instance
    let instance = single_instance::SingleInstance::new("corridor-clipboard-sync")
        .context("Failed to create single instance lock")?;

    if !instance.is_single() {
        use std::process::Command;

        // Show dialog to user
        let script_path = std::env::current_exe()
            .ok()
            .and_then(|p| p.parent().map(|p| p.to_path_buf()))
            .map(|p| p.join("../../dialogs/instance_check_dialog.py"))
            .unwrap_or_else(|| std::path::PathBuf::from("dialogs/instance_check_dialog.py"));

        let output = Command::new("python3")
            .arg(&script_path)
            .output();

        if let Ok(result) = output {
            if result.status.success() {
                let choice = String::from_utf8_lossy(&result.stdout).trim().to_string();
                if choice == "terminate" {
                    // Get current process ID to exclude it
                    let current_pid = std::process::id();

                    // Kill existing corridor processes (excluding current one)
                    let output = Command::new("pgrep")
                        .args(&["-f", "corridor"])
                        .output();

                    if let Ok(pgrep_result) = output {
                        let pids = String::from_utf8_lossy(&pgrep_result.stdout);
                        for pid_str in pids.lines() {
                            if let Ok(pid) = pid_str.trim().parse::<u32>() {
                                if pid != current_pid {
                                    // Kill the other corridor process
                                    let _ = Command::new("kill")
                                        .arg(pid.to_string())
                                        .output();
                                }
                            }
                        }
                    }

                    // Wait a moment for process to die
                    std::thread::sleep(std::time::Duration::from_secs(1));

                    // Force release the lock by dropping and recreating
                    drop(instance);

                    // Continue - will reacquire lock below
                    log::info!("Terminated existing instance, starting new one");
                } else {
                    // User chose cancel
                    log::info!("User chose to keep existing instance");
                    std::process::exit(0);
                }
            } else {
                // Dialog failed, exit
                eprintln!("❌ Corridor is already running!");
                std::process::exit(1);
            }
        } else {
            // Failed to show dialog
            eprintln!("❌ Corridor is already running!");
            std::process::exit(1);
        }
    }

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

    // Create in-memory history (no local storage)
    let history = Arc::new(Mutex::new(
        ClipboardHistory::new(config.clipboard.history_size)
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
    let history_for_sync = history.clone();
    let clipboard_to_ws_tx_for_sync = clipboard_to_ws_tx.clone();

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

                            // Try to send to websocket, if fails add to queue
                            if clipboard_to_ws_tx.send(content.clone()).is_err() {
                                log::warn!("WebSocket not available, adding to sync queue");
                                history.lock().unwrap().add_to_sync_queue(content.clone());
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

                        // Sync pending items from queue
                        let pending_items = {
                            let mut hist = history_for_sync.lock().unwrap();
                            let count = hist.pending_sync_count();
                            if count > 0 {
                                log::info!("Found {} pending items to sync", count);
                                hist.get_pending_syncs()
                            } else {
                                Vec::new()
                            }
                        };

                        if !pending_items.is_empty() {
                            let count = pending_items.len();
                            log::info!("Syncing {} queued items to server", count);
                            for pending in pending_items {
                                if let Err(e) = clipboard_to_ws_tx_for_sync.send(pending.content.clone()) {
                                    log::error!("Failed to sync queued item: {}", e);
                                    // Re-add to queue if failed
                                    history_for_sync.lock().unwrap().add_to_sync_queue(pending.content);
                                } else {
                                    log::info!("✓ Synced queued item");
                                }
                            }
                            notify("Corridor", &format!("Synced {} queued clipboard items", count));
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
                        log::info!("Received {} history items from server", items.len());
                        let mut hist = history.lock().unwrap();
                        // Clear local history and replace with server history
                        let _ = hist.clear();
                        for item in items {
                            hist.add_remote(item.id, item.content, item.timestamp);
                        }
                        log::info!("✓ Local history synced with server");
                    }
                    WsEvent::ClearHistory => {
                        log::info!("Clearing local history (server cleared)");
                        let mut hist = history.lock().unwrap();
                        hist.clear();
                        log::info!("✓ Local history cleared");
                        if config.notifications.remote_update {
                            notify("Corridor", "History cleared");
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
