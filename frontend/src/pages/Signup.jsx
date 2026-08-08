import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })

  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name.trim()) {
      toast.error('Please enter your name')
      return
    }

    if (!form.email.trim()) {
      toast.error('Please enter your email')
      return
    }

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const response = await signup(
        form.name.trim(),
        form.email.trim(),
        form.password
      )

      const user = response?.user || response

      toast.success(
        `Account created! Welcome, ${user?.name || form.name} 🎉`
      )

      navigate('/onboarding')
    } catch (err) {
      console.error('Signup error:', err)

      // Safely extract a STRING from the backend response
      const backendError = err?.response?.data?.error
      const backendMessage = err?.response?.data?.message

      let message = 'Signup failed. Please try again.'

      if (typeof backendError === 'string') {
        message = backendError
      } else if (typeof backendMessage === 'string') {
        message = backendMessage
      } else if (typeof backendError?.message === 'string') {
        message = backendError.message
      } else if (typeof err?.message === 'string') {
        message = err.message
      }

      toast.error(message)
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
      <div className="text-center">
        <div className="text-3xl font-bold text-ink">
          SkillBarter
        </div>

        <h2 className="text-2xl font-semibold text-ink mt-4">
          Create your account
        </h2>

        <p className="text-muted mt-2">
          Join thousands exchanging skills for free
        </p>
      </div>

      <div className="card p-8 mt-6">
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* NAME */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Full Name
            </label>

            <input
              type="text"
              className="input"
              placeholder="Your name"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              disabled={loading}
              required
            />
          </div>

          {/* EMAIL */}
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
                  email: e.target.value,
                }))
              }
              disabled={loading}
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Password
            </label>

            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                className="input pr-11"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                disabled={loading}
                required
              />

              <button
                type="button"
                onClick={() => setShowPw((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                disabled={loading}
              >
                {showPw ? (
                  <EyeOff size={16} />
                ) : (
                  <Eye size={16} />
                )}
              </button>
            </div>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* LOGIN LINK */}
        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-accent font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
