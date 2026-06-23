import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthModal from '../components/AuthModal';

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalMode, setModalMode] = useState('signup');
  const navigate = useNavigate();

  const handleAction = (e, mode = 'signup') => {
    e.preventDefault();
    if (!localStorage.getItem('veo_token')) {
      setModalMode(mode);
      setShowAuthModal(true);
    } else {
      navigate('/app');
    }
  };

  const handleAuthSuccess = () => {
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-[#050a12] text-slate-200 font-outfit overflow-x-hidden selection:bg-blue-500/30">
      
      {showAuthModal && (
        <AuthModal 
          initialMode={modalMode}
          onAuthSuccess={handleAuthSuccess} 
          onClose={() => setShowAuthModal(false)} 
        />
      )}
      
      {/* Navbar */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <span className="font-bold text-sm">▶</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-white">VeoStudio</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <div className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
            Resources <span className="text-[10px]">▼</span>
          </div>
        </nav>
        <div className="flex items-center gap-6 text-sm">
          <button onClick={(e) => handleAction(e, 'login')} className="hidden md:block font-medium text-slate-300 hover:text-white transition-colors">Log in</button>
          <button onClick={(e) => handleAction(e, 'signup')} className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
            Get Started Free
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-24 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        {/* Left Text */}
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111827] border border-[#1f2937] text-amber-400 text-xs font-bold mb-6">
            <span>✨</span> VeoStudio 3.0 is Live!
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 text-white">
            Generate Stunning <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">AI Videos</span> in Seconds
          </h1>
          
          <p className="text-lg text-slate-400 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            Transform your ideas into professional videos, Reels, and AI Voices without any editing skills.<br/>
            Built for creators and marketers.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-10">
            <button onClick={(e) => handleAction(e, 'signup')} className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all">
              🚀 Start Creating Now
            </button>
            <a href="#demo" className="w-full sm:w-auto px-8 py-3.5 bg-[#0b101d] border border-slate-800 hover:bg-[#121929] rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all">
              ▶ Watch Demo
            </a>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-6 text-[11px] font-semibold text-slate-400">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-sm">🛡️</span> No Credit Card Required
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-sm">👥</span> 10K+ Happy Creators
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500 text-sm">⭐</span> 4.9/5 Rating
            </div>
          </div>
        </div>

        {/* Right Graphic/Mockup */}
        <div className="flex-[1.2] relative w-full max-w-2xl mt-8 lg:mt-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle,rgba(99,102,241,0.15)_0%,transparent_60%)] blur-[40px] pointer-events-none z-0" />
          
          {/* Main Video Frame */}
          <div className="relative z-10 bg-[#0a0f1c] border border-indigo-500/30 rounded-2xl p-2 shadow-[0_0_50px_rgba(79,70,229,0.15)]">
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video group">
              <img src="https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&q=80&w=1200" alt="Cyberpunk City" className="w-full h-full object-cover opacity-80" />
              <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-bold flex items-center gap-1.5">
                <span className="text-indigo-400 text-xs">✨</span> AI Generated Video
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xl pl-1 shadow-2xl cursor-pointer group-hover:scale-110 transition-all">
                   ▶
                 </div>
              </div>
              <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                <p className="text-[10px] text-white/80 max-w-[70%] leading-relaxed bg-black/40 p-2 rounded-lg backdrop-blur-sm border border-white/5">
                  A futuristic city at sunset, flying cars moving between glowing skyscrapers, ultra detailed, cinematic...
                </p>
                <span className="text-[11px] font-bold bg-black/60 px-2 py-1 rounded backdrop-blur-sm">0:15</span>
              </div>
            </div>
            
            {/* Thumbnails row */}
            <div className="flex gap-2 mt-2 px-1">
              {[1,2,3,4].map(i => (
                <div key={i} className={`flex-1 aspect-video rounded-lg overflow-hidden border ${i===1 ? 'border-indigo-500' : 'border-transparent opacity-60'} cursor-pointer hover:opacity-100 transition-all`}>
                  <img src={`https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&q=80&w=300&hue=${i*40}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">Everything You Need to <span className="text-purple-400">Go Viral</span></h2>
          <p className="text-slate-400 text-sm">One platform. All the AI tools.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { title: "Master Video", desc: "Turn any text prompt into high-quality videos.", icon: "🎬", color: "from-purple-500 to-indigo-500", link: "Create Videos" },
            { title: "Insta Reels Gen", desc: "Instantly create highly engaging vertical short-form content.", icon: "📱", color: "from-pink-500 to-rose-500", link: "Create Reels" },
            { title: "AI Voiceovers", desc: "Ultra-realistic human voices in multiple languages and tones.", icon: "🎙️", color: "from-blue-500 to-cyan-500", link: "Generate Voice" },
            { title: "Auto Story", desc: "Generate compelling narrative scripts that hook your audience.", icon: "📖", color: "from-blue-600 to-indigo-600", link: "Write Story" },
            { title: "Image Generation", desc: "Create breathtaking visuals and assets with AI.", icon: "🖼️", color: "from-emerald-400 to-teal-500", link: "Generate Images" },
            { title: "Cloud Gallery", desc: "Manage and download all your generated masterpieces.", icon: "📂", color: "from-amber-400 to-orange-500", link: "Open Gallery" },
          ].map((f, i) => (
            <div key={i} className="bg-[#0b101d] border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700 transition-colors group flex flex-col items-start">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-105 transition-transform`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-[13px] text-slate-400 mb-6 flex-1 leading-relaxed">{f.desc}</p>
              <button onClick={(e) => handleAction(e, 'signup')} className="px-4 py-1.5 rounded-full border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5 mt-auto">
                {f.link} <span className="text-[10px]">→</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative z-10 py-12 px-6 max-w-6xl mx-auto">
        <div className="bg-[#0a0f1c] border border-indigo-900/50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-10 shadow-[0_0_50px_rgba(59,130,246,0.08)] relative overflow-hidden">
          <div className="absolute top-[-50%] left-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(99,102,241,0.12)_0%,transparent_60%)] pointer-events-none z-0" />
          
          <div className="relative z-10 flex-[0.8] flex justify-center hidden sm:flex">
            {/* Visual element representing assets */}
            <div className="relative w-48 h-48">
              <div className="absolute inset-0 bg-blue-500/20 rounded-2xl rotate-12 blur-sm" />
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl rotate-6 border border-white/10 shadow-xl flex items-center justify-center text-5xl">🎬</div>
              <div className="absolute inset-0 bg-[#121929] rounded-2xl -rotate-6 border border-slate-700 shadow-xl flex items-center justify-center text-5xl overflow-hidden">
                 <img src="https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&q=80&w=200" className="opacity-50 object-cover w-full h-full" />
                 <span className="absolute text-4xl drop-shadow-xl">🖼️</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex-[1.2] text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Stop Editing. Start Generating.</h2>
            <p className="text-sm text-slate-400 mb-8 max-w-md mx-auto md:mx-0 leading-relaxed">
              Join thousands of creators who are scaling their content production 10x faster with VeoStudio.
            </p>
            <button onClick={(e) => handleAction(e, 'signup')} className="inline-flex px-6 py-3.5 bg-white text-slate-900 rounded-xl font-bold text-sm shadow-xl hover:scale-105 transition-transform items-center gap-2">
              Start Creating for Free <span>→</span>
            </button>
          </div>

          <div className="relative z-10 flex-1 flex flex-col gap-5 text-sm border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-10">
            <div className="flex items-start gap-3">
               <span className="text-indigo-400 text-xl">⚡</span>
               <div>
                 <p className="font-bold text-white text-[13px]">AI-Powered</p>
                 <p className="text-[11px] text-slate-500">Create in seconds</p>
               </div>
            </div>
            <div className="flex items-start gap-3">
               <span className="text-pink-400 text-xl">🎯</span>
               <div>
                 <p className="font-bold text-white text-[13px]">Easy to Use</p>
                 <p className="text-[11px] text-slate-500">No editing skills needed</p>
               </div>
            </div>
            <div className="flex items-start gap-3">
               <span className="text-amber-400 text-xl">💼</span>
               <div>
                 <p className="font-bold text-white text-[13px]">Commercial Use</p>
                 <p className="text-[11px] text-slate-500">Built for creators & brands</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-20 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
           <div>
             <div className="px-3 py-1 bg-[#1e293b] text-slate-300 text-[10px] font-bold rounded-full inline-block mb-3">PRICING</div>
             <h2 className="text-3xl font-bold text-white mb-2">Simple, Transparent Pricing</h2>
             <p className="text-sm text-slate-400">One-time payment. No subscriptions.</p>
           </div>
           <a href="#" className="text-sm font-medium text-indigo-400 flex items-center gap-1 hover:text-indigo-300 transition-colors">View All Plans <span>→</span></a>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          
          {/* Pricing Cards Row */}
          <div className="flex-[2] grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter */}
            <div className="bg-[#0b101d] border border-slate-800 rounded-2xl p-6 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-300">Starter</h3>
                <span className="text-[10px] bg-[#1e293b] px-2 py-1 rounded text-slate-300 font-semibold border border-slate-700">Free Forever</span>
              </div>
              <div className="text-4xl font-bold text-white mb-1">₹0</div>
              <p className="text-xs text-slate-500 mb-6 font-medium">Forever</p>
              
              <div className="bg-[#121929] rounded-lg p-3 text-center text-xs font-semibold text-slate-300 mb-6 border border-slate-800/50">
                5 Video Credits
              </div>
              
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-500 mb-3 uppercase tracking-wider">Basic Features</p>
                <ul className="space-y-3 text-[13px] text-slate-300 mb-8">
                  <li className="flex items-center gap-2.5"><span className="text-slate-500 text-[10px]">✓</span> Standard Rendering</li>
                  <li className="flex items-center gap-2.5"><span className="text-slate-500 text-[10px]">✓</span> Script Generator</li>
                </ul>
              </div>
              <button onClick={(e) => handleAction(e, 'signup')} className="w-full py-3 mt-auto bg-transparent border border-slate-700 hover:bg-slate-800 rounded-xl text-[13px] font-bold text-center text-white transition-colors block">Get Started Free</button>
            </div>

            {/* Pro - Highlighted */}
            <div className="bg-[#0b101d] border-2 border-indigo-500 rounded-2xl p-6 flex flex-col relative shadow-[0_0_30px_rgba(79,70,229,0.15)] transform md:-translate-y-4 bg-gradient-to-b from-[#0b101d] to-[#111827]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-[10px] font-bold px-4 py-1 rounded-full shadow-lg">Most Popular</div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-white">Pro</h3>
              </div>
              <div className="text-4xl font-bold text-white mb-1">₹10</div>
              <p className="text-xs text-slate-400 mb-6 font-medium">One-time</p>
              
              <div className="bg-[#121929] rounded-lg p-3 text-center text-xs font-semibold text-white mb-6 border border-indigo-500/20 shadow-[inset_0_0_20px_rgba(79,70,229,0.1)]">
                50 Video Credits
              </div>
              
              <div className="flex-1">
                <ul className="space-y-3 text-[13px] text-slate-200 mb-8">
                  <li className="flex items-center gap-2.5"><span className="text-indigo-400 text-[10px]">✓</span> Priority Rendering</li>
                  <li className="flex items-center gap-2.5"><span className="text-indigo-400 text-[10px]">✓</span> All Aspect Ratios</li>
                  <li className="flex items-center gap-2.5"><span className="text-indigo-400 text-[10px]">✓</span> Image Generator</li>
                  <li className="flex items-center gap-2.5"><span className="text-indigo-400 text-[10px]">✓</span> Voice Generator</li>
                  <li className="flex items-center gap-2.5"><span className="text-indigo-400 text-[10px]">✓</span> Email Support</li>
                </ul>
              </div>
              <button onClick={(e) => handleAction(e, 'signup')} className="w-full py-3 mt-auto bg-indigo-500 hover:bg-indigo-600 rounded-xl text-[13px] font-bold text-center text-white transition-colors block shadow-[0_4px_14px_rgba(79,70,229,0.4)]">Buy for ₹10</button>
            </div>

            {/* Enterprise */}
            <div className="bg-[#0b101d] border border-slate-800 rounded-2xl p-6 flex flex-col relative">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-300">Enterprise</h3>
                <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-1 rounded border border-purple-500/20 font-semibold">Best Value</span>
              </div>
              <div className="text-4xl font-bold text-white mb-1">₹499</div>
              <p className="text-xs text-slate-500 mb-6 font-medium">One-time</p>
              
              <div className="bg-[#121929] rounded-lg p-3 text-center text-xs font-semibold text-slate-300 mb-6 border border-slate-800/50">
                200 Video Credits
              </div>
              
              <div className="flex-1">
                <ul className="space-y-3 text-[13px] text-slate-300 mb-8">
                  <li className="flex items-center gap-2.5"><span className="text-slate-500 text-[10px]">✓</span> Ultra HD Output</li>
                  <li className="flex items-center gap-2.5"><span className="text-slate-500 text-[10px]">✓</span> Commercial Rights</li>
                  <li className="flex items-center gap-2.5"><span className="text-slate-500 text-[10px]">✓</span> All Pro Features</li>
                  <li className="flex items-center gap-2.5"><span className="text-slate-500 text-[10px]">✓</span> Reels Generator</li>
                  <li className="flex items-center gap-2.5"><span className="text-slate-500 text-[10px]">✓</span> Priority Support</li>
                </ul>
              </div>
              <button onClick={(e) => handleAction(e, 'signup')} className="w-full py-3 mt-auto bg-indigo-600 hover:bg-indigo-700 rounded-xl text-[13px] font-bold text-center text-white transition-colors block">Buy for ₹499</button>
            </div>
          </div>

          {/* Social Proof Panel */}
          <div className="flex-1 lg:max-w-[320px] flex flex-col">
             <div className="bg-[#0b101d] border border-slate-800 rounded-2xl p-8 h-full flex flex-col justify-center">
                <h3 className="font-bold text-white mb-5 text-xl leading-tight">Trusted by 10,000+<br/>Creators Worldwide</h3>
                <div className="flex -space-x-3 mb-8">
                  {[1,2,3,4,5].map(i => (
                    <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-10 h-10 rounded-full border-2 border-[#0b101d]" />
                  ))}
                  <div className="w-10 h-10 rounded-full border-2 border-[#0b101d] bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white z-10">10K+</div>
                </div>
                
                <div className="text-indigo-400 text-4xl leading-none font-serif mb-2">"</div>
                <p className="text-[13px] text-slate-300 mb-6 leading-relaxed flex-1">
                  VeoStudio has completely changed the way I create content. It's fast, easy and the results are mind-blowing!
                </p>
                <div className="flex items-center gap-3">
                  <img src="https://i.pravatar.cc/100?img=9" className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="text-xs font-bold text-white">Sarah J.</p>
                    <p className="text-[10px] text-slate-500">Content Creator</p>
                  </div>
                </div>
                <div className="flex gap-1 text-yellow-500 text-sm mt-3">★★★★★</div>
             </div>
          </div>
        </div>
      </section>

      {/* Trust Badges Row */}
      <section className="relative z-10 py-10 px-6 max-w-6xl mx-auto border-t border-slate-800/50 mt-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#111827] border border-slate-800 flex items-center justify-center text-amber-500 text-lg flex-shrink-0">🛡️</div>
            <div>
              <p className="text-[13px] font-bold text-white mb-0.5">Secure & Safe</p>
              <p className="text-[10px] text-slate-500 leading-tight">Your data is encrypted and fully protected.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#111827] border border-slate-800 flex items-center justify-center text-purple-400 text-lg flex-shrink-0">↻</div>
            <div>
              <p className="text-[13px] font-bold text-white mb-0.5">Cancel Anytime</p>
              <p className="text-[10px] text-slate-500 leading-tight">No lock-in. Cancel or upgrade anytime.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#111827] border border-slate-800 flex items-center justify-center text-blue-400 text-lg flex-shrink-0">⚡</div>
            <div>
              <p className="text-[13px] font-bold text-white mb-0.5">Instant Access</p>
              <p className="text-[10px] text-slate-500 leading-tight">Get started immediately after purchase.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#111827] border border-slate-800 flex items-center justify-center text-pink-400 text-lg flex-shrink-0">✓</div>
            <div>
              <p className="text-[13px] font-bold text-white mb-0.5">Satisfaction Guaranteed</p>
              <p className="text-[10px] text-slate-500 leading-tight">Not satisfied? Get a full refund within 7 days.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer Padding */}
      <div className="pb-10"></div>

    </div>
  );
}
