'use client'

import { useState, useEffect } from 'react'
import { Copy, Clock, Trash2, Pencil } from 'lucide-react'

interface ClipboardHistoryProps {
  lastMessage: string | null
  websocket: WebSocket | null
  token: string
  onFillInput?: (content: string) => void
}

interface ClipboardItem {
  id: string
  content: string
  timestamp: number
}

interface WebSocketMessage {
  type: 'clipboard_history' | 'clipboard_update' | 'ping' | 'pong' | 'error'
  token?: string
  data?: ClipboardItem
  history?: ClipboardItem[]
  message?: string
}

export function ClipboardHistory({ lastMessage, websocket, token, onFillInput }: ClipboardHistoryProps) {
  const [history, setHistory] = useState<ClipboardItem[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    if (!lastMessage) return

    const processMessage = () => {
      try {
        const message: WebSocketMessage = JSON.parse(lastMessage)

        if (message.type === 'clipboard_history') {
          setHistory(message.history || [])
        } else if (message.type === 'clipboard_update' && message.data) {
          setHistory(prev => [message.data!, ...prev.slice(0, 49)])
        }
      } catch (error) {
        console.error('Error parsing message:', error)
      }
    }

    // Use setTimeout to defer state updates
    const timeoutId = setTimeout(processMessage, 0)
    return () => clearTimeout(timeoutId)
  }, [lastMessage])

  const copyToClipboard = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const fillInput = (content: string) => {
    if (onFillInput) {
      onFillInput(content)
    }
  }

  const clearHistory = () => {
    if (websocket && confirm('Clear all clipboard history?')) {
      websocket.send(JSON.stringify({
        type: 'clear_history',
        token
      }))
      setHistory([])
    }
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-800">
          Total Items ({history.length})
        </h2>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
          >
            <Trash2 className="w-3 h-3 inline mr-1" />
            Clear
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No clipboard history yet. Add some content above to get started.
        </div>
      ) : (
        <div className="space-y-2 overflow-y-auto">
          {history.map((item, index) => {
            const backgroundColors = [
              'bg-blue-50 border-blue-100 hover:bg-blue-100',
              'bg-green-50 border-green-100 hover:bg-green-100',
              'bg-purple-50 border-purple-100 hover:bg-purple-100',
              'bg-orange-50 border-orange-100 hover:bg-orange-100',
              'bg-pink-50 border-pink-100 hover:bg-pink-100',
              'bg-indigo-50 border-indigo-100 hover:bg-indigo-100'
            ]
            const buttonColors = [
              'bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-200',
              'bg-green-100 hover:bg-green-200 text-green-700 border-green-200',
              'bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-200',
              'bg-orange-100 hover:bg-orange-200 text-orange-700 border-orange-200',
              'bg-pink-100 hover:bg-pink-200 text-pink-700 border-pink-200',
              'bg-indigo-100 hover:bg-indigo-200 text-indigo-700 border-indigo-200'
            ]
            const bgClass = backgroundColors[index % backgroundColors.length]
            const buttonClass = buttonColors[index % buttonColors.length]

            return (
              <div
                key={item.id}
                className={`border rounded-lg p-3 transition-colors ${bgClass}`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {formatTime(item.timestamp)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {onFillInput && (
                        <button
                          onClick={() => fillInput(item.content)}
                          className="px-3 py-1.5 rounded-md text-xs font-medium border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 hover:border-amber-300 transition-colors flex items-center gap-1.5"
                        >
                          <Pencil className="w-3 h-3" />
                          Use
                        </button>
                      )}

                      <button
                        onClick={() => copyToClipboard(item.content, item.id)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 ${buttonClass}`}
                      >
                        {copiedId === item.id ? (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="hidden sm:inline">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="hidden sm:inline">Copy</span>
                          </>
                        )}
                      </button>

                    </div>
                  </div>
                  <div className="text-sm text-gray-800 break-words max-h-40 overflow-y-auto">
                    {item.content}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
