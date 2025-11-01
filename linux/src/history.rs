use anyhow::{Context, Result};
use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::fs;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryItem {
    pub id: String,
    pub content: String,
    pub timestamp: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub source: Option<String>,
}

impl HistoryItem {
    pub fn new(content: String) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            content,
            timestamp: Utc::now().timestamp_millis(),
            source: Some("local".to_string()),
        }
    }

    pub fn from_remote(id: String, content: String, timestamp: i64) -> Self {
        Self {
            id,
            content,
            timestamp,
            source: Some("remote".to_string()),
        }
    }

}

pub struct ClipboardHistory {
    items: Vec<HistoryItem>,
    max_items: usize,
}

impl ClipboardHistory {
    pub fn load(max_items: usize) -> Result<Self> {
        let path = crate::config::Config::config_dir()?.join("history.json");

        let items = if path.exists() {
            let content = fs::read_to_string(&path)
                .with_context(|| format!("Failed to read history file: {:?}", path))?;
            serde_json::from_str(&content)
                .with_context(|| format!("Failed to parse history file: {:?}", path))?
        } else {
            Vec::new()
        };

        Ok(Self { items, max_items })
    }

    pub fn add(&mut self, item: HistoryItem) {
        if self.items.is_empty() || self.items[0].content != item.content {
            self.items.insert(0, item);

            if self.items.len() > self.max_items {
                self.items.truncate(self.max_items);
            }

            if let Err(e) = self.save() {
                log::error!("Failed to save history: {}", e);
            }
        }
    }

    pub fn add_local(&mut self, content: String) {
        self.add(HistoryItem::new(content));
    }

    pub fn add_remote(&mut self, id: String, content: String, timestamp: i64) {
        self.add(HistoryItem::from_remote(id, content, timestamp));
    }

    pub fn get_all(&self) -> &[HistoryItem] {
        &self.items
    }

    pub fn get_recent(&self, count: usize) -> &[HistoryItem] {
        let end = count.min(self.items.len());
        &self.items[..end]
    }

    pub fn clear(&mut self) -> Result<()> {
        self.items.clear();
        self.save()
    }

    fn save(&self) -> Result<()> {
        let path = crate::config::Config::config_dir()?.join("history.json");
        let json = serde_json::to_string_pretty(&self.items)
            .context("Failed to serialize history")?;
        fs::write(&path, json)
            .with_context(|| format!("Failed to write history file: {:?}", path))?;
        Ok(())
    }
}
