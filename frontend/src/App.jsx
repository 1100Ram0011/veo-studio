// import { useState } from 'react'
// import Generate from './components/Generate'
// import History from './components/History'
// import Analytics from './components/Analytics'
// import Plans from './components/Plans'
// import ScriptGenerator from './components/ScriptGenerator'

// const TABS = [
//   { id: 'script', label: '✍️ Script' },
//   { id: 'generate', label: '⚡ Generate' },
//   { id: 'history', label: '📁 History' },
//   { id: 'analytics', label: '📊 Analytics' },
//   { id: 'plans', label: '💎 Plans' },
// ]

// export default function App() {
//   const [tab, setTab] = useState('script')
//   const [history, setHistory] = useState([])
//   const [credits, setCredits] = useState(5)
//   const [currentPlan, setCurrentPlan] = useState('Free')

//   return (
//     <div style={{ minHeight: '100vh', background: '#020817', fontFamily: "'DM Sans', sans-serif" }}>
//       {/* Background glow */}
//       <div style={{
//         position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
//         width: 600, height: 600, borderRadius: '50%',
//         background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)',
//         pointerEvents: 'none', zIndex: 0,
//       }} />

//       {/* Header */}
//       <header style={{
//         borderBottom: '1px solid #0f172a',
//         background: 'rgba(2,8,23,0.9)', backdropFilter: 'blur(16px)',
//         position: 'sticky', top: 0, zIndex: 100, padding: '0 32px',
//       }}>
//         <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
//           {/* Logo */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//             <div style={{
//               width: 34, height: 34, borderRadius: 8,
//               background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
//               display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
//             }}>▶</div>
//             <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: '#f1f5f9' }}>
//               Veo<span style={{ color: '#f59e0b' }}>Studio</span>
//             </span>
//           </div>

//           {/* Tabs */}
//           <nav style={{ display: 'flex', gap: 4 }}>
//             {TABS.map(t => (
//               <button key={t.id} onClick={() => setTab(t.id)} style={{
//                 padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
//                 background: tab === t.id ? '#0f172a' : 'transparent',
//                 color: tab === t.id ? '#f59e0b' : '#475569',
//                 fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: tab === t.id ? 700 : 500,
//                 borderBottom: tab === t.id ? '2px solid #f59e0b' : '2px solid transparent',
//                 transition: 'all 0.2s',
//               }}>{t.label}</button>
//             ))}
//           </nav>

//           {/* Credits */}
//           <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//             <span style={{
//               color: '#f59e0b', fontSize: 13, fontWeight: 600,
//               background: 'rgba(245,158,11,0.1)', padding: '6px 12px',
//               borderRadius: 8, border: '1px solid rgba(245,158,11,0.2)',
//             }}>
//               {credits} credits
//             </span>
//             <div style={{
//               width: 34, height: 34, borderRadius: '50%',
//               background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
//               display: 'flex', alignItems: 'center', justifyContent: 'center',
//               color: '#fff', fontSize: 14, fontWeight: 700,
//             }}>U</div>
//           </div>
//         </div>
//       </header>

//       {/* Content */}
//       <main style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 32px', position: 'relative', zIndex: 1 }}>
//         {tab === 'script'    && <ScriptGenerator />}
//         {tab === 'generate'  && <Generate history={history} setHistory={setHistory} credits={credits} setCredits={setCredits} />}
//         {tab === 'history'   && <History history={history} />}
//         {tab === 'analytics' && <Analytics history={history} />}
//         {tab === 'plans'     && <Plans currentPlan={currentPlan} setCurrentPlan={setCurrentPlan} setCredits={setCredits} />}
//       </main>
//     </div>
//   )
// }





import { useState } from 'react'
import Generate from './components/Generate'
import History from './components/History'
import Analytics from './components/Analytics'
import Plans from './components/Plans'
import ScriptGenerator from './components/ScriptGenerator'

const TABS = [
  //{ id: 'script',    label: 'Script',    icon: '✍' },
  { id: 'generate',  label: 'Generate',  icon: '⚡' },
  { id: 'history',   label: 'History',   icon: '⊞' },
  { id: 'analytics', label: 'Analytics', icon: '↗' },
  { id: 'plans',     label: 'Plans',     icon: '◈' },
]

