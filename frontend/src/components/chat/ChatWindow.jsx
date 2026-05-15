import { useEffect, useRef, useState } from 'react'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import { Send, Smile } from 'lucide-react'

export default function ChatWindow({ messages, partner, loading, typingUser, onSend, onTyping, currentUserId }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const typingTimer = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUser])

  const handleSend = () => {
    const text = input.trim()
    if (!text) return
    onSend(text)
    setInput('')
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e) => {
    setInput(e.target.value)
    onTyping(true)
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => onTyping(false), 1500)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-black/8 flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 rounded-full bg-teal/10 flex items-center justify-center text-teal font-bold text-sm overflow-hidden">
          {partner?.avatar_url
            ? <img src={partner.avatar_url} alt={partner.name} className="w-full h-full object-cover" />
            : partner?.name?.[0]}
        </div>
        <div>
          <p className="font-medium text-sm text-ink">{partner?.name}</p>
          <p className="text-xs text-muted">{typingUser ? `${typingUser} is typing...` : 'Online'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-2xl mb-2">👋</p>
              <p className="text-sm text-muted">Say hello to {partner?.name}!</p>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <MessageBubble
              key={msg._id || i}
              message={msg}
              isOwn={msg.sender_id === currentUserId}
              showName={msg.sender_id !== messages[i - 1]?.sender_id}
            />
          ))
        )}
        {typingUser && <TypingIndicator name={typingUser} />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-black/8 flex items-end gap-2 flex-shrink-0">
        <textarea
          id="chat-input"
          className="flex-1 input resize-none min-h-[42px] max-h-28 py-2.5 text-sm overflow-y-auto"
          placeholder={`Message ${partner?.name}...`}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKey}
          rows={1}
        />
        <button onClick={handleSend} disabled={!input.trim()}
          className="btn-primary p-2.5 flex-shrink-0 disabled:opacity-40">
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
