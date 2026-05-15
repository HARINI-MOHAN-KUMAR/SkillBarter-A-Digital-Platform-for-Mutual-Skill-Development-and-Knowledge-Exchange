import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Sparkles, X, MessageSquare, Map, Send, ChevronRight } from 'lucide-react'

const ACTIONS = [
  { id: 'icebreaker', label: 'Icebreaker Message', icon: <MessageSquare size={14} /> },
  { id: 'reply', label: 'Reply Suggestion', icon: <ChevronRight size={14} /> },
  { id: 'roadmap', label: 'Skill Roadmap', icon: <Map size={14} /> },
]

export default function AIPanel({ mySkills, theirSkills, theirName, conversationHistory, authAxios }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(null)
  const [result, setResult] = useState(null)
  const [resultType, setResultType] = useState(null)
  const [skillInput, setSkillInput] = useState('')

  const callAction = async (action) => {
    setLoading(action)
    setResult(null)
    try {
      let res
      if (action === 'icebreaker') {
        res = await authAxios.post('/api/ai/icebreaker', {
          my_skills: mySkills,
          their_skills: theirSkills,
          their_name: theirName,
        })
        setResult(res.data.message)
        setResultType('message')
      } else if (action === 'reply') {
        res = await authAxios.post('/api/ai/chat-assist', {
          conversation_history: conversationHistory?.slice(-6) || [],
          context: 'skill exchange',
        })
        setResult(res.data.reply_suggestion)
        setResultType('message')
      } else if (action === 'roadmap') {
        if (!skillInput.trim()) {
          toast.error('Enter a skill first!')
          setLoading(null)
          return
        }
        res = await authAxios.post('/api/ai/skill-roadmap', {
          skill: skillInput,
          current_level: 'beginner',
        })
        setResult(res.data.roadmap)
        setResultType('roadmap')
      }
    } catch {
      toast.error('AI unavailable. Check your OpenAI API key.')
    } finally {
      setLoading(null)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(typeof text === 'string' ? text : text.join('\n'))
    toast.success('Copied to clipboard!')
  }

  return (
    <>
      {/* Floating button */}
      <button onClick={() => setOpen(o => !o)}
        className="absolute bottom-20 right-4 w-10 h-10 rounded-full bg-gold text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 z-10"
        title="AI Assistant">
        <Sparkles size={18} />
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-20 right-16 w-80 bg-white rounded-2xl border border-black/10 shadow-card-hover overflow-hidden z-20">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/8 bg-gold/5">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-gold" />
                <span className="font-display font-bold text-sm text-ink">AI Assistant</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-ink">
                <X size={14} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Action buttons */}
              <div className="grid grid-cols-1 gap-2">
                {ACTIONS.map(a => (
                  <button key={a.id} onClick={() => callAction(a.id)}
                    disabled={loading !== null}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-paper-dim hover:bg-paper border border-black/8 text-sm text-ink transition-colors disabled:opacity-50">
                    <span className="text-gold">{a.icon}</span>
                    {a.label}
                    {loading === a.id && <span className="ml-auto w-3.5 h-3.5 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />}
                  </button>
                ))}
              </div>

              {/* Roadmap skill input */}
              <div className="flex gap-2">
                <input className="input text-xs flex-1 py-2" placeholder="Skill for roadmap..."
                  value={skillInput} onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && callAction('roadmap')} />
              </div>

              {/* Result */}
              {result && (
                <div className="bg-paper-dim rounded-xl p-3">
                  {resultType === 'message' ? (
                    <>
                      <p className="text-xs text-ink leading-relaxed">{result}</p>
                      <button onClick={() => copyToClipboard(result)}
                        className="mt-2 flex items-center gap-1 text-xs text-accent hover:underline">
                        <Send size={10} /> Copy to clipboard
                      </button>
                    </>
                  ) : (
                    <div className="space-y-1.5">
                      {Array.isArray(result) ? result.map((step, i) => (
                        <div key={i} className="flex gap-2 text-xs text-ink">
                          <span className="text-teal font-mono flex-shrink-0">{i + 1}.</span>
                          <span>{step.replace(/^Week \d+: /, '')}</span>
                        </div>
                      )) : <p className="text-xs text-ink">{result}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
