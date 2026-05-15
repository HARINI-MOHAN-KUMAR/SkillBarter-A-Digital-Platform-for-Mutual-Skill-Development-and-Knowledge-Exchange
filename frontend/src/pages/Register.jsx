import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/profile')
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.details || err.message || 'Registration failed. Please try again.'
      setError(message)
      console.error('Registration error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '2rem'
    }}>
      <div className="glass-card animate-fade-in-up" style={{ width: '100%', maxWidth: 460, padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#e2e8f0', marginBottom: '0.5rem' }}>
            Join <span className="gradient-text">SkillBarter</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem' }}>
            Start exchanging knowledge with peers today
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem',
            color: '#fc8181', fontSize: '0.875rem'
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem' }}>Full Name</label>
            <input id="register-name" className="input-field" type="text" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem' }}>Email Address</label>
            <input id="register-email" className="input-field" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem' }}>Password</label>
            <input id="register-password" className="input-field" type="password" name="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '0.4rem' }}>Confirm Password</label>
            <input id="register-confirm" className="input-field" type="password" name="confirm" placeholder="Repeat password" value={form.confirm} onChange={handleChange} required />
          </div>
          <button
            id="register-submit-btn"
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ justifyContent: 'center', marginTop: '0.5rem', padding: '0.85rem', fontSize: '1rem' }}
          >
            {loading ? '⏳ Creating account...' : '🚀 Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.5)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#a5b4fc', textDecoration: 'none', fontWeight: 600 }}>
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  )
}
