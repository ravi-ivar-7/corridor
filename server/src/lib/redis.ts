import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Helper function to get token-based key
const getClipboardKey = (token: string) => `clipboard:${token}`;

// Get max items from environment variable or use default
const MAX_ITEMS = process.env.NEXT_PUBLIC_MAX_HISTORY_ITEMS 
  ? parseInt(process.env.NEXT_PUBLIC_MAX_HISTORY_ITEMS, 10)
  : 50; // Default to 50 items

interface ClipboardItem {
  id: string;
  content: string;
  timestamp: number;
}

// Get all clipboard items for a specific token, most recent first
export async function getClipboardHistory(token: string): Promise<ClipboardItem[]> {
  if (!token) {
    throw new Error('Token is required');
  }
  
  try {
    const clipboardKey = getClipboardKey(token);
    const items = await redis.lrange(clipboardKey, 0, MAX_ITEMS - 1);
    
    if (!Array.isArray(items)) {
      console.error('Unexpected Redis response format - not an array');
      return [];
    }

    const parsedItems = items.map((item, index) => {
      try {
        // If item is already in the correct format
        if (item && typeof item === 'object' && 'content' in item) {
          return item as unknown as ClipboardItem;
        }
        
        // If item is a string, try to parse it
        if (typeof item === 'string') {
          const parsed = JSON.parse(item);
          if (parsed && typeof parsed === 'object' && 'content' in parsed) {
            return parsed as ClipboardItem;
          }
        }
        
        console.warn('Skipping invalid clipboard item at index', index, ':', item);
        return null;
      } catch (e) {
        console.error('Error processing clipboard item at index', index, ':', e);
        return null;
      }
    }).filter(Boolean) as ClipboardItem[];

    return parsedItems;
  } catch (error) {
    console.error('Error getting clipboard history:', error);
    return [];
  }
}

// Add new clipboard item for a specific token
export async function addToClipboard(token: string, content: string): Promise<ClipboardItem | null> {
  if (!token) {
    throw new Error('Token is required');
  }
  
  try {
    const clipboardKey = getClipboardKey(token);
    
    // Check the most recent item to avoid duplicates
    const recentItems = await redis.lrange(clipboardKey, 0, 0);
    if (recentItems.length > 0) {
      let recentItem: ClipboardItem | null = null;
      
      try {
        // Handle both string and object formats
        const item = recentItems[0];
        if (item && typeof item === 'object' && 'content' in item) {
          recentItem = item as unknown as ClipboardItem;
        } else if (typeof item === 'string') {
          recentItem = JSON.parse(item);
        }
        
        // If the content is the same as the most recent item, don't add it again
        if (recentItem && recentItem.content === content) {
          console.log('Skipping duplicate clipboard content');
          return null;
        }
      } catch (e) {
        console.warn('Error checking for duplicate content:', e);
        // Continue with adding the item if there was an error checking for duplicates
      }
    }
    
    const newItem: ClipboardItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      content: content,
      timestamp: Date.now()
    };

    // Ensure we're storing a properly stringified JSON object
    const itemString = JSON.stringify(newItem);
    
    // Add to the beginning of the list
    await redis.lpush(clipboardKey, itemString);
    
    // Trim the list to keep only the latest items
    await redis.ltrim(clipboardKey, 0, MAX_ITEMS - 1);
    
    return newItem;
  } catch (error) {
    console.error('Error adding to clipboard:', error);
    throw error; // Re-throw to be handled by the API route
  }
}

// Clear all clipboard history for a specific token
export async function clearClipboardHistory(token: string): Promise<boolean> {
  if (!token) {
    throw new Error('Token is required');
  }
  
  try {
    const clipboardKey = getClipboardKey(token);
    const result = await redis.del(clipboardKey);
    // redis.del() returns the number of keys that were removed
    return result > 0;
  } catch (error) {
    console.error('Error clearing clipboard history:', error);
    throw new Error('Failed to clear clipboard history');
  }
}
