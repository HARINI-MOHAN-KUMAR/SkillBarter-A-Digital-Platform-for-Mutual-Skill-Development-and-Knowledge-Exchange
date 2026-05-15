import { motion } from 'framer-motion'

export default function XPBar({ xp = 0, level = 1, levelName = 'Beginner', nextXp = 201 }) {
  const prevLevelXp = level === 1 ? 0 : [0, 0, 201, 501, 1001, 2001][level - 1] || 0
  const range = nextXp - prevLevelXp
  const progress = Math.min(((xp - prevLevelXp) / range) * 100, 100)

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-ink text-lg">Level {level}</span>
          <span className="tag-gold">{levelName}</span>
        </div>
        <span className="text-xs font-mono text-muted">{xp} / {nextXp} XP</span>
      </div>
      <div className="h-3 bg-paper-dim rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-xp-gradient"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <p className="text-xs text-muted mt-1.5">{Math.max(0, nextXp - xp)} XP to next level</p>
    </div>
  )
}
