'use client'

import { useState, useEffect } from 'react'
import { Copy, RefreshCw } from 'lucide-react'

interface TokenInputProps {
  onSubmit: (token: string) => void
}

export function TokenInput({ onSubmit }: TokenInputProps) {
  const [token, setToken] = useState('')
  const [isCopied, setIsCopied] = useState(false)

  // Load token from localStorage on mount
  useEffect(() => {
    const existingToken = localStorage.getItem('clipboardSyncToken');
    if (existingToken !== null) {
      setTimeout(() => setToken(existingToken), 0);
    }
  }, [])

    const generateToken = () => {
    const newToken = `token_${Math.random().toString(36).substr(2, 9)}`
    setToken(newToken)
    setIsCopied(false)
  }

  const copyToken = async () => {
    if (token) {
      await navigator.clipboard.writeText(token)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (token.trim()) {
      onSubmit(token.trim())
    }
  }

  return (
    <div className="">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            id="token"
            type="text"
            value={token}
            onChange={(e) => {
              setToken(e.target.value)
              setIsCopied(false)
            }}
            placeholder="Enter or generate a token"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div className="flex gap-2">
          <div className="flex gap-2">
            {token && (
              <button
                type="button"
                onClick={copyToken}
                className="px-3 py-2 bg-green-50 text-green-700 text-xs font-medium rounded border border-green-200 hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
              >
                {isCopied ? (
                  <>
                    <Copy className="w-3 h-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span className="hidden sm:inline">Copy</span>
                  </>
                )}
              </button>
            )}
            <button
              type="button"
              onClick={generateToken}
              className="px-3 py-2 bg-red-50 text-red-700 text-xs font-medium rounded border border-red-200 hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              New
            </button>
          </div>
          
          <button
            type="submit"
            disabled={!token.trim()}
            className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 text-xs font-medium rounded border border-blue-200 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1"
          >
            Connect
          </button>
        </div>
      </form>

      <p className="text-sm text-gray-500 mt-4">
        Use the same token on all devices to sync your clipboard
      </p>
    </div>
  )
}
