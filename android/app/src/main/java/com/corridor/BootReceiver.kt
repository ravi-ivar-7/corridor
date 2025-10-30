package com.corridor

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.corridor.service.ClipboardSyncService
import com.corridor.util.Preferences

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            val token = Preferences.loadToken(context)
            val auto = Preferences.loadAutostart(context)
            if (auto && token.length >= 3) {
                val svc = Intent(context, ClipboardSyncService::class.java).apply {
                    putExtra("TOKEN", token)
                    putExtra("SILENT", Preferences.loadSilent(context))
                    putExtra("NOTIFY_LOCAL", Preferences.loadNotifyLocal(context))
                    putExtra("NOTIFY_REMOTE", Preferences.loadNotifyRemote(context))
                    putExtra("NOTIFY_ERRORS", Preferences.loadNotifyErrors(context))
                }
                context.startForegroundService(svc)
            }
        }
    }
}

