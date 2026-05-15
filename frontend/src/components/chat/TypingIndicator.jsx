export default function TypingIndicator({ name }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1 bg-paper-dim rounded-2xl rounded-bl-sm px-4 py-2.5 border border-black/8">
        {[0, 1, 2].map(i => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-muted/50"
            style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
      <span className="text-xs text-muted">{name} is typing</span>
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }`}</style>
    </div>
  )
}
