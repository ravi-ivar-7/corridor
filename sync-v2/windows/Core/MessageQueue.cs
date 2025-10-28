using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;

namespace ClipboardSyncClient.Core
{
    public class MessageQueue
    {
        private readonly Queue<ClipboardMessage> messageQueue = new Queue<ClipboardMessage>();
        private readonly object queueLock = new object();

        public void Enqueue(string content)
        {
            lock (queueLock)
            {
                var message = new ClipboardMessage
                {
                    Id = Guid.NewGuid().ToString(),
                    Content = content,
                    Timestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
                };
                messageQueue.Enqueue(message);
            }
        }

        public ClipboardMessage[] DequeueAll()
        {
            lock (queueLock)
            {
                var messages = messageQueue.ToArray();
                messageQueue.Clear();
                return messages;
            }
        }

        public int Count
        {
            get
            {
                lock (queueLock)
                {
                    return messageQueue.Count;
                }
            }
        }

        public bool IsEmpty
        {
            get
            {
                lock (queueLock)
                {
                    return messageQueue.Count == 0;
                }
            }
        }
    }

    public class ClipboardMessage
    {
        public string Id { get; set; } = "";
        public string Content { get; set; } = "";
        public long Timestamp { get; set; }
    }
}
