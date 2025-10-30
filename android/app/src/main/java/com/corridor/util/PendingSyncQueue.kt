package com.corridor.util

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

object PendingSyncQueue {
    private const val PREFS = "corridor_pending_sync"
    private const val KEY_QUEUE = "queue"
    private const val MAX_QUEUE_SIZE = 50

    data class PendingItem(val content: String, val timestamp: Long)

    fun add(context: Context, content: String, timestamp: Long = System.currentTimeMillis()) {
        val sp = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val arr = JSONArray(sp.getString(KEY_QUEUE, "[]"))

        // Check if last item has same content - avoid duplicates
        if (arr.length() > 0) {
            val lastItem = arr.getJSONObject(arr.length() - 1)
            if (lastItem.optString("content") == content) {
                return // Skip adding duplicate
            }
        }

        // Add to end of queue
        val obj = JSONObject()
            .put("content", content)
            .put("timestamp", timestamp)
        arr.put(obj)

        // Limit queue size
        val newArr = JSONArray()
        val startIndex = (arr.length() - MAX_QUEUE_SIZE).coerceAtLeast(0)
        for (i in startIndex until arr.length()) {
            newArr.put(arr.getJSONObject(i))
        }

        sp.edit().putString(KEY_QUEUE, newArr.toString()).apply()
    }

    fun getAll(context: Context): List<PendingItem> {
        val sp = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val arr = JSONArray(sp.getString(KEY_QUEUE, "[]"))
        val list = mutableListOf<PendingItem>()
        for (i in 0 until arr.length()) {
            val o = arr.getJSONObject(i)
            list.add(PendingItem(o.optString("content"), o.optLong("timestamp")))
        }
        return list
    }

    fun clear(context: Context) {
        val sp = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        sp.edit().putString(KEY_QUEUE, "[]").apply()
    }

    fun size(context: Context): Int {
        val sp = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val arr = JSONArray(sp.getString(KEY_QUEUE, "[]"))
        return arr.length()
    }
}
