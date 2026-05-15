import { motion } from 'framer-motion'

const RANK_COLORS = ['text-gold', 'text-muted', 'text-amber-600']
const RANK_ICONS = ['🥇', '🥈', '🥉']

export default function LeaderboardRow({ entry, isCurrentUser, delay = 0 }) {
  const { rank, name, avatar_url, xp, level, level_name, badges } = entry

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className={`flex items-center gap-4 px-5 py-4 border-b border-black/6 last:border-0 transition-colors
        ${isCurrentUser ? 'bg-accent/5 border-l-2 border-l-accent' : 'hover:bg-paper-dim'}`}>
      {/* Rank */}
      <div className={`w-8 text-center font-display font-bold text-sm ${RANK_COLORS[rank - 1] || 'text-muted'}`}>
        {rank <= 3 ? RANK_ICONS[rank - 1] : `#${rank}`}
      </div>

      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-paper-dim flex items-center justify-center font-bold text-ink overflow-hidden flex-shrink-0">
        {avatar_url
          ? <img src={avatar_url} alt={name} className="w-full h-full object-cover" />
          : name?.[0]}
      </div>

      {/* Name + Level */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm text-ink truncate">{name}</p>
          {isCurrentUser && <span className="tag-accent" style={{ fontSize: '10px' }}>You</span>}
        </div>
        <p className="text-xs text-muted">Level {level} · {level_name}</p>
      </div>

      {/* Badges */}
      <div className="hidden sm:flex items-center gap-1">
        {(badges || []).slice(0, 3).map(b => (
          <span key={b} className="text-sm" title={b}>
            {{ first_swap: '🥇', top_mentor: '🌟', chatterbox: '💬', on_fire: '🔥', perfect_match: '🎯', quick_starter: '⚡' }[b] || '🏅'}
          </span>
        ))}
      </div>

      {/* XP */}
      <div className="text-right flex-shrink-0">
        <p className="font-mono font-medium text-sm text-ink">{xp.toLocaleString()}</p>
        <p className="text-xs text-muted">XP</p>
      </div>
    </motion.div>
  )
}
