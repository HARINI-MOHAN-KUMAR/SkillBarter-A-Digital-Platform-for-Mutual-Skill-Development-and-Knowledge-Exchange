import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/layout/Navbar'
import XPBar from '../components/gamification/XPBar'
import BadgeShelf from '../components/gamification/BadgeShelf'
import { Users, MessageCircle, Trophy, ArrowRight, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user, authAxios } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [matches, setMatches] = useState([])
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, matchRes, roomRes] = await Promise.all([
          authAxios.get('/api/gamification/my-stats'),
          authAxios.get('/api/matches'),
          authAxios.get('/api/chat/rooms'),
        ])
        setStats(statsRes.data)
        setMatches(matchRes.data.matches?.slice(0, 3) || [])
        setRooms(roomRes.data.rooms?.slice(0, 4) || [])
      } catch {
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [authAxios])

  const totalUnread = rooms.reduce((sum, r) => sum + (r.unread_count || 0), 0)

  if (loading) return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 page-fade">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-ink">
            Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted mt-1">Here's what's happening in your skill journey.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Connections', val: user?.connections?.length || 0, icon: <Users size={18} />, color: 'text-teal' },
            { label: 'Skills Teaching', val: user?.skills_teach?.length || 0, icon: <Plus size={18} />, color: 'text-accent' },
            { label: 'Skills Learning', val: user?.skills_learn?.length || 0, icon: <Plus size={18} />, color: 'text-gold' },
            { label: 'Messages', val: totalUnread > 0 ? `${totalUnread} new` : '—', icon: <MessageCircle size={18} />, color: 'text-muted' },
          ].map((s, i) => (
            <motion.div key={i} className="card p-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <div className={`${s.color} mb-2`}>{s.icon}</div>
              <p className="font-display text-2xl font-bold text-ink">{s.val}</p>
              <p className="text-xs text-muted">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* XP + Badges */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-ink mb-4">Your Progress</h2>
              {stats && <XPBar xp={stats.xp} level={stats.level} levelName={stats.level_name} nextXp={stats.next_level_xp} />}
              <div className="flex items-center gap-3 mt-4 p-3 bg-paper-dim rounded-xl">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="font-medium text-sm text-ink">{stats?.login_streak || 0}-day streak</p>
                  <p className="text-xs text-muted">Keep it up for the On Fire badge!</p>
                </div>
              </div>
            </div>
            {stats && <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-ink mb-4">Badges</h2>
              <BadgeShelf earned={stats.badges || []} all={stats.all_badges || []} />
            </div>}
          </div>

          {/* Matches + Chat Preview */}
          <div className="lg:col-span-2 space-y-4">
            {/* Top Matches */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold text-ink">Top Matches</h2>
                <Link to="/matches" className="text-sm text-accent hover:underline flex items-center gap-1">
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              {matches.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted mb-3">No matches yet — add more skills!</p>
                  <Link to="/profile" className="btn-primary text-sm">Add Skills</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {matches.map((m, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-paper-dim rounded-xl hover:bg-white transition-colors">
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold flex-shrink-0">
                        {m.user.name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-ink">{m.user.name}</p>
                        <p className="text-xs text-muted truncate">{m.reason}</p>
                      </div>
                      <span className="tag-accent text-xs flex-shrink-0">{m.score}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Chats */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-bold text-ink">Recent Messages</h2>
                <Link to="/chat" className="text-sm text-accent hover:underline flex items-center gap-1">
                  Open chat <ArrowRight size={14} />
                </Link>
              </div>
              {rooms.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted text-sm">No conversations yet.</p>
                  <Link to="/matches" className="text-accent text-sm hover:underline mt-1 inline-block">Find matches to connect →</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {rooms.map((r, i) => (
                    <Link key={i} to={`/chat/${r.partner.id}`}
                      className="flex items-center gap-3 p-3 bg-paper-dim rounded-xl hover:bg-white transition-colors">
                      <div className="w-9 h-9 rounded-full bg-teal/10 flex items-center justify-center text-teal font-bold text-sm flex-shrink-0">
                        {r.partner.name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-ink">{r.partner.name}</p>
                        <p className="text-xs text-muted truncate">{r.last_message?.content || 'Start a conversation'}</p>
                      </div>
                      {r.unread_count > 0 && (
                        <span className="w-5 h-5 rounded-full bg-accent text-white text-xs flex items-center justify-center flex-shrink-0">
                          {r.unread_count}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
