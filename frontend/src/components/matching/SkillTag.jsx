import { Award } from 'lucide-react'

export default function SkillTag({ label, variant = 'teal', endorsements = 0 }) {
  const classes = {
    teal: 'tag-teal',
    gold: 'tag-gold',
    accent: 'tag-accent',
  }
  const match = label.match(/(.*)\s\((Beginner|Intermediate|Expert)\)$/)
  const displayLabel = match ? match[1] : label
  const level = match ? match[2] : null

  return (
    <span className={`${classes[variant] || 'tag-teal'} flex items-center gap-1.5`}>
      <span className="truncate">{displayLabel}</span>
      {level && (
        <span className="text-[10px] uppercase tracking-wider opacity-60 font-bold border-l border-current/20 pl-1.5 ml-0.5">
          {level[0]}
        </span>
      )}
      {endorsements > 0 && (
        <span className="flex items-center gap-0.5 opacity-80 border-l border-current/20 pl-1.5 ml-0.5">
          <Award size={10} />
          {endorsements}
        </span>
      )}
    </span>
  )
}
