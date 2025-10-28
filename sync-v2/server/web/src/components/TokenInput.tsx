'use client'

import { useState } from 'react'
import { Copy, RefreshCw } from 'lucide-react'

interface TokenInputProps {
  onSubmit: (token: string) => void
}

export function TokenInput({ onSubmit }: TokenInputProps) {
  const [token, setToken] = useState('')
  const [isCopied, setIsCopied] = useState(false)

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
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Connect to Clipboard Sync</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-2">
            Token
          </label>
          <div className="flex gap-2">
            <input
              id="token"
              type="text"
              value={token}
              onChange={(e) => {
                setToken(e.target.value)
                setIsCopied(false)
              }}
              placeholder="Enter or generate a token"
              className="input-field flex-1"
              required
            />
            {token && (
              <button
                type="button"
                onClick={copyToken}
                className="btn-secondary flex items-center gap-2"
              >
                {isCopied ? (
                  <>
                    <Copy className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            )}
            <button
              type="button"
              onClick={generateToken}
              className="btn-secondary flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              New
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={!token.trim()}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Connect
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-4">
        Use the same token on all devices to sync your clipboard
      </p>
    </div>
  )
}
