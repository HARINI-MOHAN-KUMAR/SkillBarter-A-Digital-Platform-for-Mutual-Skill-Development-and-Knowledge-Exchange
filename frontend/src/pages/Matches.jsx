import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/layout/Navbar'
import MatchCard from '../components/matching/MatchCard'
import toast from 'react-hot-toast'
import { Search, Users } from 'lucide-react'

export default function Matches() {
  const { authAxios } = useAuth()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [connecting, setConnecting] = useState(null)

  const loadMatches = async () => {
    setLoading(true)
    try {
      const res = await authAxios.get('/api/matches')
      setMatches(res.data.matches || [])
    } catch {
      toast.error('Failed to load matches')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadMatches() }, [])

  const handleConnect = async (userId, name) => {
    setConnecting(userId)
    try {
      await authAxios.post('/api/matches/connect', { target_id: userId })
      toast.success(`Connected with ${name}! 🎉 Start chatting now.`)
      setMatches(prev => prev.map(m =>
        m.user.id === userId ? { ...m, is_connected: true } : m
      ))
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to connect')
    } finally {
      setConnecting(null)
    }
  }

  const filtered = matches.filter(m =>
    search === '' ||
    m.user.name.toLowerCase().includes(search.toLowerCase()) ||
    m.user.skills_teach.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
    m.user.skills_learn.some(s => s.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-8 page-fade">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-ink">Skill Matches</h1>
          <p className="text-muted mt-1">Sorted by compatibility — find your perfect skill-swap partner.</p>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input pl-10" placeholder="Search by name or skill..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <Users size={40} className="text-muted mx-auto mb-4" />
            <p className="font-display text-xl font-bold text-ink mb-2">
              {search ? 'No matches found' : 'No matches yet'}
            </p>
            <p className="text-muted text-sm">
              {search ? 'Try a different search term' : 'Add more skills to your profile to improve matching'}
            </p>
          </div>
        ) : (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((match, i) => (
              <motion.div key={match.user.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}>
                <MatchCard
                  match={match}
                  onConnect={() => handleConnect(match.user.id, match.user.name)}
                  connecting={connecting === match.user.id}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  )
}
