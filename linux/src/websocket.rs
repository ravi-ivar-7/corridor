use anyhow::{Context, Result};
use chrono::Utc;
use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use serde_json::json;
use tokio::sync::mpsc;
use tokio::time::{interval, Duration};
use tokio_tungstenite::{connect_async, tungstenite::Message};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryData {
    pub id: String,
    pub content: String,
    pub timestamp: i64,
}

#[derive(Debug, Clone)]
pub enum WsEvent {
    Connected,
    Disconnected,
    ClipboardUpdate(String),
    ClipboardHistory(Vec<HistoryData>),
    ClearHistory,
    Error(String),
}

pub struct WebSocketClient {
    token: String,
    url: String,
}

impl WebSocketClient {
    pub fn new(token: String, websocket_url: String) -> Self {
        Self {
            token,
            url: websocket_url,
        }
    }

    pub async fn connect_and_run(
        self,
        mut rx: mpsc::UnboundedReceiver<String>,
        tx: mpsc::UnboundedSender<WsEvent>,
    ) -> Result<()> {
        loop {
            match self.connect_once(&mut rx, &tx).await {
                Ok(_) => {
                    log::info!("WebSocket connection closed normally");
                }
                Err(e) => {
                    log::error!("WebSocket connection error: {}", e);
                    let _ = tx.send(WsEvent::Error(e.to_string()));
                }
            }

            let _ = tx.send(WsEvent::Disconnected);
            log::info!("Reconnecting in 5 seconds...");
            tokio::time::sleep(Duration::from_secs(5)).await;
        }
    }

    async fn connect_once(
        &self,
        rx: &mut mpsc::UnboundedReceiver<String>,
        tx: &mpsc::UnboundedSender<WsEvent>,
    ) -> Result<()> {
        let url = format!("{}?token={}", self.url, self.token);
        log::info!("Connecting to WebSocket: {}", self.url);

        let (ws_stream, _) = connect_async(&url)
            .await
            .context("Failed to connect to WebSocket")?;

        log::info!("✓ WebSocket connected");
        let _ = tx.send(WsEvent::Connected);

        let (mut write, mut read) = ws_stream.split();

        // Request history on connect
        let request_history = json!({
            "type": "clipboard_history"
        });
        if let Err(e) = write.send(Message::Text(request_history.to_string())).await {
            log::error!("Failed to request history: {}", e);
        } else {
            log::info!("Requested clipboard history from server");
        }

        // Use 5-second ping interval for faster disconnection detection
        let mut ping_interval = interval(Duration::from_secs(5));
        // If we don't get any response (pong or any message) within 10 seconds, disconnect
        let mut last_response = tokio::time::Instant::now();
        let connection_timeout = Duration::from_secs(10);

        loop {
            // Check if connection is dead (no response in 10 seconds)
            if last_response.elapsed() > connection_timeout {
                log::error!("Connection timeout - no response in {:?}", connection_timeout);
                break;
            }

            tokio::select! {
                msg = read.next() => {
                    match msg {
                        Some(Ok(Message::Text(text))) => {
                            last_response = tokio::time::Instant::now();
                            self.handle_message(&text, tx)?;
                        }
                        Some(Ok(Message::Close(_))) => {
                            log::info!("WebSocket closed by server");
                            break;
                        }
                        Some(Ok(Message::Ping(_))) => {
                            last_response = tokio::time::Instant::now();
                            log::debug!("Received ping");
                        }
                        Some(Ok(Message::Pong(_))) => {
                            last_response = tokio::time::Instant::now();
                            log::debug!("Received pong - connection alive");
                        }
                        Some(Err(e)) => {
                            log::error!("WebSocket read error: {}", e);
                            break;
                        }
                        None => {
                            log::info!("WebSocket stream ended");
                            break;
                        }
                        _ => {}
                    }
                }

                content = rx.recv() => {
                    if let Some(content) = content {
                        let msg = json!({
                            "type": "clipboard_update",
                            "data": {
                                "content": content,
                                "timestamp": Utc::now().timestamp_millis()
                            }
                        });

                        if let Err(e) = write.send(Message::Text(msg.to_string())).await {
                            log::error!("Failed to send clipboard update: {}", e);
                            break;
                        }
                        log::info!("✓ Sent clipboard update");
                    }
                }

                _ = ping_interval.tick() => {
                    log::debug!("Sending ping to check connection");
                    if let Err(e) = write.send(Message::Ping(vec![])).await {
                        log::error!("Failed to send ping: {}", e);
                        break;
                    }
                }

                _ = tokio::time::sleep(Duration::from_millis(100)) => {
                    // Small sleep to check timeout regularly without busy-waiting
                }
            }
        }

        Ok(())
    }

    fn handle_message(&self, text: &str, tx: &mpsc::UnboundedSender<WsEvent>) -> Result<()> {
        let value: serde_json::Value = serde_json::from_str(text)
            .context("Failed to parse WebSocket message")?;

        match value.get("type").and_then(|v| v.as_str()) {
            Some("clipboard_update") => {
                if let Some(data) = value.get("data") {
                    if let Some(content) = data.get("content").and_then(|v| v.as_str()) {
                        log::info!("Remote clipboard update: {}...", &content.chars().take(50).collect::<String>());
                        let _ = tx.send(WsEvent::ClipboardUpdate(content.to_string()));
                    }
                }
            }
            Some("clipboard_history") => {
                if let Some(history) = value.get("history") {
                    if let Ok(history_items) = serde_json::from_value::<Vec<HistoryData>>(history.clone()) {
                        log::info!("Received clipboard history: {} items", history_items.len());
                        let _ = tx.send(WsEvent::ClipboardHistory(history_items));
                    }
                }
            }
            Some("clear_history") => {
                log::info!("History cleared on server");
                let _ = tx.send(WsEvent::ClearHistory);
            }
            Some("pong") => {
                log::debug!("Received pong");
            }
            Some("error") => {
                if let Some(error) = value.get("error").and_then(|v| v.as_str()) {
                    log::error!("Server error: {}", error);
                    let _ = tx.send(WsEvent::Error(error.to_string()));
                }
            }
            _ => {
                log::warn!("Unknown message type: {:?}", value.get("type"));
            }
        }

        Ok(())
    }
}
