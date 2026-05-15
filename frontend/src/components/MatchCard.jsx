import { useNavigate } from 'react-router-dom'
import SkillBadge from './SkillBadge'

export default function MatchCard({ match, onConnect, connecting }) {
  const { user } = match
  const score = match.score

  const getScoreColor = (s) => {
    if (s >= 70) return '#1a7a62'
    if (s >= 40) return '#b8890a'
    return '#c84b2f'
  }

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{
          width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #c84b2f, #b8890a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.3rem', fontWeight: 700, color: 'white'
        }}>
          {user.name?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f0e0c' }}>{user.name}</h3>
            <span style={{
              fontSize: '0.85rem', fontWeight: 700,
              color: getScoreColor(score),
              background: `${getScoreColor(score)}20`,
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              border: `1px solid ${getScoreColor(score)}40`,
              whiteSpace: 'nowrap'
            }}>
              {score}% match
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#6b6660', marginTop: '0.2rem' }}>
            {user.bio || 'No bio yet'} • ⭐ {user.xp || 0} XP
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '0.6rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#6b6660', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Can Teach</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {user.skills_teach?.length > 0
            ? user.skills_teach.slice(0, 4).map(s => <SkillBadge key={s} skill={s} type="teach" />)
            : <span style={{ color: '#6b6660', fontSize: '0.8rem' }}>None listed</span>}
        </div>
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#6b6660', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Wants to Learn</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {user.skills_learn?.length > 0
            ? user.skills_learn.slice(0, 4).map(s => <SkillBadge key={s} skill={s} type="learn" />)
            : <span style={{ color: '#6b6660', fontSize: '0.8rem' }}>None listed</span>}
        </div>
      </div>

      <button
        className="btn-primary"
        id={`connect-${user.id}`}
        onClick={onConnect}
        disabled={connecting}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        {connecting ? 'Connecting...' : '🤝 Connect'}
      </button>
    </div>
  )
}
