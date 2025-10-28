'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useWebSocket } from '@/hooks/useWebSocket'
import { ClipboardInput } from '@/components/ClipboardInput'
import { ClipboardHistory } from '@/components/ClipboardHistory'
import { ConnectionStatus } from '@/components/ConnectionStatus'
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react'

export default function TokenPage() {
  const params = useParams()
  const router = useRouter()
  const token = Array.isArray(params.token) ? params.token[0] : params.token || ''
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true)
  
  const { 
    websocket, 
    connect, 
    sendMessage, 
    lastMessage,
    connectionState 
  } = useWebSocket()

  const isConnected = connectionState === 'connected'

  useEffect(() => {
    if (token) {
      localStorage.setItem('clipboardSyncToken', token)
      connect(token)
    } else {
      router.push('/')
    }
  }, [token, connect, router])

  const handleClipboardUpdate = (content: string) => {
    if (websocket && isConnected) {
      sendMessage({
        type: 'clipboard_update',
        token,
        data: {
          content,
          timestamp: Date.now(),
          id: crypto.randomUUID()
        }
      })
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Token</h1>
          <p className="text-gray-600 mb-6">The provided token is invalid or missing.</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-2 sm:p-6 lg:p-8">


        <div className="space-y-4">
          {/* Connection Status - Compact */}
          <div className="bg-white rounded-lg border border-gray-200 p-2">
            <ConnectionStatus 
              isConnected={isConnected} 
              connectionState={connectionState}
              token={token}
            />
          </div>

          {/* Clipboard Input */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <ClipboardInput 
              onUpdate={handleClipboardUpdate}
              disabled={!isConnected}
            />
          </div>
          
          {/* Clipboard History with Expand/Collapse */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Clipboard History</h2>
              <button
                onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
              >
                {isHistoryExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Expand
                  </>
                )}
              </button>
            </div>
            
            {isHistoryExpanded && (
              <div className="p-4">
                <ClipboardHistory 
                  lastMessage={lastMessage}
                  websocket={websocket}
                  token={token}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
