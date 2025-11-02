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
use std::io::Write;

// Embed all Python dialog scripts
pub const SETUP_DIALOG: &str = include_str!("../dialogs/setup_dialog.py");
pub const INSTANCE_CHECK_DIALOG: &str = include_str!("../dialogs/instance_check_dialog.py");
pub const BROADCAST_DIALOG: &str = include_str!("../dialogs/broadcast_dialog.py");
pub const SETTINGS_DIALOG: &str = include_str!("../dialogs/settings_dialog.py");
pub const HELP_DIALOG: &str = include_str!("../dialogs/help_dialog.py");
pub const ABOUT_DIALOG: &str = include_str!("../dialogs/about_dialog.py");
pub const SHOW_HISTORY: &str = include_str!("../dialogs/show_history.py");

// Helper function to extract embedded dialog to temp file
pub fn extract_dialog(content: &str, name: &str) -> Result<std::path::PathBuf> {
    let temp_dir = std::env::temp_dir().join("corridor-dialogs");
    std::fs::create_dir_all(&temp_dir)?;

    let dialog_path = temp_dir.join(name);
    let mut file = std::fs::File::create(&dialog_path)?;
    file.write_all(content.as_bytes())?;

    // Make executable
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let mut perms = file.metadata()?.permissions();
        perms.set_mode(0o755);
        std::fs::set_permissions(&dialog_path, perms)?;
    }

    Ok(dialog_path)
}

