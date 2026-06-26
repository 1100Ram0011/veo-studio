import { useState, useEffect } from 'react'
import axios from 'axios'
import API_URL from './config'
import Generate from './components/Generate'
import ReelsGenerator from './components/ReelsGenerator'
import VoiceGenerator from './components/VoiceGenerator'
import ImageGenerator from './components/ImageGenerator'
import Analytics from './components/Analytics'
import Plans from './components/Plans'
import AuthModal from './components/AuthModal'
import ScriptGenerator from './components/ScriptGenerator'
import StoryGenerator from './components/StoryGenerator'
import Gallery from './components/Gallery'
import ShortsGenerator from './components/ShortsGen'

const SIDEBAR_TABS_TOP = [
  { id: 'generate',  label: 'Master Video', icon: '🎬' },
  { id: 'shorts',    label: 'Viral Shorts', icon: '🔥' },
  { id: 'story',     label: 'Auto Story',   icon: '📖' },
  { id: 'script',    label: 'AI Prompt',    icon: '✨' },
  { id: 'reels',     label: 'Insta Reels',  icon: '📱' },
  { id: 'voice',     label: 'AI Voice',     icon: '🎙️' },
  { id: 'image',     label: 'Image Gen',    icon: '🖼️' },
]

const SIDEBAR_TABS_BOTTOM = [
  { id: 'gallery',   label: 'My Gallery',   icon: '📂' },
  { id: 'analytics', label: 'Analytics',    icon: '📈' },
  { id: 'plans',     label: 'Plans & Billing', icon: '💳' },
]

