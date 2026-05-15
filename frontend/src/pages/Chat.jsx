import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import Navbar from '../components/layout/Navbar'
import ChatWindow from '../components/chat/ChatWindow'
import AIPanel from '../components/ai/AIPanel'
import toast from 'react-hot-toast'
import { MessageCircle } from 'lucide-react'

export default function Chat() {
  const { partnerId } = useParams()
  const { user, authAxios } = useAuth()
  const { joinRoom, sendMessage, sendTyping, markRead, onMessage, onTyping } = useSocket()
  const navigate = useNavigate()

  const [rooms, setRooms] = useState([])
  const [activeRoom, setActiveRoom] = useState(null)
  const [messages, setMessages] = useState([])
  const [typingUser, setTypingUser] = useState(null)
  const [loadingRooms, setLoadingRooms] = useState(true)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const currentRoomId = useRef(null)

  // Load rooms
  useEffect(() => {
    authAxios.get('/api/chat/rooms')
      .then(res => {
        setRooms(res.data.rooms || [])
        setLoadingRooms(false)
      })
      .catch(() => setLoadingRooms(false))
  }, [authAxios])

  // Auto-open room from URL param
  useEffect(() => {
    if (partnerId && rooms.length > 0) {
      const room = rooms.find(r => r.partner.id === partnerId)
      if (room) {
        openRoom(room)
      } else {
        // Create virtual room for connected user
        const roomId = [user.id, partnerId].sort().join('_')
        authAxios.get(`/api/users/${partnerId}`).then(res => {
          const virtualRoom = {
            room_id: roomId,
            partner: { id: partnerId, name: res.data.name, avatar_url: res.data.avatar_url },
            last_message: null,
            unread_count: 0,
          }
          setRooms(prev => [virtualRoom, ...prev])
          openRoom(virtualRoom)
        }).catch(() => toast.error('Could not open chat'))
      }
    }
  }, [partnerId, rooms.length])

  const openRoom = useCallback(async (room) => {
    setActiveRoom(room)
    setMessages([])
    setLoadingMsgs(true)
    currentRoomId.current = room.room_id
    joinRoom(room.room_id)
    markRead(room.room_id)

    try {
      const res = await authAxios.get(`/api/chat/${room.room_id}/messages`)
      setMessages(res.data.messages || [])
      setRooms(prev => prev.map(r => r.room_id === room.room_id ? { ...r, unread_count: 0 } : r))
    } catch {
      toast.error('Failed to load messages')
    } finally {
      setLoadingMsgs(false)
    }
  }, [authAxios, joinRoom, markRead])

  // Subscribe to socket messages
  useEffect(() => {
    const unsub = onMessage(msg => {
      if (msg.room_id === currentRoomId.current) {
        setMessages(prev => [...prev, msg])
        markRead(msg.room_id)
      }
      setRooms(prev => prev.map(r =>
        r.room_id === msg.room_id
          ? { ...r, last_message: { content: msg.content, timestamp: msg.timestamp, sender_id: msg.sender_id } }
          : r
      ))
    })
    return unsub
  }, [onMessage, markRead])

  useEffect(() => {
    const unsub = onTyping(({ user_name, is_typing }) => {
      setTypingUser(is_typing ? user_name : null)
    })
    return unsub
  }, [onTyping])

  const handleSend = (content) => {
    if (!activeRoom) return
    sendMessage(activeRoom.room_id, content)
    sendTyping(activeRoom.room_id, false)
  }

  const handleTyping = (isTyping) => {
    if (!activeRoom) return
    sendTyping(activeRoom.room_id, isTyping)
  }

  const insertAIMessage = (text) => {
    // Just pre-fill — user still sends it
    document.getElementById('chat-input')?.focus()
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-6xl mx-auto w-full px-4 py-4 gap-4" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Sidebar: room list */}
        <div className="w-72 flex-shrink-0 bg-white rounded-card border border-black/10 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-black/8">
            <h2 className="font-display font-bold text-ink">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingRooms ? (
              <div className="flex items-center justify-center h-24">
                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            ) : rooms.length === 0 ? (
              <div className="text-center p-6">
                <MessageCircle size={28} className="text-muted mx-auto mb-2" />
                <p className="text-xs text-muted">No conversations yet.<br />Connect with a match to start chatting!</p>
              </div>
            ) : rooms.map(room => (
              <button key={room.room_id} onClick={() => openRoom(room)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-paper-dim transition-colors
                  ${activeRoom?.room_id === room.room_id ? 'bg-accent/5 border-l-2 border-accent' : ''}`}>
                <div className="w-9 h-9 rounded-full bg-teal/10 flex items-center justify-center text-teal font-bold text-sm flex-shrink-0">
                  {room.partner.name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-ink">{room.partner.name}</p>
                  <p className="text-xs text-muted truncate">{room.last_message?.content || 'Say hello!'}</p>
                </div>
                {room.unread_count > 0 && (
                  <span className="w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center flex-shrink-0">
                    {room.unread_count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat window */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-card border border-black/10 relative">
          {activeRoom ? (
            <>
              <ChatWindow
                messages={messages}
                partner={activeRoom.partner}
                loading={loadingMsgs}
                typingUser={typingUser}
                onSend={handleSend}
                onTyping={handleTyping}
                currentUserId={user?.id}
              />
              <AIPanel
                mySkills={user?.skills_teach || []}
                theirSkills={activeRoom.partner?.skills || []}
                theirName={activeRoom.partner?.name}
                conversationHistory={messages}
                authAxios={authAxios}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle size={48} className="text-muted mx-auto mb-4" />
                <p className="font-display text-xl font-bold text-ink mb-1">Select a conversation</p>
                <p className="text-muted text-sm">Choose a chat from the sidebar to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
