package com.corridor.util

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

object HistoryStore {
    private const val PREFS = "corridor_history"
    private const val KEY_ITEMS = "items"
    private const val MAX_ITEMS = 100

    data class Entry(val type: String, val content: String, val ts: Long)

    fun add(context: Context, type: String, content: String, ts: Long = System.currentTimeMillis()) {
        val sp = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val arr = JSONArray(sp.getString(KEY_ITEMS, "[]"))

        // Check if last item (most recent) has same content - avoid duplicates
        if (arr.length() > 0) {
            val lastItem = arr.getJSONObject(0)
            if (lastItem.optString("content") == content) {
                return // Skip adding duplicate
            }
        }

        val obj = JSONObject()
            .put("type", type)
            .put("content", content)
            .put("ts", ts)
        // Prepend new entry
        val newArr = JSONArray()
        newArr.put(obj)
        for (i in 0 until arr.length().coerceAtMost(MAX_ITEMS - 1)) {
            newArr.put(arr.getJSONObject(i))
        }
        sp.edit().putString(KEY_ITEMS, newArr.toString()).apply()
    }

    fun getAll(context: Context): List<Entry> {
        val sp = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val arr = JSONArray(sp.getString(KEY_ITEMS, "[]"))
        val list = mutableListOf<Entry>()
        for (i in 0 until arr.length()) {
            val o = arr.getJSONObject(i)
            list.add(Entry(o.optString("type"), o.optString("content"), o.optLong("ts")))
        }
        return list
    }

    fun clear(context: Context) {
        val sp = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        sp.edit().putString(KEY_ITEMS, "[]").apply()
    }

    fun delete(context: Context, timestamp: Long) {
        val sp = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val arr = JSONArray(sp.getString(KEY_ITEMS, "[]"))
        val newArr = JSONArray()
        for (i in 0 until arr.length()) {
            val o = arr.getJSONObject(i)
            if (o.optLong("ts") != timestamp) {
                newArr.put(o)
            }
        }
        sp.edit().putString(KEY_ITEMS, newArr.toString()).apply()
    }
}

