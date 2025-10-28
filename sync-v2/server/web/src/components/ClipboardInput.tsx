'use client'

import { useState } from 'react'
import { Copy, Check, Send, Trash2 } from 'lucide-react'

interface ClipboardInputProps {
  onUpdate: (content: string) => void
  disabled?: boolean
}

export function ClipboardInput({ onUpdate, disabled }: ClipboardInputProps) {
  const [content, setContent] = useState('')
  const [isCopied, setIsCopied] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim() && !disabled) {
      onUpdate(content.trim())
      setContent('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault()
      if (content.trim() && !disabled) {
        onUpdate(content.trim())
        setContent('')
      }
    } else if (e.shiftKey && e.key === 'Enter') {
      e.preventDefault()
      if (content.trim() && !disabled) {
        onUpdate(content.trim())
        setContent('')
      }
    }
  }

  const copyToClipboard = async () => {
    if (content) {
      await navigator.clipboard.writeText(content)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const clearContent = () => {
    setContent('')
  }

  return (
    <div className="bg-white rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base font-semibold text-gray-900">Add to Clipboard</h2>
        <span className="text-xs text-gray-400">Ctrl/Shift+Enter to send</span>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type something to sync..."
            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm resize-y min-h-[60px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            disabled={disabled}
            rows={2}
            style={{ height: 'auto', overflow: 'hidden' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = target.scrollHeight + 'px'
            }}
          />
        </div>

        <div className="flex gap-1.5">
          <button
            type="submit"
            disabled={!content.trim() || disabled}
            className="flex-1 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-200 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
          >
            <Send className="w-3 h-3" />
            Sync
          </button>
          
          {content && (
            <>
              <button
                type="button"
                onClick={copyToClipboard}
                className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded border border-green-200 hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span className="hidden sm:inline">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span className="hidden sm:inline">Copy</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={clearContent}
                className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-medium rounded border border-red-200 hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  )
}
