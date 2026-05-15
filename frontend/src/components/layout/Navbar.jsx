import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import { LayoutDashboard, Users, MessageCircle, Trophy, User, LogOut, Zap } from 'lucide-react'

const NAV_LINKS = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/matches', icon: <Users size={18} />, label: 'Matches' },
  { to: '/chat', icon: <MessageCircle size={18} />, label: 'Chat' },
  { to: '/leaderboard', icon: <Trophy size={18} />, label: 'Leaderboard' },
  { to: '/profile', icon: <User size={18} />, label: 'Profile' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const { connected } = useSocket()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 frosted px-4 py-3 flex items-center gap-4">
      {/* Logo */}
      <Link to="/dashboard" className="font-display text-xl font-bold text-ink mr-2">
        Skill<span className="text-accent">Barter</span>
      </Link>

      {/* Nav Links */}
      <div className="flex items-center gap-1 flex-1">
        {NAV_LINKS.map(link => {
          const active = location.pathname.startsWith(link.to)
          return (
            <Link key={link.to} to={link.to}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                ${active ? 'bg-accent text-white' : 'text-muted hover:text-ink hover:bg-black/5'}`}>
              {link.icon}
              <span className="hidden sm:block">{link.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* XP chip */}
        <div className="hidden md:flex items-center gap-1.5 bg-paper-dim rounded-full px-3 py-1.5">
          <Zap size={13} className="text-gold" />
          <span className="text-xs font-mono font-medium text-ink">{user?.xp || 0} XP</span>
        </div>

        {/* Socket indicator */}
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${connected ? 'bg-teal' : 'bg-muted/40'}`}
          title={connected ? 'Connected' : 'Offline'} />

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-accent/10 overflow-hidden flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
          {user?.avatar_url
            ? <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
            : user?.name?.[0] || '?'}
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="btn-ghost p-2" title="Sign out">
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  )
}
