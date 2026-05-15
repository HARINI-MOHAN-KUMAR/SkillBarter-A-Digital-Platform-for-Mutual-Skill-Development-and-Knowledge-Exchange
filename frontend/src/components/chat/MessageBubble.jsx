export default function MessageBubble({ message, isOwn, showName }) {
  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} gap-0.5`}>
      {showName && !isOwn && (
        <span className="text-xs text-muted px-1">{message.sender_name}</span>
      )}
      <div className={`max-w-xs sm:max-w-sm lg:max-w-md px-4 py-2.5 rounded-2xl text-sm leading-relaxed
        ${isOwn
          ? 'bg-accent text-white rounded-br-sm'
          : 'bg-paper-dim text-ink rounded-bl-sm border border-black/8'
        }`}>
        {message.content}
      </div>
      <span className="text-xs text-muted/60 px-1">{time}</span>
    </div>
  )
}
