use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub token: String,
    pub websocket_url: String,
    pub http_url: String,
    pub mode: AppMode,
    pub auto_start: bool,
    pub notifications: NotificationConfig,
    pub clipboard: ClipboardConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum AppMode {
    Interactive,
    Silent,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationConfig {
    pub local_copy: bool,
    pub remote_update: bool,
    pub errors: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClipboardConfig {
    pub history_size: usize,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            token: String::new(),
            websocket_url: "wss://corridor-worker.corridor-sync.workers.dev/ws".to_string(),
            http_url: "https://corridor-worker.corridor-sync.workers.dev/api".to_string(),
            mode: AppMode::Interactive,
            auto_start: true,
            notifications: NotificationConfig {
                local_copy: false,
                remote_update: true,
                errors: true,
            },
            clipboard: ClipboardConfig { history_size: 100 },
        }
    }
}

impl Config {
    pub fn config_dir() -> Result<PathBuf> {
        let config_dir = dirs::config_dir()
            .context("Failed to get config directory")?
            .join("corridor");
        fs::create_dir_all(&config_dir).context("Failed to create config directory")?;
        Ok(config_dir)
    }

    pub fn config_path() -> Result<PathBuf> {
        Ok(Self::config_dir()?.join("config.json"))
    }

    pub fn load() -> Result<Self> {
        let path = Self::config_path()?;
        if !path.exists() {
            return Ok(Self::default());
        }

        let content = fs::read_to_string(&path)
            .with_context(|| format!("Failed to read config file: {:?}", path))?;
        let config: Config = serde_json::from_str(&content)
            .with_context(|| format!("Failed to parse config file: {:?}", path))?;
        Ok(config)
    }

    pub fn is_configured(&self) -> bool {
        !self.token.is_empty()
    }
}