export default function App() {
  const [tab, setTab] = useState('generate')
  const [history, setHistory] = useState([])
  const [theme, setTheme] = useState(() => localStorage.getItem('veo_theme') || 'light')

  const [freeCount, setFreeCount] = useState(() => {
    const saved = localStorage.getItem('veo_app_usage_loop_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [isUnlimited, setIsUnlimited] = useState(() => {
    return localStorage.getItem('veo_app_premium_unlocked_flag') === 'true';
  });

  const [showAuthModal, setShowAuthModal] = useState(() => !localStorage.getItem('veo_token'))
  const [user, setUser] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
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
            setShowAuthModal(false);
          }
        })
        .catch(() => {
          localStorage.removeItem('veo_token');
          setUser(null);
          setShowAuthModal(true);
        });
    } else {
      setShowAuthModal(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('veo_theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light')

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

  const handleLogout = () => {
    localStorage.removeItem('veo_token');
    localStorage.removeItem('userEmail');
    setUser(null);
    window.location.href = '/';
  };

  const handleUsageAccounting = () => {
    if (!user) {
      setShowAuthModal(true);
      return false;
    }
    
    if (isUnlimited) return true;
    
    if (user.credits <= 0) {
      setTab('plans');
      return false;
    }
    
    const newCredits = user.credits - 1;
    setUser({ ...user, credits: newCredits });
    
    const token = localStorage.getItem('veo_token');
    axios.post(`${API_URL}/api/auth/use-credit`, {}, { headers: { Authorization: `Bearer ${token}` } })
      .catch(() => console.error("Failed to sync credit deduction"));
      
    return true;
  };

  let creditsDisplay = '';
  let creditsNum = 0;

  if (isUnlimited) {
    creditsDisplay = 'Unlimited';
    creditsNum = 9999;
  } else if (user) {
    creditsDisplay = `${user.credits} Credits`;
    creditsNum = user.credits;
  } else {
    creditsDisplay = `${20 - freeCount} Free Tries`;
    creditsNum = 20 - freeCount;
  }

  const renderTabButton = (t) => {
    const isActive = tab === t.id;
    return (
      <button
        key={t.id}
        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all ${
          isActive 
            ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20 shadow-[inset_4px_0_0_#3b82f6]' 
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 border border-transparent'
        }`}
        onClick={() => { setTab(t.id); setIsMobileMenuOpen(false); }}
      >
        <span className={`text-xl ${isActive ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>{t.icon}</span>
        <span className="font-semibold tracking-wide">{t.label}</span>
      </button>
    )
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#050a12] text-slate-900 dark:text-slate-200 overflow-hidden font-outfit selection:bg-blue-500/30 transition-colors duration-300">
      
      {/* Mobile Header (visible only on small screens) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#0a101d] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-50">
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-500 dark:text-slate-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <div className="flex items-center gap-2" onClick={() => setTab('generate')}>
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xs">▶</div>
          <span className="font-bold text-lg text-slate-900 dark:text-white">Veo<span className="text-blue-500 dark:text-blue-400">Studio</span></span>
        </div>
        <div className="flex flex-col items-center gap-1">
           <button 
             onClick={() => setTab('plans')}
             className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-500/30 text-[10px] font-bold"
           >
             <span className="text-blue-500">⚡</span> {creditsNum}
           </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed md:static top-0 left-0 h-full w-[260px] bg-white dark:bg-[#0a101d] border-r border-slate-200 dark:border-slate-800/80 flex flex-col z-40 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0 pt-16 md:pt-0' : '-translate-x-full md:translate-x-0 shadow-2xl md:shadow-none'}`}>
        
        {/* Logo (Desktop) */}
        <div className="hidden md:flex items-center gap-3 px-6 h-20 flex-shrink-0 cursor-pointer" onClick={() => setTab('generate')}>
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
            ▶
          </div>
          <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">
            Veo<span className="text-blue-600 dark:text-blue-400">Studio</span>
          </span>
        </div>

        {/* Scrollable Nav Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-6">
          <div className="space-y-1">
            {SIDEBAR_TABS_TOP.map(renderTabButton)}
          </div>

          <div className="h-[1px] w-full bg-slate-200 dark:bg-slate-800/60 my-4" />

          <div className="space-y-1">
            {SIDEBAR_TABS_BOTTOM.map(renderTabButton)}
          </div>
        </div>

        {/* Footer Area (Credits widget, Profile) */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#080c16]">
          {/* Credits Widget */}
          <div className="bg-white dark:bg-[#0b1221] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">{creditsDisplay}</span>
            </div>
            {!isUnlimited && (
              <div className="text-xs text-slate-500 mb-3">Resets on 1 July 2026</div>
            )}
            <button 
              onClick={() => setTab('plans')}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 dark:bg-gradient-to-r dark:from-blue-600 dark:to-indigo-600 text-white rounded-xl text-[13px] font-bold shadow-md shadow-blue-500/20 transition-all"
            >
              Upgrade Plan
            </button>
          </div>

          {/* Help / Profile / Theme Toggle */}
          <div className="flex items-center justify-between px-2">
            <button onClick={toggleTheme} className="text-xl p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors" title="Toggle Theme">
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            {user ? (
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-md cursor-help" title={user.email}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <button onClick={handleLogout} className="text-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-full transition-colors" title="Log Out">
                  🚪
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                👤
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-[#050a12] pt-16 pb-20 md:pt-0 md:pb-0 transition-colors duration-300">
        
        {/* Subtle Background Glows (Dark Mode Only) */}
        {theme === 'dark' && (
          <>
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.03)_0%,transparent_70%)] blur-[100px] pointer-events-none z-0" />
            <div className="absolute bottom-[10%] left-[10%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.02)_0%,transparent_70%)] blur-[100px] pointer-events-none z-0" />
          </>
        )}

        <div className="relative z-10 w-full h-full p-4 md:p-8 animate-[fadeSlide_0.3s_ease]">
          
          <div className={tab === 'generate' ? 'block' : 'hidden'}>
            <Generate history={history} setHistory={setHistory} credits={creditsNum} setCredits={handleUsageAccounting} />
          </div>
          <div className={tab === 'shorts' ? 'block' : 'hidden'}>
            <ShortsGenerator history={history} setHistory={setHistory} credits={creditsNum} setCredits={handleUsageAccounting} />
          </div>
          <div className={tab === 'script' ? 'block' : 'hidden'}>
            <ScriptGenerator credits={creditsNum} setCredits={handleUsageAccounting} />
          </div>
          <div className={tab === 'story' ? 'block' : 'hidden'}>
            <StoryGenerator credits={creditsNum} setCredits={handleUsageAccounting} />
          </div>
          <div className={tab === 'reels' ? 'block' : 'hidden'}>
            <ReelsGenerator history={history} setHistory={setHistory} credits={creditsNum} setCredits={handleUsageAccounting} />
          </div>
          <div className={tab === 'voice' ? 'block' : 'hidden'}>
            <VoiceGenerator credits={creditsNum} setCredits={handleUsageAccounting} />
          </div>
          <div className={tab === 'image' ? 'block' : 'hidden'}>
            <ImageGenerator credits={creditsNum} setCredits={handleUsageAccounting} />
          </div>
          <div className={tab === 'gallery' ? 'block' : 'hidden'}>
            {tab === 'gallery' && <Gallery setTab={setTab} />}
          </div>
          <div className={tab === 'analytics' ? 'block' : 'hidden'}>
            <Analytics history={history} />
          </div>
          <div className={tab === 'plans' ? 'block' : 'hidden'}>
            <Plans 
              currentPlan={user?.plan || 'Free'}
              setCurrentPlan={(planId) => {
                setUser(prev => ({
                  ...prev,
                  plan: planId,
                  isUnlimited: planId === 'ProMonthly'
                }))
                if (planId === 'ProMonthly') setIsUnlimited(true)
              }}
              setCredits={(updater) => {
                setUser(prev => ({
                  ...prev,
                  credits: typeof updater === 'function' ? updater(prev?.credits || 0) : updater
                }))
              }}
              userEmail={user?.email} 
            />
          </div>
        </div>
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#0a101d] border-t border-slate-200 dark:border-slate-800 pb-safe px-4 py-2 flex justify-between shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {[
          { id: 'generate', label: 'Home', icon: '🏠' },
          { id: 'reels', label: 'Create', icon: '🎬' },
          { id: 'gallery', label: 'Gallery', icon: '🖼️' },
          { id: 'analytics', label: 'Projects', icon: '📁' },
          { id: 'plans', label: 'Profile', icon: '👤' }
        ].map(t => (
          <button
            key={t.id}
            className={`flex flex-col items-center justify-center gap-1 min-w-[50px] transition-all ${
              tab === t.id 
                ? 'text-blue-600 dark:text-blue-400 font-bold' 
                : 'text-slate-500 dark:text-slate-400'
            }`}
            onClick={() => setTab(t.id)}
          >
            <span className="text-[20px]">{t.icon}</span>
            <span className="text-[10px]">{t.label}</span>
          </button>
        ))}
      </nav>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal 
          onAuthSuccess={handleAuthSuccess} 
          onClose={user ? () => setShowAuthModal(false) : undefined} 
        />
      )}
    </div>
  )
}
