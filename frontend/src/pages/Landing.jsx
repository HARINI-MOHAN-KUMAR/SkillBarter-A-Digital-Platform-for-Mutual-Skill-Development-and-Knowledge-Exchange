import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Zap, Users, MessageCircle, Trophy } from 'lucide-react'

const FLOATING_CARDS = [
  { teach: 'Python', learn: 'Guitar', name: 'Priya K.', score: 94 },
  { teach: 'Yoga', learn: 'UI Design', name: 'Aryan M.', score: 88 },
  { teach: 'Spanish', learn: 'Cooking', name: 'Sara L.', score: 76 },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Sign Up Free', desc: 'Create your profile in under 2 minutes.' },
  { step: '02', title: 'List Your Skills', desc: 'Tell us what you teach and what you want to learn.' },
  { step: '03', title: 'Get Matched', desc: 'Our algorithm finds your perfect skill-swap partners.' },
  { step: '04', title: 'Start Bartering', desc: 'Chat, schedule, and exchange skills — no money needed.' },
]

const FEATURES = [
  { icon: <Zap size={22} />, title: 'Smart Matching', desc: 'AI-powered bidirectional matching scores to find your ideal partner.' },
  { icon: <MessageCircle size={22} />, title: 'Real-time Chat', desc: 'Instant messaging with typing indicators and message history.' },
  { icon: <Zap size={22} />, title: 'AI-Powered', desc: 'Generate bios, get icebreakers, and create learning roadmaps with AI.' },
  { icon: <Trophy size={22} />, title: 'Gamified Growth', desc: 'Earn XP, unlock badges, and climb the leaderboard as you exchange skills.' },
]

const TESTIMONIALS = [
  { name: 'Ananya R.', text: 'I traded Python lessons for guitar sessions. Best decision ever!', level: 'Connector' },
  { name: 'Rahul S.', text: 'Found someone who teaches Spanish and wants to learn cooking — just like me!', level: 'Mentor' },
  { name: 'Meera P.', text: 'The AI icebreaker message made my first chat so much easier.', level: 'Explorer' },
  { name: 'Vikram D.', text: 'Within a week I had 3 skill swap partners. This app is incredible!', level: 'Master Barterer' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-paper font-body">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 frosted px-6 py-4 flex items-center justify-between">
        <span className="font-display text-xl font-bold text-ink">Skill<span className="text-accent">Barter</span></span>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-ghost text-sm">Sign In</Link>
          <Link to="/signup" className="btn-primary text-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <span className="tag-accent mb-6 inline-block">🎓 Peer-to-Peer Skill Exchange</span>
          <h1 className="font-display text-5xl md:text-7xl font-extrabold text-ink leading-tight mb-6">
            Trade what you know.<br />
            <span className="text-accent">Learn what you don't.</span>
          </h1>
          <p className="text-lg text-muted max-w-xl mx-auto mb-10">
            Connect with people who have skills you want — and offer yours in return. No money. Just knowledge.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/signup" className="btn-primary flex items-center gap-2 text-base px-8 py-3">
              Start Bartering <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-3">
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Floating cards */}
        <div className="mt-16 flex flex-wrap justify-center gap-4">
          {FLOATING_CARDS.map((c, i) => (
            <motion.div
              key={i}
              className="card p-5 w-64"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.15, duration: 0.5 }}
              style={{ animation: `float${i} 3s ease-in-out infinite ${i * 1}s` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-display font-bold text-sm">
                  {c.name[0]}
                </div>
                <span className="font-medium text-sm text-ink">{c.name}</span>
                <span className="ml-auto tag-accent text-xs">{c.score}%</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">Teaches</span>
                  <span className="tag-teal">{c.teach}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">Wants</span>
                  <span className="tag-gold">{c.learn}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-4xl text-center text-ink mb-12">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-12 h-12 rounded-full bg-accent/10 text-accent font-display font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {step.step}
                </div>
                <h3 className="font-display text-lg font-bold text-ink mb-2">{step.title}</h3>
                <p className="text-muted text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Bento */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <h2 className="font-display text-4xl text-center text-ink mb-12">Everything You Need</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              className="card p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4">{f.icon}</div>
              <h3 className="font-display text-lg font-bold text-ink mb-2">{f.title}</h3>
              <p className="text-muted text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-display text-4xl text-center text-ink mb-12">What People Say</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card p-6 min-w-64 flex-shrink-0">
                <p className="text-ink text-sm mb-4">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-teal/20 text-teal font-bold text-xs flex items-center justify-center">{t.name[0]}</div>
                  <div>
                    <p className="font-medium text-xs text-ink">{t.name}</p>
                    <p className="text-xs text-muted">{t.level}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-ink text-center px-6">
        <h2 className="font-display text-4xl text-paper font-extrabold mb-4">Ready to start bartering?</h2>
        <p className="text-paper/60 mb-8">Join thousands already exchanging skills — for free.</p>
        <Link to="/signup" className="inline-flex items-center gap-2 bg-accent text-white font-medium px-10 py-4 rounded-xl hover:shadow-glow transition-all duration-200 text-base">
          Create Free Account <ArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-ink text-paper/40 text-center py-6 text-sm border-t border-white/5">
        <p>© 2025 SkillBarter. Built with ♡ for curious learners.</p>
      </footer>
    </div>
  )
}
