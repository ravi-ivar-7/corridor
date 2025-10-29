#nullable enable
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Windows.Forms;

namespace ClipboardSyncClient.Core
{
    public class HotkeyManager : IDisposable
    {
        private readonly Dictionary<int, Action> hotkeys = new Dictionary<int, Action>();
        private readonly Dictionary<int, string> hotkeyNames = new Dictionary<int, string>();
        private bool disposed = false;

        // Windows API constants
        private const int WM_HOTKEY = 0x0312;
        private const int MOD_ALT = 0x0001;
        private const int MOD_CONTROL = 0x0002;
        private const int MOD_SHIFT = 0x0004;
        private const int MOD_WIN = 0x0008;

        // Windows API functions
        [DllImport("user32.dll")]
        private static extern bool RegisterHotKey(IntPtr hWnd, int id, int fsModifiers, int vk);

        [DllImport("user32.dll")]
        private static extern bool UnregisterHotKey(IntPtr hWnd, int id);

        [DllImport("user32.dll")]
        private static extern int RegisterWindowMessage(string lpString);

        public event EventHandler<string>? HotkeyPressed;

        public bool RegisterHotkey(string hotkeyString, Action action)
        {
            try
            {
                var (modifiers, key) = ParseHotkey(hotkeyString);
                int id = hotkeyString.GetHashCode();
                
                if (hotkeys.ContainsKey(id))
                {
                    UnregisterHotkey(hotkeyString);
                }

                bool success = RegisterHotKey(IntPtr.Zero, id, modifiers, key);
                if (success)
                {
                    hotkeys[id] = action;
                    hotkeyNames[id] = hotkeyString;
                    return true;
                }
                return false;
            }
            catch
            {
                return false;
            }
        }

        public bool UnregisterHotkey(string hotkeyString)
        {
            try
            {
                int id = hotkeyString.GetHashCode();
                if (hotkeys.ContainsKey(id))
                {
                    bool success = UnregisterHotKey(IntPtr.Zero, id);
                    if (success)
                    {
                        hotkeys.Remove(id);
                        hotkeyNames.Remove(id);
                    }
                    return success;
                }
                return true;
            }
            catch
            {
                return false;
            }
        }

        public void ProcessMessage(Message m)
        {
            if (m.Msg == WM_HOTKEY)
            {
                int id = m.WParam.ToInt32();
                if (hotkeys.ContainsKey(id))
                {
                    hotkeys[id]?.Invoke();
                    HotkeyPressed?.Invoke(this, hotkeyNames.GetValueOrDefault(id, "Unknown"));
                }
            }
        }

        private (int modifiers, int key) ParseHotkey(string hotkeyString)
        {
            int modifiers = 0;
            int key = 0;

            string[] parts = hotkeyString.ToUpper().Split('+');
            string keyPart = parts[parts.Length - 1].Trim();

            // Parse modifiers
            for (int i = 0; i < parts.Length - 1; i++)
            {
                string modifier = parts[i].Trim();
                switch (modifier)
                {
                    case "CTRL":
                    case "CONTROL":
                        modifiers |= MOD_CONTROL;
                        break;
                    case "ALT":
                        modifiers |= MOD_ALT;
                        break;
                    case "SHIFT":
                        modifiers |= MOD_SHIFT;
                        break;
                    case "WIN":
                    case "WINDOWS":
                        modifiers |= MOD_WIN;
                        break;
                }
            }

            // Parse key
            key = GetVirtualKey(keyPart);

            return (modifiers, key);
        }

        private int GetVirtualKey(string keyName)
        {
            // Handle function keys
            if (keyName.StartsWith("F") && keyName.Length > 1)
            {
                if (int.TryParse(keyName.Substring(1), out int fNumber) && fNumber >= 1 && fNumber <= 24)
                {
                    return (int)Keys.F1 + fNumber - 1;
                }
            }

            // Handle single character keys
            if (keyName.Length == 1)
            {
                return (int)Enum.Parse<Keys>(keyName);
            }

            // Handle special keys
            switch (keyName)
            {
                case "SPACE": return (int)Keys.Space;
                case "ENTER": return (int)Keys.Enter;
                case "TAB": return (int)Keys.Tab;
                case "ESC": case "ESCAPE": return (int)Keys.Escape;
                case "BACKSPACE": return (int)Keys.Back;
                case "DELETE": return (int)Keys.Delete;
                case "INSERT": return (int)Keys.Insert;
                case "HOME": return (int)Keys.Home;
                case "END": return (int)Keys.End;
                case "PAGEUP": return (int)Keys.PageUp;
                case "PAGEDOWN": return (int)Keys.PageDown;
                case "UP": return (int)Keys.Up;
                case "DOWN": return (int)Keys.Down;
                case "LEFT": return (int)Keys.Left;
                case "RIGHT": return (int)Keys.Right;
                default:
                    // Try to parse as Keys enum
                    if (Enum.TryParse<Keys>(keyName, true, out Keys key))
                    {
                        return (int)key;
                    }
                    throw new ArgumentException($"Unknown key: {keyName}");
            }
        }

        public static bool IsValidHotkey(string hotkeyString)
        {
            try
            {
                var manager = new HotkeyManager();
                var (modifiers, key) = manager.ParseHotkey(hotkeyString);
                return key > 0;
            }
            catch
            {
                return false;
            }
        }

        public static List<string> GetSuggestedHotkeys()
        {
            return new List<string>
            {
                "Ctrl+Alt+O",
                "Ctrl+Alt+X",
                "Ctrl+Shift+O",
                "Ctrl+Shift+X",
                "Alt+Shift+O",
                "Alt+Shift+X",
                "Ctrl+Alt+C",
                "Ctrl+Alt+S",
                "Ctrl+Alt+T",
                "Ctrl+Alt+Q"
            };
        }

        public void Dispose()
        {
            if (!disposed)
            {
                foreach (var id in hotkeys.Keys)
                {
                    UnregisterHotKey(IntPtr.Zero, id);
                }
                hotkeys.Clear();
                hotkeyNames.Clear();
                disposed = true;
            }
        }
    }
}