// ✅ Sahi Code: Isko apne App.jsx mein appStyles wale variable se replace karein
const appStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body {
    background: #050a12;
    color: #e2eaf6;
    font-family: 'Outfit', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #050a12; }
  ::-webkit-scrollbar-thumb { background: #1a2535; border-radius: 99px; }

  @keyframes fadeSlide {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .app-shell {
    min-height: 100vh;
    background: #050a12;
    position: relative;
    overflow-x: hidden;
  }

  /* Ambient background blobs */
  .bg-blob {
    position: fixed;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    filter: blur(80px);
  }
  .bg-blob-1 {
    top: -10%;
    left: 20%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 70%);
  }
  .bg-blob-2 {
    bottom: 5%;
    right: 10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%);
  }

  /* Header */
  .app-header {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: rgba(5,10,18,0.9);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-bottom: 1px solid #0f1c2e;
    padding: 0 24px;
  }

  .header-inner {
    max-width: 1140px;
    margin: 0 auto;
    height: 66px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  /* Logo */
  .logo {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    text-decoration: none;
  }

  .logo-mark {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17px;
    box-shadow: 0 2px 12px rgba(14,165,233,0.35);
    flex-shrink: 0;
  }

  .logo-text {
    font-family: 'Outfit', sans-serif;
    font-weight: 800;
    font-size: 19px;
    letter-spacing: -0.4px;
    color: #e2eaf6;
  }

  .logo-text span { color: #38bdf8; }

  /* Nav Container Box */
  .mobile-nav-scroll {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    max-width: 600px;
  }

  .app-nav {
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(15,28,46,0.4);
    border: 1px solid #0f1c2e;
    border-radius: 14px;
    padding: 5px;
  }

  .nav-btn {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 8px 16px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-family: 'Outfit', sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    color: #64748b;
    background: transparent;
    transition: all 0.18s;
    white-space: nowrap;
    letter-spacing: 0.1px;
  }

  .nav-btn:hover { color: #7dd3fc; background: rgba(56,189,248,0.05); }

  .nav-btn.active {
    background: #0d1f35;
    color: #38bdf8;
    font-weight: 700;
    box-shadow: 0 1px 8px rgba(14,165,233,0.15);
  }

  .nav-icon {
    font-size: 15px;
    line-height: 1;
  }

  /* Header right */
  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
  }

  .credit-badge {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 7px 14px;
    border-radius: 100px;
    border: 1px solid rgba(56,189,248,0.2);
    background: rgba(56,189,248,0.05);
    font-size: 13px;
    font-weight: 600;
    color: #7dd3fc;
    letter-spacing: 0.2px;
  }

  .credit-badge.low {
    border-color: rgba(248,113,113,0.25);
    background: rgba(248,113,113,0.06);
    color: #f87171;
  }

  .credit-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #38bdf8;
    box-shadow: 0 0 6px #38bdf8;
  }

  .credit-dot.low {
    background: #f87171;
    box-shadow: 0 0 6px #f87171;
  }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    flex-shrink: 0;
    border: 2px solid rgba(56,189,248,0.2);
    cursor: pointer;
    transition: border-color 0.2s;
  }

  .avatar:hover { border-color: rgba(56,189,248,0.5); }

  /* Main content layout stack lock */
  .app-main {
    max-width: 1140px;
    margin: 0 auto;
    padding: 44px 24px 80px;
    position: relative;
    z-index: 10;
    animation: fadeSlide 0.3s ease;
  }

  /* 🔥 MOBILE VIEW OVERHAUL (Aapki Problem Ka Solution) 🔥 */
  @media (max-width: 768px) {
    .app-header { padding: 0 12px; }
    .header-inner { height: 64px; gap: 8px; }
    
    .mobile-nav-scroll {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      justify-content: flex-start;
      padding: 6px 0;
      max-width: 100%;
    }
    .mobile-nav-scroll::-webkit-scrollbar { display: none; }

    /* Nav container ko pill-shaped border aur background diya */
    .app-nav { 
      background: #0b1524; 
      border: 1px solid #16263f; 
      padding: 4px; 
      border-radius: 12px;
      display: flex;
      gap: 6px;
    }

    /* Buttons ko bada kiya aur distinct border diya */
    .nav-btn { 
      padding: 8px 14px; 
      font-size: 13px; 
      border-radius: 8px;
      background: #070d16;
      border: 1px solid #101d30;
      color: #748ba7;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .nav-btn .nav-label { display: inline-block; } /* Text vapas on kiya taaki pata chale kaunsa button hai */
    .nav-icon { font-size: 14px; }
    
    /* Active button par solid neon border aur glow background background */
    .nav-btn.active { 
      background: #0ea5e9;
      color: #050a12;
      font-weight: 700;
      border-color: #38bdf8;
      box-shadow: 0 0 12px rgba(14,165,233,0.4);
    }

    .nav-btn:hover {
      background: #0d1f35;
      color: #38bdf8;
    }
    
    .credit-badge .credit-label { display: none; }
    .credit-badge { padding: 8px; border-radius: 50%; }
    .app-main { padding: 20px 12px 60px; }
    .logo-mark { width: 32px; height: 32px; font-size: 15px; }
  }

  @media (max-width: 520px) {
    .logo-text { display: none; }
  }
`;

export default function App() {
  const [tab, setTab] = useState('script')
  const [history, setHistory] = useState([])
  const [credits, setCredits] = useState(5)
  const [currentPlan, setCurrentPlan] = useState('Free')

  return (
    <>
      <style>{appStyles}</style>
      <div className="app-shell">
        {/* Ambient blobs */}
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />

        {/* Header */}
        <header className="app-header">
          <div className="header-inner">
            {/* Logo */}
            <div className="logo">
              <div className="logo-mark">▶</div>
              <span className="logo-text">Veo<span>Studio</span></span>
            </div>

            {/* Nav */}
            <div className="mobile-nav-scroll">
              <nav className="app-nav">
                {TABS.map(t => (
                  <button
                    key={t.id}
                    className={`nav-btn ${tab === t.id ? 'active' : ''}`}
                    onClick={() => setTab(t.id)}
                  >
                    <span className="nav-icon">{t.icon}</span>
                    <span className="nav-label">{t.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Right */}
            <div className="header-right">
              <div className={`credit-badge ${credits <= 1 ? 'low' : ''}`}>
                <span className={`credit-dot ${credits <= 1 ? 'low' : ''}`} />
                <span className="credit-label">{credits} credit{credits !== 1 ? 's' : ''}</span>
              </div>
              <div className="avatar">U</div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="app-main" key={tab}>
     
          {tab === 'generate'  && <Generate history={history} setHistory={setHistory} credits={credits} setCredits={setCredits} />}
          {tab === 'history'   && <History history={history} />}
          {tab === 'analytics' && <Analytics history={history} />}
          {tab === 'plans'     && <Plans currentPlan={currentPlan} setCurrentPlan={setCurrentPlan} setCredits={setCredits} />}
        </main>
      </div>
    </>
  )
}
