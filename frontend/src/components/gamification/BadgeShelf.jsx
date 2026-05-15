import { motion } from 'framer-motion'

const ALL_BADGE_META = {
  first_swap: { icon: '🥇', name: 'First Swap' },
  top_mentor: { icon: '🌟', name: 'Top Mentor' },
  chatterbox: { icon: '💬', name: 'Chatterbox' },
  on_fire: { icon: '🔥', name: 'On Fire' },
  perfect_match: { icon: '🎯', name: 'Perfect Match' },
  quick_starter: { icon: '⚡', name: 'Quick Starter' },
}

export default function BadgeShelf({ earned = [], all = [] }) {
  const displayBadges = all.length > 0
    ? all.map(b => ({ ...b, unlocked: earned.includes(b.id) }))
    : Object.entries(ALL_BADGE_META).map(([id, meta]) => ({
        id, ...meta, unlocked: earned.includes(id)
      }))

  return (
    <div className="grid grid-cols-3 gap-3">
      {displayBadges.map((badge, i) => (
        <motion.div
          key={badge.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.06 }}
          title={badge.name}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl
            ${badge.unlocked ? 'bg-gold/10 border border-gold/20' : 'bg-paper-dim border border-black/5 opacity-40 grayscale'}`}>
          <span className="text-xl">{badge.icon}</span>
          <p className="text-xs font-mono text-center leading-tight" style={{ fontSize: '10px' }}>
            {badge.name}
          </p>
        </motion.div>
      ))}
    </div>
  )
}