#[tokio::main]
async fn main() -> Result<()> {
    // Parse command line arguments
    let args: Vec<String> = std::env::args().collect();

    // Handle help flag
    if args.contains(&"--help".to_string()) || args.contains(&"-h".to_string()) {
        println!("corridor - Cross-platform Clipboard Sync v1.0.0");
        println!();
        println!("USAGE:");
        println!("    corridor [OPTIONS]");
        println!();
        println!("OPTIONS:");
        println!("    -h, --help       Show this help message");
        println!("    -d, --debug      Run in debug mode (attached to terminal)");
        println!("    --autostart      Start in autostart mode (skips setup dialog)");
        println!();
        println!("By default, corridor runs detached from the terminal.");
        println!("Use --debug to see logs in the terminal.");
        return Ok(());
    }

    let is_debug = args.contains(&"--debug".to_string()) || args.contains(&"-d".to_string());
    let is_autostart = args.contains(&"--autostart".to_string());

    // Detach from terminal unless debug mode or autostart
    if !is_debug && !is_autostart {
        use std::process::Command;

        // Check if we're already running detached (to avoid infinite recursion)
        let is_detached = std::env::var("CORRIDOR_DETACHED").is_ok();

        if !is_detached {
            // Fork and run in background
            let mut cmd = Command::new(&args[0]);
            cmd.env("CORRIDOR_DETACHED", "1");

            // Pass through all args except the program name
            for arg in &args[1..] {
                cmd.arg(arg);
            }

            // Detach from terminal
            cmd.stdin(std::process::Stdio::null())
               .stdout(std::process::Stdio::null())
               .stderr(std::process::Stdio::null());

            cmd.spawn().context("Failed to spawn detached process")?;

            // Exit the parent process
            return Ok(());
        }
    }

    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    log::info!("Starting corridor Linux Client v1.0.0 (debug: {})", is_debug);

    // If not autostart, show setup dialog
    if !is_autostart {
        use std::process::Command;

        log::info!("Manual start detected, showing setup dialog");

        // Extract embedded setup dialog to temp file
        let script_path = extract_dialog(SETUP_DIALOG, "setup_dialog.py")
            .context("Failed to extract setup dialog")?;

        let status = Command::new("python3")
            .arg(&script_path)
            .status()
            .context("Failed to start setup dialog")?;

        // Check exit code - 0 means "Save and Start", non-zero means cancelled
        if !status.success() {
            log::info!("Setup dialog cancelled by user (exit code: {:?})", status.code());
            return Ok(());
        }

        log::info!("Setup dialog completed with success, continuing to start Corridor");
    } else {
        log::info!("Starting with --autostart flag, skipping setup dialog");
    }

    // Check for single instance
    let mut instance = single_instance::SingleInstance::new("corridor-clipboard-sync")
        .context("Failed to create single instance lock")?;

    if !instance.is_single() {
        use std::process::Command;

        // Extract embedded instance check dialog to temp file
        let script_path = extract_dialog(INSTANCE_CHECK_DIALOG, "instance_check_dialog.py")
            .context("Failed to extract instance check dialog")?;

        let output = Command::new("python3")
            .arg(&script_path)
            .output();

        if let Ok(result) = output {
            if result.status.success() {
                let choice = String::from_utf8_lossy(&result.stdout).trim().to_string();
                if choice == "terminate" {
                    // Get current process ID to exclude it from kill
                    let current_pid = std::process::id();

                    // Find all corridor processes
                    let pgrep_output = Command::new("pgrep")
                        .args(&["-f", "corridor"])
                        .output();

                    if let Ok(result) = pgrep_output {
                        let pids = String::from_utf8_lossy(&result.stdout);
                        for pid_str in pids.lines() {
                            if let Ok(pid) = pid_str.trim().parse::<u32>() {
                                // Only kill if it's not the current process
                                if pid != current_pid {
                                    log::info!("Killing corridor process with PID: {}", pid);
                                    let _ = Command::new("kill")
                                        .args(&["-9", &pid.to_string()])
                                        .output();
                                }
                            }
                        }
                    }

                    log::info!("Killed existing corridor processes");

                    // Wait a moment for process to die and lock to release
                    std::thread::sleep(std::time::Duration::from_secs(2));

                    // Force release the lock by dropping
                    drop(instance);

                    // Re-acquire the lock
                    instance = single_instance::SingleInstance::new("corridor-clipboard-sync")
                        .context("Failed to re-acquire single instance lock")?;

                    if !instance.is_single() {
                        eprintln!("❌ Failed to terminate existing instance");
                        std::process::exit(1);
                    }

                    log::info!("Successfully terminated existing instance and acquired lock");
                } else {
                    // User chose cancel
                    log::info!("User chose to keep existing instance");
                    std::process::exit(0);
                }
            } else {
                // Dialog failed, exit
                eprintln!("❌ corridor is already running!");
                std::process::exit(1);
            }
        } else {
            // Failed to show dialog
            eprintln!("❌ corridor is already running!");
            std::process::exit(1);
        }
    }

    let config = Config::load().context("Failed to load configuration")?;

    if !config.is_configured() {
        eprintln!("❌ corridor is not configured.");
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

    let (tray_connected, tray_handle) = if matches!(config.mode, AppMode::Interactive) {
        let tray = TrayIcon::new(
            history.clone(),
            Some(clipboard_to_ws_tx.clone()),
            config.http_url.clone(),
            config.token.clone(),
        );
        let connected_handle = tray.get_connected_handle();
        let handle = tray.spawn();
        (Some(connected_handle), Some(handle))
    } else {
        (None, None)
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

                            // Always trigger immediate tray update when history changes
                            if let Some(ref handle) = tray_handle {
                                handle.update(|tray| {
                                    if let Ok(mut counter) = tray.refresh_counter.lock() {
                                        *counter = counter.wrapping_add(1);
                                    }
                                });
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

                        // Trigger immediate tray update
                        if let Some(ref handle) = tray_handle {
                            handle.update(|tray| {
                                if let Ok(mut counter) = tray.refresh_counter.lock() {
                                    *counter = counter.wrapping_add(1);
                                }
                            });
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

                            // Trigger immediate tray update to show pending count cleared
                            if let Some(ref handle) = tray_handle {
                                handle.update(|tray| {
                                    if let Ok(mut counter) = tray.refresh_counter.lock() {
                                        *counter = counter.wrapping_add(1);
                                    }
                                });
                            }
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

                        // Trigger immediate tray update
                        if let Some(ref handle) = tray_handle {
                            handle.update(|tray| {
                                if let Ok(mut counter) = tray.refresh_counter.lock() {
                                    *counter = counter.wrapping_add(1);
                                }
                            });
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

                                // Trigger immediate tray update to show new history item
                                if let Some(ref handle) = tray_handle {
                                    handle.update(|tray| {
                                        if let Ok(mut counter) = tray.refresh_counter.lock() {
                                            *counter = counter.wrapping_add(1);
                                        }
                                    });
                                }

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
                        drop(hist); // Release the lock before updating tray
                        log::info!("✓ Local history synced with server");

                        // Trigger immediate tray update to show new history
                        if let Some(ref handle) = tray_handle {
                            handle.update(|tray| {
                                if let Ok(mut counter) = tray.refresh_counter.lock() {
                                    *counter = counter.wrapping_add(1);
                                }
                            });
                        }
                    }
                    WsEvent::ClearHistory => {
                        log::info!("Clearing local history (server cleared)");
                        let mut hist = history.lock().unwrap();
                        hist.clear();
                        drop(hist); // Release the lock before updating tray
                        log::info!("✓ Local history cleared");

                        // Trigger immediate tray update to show cleared history
                        if let Some(ref handle) = tray_handle {
                            handle.update(|tray| {
                                if let Ok(mut counter) = tray.refresh_counter.lock() {
                                    *counter = counter.wrapping_add(1);
                                }
                            });
                        }

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
