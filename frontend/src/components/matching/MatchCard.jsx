import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { MessageCircle, ThumbsUp } from 'lucide-react'
import SkillTag from './SkillTag'
import toast from 'react-hot-toast'
import { useState } from 'react'

export default function MatchCard({ match, onConnect, connecting }) {
  const { user, authAxios } = useAuth()
  const { user: partner, score, reason, matched_skills, is_connected } = match
  const [endorsing, setEndorsing] = useState(false)
  const [localEndorsements, setLocalEndorsements] = useState(partner.skill_endorsements || {})

  const handleEndorse = async (skill) => {
    setEndorsing(true)
    try {
      await authAxios.post('/api/skills/endorse', { user_id: partner.id, skill })
      toast.success(`Endorsed ${partner.name} for ${skill}!`)
      setLocalEndorsements(prev => ({
        ...prev,
        [skill]: [...(prev[skill] || []), user.id]
      }))
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to endorse')
    } finally {
      setEndorsing(false)
    }
  }

  return (
    <div className="card p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-display font-bold text-xl flex-shrink-0 overflow-hidden">
          {partner.avatar_url
            ? <img src={partner.avatar_url} alt={partner.name} className="w-full h-full object-cover" />
            : partner.name?.[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-display font-bold text-ink">{partner.name}</p>
            <span className="tag-accent text-xs">{score}% match</span>
          </div>
          <p className="text-xs text-muted mt-0.5 line-clamp-2">{partner.bio || 'No bio yet'}</p>
        </div>
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {partner.skills_teach?.slice(0, 4).map(s => {
            const count = localEndorsements[s]?.length || 0
            const alreadyEndorsed = localEndorsements[s]?.includes(user.id)
            return (
              <div key={s} className="group relative">
                <SkillTag label={s} variant="teal" endorsements={count} />
                {is_connected && !alreadyEndorsed && (
                  <button
                    onClick={() => handleEndorse(s)}
                    disabled={endorsing}
                    className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-gold hover:scale-110"
                    title="Endorse this skill"
                  >
                    <ThumbsUp size={10} fill="currentColor" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {partner.skills_learn?.slice(0, 4).map(s => (
            <SkillTag key={s} label={s} variant="gold" />
          ))}
        </div>
      </div>

      {/* AI Reason */}
      {reason && (
        <p className="text-xs text-muted bg-paper-dim rounded-lg px-3 py-2 italic">✨ {reason}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {is_connected ? (
          <Link to={`/chat/${partner.id}`}
            className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm">
            <MessageCircle size={15} /> Chat
          </Link>
        ) : (
          <button onClick={onConnect} disabled={connecting}
            className="btn-primary flex-1 text-sm disabled:opacity-60">
            {connecting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connecting...
              </span>
            ) : 'Connect'}
          </button>
        )}
      </div>
    </div>
  )
}
