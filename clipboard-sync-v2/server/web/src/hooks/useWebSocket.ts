'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface ClipboardMessage {
  type: string
  token: string
  data?: any
  history?: any[]
  error?: string
}

export function useWebSocket() {
  const [websocket, setWebsocket] = useState<WebSocket | null>(null)
  const [lastMessage, setLastMessage] = useState<string | null>(null)
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const connect = useCallback((token: string) => {
    if (websocket?.readyState === WebSocket.OPEN) return

    setConnectionState('connecting')
    
    const wsUrl = `wss://clipboard-sync-worker.ravi404606.workers.dev/ws?token=${encodeURIComponent(token)}`
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
      scheduleReconnect(token)
    }

    ws.onerror = () => {
      setConnectionState('error')
    }
  }, [websocket])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    stopPing()
    websocket?.close()
    setWebsocket(null)
    setConnectionState('disconnected')
  }, [websocket])

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

  const scheduleReconnect = useCallback((token: string) => {
    if (reconnectTimeoutRef.current) return
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connect(token)
    }, 5000)
  }, [connect])

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
