import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001'

export function SocketProvider({ children }) {
  const { token, user } = useAuth()
  const socketRef = useRef(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!token || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setConnected(false)
      }
      return
    }

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      auth: { token },
    })

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))

    socketRef.current = socket

    return () => {
      socket.disconnect()
      socketRef.current = null
      setConnected(false)
    }
  }, [token, user])

  const joinRoom = (roomId) => {
    if (socketRef.current && user) {
      socketRef.current.emit('join_room', { room: roomId, user_id: user.id })
    }
  }

  const sendMessage = (roomId, content) => {
    if (socketRef.current && user) {
      socketRef.current.emit('send_message', {
        room: roomId,
        sender_id: user.id,
        sender_name: user.name,
        content,
      })
    }
  }

  const sendTyping = (roomId, isTyping) => {
    if (socketRef.current && user) {
      socketRef.current.emit('typing', {
        room: roomId,
        user_name: user.name,
        is_typing: isTyping,
      })
    }
  }

  const markRead = (roomId) => {
    if (socketRef.current && user) {
      socketRef.current.emit('mark_read', { room: roomId, user_id: user.id })
    }
  }

  const onMessage = (cb) => {
    socketRef.current?.on('receive_message', cb)
    return () => socketRef.current?.off('receive_message', cb)
  }

  const onTyping = (cb) => {
    socketRef.current?.on('typing_indicator', cb)
    return () => socketRef.current?.off('typing_indicator', cb)
  }

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current, connected,
      joinRoom, sendMessage, sendTyping, markRead,
      onMessage, onTyping,
    }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
