import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/profile', label: 'Profile', icon: '👤' },
  { to: '/matches', label: 'Matches', icon: '🤝' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(15, 12, 41, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      padding: '0.8rem 2rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      <Link to="/dashboard" style={{ textDecoration: 'none' }}>
        <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>
          <span style={{
            background: 'linear-gradient(135deg, #6c63ff, #c850c0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>Skill</span>
          <span style={{ color: '#e2e8f0' }}>Barter</span>
        </span>
      </Link>

      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
        {navLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            id={`nav-${link.label.toLowerCase()}`}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: location.pathname === link.to
                ? 'rgba(108,99,255,0.2)'
                : 'transparent',
              color: location.pathname === link.to ? '#a5b4fc' : 'rgba(255,255,255,0.6)',
              border: location.pathname === link.to
                ? '1px solid rgba(108,99,255,0.3)'
                : '1px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            <span>{link.icon}</span> {link.label}
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6c63ff, #c850c0)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.9rem', fontWeight: 700, color: 'white'
            }}>
              {user.name?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0' }}>{user.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)' }}>⭐ {user.points} pts</div>
            </div>
          </div>
        )}
        <button
          id="navbar-logout-btn"
          onClick={handleLogout}
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fc8181',
            padding: '0.45rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  )
}
