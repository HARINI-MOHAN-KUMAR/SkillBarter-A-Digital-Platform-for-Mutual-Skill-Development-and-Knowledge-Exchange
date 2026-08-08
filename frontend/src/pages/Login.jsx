import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = await login(form.email, form.password)

      toast.success(`Welcome back, ${user.name}! 👋`)

      navigate(
        user.onboarding_complete
          ? '/dashboard'
          : '/onboarding'
      )
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
        'Login failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-8">
        <div className="text-3xl font-bold text-ink">
          SkillBarter
        </div>

        <h1 className="text-2xl font-bold text-ink mt-4">
          Welcome back
        </h1>

        <p className="text-muted mt-2">
          Sign in to continue your skill journey
        </p>
      </div>

      <div className="card p-8">

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Email
            </label>

            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  email: e.target.value
                }))
              }
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Password
            </label>

            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                className="input pr-11"
                placeholder="Your password"
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    password: e.target.value
                  }))
                }
                required
              />

              <button
                type="button"
                onClick={() => setShowPw((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
              >
                {showPw ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>

        </form>

        {/* Signup link */}
        <p className="text-center text-sm text-muted mt-6">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-accent font-medium hover:underline"
          >
            Sign up free
          </Link>
        </p>

      </div>
    </motion.div>
  )
}
