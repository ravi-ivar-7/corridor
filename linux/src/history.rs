use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use std::collections::VecDeque;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryItem {
    pub id: String,
    pub content: String,
    pub timestamp: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub source: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PendingSync {
    pub content: String,
    pub timestamp: i64,
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
    pending_sync_queue: VecDeque<PendingSync>,
}

impl ClipboardHistory {
    pub fn new(max_items: usize) -> Self {
        Self {
            items: Vec::new(),
            max_items,
            pending_sync_queue: VecDeque::new(),
        }
    }

    pub fn add_to_sync_queue(&mut self, content: String) {
        let pending = PendingSync {
            content,
            timestamp: Utc::now().timestamp_millis(),
        };
        self.pending_sync_queue.push_back(pending);
        log::info!("Added to sync queue. Queue size: {}", self.pending_sync_queue.len());
    }

    pub fn get_pending_syncs(&mut self) -> Vec<PendingSync> {
        let items: Vec<PendingSync> = self.pending_sync_queue.drain(..).collect();
        log::info!("Retrieved {} pending syncs from queue", items.len());
        items
    }

    pub fn pending_sync_count(&self) -> usize {
        self.pending_sync_queue.len()
    }

    pub fn add(&mut self, item: HistoryItem) {
        // Only add if it's different from the most recent item (don't duplicate consecutively)
        if self.items.is_empty() || self.items[0].content != item.content {
            self.items.insert(0, item);

            if self.items.len() > self.max_items {
                self.items.truncate(self.max_items);
            }
        }
    }

    pub fn add_local(&mut self, content: String) {
        self.add(HistoryItem::new(content));
    }

    pub fn add_remote(&mut self, id: String, content: String, timestamp: i64) {
        self.add(HistoryItem::from_remote(id, content, timestamp));
    }

    pub fn get_recent(&self, count: usize) -> &[HistoryItem] {
        let end = count.min(self.items.len());
        &self.items[..end]
    }

    pub fn clear(&mut self) {
        self.items.clear();
    }
}
