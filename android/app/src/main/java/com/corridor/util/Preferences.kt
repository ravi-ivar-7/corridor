package com.corridor.util

import android.content.Context
import android.content.SharedPreferences

object Preferences {
    private const val PREFS = "corridor_prefs"
    private const val KEY_TOKEN = "token"
    private const val KEY_SILENT = "silent"
    private const val KEY_NOTIFY = "notify" // legacy
    private const val KEY_AUTOSTART = "autostart"
    private const val KEY_NOTIFY_LOCAL = "notify_local"
    private const val KEY_NOTIFY_REMOTE = "notify_remote"
    private const val KEY_NOTIFY_ERRORS = "notify_errors"

    private fun prefs(ctx: Context): SharedPreferences =
        ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    fun save(
        ctx: Context,
        token: String,
        silent: Boolean,
        notifyLocal: Boolean,
        notifyRemote: Boolean,
        notifyErrors: Boolean,
        autostart: Boolean
    ) {
        prefs(ctx).edit()
            .putString(KEY_TOKEN, token)
            .putBoolean(KEY_SILENT, silent)
            .putBoolean(KEY_NOTIFY_LOCAL, notifyLocal)
            .putBoolean(KEY_NOTIFY_REMOTE, notifyRemote)
            .putBoolean(KEY_NOTIFY_ERRORS, notifyErrors)
            .putBoolean(KEY_AUTOSTART, autostart)
            .apply()
    }

    fun loadToken(ctx: Context): String = prefs(ctx).getString(KEY_TOKEN, "") ?: ""
    fun loadSilent(ctx: Context): Boolean = prefs(ctx).getBoolean(KEY_SILENT, false)

    fun loadNotifyLocal(ctx: Context): Boolean {
        val p = prefs(ctx)
        return p.getBoolean(KEY_NOTIFY_LOCAL, p.getBoolean(KEY_NOTIFY, true))
    }
    fun loadNotifyRemote(ctx: Context): Boolean {
        val p = prefs(ctx)
        return p.getBoolean(KEY_NOTIFY_REMOTE, p.getBoolean(KEY_NOTIFY, true))
    }
    fun loadNotifyErrors(ctx: Context): Boolean {
        val p = prefs(ctx)
        return p.getBoolean(KEY_NOTIFY_ERRORS, p.getBoolean(KEY_NOTIFY, false)) // Default: false
    }

    fun loadAutostart(ctx: Context): Boolean = prefs(ctx).getBoolean(KEY_AUTOSTART, false)
}

