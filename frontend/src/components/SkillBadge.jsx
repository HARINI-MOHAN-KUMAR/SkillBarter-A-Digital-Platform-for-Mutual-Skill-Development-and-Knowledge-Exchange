export default function SkillBadge({ skill, type = 'teach', onRemove }) {
  const isLearn = type === 'learn'
  return (
    <span className={`skill-tag ${isLearn ? 'skill-tag-learn' : ''}`}>
      {isLearn ? '📚' : '⚡'} {skill}
      {onRemove && (
        <button
          onClick={() => onRemove(skill)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'inherit', fontSize: '0.75rem', lineHeight: 1,
            padding: '0 2px', opacity: 0.7
          }}
          aria-label={`Remove ${skill}`}
        >✕</button>
      )}
    </span>
  )
}
