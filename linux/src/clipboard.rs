use anyhow::{Context, Result};
use arboard::Clipboard;
use clipboard_master::{CallbackResult, ClipboardHandler, Master};
use std::sync::{Arc, Mutex};
use tokio::sync::mpsc;

#[derive(Debug, Clone)]
pub enum ClipboardEvent {
    LocalChange(String),
    Error(String),
}

pub struct ClipboardManager {
    clipboard: Arc<Mutex<Clipboard>>,
    last_content: Arc<Mutex<String>>,
    ignore_next: Arc<Mutex<bool>>,
}

impl ClipboardManager {
    pub fn new() -> Result<Self> {
        let clipboard = Clipboard::new().context("Failed to create clipboard")?;
        Ok(Self {
            clipboard: Arc::new(Mutex::new(clipboard)),
            last_content: Arc::new(Mutex::new(String::new())),
            ignore_next: Arc::new(Mutex::new(false)),
        })
    }

    pub fn get_text(&self) -> Result<String> {
        let mut clipboard = self.clipboard.lock().unwrap();
        clipboard
            .get_text()
            .context("Failed to get clipboard text")
    }

    pub fn set_text(&self, text: String, from_remote: bool) -> Result<()> {
        if from_remote {
            *self.ignore_next.lock().unwrap() = true;
        }

        {
            let mut clipboard = self.clipboard.lock().unwrap();
            clipboard
                .set_text(&text)
                .context("Failed to set clipboard text")?;
        }

        *self.last_content.lock().unwrap() = text;
        Ok(())
    }

    pub fn start_monitoring(self, tx: mpsc::UnboundedSender<ClipboardEvent>) -> Result<()> {
        let last_content = self.last_content.clone();
        let ignore_next = self.ignore_next.clone();

        if let Ok(initial) = self.get_text() {
            *last_content.lock().unwrap() = initial;
        }

        std::thread::spawn(move || {
            struct Handler {
                tx: mpsc::UnboundedSender<ClipboardEvent>,
                last_content: Arc<Mutex<String>>,
                ignore_next: Arc<Mutex<bool>>,
            }

            impl ClipboardHandler for Handler {
                fn on_clipboard_change(&mut self) -> CallbackResult {
                    let mut clipboard = match Clipboard::new() {
                        Ok(cb) => cb,
                        Err(e) => {
                            log::error!("Failed to create clipboard: {}", e);
                            return CallbackResult::Next;
                        }
                    };

                    match clipboard.get_text() {
                        Ok(text) => {
                            let should_ignore = {
                                let mut ignore = self.ignore_next.lock().unwrap();
                                if *ignore {
                                    *ignore = false;
                                    true
                                } else {
                                    false
                                }
                            };

                            if should_ignore {
                                *self.last_content.lock().unwrap() = text;
                                return CallbackResult::Next;
                            }

                            let last = self.last_content.lock().unwrap().clone();
                            if text != last {
                                log::info!("Clipboard changed: {}...", &text.chars().take(50).collect::<String>());
                                *self.last_content.lock().unwrap() = text.clone();
                                if self.tx.send(ClipboardEvent::LocalChange(text)).is_err() {
                                    log::error!("Failed to send clipboard event");
                                    return CallbackResult::Stop;
                                }
                            }
                        }
                        Err(e) => {
                            log::warn!("Failed to get clipboard text: {}", e);
                        }
                    }
                    CallbackResult::Next
                }

                fn on_clipboard_error(&mut self, error: std::io::Error) -> CallbackResult {
                    log::error!("Clipboard error: {}", error);
                    let _ = self.tx.send(ClipboardEvent::Error(error.to_string()));
                    CallbackResult::Next
                }
            }

            let handler = Handler {
                tx,
                last_content,
                ignore_next,
            };

            log::info!("Starting clipboard monitoring...");
            match Master::new(handler) {
                Ok(mut master) => {
                    if let Err(e) = master.run() {
                        log::error!("Clipboard monitoring stopped: {}", e);
                    }
                }
                Err(e) => {
                    log::error!("Failed to create clipboard master: {}", e);
                }
            }
        });

        Ok(())
    }
}
