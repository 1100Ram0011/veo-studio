import { useState } from 'react'
import Generate from './components/Generate'
import History from './components/History'
import Analytics from './components/Analytics'
import Plans from './components/Plans'
import ScriptGenerator from './components/ScriptGenerator'

const TABS = [
  { id: 'script', label: '✍️ Script' },
  { id: 'generate', label: '⚡ Generate' },
  { id: 'history', label: '📁 History' },
  { id: 'analytics', label: '📊 Analytics' },
  { id: 'plans', label: '💎 Plans' },
]

export default function App() {
  const [tab, setTab] = useState('script')
  const [history, setHistory] = useState([])
  const [credits, setCredits] = useState(5)
  const [currentPlan, setCurrentPlan] = useState('Free')

  return (
    <div style={{ minHeight: '100vh', background: '#020817', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Header */}
      <header style={{
        borderBottom: '1px solid #0f172a',
        background: 'rgba(2,8,23,0.9)', backdropFilter: 'blur(16px)',
        position: 'sticky', top: 0, zIndex: 100, padding: '0 32px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}>▶</div>
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: '#f1f5f9' }}>
              Veo<span style={{ color: '#f59e0b' }}>Studio</span>
            </span>
          </div>

          {/* Tabs */}
          <nav style={{ display: 'flex', gap: 4 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: tab === t.id ? '#0f172a' : 'transparent',
                color: tab === t.id ? '#f59e0b' : '#475569',
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: tab === t.id ? 700 : 500,
                borderBottom: tab === t.id ? '2px solid #f59e0b' : '2px solid transparent',
                transition: 'all 0.2s',
              }}>{t.label}</button>
            ))}
          </nav>

          {/* Credits */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              color: '#f59e0b', fontSize: 13, fontWeight: 600,
              background: 'rgba(245,158,11,0.1)', padding: '6px 12px',
              borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)',
            }}>
              {credits} credits
            </span>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 14, fontWeight: 700,
            }}>U</div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 32px', position: 'relative', zIndex: 1 }}>
        {tab === 'script'    && <ScriptGenerator />}
        {tab === 'generate'  && <Generate history={history} setHistory={setHistory} credits={credits} setCredits={setCredits} />}
        {tab === 'history'   && <History history={history} />}
        {tab === 'analytics' && <Analytics history={history} />}
        {tab === 'plans'     && <Plans currentPlan={currentPlan} setCurrentPlan={setCurrentPlan} setCredits={setCredits} />}
      </main>
    </div>
  )
}
