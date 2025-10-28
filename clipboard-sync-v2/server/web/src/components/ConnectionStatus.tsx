'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, Wifi, WifiOff, AlertCircle, RefreshCw } from 'lucide-react'

interface ConnectionStatusProps {
  isConnected: boolean
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'error'
  token: string
}

export function ConnectionStatus({ isConnected, connectionState, token }: ConnectionStatusProps) {
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (isConnected) {
      const timeoutId = setTimeout(() => {
        setLastSync(new Date())
      }, 0)
      return () => clearTimeout(timeoutId)
    }
  }, [isConnected])

  const changeToken = () => {
    localStorage.removeItem('clipboardSyncToken')
    router.push('/')
  }

  const getStatusIcon = () => {
    switch (connectionState) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-500" />
      case 'connecting':
        return <Wifi className="w-4 h-4 text-yellow-500 animate-pulse" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <WifiOff className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (connectionState) {
      case 'connected':
        return 'Connected'
      case 'connecting':
        return 'Connecting...'
      case 'error':
        return 'Connection Error'
      default:
        return 'Disconnected'
    }
  }

  const getStatusColor = () => {
    switch (connectionState) {
      case 'connected':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'connecting':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="bg-white rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
              {getStatusText()}
            </div>
            {lastSync && (
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last sync: {lastSync.toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
        
        <div className="text-right">
          <div className="flex items-center justify-end gap-2 mb-1 bg-blue-50 border border-blue-200 rounded px-2 py-1">
            <span className="text-xs text-blue-600">Token:</span>
            <span className="text-xs font-mono text-blue-700">{token}</span>
          </div>
          <button
            onClick={changeToken}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100 hover:text-orange-800 rounded transition-colors ml-auto"
          >
            <RefreshCw className="w-3 h-3" />
            Change Token
          </button>
        </div>
      </div>
    </div>
  )
}
