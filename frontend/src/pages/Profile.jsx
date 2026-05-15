import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/layout/Navbar'
import toast from 'react-hot-toast'
import { Plus, X, Save, Sparkles } from 'lucide-react'

function TagInput({ tags, onAdd, onRemove, placeholder, colorClass }) {
  const [val, setVal] = useState('')
  const [level, setLevel] = useState('Intermediate')

  const add = () => {
    const tag = val.trim().replace(/,/g, '')
    if (tag) {
      onAdd(`${tag} (${level})`)
      setVal('')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map(tag => (
          <span key={tag} className={`${colorClass} flex items-center gap-1 text-xs py-1 px-2`}>
            {tag}
            <button onClick={() => onRemove(tag)} className="hover:opacity-70 ml-1"><X size={10} /></button>
          </span>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <input className="input flex-1 text-sm" placeholder={placeholder} value={val}
          onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }} />
        
        <select 
          value={level} 
          onChange={e => setLevel(e.target.value)}
          className="input text-xs w-full sm:w-32 bg-paper"
        >
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Expert</option>
        </select>

        <button onClick={add} className="btn-secondary px-4 py-2 flex items-center justify-center">
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}

export default function Profile() {
  const { user, updateUser, authAxios } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar_url: user?.avatar_url || '',
    skills_teach: user?.skills_teach || [],
    skills_learn: user?.skills_learn || [],
  })
  const [saving, setSaving] = useState(false)
  const [genBio, setGenBio] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateUser(form)
      toast.success('Profile updated! ✨')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const generateBio = async () => {
    setGenBio(true)
    try {
      const res = await authAxios.post('/api/ai/generate-bio', {
        name: form.name,
        skills_teach: form.skills_teach,
        skills_learn: form.skills_learn,
      })
      setForm(p => ({ ...p, bio: res.data.bio }))
      toast.success('Bio generated!')
    } catch {
      toast.error('AI unavailable')
    } finally {
      setGenBio(false)
    }
  }

  const addTeach = (skill) => {
    const s = skill.trim()
    if (s && !form.skills_teach.includes(s))
      setForm(p => ({ ...p, skills_teach: [...p.skills_teach, s] }))
  }
  const removeTeach = (skill) => setForm(p => ({ ...p, skills_teach: p.skills_teach.filter(s => s !== skill) }))
  const addLearn = (skill) => {
    const s = skill.trim()
    if (s && !form.skills_learn.includes(s))
      setForm(p => ({ ...p, skills_learn: [...p.skills_learn, s] }))
  }
  const removeLearn = (skill) => setForm(p => ({ ...p, skills_learn: p.skills_learn.filter(s => s !== skill) }))

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8 page-fade">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink">Edit Profile</h1>
            <p className="text-muted mt-1">Keep your profile fresh to attract better matches.</p>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="space-y-5">
          {/* Avatar + Name */}
          <div className="card p-6 flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center text-accent font-display font-bold text-3xl flex-shrink-0 overflow-hidden">
              {form.avatar_url
                ? <img src={form.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                : user?.name?.[0] || '?'}
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-muted mb-1 block">Avatar URL</label>
              <input className="input text-sm" placeholder="https://..." value={form.avatar_url}
                onChange={e => setForm(p => ({ ...p, avatar_url: e.target.value }))} />
            </div>
          </div>

          {/* Name */}
          <div className="card p-6">
            <label className="block text-sm font-medium text-ink mb-2">Full Name</label>
            <input className="input" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          </div>

          {/* Bio */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-ink">Bio</label>
              <button onClick={generateBio} disabled={genBio}
                className="text-xs flex items-center gap-1 text-gold hover:underline">
                <Sparkles size={12} /> {genBio ? 'Generating...' : 'AI Generate'}
              </button>
            </div>
            <textarea className="input h-28 resize-none" placeholder="Tell the community about yourself..."
              value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} />
          </div>

          {/* Skills Teach */}
          <div className="card p-6">
            <label className="block text-sm font-medium text-ink mb-3">Skills I Can Teach</label>
            <TagInput tags={form.skills_teach} onAdd={addTeach} onRemove={removeTeach}
              placeholder="Add a skill you can teach..." colorClass="tag-teal" />
          </div>

          {/* Skills Learn */}
          <div className="card p-6">
            <label className="block text-sm font-medium text-ink mb-3">Skills I Want to Learn</label>
            <TagInput tags={form.skills_learn} onAdd={addLearn} onRemove={removeLearn}
              placeholder="Add a skill you want to learn..." colorClass="tag-gold" />
          </div>
        </div>
      </main>
    </div>
  )
}
