import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Plus, X, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react'

const STEP_LABELS = ['Skills You Teach', 'Skills to Learn', 'Your Bio']
const SUGGESTED_TEACH = ['Python', 'Guitar', 'Yoga', 'Photography', 'Cooking', 'Spanish', 'UI Design', 'Excel', 'Drawing', 'Math']
const SUGGESTED_LEARN = ['Cooking', 'Machine Learning', 'Meditation', 'Video Editing', 'Graphic Design', 'Public Speaking', 'Korean', 'Finance', 'Dance', 'Writing']

function TagInput({ tags, setTags, suggestions, placeholder, colorClass }) {
  const [input, setInput] = useState('')

  const addTag = (val) => {
    const tag = val.trim()
    if (tag && !tags.includes(tag)) setTags(prev => [...prev, tag])
    setInput('')
  }

  const handleKey = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      addTag(input)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map(tag => (
          <span key={tag} className={`${colorClass} flex items-center gap-1`}>
            {tag}
            <button onClick={() => setTags(p => p.filter(t => t !== tag))} className="hover:opacity-70">
              <X size={10} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input className="input flex-1" placeholder={placeholder} value={input}
          onChange={e => setInput(e.target.value)} onKeyDown={handleKey} />
        <button type="button" onClick={() => addTag(input)} className="btn-secondary px-3">
          <Plus size={16} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        <span className="text-xs text-muted">Suggestions:</span>
        {suggestions.filter(s => !tags.includes(s)).slice(0, 6).map(s => (
          <button key={s} onClick={() => addTag(s)}
            className="text-xs border border-black/10 rounded-full px-3 py-1 hover:bg-paper-dim transition-colors">
            + {s}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Onboarding() {
  const { user, updateUser, authAxios } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [teach, setTeach] = useState([])
  const [learn, setLearn] = useState([])
  const [bio, setBio] = useState('')
  const [genLoading, setGenLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const generateBio = async () => {
    setGenLoading(true)
    try {
      const res = await authAxios.post('/api/ai/generate-bio', {
        name: user?.name,
        skills_teach: teach,
        skills_learn: learn,
      })
      setBio(res.data.bio)
      toast.success('Bio generated! ✨')
    } catch {
      toast.error('AI unavailable — write your own bio!')
    } finally {
      setGenLoading(false)
    }
  }

  const handleFinish = async () => {
    setSaving(true)
    try {
      await updateUser({
        skills_teach: teach,
        skills_learn: learn,
        bio,
        onboarding_complete: true,
      })
      toast.success('Profile set up! Time to find matches 🎯')
      navigate('/dashboard')
    } catch {
      toast.error('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const steps = [
    <div key="teach">
      <p className="text-muted mb-6">What skills can you teach others? Add at least one to get started.</p>
      <TagInput tags={teach} setTags={setTeach} suggestions={SUGGESTED_TEACH}
        placeholder="e.g. Python, Guitar, Yoga..." colorClass="tag-teal" />
    </div>,
    <div key="learn">
      <p className="text-muted mb-6">What do you want to learn? Be specific to find the best matches.</p>
      <TagInput tags={learn} setTags={setLearn} suggestions={SUGGESTED_LEARN}
        placeholder="e.g. Spanish, Cooking, UI Design..." colorClass="tag-gold" />
    </div>,
    <div key="bio">
      <p className="text-muted mb-4">Write a short bio so matches know who you are.</p>
      <textarea className="input h-32 resize-none" placeholder="I'm a software developer who loves teaching Python..."
        value={bio} onChange={e => setBio(e.target.value)} />
      <button onClick={generateBio} disabled={genLoading}
        className="btn-secondary flex items-center gap-2 mt-3 text-sm">
        <Sparkles size={14} className="text-gold" />
        {genLoading ? 'Generating...' : 'Generate with AI'}
      </button>
    </div>,
  ]

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-lg">
        <div className="text-center mb-8">
          <span className="font-display text-2xl font-bold text-ink">Skill<span className="text-accent">Barter</span></span>
          <h1 className="font-display text-3xl font-bold text-ink mt-4">Set up your profile</h1>
          <div className="flex gap-2 justify-center mt-4">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${i <= step ? 'bg-accent' : 'bg-black/10'}`} />
            ))}
          </div>
          <p className="text-sm text-muted mt-2">Step {step + 1} of 3 — <span className="text-ink font-medium">{STEP_LABELS[step]}</span></p>
        </div>

        <div className="card p-8">
          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}>
              {steps[step]}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
              className="btn-ghost flex items-center gap-2 disabled:opacity-30">
              <ArrowLeft size={16} /> Back
            </button>
            {step < 2 ? (
              <button onClick={() => setStep(s => s + 1)}
                disabled={(step === 0 && teach.length === 0) || (step === 1 && learn.length === 0)}
                className="btn-primary flex items-center gap-2 disabled:opacity-50">
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button onClick={handleFinish} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving ? 'Saving...' : 'Finish Setup'} <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
