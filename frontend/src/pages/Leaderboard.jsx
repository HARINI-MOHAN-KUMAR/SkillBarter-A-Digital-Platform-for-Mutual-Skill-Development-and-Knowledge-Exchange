import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/layout/Navbar'
import LeaderboardRow from '../components/gamification/LeaderboardRow'
import toast from 'react-hot-toast'
import { Trophy, RefreshCw } from 'lucide-react'

export default function Leaderboard() {
  const { user, authAxios } = useAuth()
  const [leaders, setLeaders] = useState([])
  const [myStats, setMyStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [lbRes, statsRes] = await Promise.all([
        authAxios.get('/api/gamification/leaderboard'),
        authAxios.get('/api/gamification/my-stats'),
      ])
      setLeaders(lbRes.data.leaderboard || [])
      setMyStats(statsRes.data)
      setLastRefresh(new Date())
    } catch {
      toast.error('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8 page-fade">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink flex items-center gap-2">
              <Trophy size={28} className="text-gold" /> Leaderboard
            </h1>
            <p className="text-muted mt-1">Top skill barterers ranked by XP</p>
          </div>
          <button onClick={load} disabled={loading}
            className="btn-ghost flex items-center gap-2 text-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {lastRefresh ? `Updated ${lastRefresh.toLocaleTimeString()}` : 'Refresh'}
          </button>
        </div>

        {/* My Rank Banner */}
        {myStats?.rank && myStats.rank > 10 && (
          <div className="card p-4 mb-6 flex items-center gap-4 border-accent/20 bg-accent/5">
            <div className="w-10 h-10 rounded-full bg-accent/20 text-accent font-display font-bold flex items-center justify-center">
              #{myStats.rank}
            </div>
            <div>
              <p className="font-medium text-sm text-ink">Your current rank</p>
              <p className="text-xs text-muted">{myStats.xp} XP · Level {myStats.level} {myStats.level_name}</p>
            </div>
            <div className="ml-auto text-xs text-muted">+XP to climb higher 🏔️</div>
          </div>
        )}

        {/* Top 3 Podium */}
        {leaders.length >= 3 && !loading && (
          <div className="flex items-end justify-center gap-4 mb-8">
            {[leaders[1], leaders[0], leaders[2]].map((l, i) => {
              const heights = ['h-24', 'h-32', 'h-20']
              const medals = ['🥈', '🥇', '🥉']
              const isMe = l?.id === user?.id
              return l ? (
                <motion.div key={l.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex flex-col items-center gap-2 flex-1 max-w-32`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold
                    ${isMe ? 'ring-2 ring-accent ring-offset-2' : ''}
                    ${i === 1 ? 'bg-gold/20 text-gold' : 'bg-paper-dim text-muted'}`}>
                    {l.name?.[0]}
                  </div>
                  <p className="font-medium text-xs text-ink text-center truncate w-full">{l.name}</p>
                  <div className={`${heights[i]} w-full rounded-t-xl flex flex-col items-center justify-end pb-2
                    ${i === 1 ? 'bg-gold/20' : 'bg-paper-dim'}`}>
                    <span className="text-xl">{medals[i]}</span>
                    <p className="text-xs font-mono font-medium text-muted">{l.xp} XP</p>
                  </div>
                </motion.div>
              ) : null
            })}
          </div>
        )}

        {/* Full List */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : leaders.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted">No data yet. Be the first to earn XP!</p>
            </div>
          ) : (
            <div>
              {leaders.map((l, i) => (
                <LeaderboardRow
                  key={l.id}
                  entry={l}
                  isCurrentUser={l.id === user?.id}
                  delay={i * 0.04}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
