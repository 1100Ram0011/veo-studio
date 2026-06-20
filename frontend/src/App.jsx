import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import API_URL from './config'
import Generate from './components/Generate'
import ReelsGenerator from './components/ReelsGenerator'
import VoiceGenerator from './components/VoiceGenerator'
import ImageGenerator from './components/ImageGenerator'
import History from './components/History'
import Analytics from './components/Analytics'
import Plans from './components/Plans'
import AuthModal from './components/AuthModal'
import ScriptGenerator from './components/ScriptGenerator'
const TABS = [
  { id: 'generate',  label: 'Master Video', icon: '🎬' },
  { id: 'script',    label: 'AI Prompt',    icon: '✨' },
  { id: 'reels',     label: 'Insta Reels',  icon: '📱' },
  { id: 'voice',     label: 'AI Voice',     icon: '🎙️' },
  { id: 'image',     label: 'Image Gen',    icon: '🖼️' },
  { id: 'history',   label: 'History',      icon: '⊞' },
  { id: 'analytics', label: 'Analytics',    icon: '↗' },
  { id: 'plans',     label: 'Plans',        icon: '◈' },
]

const appStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background: #050a12;
    color: #e2eaf6;
    font-family: 'Outfit', sans-serif;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: #050a12; }
  ::-webkit-scrollbar-thumb { background: #1a2535; border-radius: 99px; }

  @keyframes fadeSlide {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ─── SHELL ─────────────────────────────────────────────── */
  .app-shell {
    min-height: 100vh;
    background: #050a12;
    position: relative;
    overflow-x: hidden;
  }

  /* ─── BG BLOBS ───────────────────────────────────────────── */
  .bg-blob {
    position: fixed;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
    filter: blur(80px);
  }
  .bg-blob-1 {
    top: -10%; left: 20%;
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(14,165,233,0.05) 0%, transparent 70%);
  }
  .bg-blob-2 {
    bottom: 5%; right: 10%;
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(99,102,241,0.04) 0%, transparent 70%);
  }

  /* ─── HEADER ─────────────────────────────────────────────── */
  .app-header {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: rgba(5,10,18,0.95);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-bottom: 1px solid #0f1c2e;
  }

  .header-inner {
    max-width: 1140px;
    margin: 0 auto;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 0 16px;
  }

  /* ─── LOGO ───────────────────────────────────────────────── */
  .logo {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    text-decoration: none;
  }
  .logo-mark {
    width: 34px; height: 34px;
    border-radius: 10px;
    background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
    box-shadow: 0 2px 12px rgba(14,165,233,0.35);
    flex-shrink: 0;
  }
  .logo-text {
    font-family: 'Outfit', sans-serif;
    font-weight: 800;
    font-size: 18px;
    letter-spacing: -0.4px;
    color: #e2eaf6;
  }
  .logo-text span { color: #38bdf8; }

  /* ─── CREDIT BADGE ───────────────────────────────────────── */
  .credit-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 100px;
    border: 1px solid rgba(56,189,248,0.2);
    background: rgba(56,189,248,0.05);
    font-size: 12px;
    color: #7dd3fc;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .credit-badge.low {
    border-color: rgba(248,113,113,0.25);
    background: rgba(248,113,113,0.06);
    color: #f87171;
  }
  .credit-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #38bdf8;
    box-shadow: 0 0 6px #38bdf8;
    flex-shrink: 0;
  }
  .credit-dot.low { background: #f87171; box-shadow: 0 0 6px #f87171; }

  .avatar {
    width: 34px; height: 34px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
    display: flex; align-items: center; justify-content: center;
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    flex-shrink: 0;
    border: 2px solid rgba(56,189,248,0.2);
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  /* ─── BOTTOM NAV (Mobile) ────────────────────────────────── */
  .bottom-nav {
    display: none;
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 1000;
    background: rgba(7,13,24,0.97);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid #0f1c2e;
    padding: 6px 4px max(env(safe-area-inset-bottom), 6px);
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .bottom-nav::-webkit-scrollbar { display: none; }

  .bottom-nav-inner {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 2px;
    min-width: max-content;
    padding: 0 4px;
  }

  .bottom-nav-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    padding: 6px 10px;
    border-radius: 12px;
    border: none;
    cursor: pointer;
    font-family: 'Outfit', sans-serif;
    font-size: 10px;
    font-weight: 500;
    color: #3d5166;
    background: transparent;
    transition: all 0.15s;
    min-width: 52px;
    -webkit-tap-highlight-color: transparent;
  }
  .bottom-nav-btn .bn-icon { font-size: 18px; line-height: 1; }
  .bottom-nav-btn:hover { color: #7dd3fc; background: rgba(56,189,248,0.05); }
  .bottom-nav-btn.active {
    color: #38bdf8;
    background: rgba(56,189,248,0.1);
    font-weight: 700;
  }

  /* ─── DESKTOP NAV ────────────────────────────────────────── */
  .desktop-nav-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    overflow: hidden;
  }
  .app-nav {
    display: flex;
    align-items: center;
    gap: 3px;
    background: rgba(15,28,46,0.4);
    border: 1px solid #0f1c2e;
    border-radius: 14px;
    padding: 5px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .app-nav::-webkit-scrollbar { display: none; }
  .nav-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 13px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #64748b;
    background: transparent;
    transition: all 0.18s;
    white-space: nowrap;
    -webkit-tap-highlight-color: transparent;
  }
  .nav-btn:hover { color: #7dd3fc; background: rgba(56,189,248,0.05); }
  .nav-btn.active {
    background: #0d1f35;
    color: #38bdf8;
    font-weight: 700;
    box-shadow: 0 1px 8px rgba(14,165,233,0.15);
  }

  /* ─── MAIN CONTENT ───────────────────────────────────────── */
  .app-main {
    max-width: 1140px;
    margin: 0 auto;
    padding: 36px 16px 100px;   /* bottom 100px = space for bottom-nav on mobile */
    position: relative;
    z-index: 10;
    animation: fadeSlide 0.3s ease;
  }

  /* ─── CARDS / BUTTONS ────────────────────────────────────── */
  .card {
    background: #0b1520;
    border: 1px solid #1a2535;
    border-radius: 20px;
    padding: 20px;
    margin-bottom: 16px;
  }
  .gen-btn {
    width: 100%;
    padding: 16px;
    border-radius: 16px;
    border: none;
    cursor: pointer;
    font-family: 'Outfit', sans-serif;
    font-size: 15px;
    font-weight: 700;
    transition: all 0.25s;
    -webkit-tap-highlight-color: transparent;
  }
  .gen-btn.primary {
    background: linear-gradient(135deg, #ea580c 0%, #d97706 100%);
    color: #fff;
    box-shadow: 0 4px 24px rgba(234,88,12,0.3);
  }

  /* ─── PAYWALL MODAL ──────────────────────────────────────── */
  .paywall-overlay {
    position: fixed;
    inset: 0;
    background: rgba(3,7,18,0.98);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    pointer-events: auto;
  }
  .paywall-card {
    max-width: 380px;
    width: 100%;
    text-align: center;
    background: #0b1520;
    border: 1px solid rgba(168,85,247,0.35);
    border-radius: 20px;
    padding: 28px 20px;
    box-shadow: 0 10px 50px rgba(0,0,0,0.9);
  }
  .paywall-amount {
    font-size: 32px;
    font-weight: 800;
    color: #4ade80;
    font-family: 'Space Mono', monospace;
    margin-top: 2px;
  }
  .paywall-ref {
    font-size: 10px;
    color: #2a3a4e;
    font-family: 'Space Mono', monospace;
    margin-top: 4px;
    word-break: break-all;
  }

  /* ─── RESPONSIVE BREAKPOINTS ─────────────────────────────── */

  /* Tablet & below: hide desktop nav, show bottom nav */
  @media (max-width: 768px) {
    .desktop-nav-wrap { display: none; }
    .bottom-nav { display: block; }

    .header-inner { height: 56px; padding: 0 14px; }
    .logo-text { font-size: 16px; }
    .logo-mark { width: 30px; height: 30px; font-size: 14px; }

    .app-main { padding: 20px 12px 90px; }
    .card { padding: 16px; border-radius: 16px; }

    .paywall-card { padding: 24px 16px; }
    .paywall-amount { font-size: 28px; }
  }

  /* Small phones */
  @media (max-width: 380px) {
    .header-inner { padding: 0 10px; gap: 8px; }
    .credit-badge { padding: 5px 9px; font-size: 11px; }
    .credit-badge .credit-label { display: none; }   /* show only dot on very small screens */
    .credit-badge.show-label .credit-label { display: inline; }
    .avatar { width: 30px; height: 30px; font-size: 12px; }
    .app-main { padding: 16px 10px 88px; }
    .paywall-card { padding: 20px 14px; }
  }
`;

export default function App() {
  const [tab, setTab] = useState('generate')
  const [history, setHistory] = useState([])

  const [freeCount, setFreeCount] = useState(() => {
    const saved = localStorage.getItem('veo_app_usage_loop_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [isUnlimited, setIsUnlimited] = useState(() => {
    return localStorage.getItem('veo_app_premium_unlocked_flag') === 'true';
  });

  const [showAuthModal, setShowAuthModal] = useState(false)
  const [user, setUser] = useState(null)
  
  useEffect(() => {
    const token = localStorage.getItem('veo_token');
    if (token) {
      axios.get(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          if (res.data.success) {
            setUser(res.data.user);
            setIsUnlimited(res.data.user.isUnlimited);
            if (res.data.user.isUnlimited) {
              localStorage.setItem('veo_app_premium_unlocked_flag', 'true');
            }
          }
        })
        .catch(() => {
          localStorage.removeItem('veo_token');
        });
    }
  }, []);

  const handleAuthSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    setShowAuthModal(false);
    setIsUnlimited(loggedInUser.isUnlimited);
    if (loggedInUser.isUnlimited) {
      localStorage.setItem('veo_app_premium_unlocked_flag', 'true');
    } else {
      setTab('plans');
    }
  };

  const handleUsageAccounting = () => {
    if (isUnlimited) return true;
    
    if (user) {
      if (user.credits <= 0) {
        setTab('plans');
        return false;
      }
      
      // Deduct locally and sync with backend
      const newCredits = user.credits - 1;
      setUser({ ...user, credits: newCredits });
      
      const token = localStorage.getItem('veo_token');
      axios.post(`${API_URL}/api/auth/use-credit`, {}, { headers: { Authorization: `Bearer ${token}` } })
        .catch(() => console.error("Failed to sync credit deduction"));
        
      return true;
    } else {
      if (freeCount >= 20) {
        setShowAuthModal(true);
        return false;
      }
      const nextCount = freeCount + 1;
      setFreeCount(nextCount);
      localStorage.setItem('veo_app_usage_loop_count', nextCount);
      return true;
    }
  };

  const triggerScanPaySequence = () => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setTab('plans');
    }
  };

  let creditsDisplay = '';
  let isLow = false;
  let creditsNum = 0;

  if (isUnlimited) {
    creditsDisplay = '∞ Unlimited';
    creditsNum = 9999;
  } else if (user) {
    creditsDisplay = `${user.credits} Credits`;
    isLow = user.credits <= 2;
    creditsNum = user.credits;
  } else {
    creditsDisplay = `${20 - freeCount} Free Tries`;
    isLow = freeCount >= 18;
    creditsNum = 20 - freeCount;
  }

  return (
    <>
      <style>{appStyles}</style>
      <div className="app-shell">
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />

        {/* ── HEADER ── */}
        <header className="app-header">
          <div className="header-inner">

            {/* Logo */}
            <div className="logo">
              <div className="logo-mark">▶</div>
              <span className="logo-text">Veo<span>Studio</span></span>
            </div>

            {/* Desktop Nav (hidden on mobile) */}
            <div className="desktop-nav-wrap">
              <nav className="app-nav">
                {TABS.map(t => (
                  <button
                    key={t.id}
                    className={`nav-btn ${tab === t.id ? 'active' : ''}`}
                    onClick={() => setTab(t.id)}
                  >
                    <span>{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Right side: credits + avatar */}
            <div className="header-right">
              <div className={`credit-badge show-label ${isLow ? 'low' : ''}`}>
                <span className={`credit-dot ${isLow ? 'low' : ''}`} />
                <span className="credit-label" style={{ fontWeight: 700 }}>{creditsDisplay}</span>
              </div>
              <div className="avatar">U</div>
            </div>

          </div>
        </header>

        <main className="app-main">
          <div style={{ display: tab === 'generate' ? 'block' : 'none' }}>
            <Generate history={history} setHistory={setHistory} credits={creditsNum} setCredits={handleUsageAccounting} />
          </div>
          <div style={{ display: tab === 'script' ? 'block' : 'none' }}>
            <ScriptGenerator credits={creditsNum} setCredits={handleUsageAccounting} />
          </div>
          <div style={{ display: tab === 'reels' ? 'block' : 'none' }}>
            <ReelsGenerator history={history} setHistory={setHistory} credits={creditsNum} setCredits={handleUsageAccounting} />
          </div>
          <div style={{ display: tab === 'voice' ? 'block' : 'none' }}>
            <VoiceGenerator credits={creditsNum} setCredits={handleUsageAccounting} />
          </div>
          <div style={{ display: tab === 'image' ? 'block' : 'none' }}>
            <ImageGenerator credits={creditsNum} setCredits={handleUsageAccounting} />
          </div>
          <div style={{ display: tab === 'history' ? 'block' : 'none' }}>
            <History history={history} />
          </div>
          <div style={{ display: tab === 'analytics' ? 'block' : 'none' }}>
            <Analytics history={history} />
          </div>
          <div style={{ display: tab === 'plans' ? 'block' : 'none' }}>
            <Plans currentPlan={isUnlimited ? 'Unlimited Pro' : 'Free Tier'} setCurrentPlan={() => {}} setCredits={() => setIsUnlimited(true)} userEmail={user?.email} />
          </div>
        </main>

        {/* ── BOTTOM NAV (Mobile only) ── */}
        <nav className="bottom-nav">
          <div className="bottom-nav-inner">
            {TABS.map(t => (
              <button
                key={t.id}
                className={`bottom-nav-btn ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                <span className="bn-icon">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* ── AUTH MODAL ── */}
        {showAuthModal && (
          <AuthModal 
            onAuthSuccess={handleAuthSuccess} 
            onClose={() => setShowAuthModal(false)} 
          />
        )}

      </div>
    </>
  )
}
