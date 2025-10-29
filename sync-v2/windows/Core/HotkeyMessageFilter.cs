#nullable enable
using System;
using System.Windows.Forms;

namespace ClipboardSyncClient.Core
{
    public class HotkeyMessageFilter : IMessageFilter
    {
        private readonly HotkeyManager hotkeyManager;

        public HotkeyMessageFilter(HotkeyManager hotkeyManager)
        {
            this.hotkeyManager = hotkeyManager;
        }

        public bool PreFilterMessage(ref Message m)
        {
            hotkeyManager.ProcessMessage(m);
            return false; // Let the message continue to other filters
        }
    }
}
