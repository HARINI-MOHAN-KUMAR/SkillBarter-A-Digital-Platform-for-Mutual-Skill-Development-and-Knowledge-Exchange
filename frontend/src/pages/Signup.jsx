import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import GoogleLoginButton from '../components/auth/GoogleLoginButton'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const { user } = await signup(form.name, form.email, form.password)
      toast.success(`Account created! Welcome, ${user.name} 🎉`)
      navigate('/onboarding')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-2xl font-bold text-ink">
            Skill<span className="text-accent">Barter</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-ink mt-4">Create your account</h1>
          <p className="text-muted mt-2">Join thousands exchanging skills for free</p>
        </div>

        <div className="card p-8">
          <GoogleLoginButton label="Sign up with Google" />

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-black/10" />
            <span className="text-xs text-muted">or sign up with email</span>
            <div className="flex-1 h-px bg-black/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Full Name</label>
              <input className="input" placeholder="Your name" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
              <input type="email" className="input" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input pr-11"
                  placeholder="Min 6 characters" value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </span> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-accent font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
