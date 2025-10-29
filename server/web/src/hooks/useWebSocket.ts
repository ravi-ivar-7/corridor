'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { getWebSocketUrl } from '@/lib/config'

interface ClipboardMessage {
  type: string
  token: string
  data?: ClipboardItem
  history?: ClipboardItem[]
  error?: string
}

interface ClipboardItem {
  content: string
  timestamp: number
  id: string
}

export function useWebSocket() {
  const [websocket, setWebsocket] = useState<WebSocket | null>(null)
  const [lastMessage, setLastMessage] = useState<string | null>(null)
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const sendMessage = useCallback((message: ClipboardMessage) => {
    if (websocket?.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify(message))
    }
  }, [websocket])

  const startPing = useCallback(() => {
    pingIntervalRef.current = setInterval(() => {
      if (websocket?.readyState === WebSocket.OPEN) {
        sendMessage({ type: 'ping', token: '' })
      }
    }, 30000)
  }, [websocket, sendMessage])

  const stopPing = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current)
      pingIntervalRef.current = null
    }
  }, [])

  const connect = useCallback((token: string) => {
    if (websocket?.readyState === WebSocket.OPEN) return

    setConnectionState('connecting')
    
    const wsUrl = getWebSocketUrl(token)
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      setWebsocket(ws)
      setConnectionState('connected')
      startPing()
    }

    ws.onmessage = (event) => {
      setLastMessage(event.data)
    }

    ws.onclose = () => {
      setWebsocket(null)
      setConnectionState('disconnected')
      stopPing()
      // Schedule reconnect
      if (reconnectTimeoutRef.current) return
      reconnectTimeoutRef.current = setTimeout(() => {
        // Use a new connection instead of calling connect recursively
        setConnectionState('connecting')
        const newWs = new WebSocket(wsUrl)
        newWs.onopen = () => {
          setWebsocket(newWs)
          setConnectionState('connected')
          startPing()
        }
        newWs.onmessage = (event) => {
          setLastMessage(event.data)
        }
        newWs.onclose = () => {
          setWebsocket(null)
          setConnectionState('disconnected')
          stopPing()
        }
        newWs.onerror = () => {
          setConnectionState('error')
        }
      }, 5000)
    }

    ws.onerror = () => {
      setConnectionState('error')
    }
  }, [websocket, startPing, stopPing])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    stopPing()
    websocket?.close()
    setWebsocket(null)
    setConnectionState('disconnected')
  }, [websocket, stopPing])

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      stopPing()
      websocket?.close()
    }
  }, [websocket, stopPing])

  return {
    websocket,
    lastMessage,
    connectionState,
    connect,
    disconnect,
    sendMessage
  }
}
