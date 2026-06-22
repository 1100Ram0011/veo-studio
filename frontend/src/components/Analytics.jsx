import React from 'react';

export default function Analytics({ history }) {
  // Use mocked data from screenshot
  const stats = {
    total: '1,245',
    completed: '1,032',
    failed: '56',
    successRate: '82.9%',
  };

  const topPrompts = [
    { prompt: 'Futuristic city at sunset with flying cars', gens: '128', rate: '92.3%', img: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=100&q=80' },
    { prompt: 'Hypercar drifting in rain, cinematic', gens: '96', rate: '88.5%', img: 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=100&q=80' },
    { prompt: 'Motivational voiceover for success', gens: '84', rate: '90.2%', icon: '🎙️', color: 'bg-[#10b981]/20 text-[#34d399]' },
    { prompt: 'Cute puppy sitting on grass', gens: '72', rate: '89.7%', img: 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=100&q=80' },
    { prompt: 'Space exploration, astronaut on mars', gens: '65', rate: '85.2%', img: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=100&q=80' },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-[fadeSlide_0.3s_ease] text-slate-800 dark:text-slate-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">Analytics</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Track your performance and unlock insights</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-between gap-3 px-4 py-2 bg-slate-50 dark:bg-[#121826] border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold transition-colors text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-2"><span className="text-[#8b5cf6]">📅</span> May 20 – Jun 20, 2026</span>
            <span className="text-[10px]">▼</span>
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 dark:bg-[#121826] border border-slate-200 dark:border-slate-800 hover:border-[#8b5cf6] text-[#c084fc] rounded-xl text-xs font-bold transition-colors">
            <span>📥</span> Download Report
          </button>
        </div>
      </div>

      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total */}
        <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-[20px] p-5 flex items-start gap-4 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center text-[#c084fc] text-xl flex-shrink-0">🎬</div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Total Generations</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">{stats.total}</div>
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-500 flex items-center gap-1">
              <span className="text-[#10b981]">↑ 18.6%</span> from last 30 days
            </div>
          </div>
        </div>
        {/* Completed */}
        <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-[20px] p-5 flex items-start gap-4 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-[#10b981]/20 flex items-center justify-center text-[#34d399] text-xl flex-shrink-0">✓</div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Completed</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">{stats.completed}</div>
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-500 flex items-center gap-1">
              <span className="text-[#10b981]">↑ 21.4%</span> from last 30 days
            </div>
          </div>
        </div>
        {/* Failed */}
        <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-[20px] p-5 flex items-start gap-4 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-[#ec4899]/20 flex items-center justify-center text-[#f472b6] text-xl flex-shrink-0">✕</div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Failed</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">{stats.failed}</div>
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-500 flex items-center gap-1">
              <span className="text-[#ec4899]">↓ 8.3%</span> from last 30 days
            </div>
          </div>
        </div>
        {/* Success Rate */}
        <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-[20px] p-5 flex items-start gap-4 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-[#f59e0b]/20 flex items-center justify-center text-[#fbbf24] text-xl flex-shrink-0">📈</div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Success Rate</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">{stats.successRate}</div>
            <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-500 flex items-center gap-1">
              <span className="text-[#10b981]">↑ 12.7%</span> from last 30 days
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Big Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Generations Over Time (Purple) */}
        <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-[24px] p-6 shadow-lg flex flex-col h-[320px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Generations Over Time</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-[#121826] border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-200 dark:bg-slate-800 text-[11px] font-bold transition-colors">
              Daily <span className="text-[8px] text-slate-500 dark:text-slate-500">▼</span>
            </button>
          </div>
          <div className="flex-1 relative w-full mt-2">
            {/* SVG Chart Background Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {[200, 150, 100, 50, 0].map(val => (
                <div key={val} className="flex items-center w-full h-[1px]">
                  <span className="text-[10px] font-mono text-slate-600 w-8 text-right mr-3 -mt-2">{val}</span>
                  <div className="flex-1 h-px bg-slate-200/50 dark:bg-slate-800/50" />
                </div>
              ))}
            </div>
            
            {/* SVG Area Chart */}
            <div className="absolute inset-0 left-11 bottom-6 right-2 top-2">
              <svg viewBox="0 0 1000 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* The Path */}
                <path 
                  d="M0,150 Q50,110 100,100 T200,130 T300,100 T400,60 T500,110 T600,80 T700,90 T800,50 T900,100 T1000,40" 
                  fill="none" 
                  stroke="#a855f7" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                <path 
                  d="M0,200 L0,150 Q50,110 100,100 T200,130 T300,100 T400,60 T500,110 T600,80 T700,90 T800,50 T900,100 T1000,40 L1000,200 Z" 
                  fill="url(#purpleGrad)" 
                />
                {/* Tooltip dot */}
                <circle cx="800" cy="50" r="4" fill="#a855f7" className="animate-pulse" />
                <line x1="800" y1="50" x2="800" y2="200" stroke="#a855f7" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
              </svg>
              
              {/* Tooltip HTML overlay */}
              <div className="absolute top-[10%] left-[80%] -translate-x-1/2 -translate-y-full bg-slate-50 dark:bg-[#121826] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap mb-2 z-10">
                <div className="text-[10px] text-slate-600 dark:text-slate-400 mb-0.5">Jun 10, 2026</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">142 Generations</div>
              </div>
            </div>
            
            {/* X Axis labels */}
            <div className="absolute bottom-0 left-11 right-2 flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-500">
              <span>May 20</span>
              <span>May 27</span>
              <span>Jun 3</span>
              <span>Jun 10</span>
              <span>Jun 17</span>
              <span>Jun 20</span>
            </div>
          </div>
        </div>

        {/* Success Rate Over Time (Green) */}
        <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-[24px] p-6 shadow-lg flex flex-col h-[320px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Success Rate Over Time</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-[#121826] border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-200 dark:bg-slate-800 text-[11px] font-bold transition-colors">
              Daily <span className="text-[8px] text-slate-500 dark:text-slate-500">▼</span>
            </button>
          </div>
          <div className="flex-1 relative w-full mt-2">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {['100%', '75%', '50%', '25%', '0%'].map(val => (
                <div key={val} className="flex items-center w-full h-[1px]">
                  <span className="text-[10px] font-mono text-slate-600 w-8 text-right mr-3 -mt-2">{val}</span>
                  <div className="flex-1 h-px bg-slate-200/50 dark:bg-slate-800/50" />
                </div>
              ))}
            </div>
            
            <div className="absolute inset-0 left-11 bottom-6 right-2 top-2">
              <svg viewBox="0 0 1000 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path 
                  d="M0,80 Q100,50 200,60 T400,50 T500,80 T600,100 T700,60 T800,50 T900,40 T1000,50" 
                  fill="none" 
                  stroke="#34d399" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                <path 
                  d="M0,200 L0,80 Q100,50 200,60 T400,50 T500,80 T600,100 T700,60 T800,50 T900,40 T1000,50 L1000,200 Z" 
                  fill="url(#greenGrad)" 
                />
                <circle cx="700" cy="60" r="4" fill="#34d399" className="animate-pulse" />
                <line x1="700" y1="60" x2="700" y2="200" stroke="#34d399" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
              </svg>
              
              <div className="absolute top-[30%] left-[70%] -translate-x-1/2 -translate-y-full bg-slate-50 dark:bg-[#121826] border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap mb-2 z-10">
                <div className="text-[10px] text-slate-600 dark:text-slate-400 mb-0.5">Jun 10, 2026</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">85.4%</div>
              </div>
            </div>
            
            <div className="absolute bottom-0 left-11 right-2 flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-500">
              <span>May 20</span>
              <span>May 27</span>
              <span>Jun 3</span>
              <span>Jun 10</span>
              <span>Jun 17</span>
              <span>Jun 20</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Breakdown & Prompts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        {/* Generations by Type (Donut) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-[24px] p-6 shadow-lg h-[340px] flex flex-col">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Generations by Type</h3>
          
          <div className="flex flex-1 items-center gap-6">
            <div className="relative w-44 h-44 flex-shrink-0">
              {/* SVG Donut Chart Matching Screenshot */}
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 drop-shadow-xl">
                <circle cx="50" cy="50" r="35" fill="none" stroke="#1e293b" strokeWidth="20" />
                {/* Videos 34% #8b5cf6 */}
                <circle cx="50" cy="50" r="35" fill="none" stroke="#8b5cf6" strokeWidth="20" strokeDasharray="219.9" strokeDashoffset="145" />
                {/* Images 30% #3b82f6 */}
                <circle cx="50" cy="50" r="35" fill="none" stroke="#3b82f6" strokeWidth="20" strokeDasharray="219.9" strokeDashoffset="153.9" className="transform origin-center rotate-[122.4deg]" />
                {/* Voices 21% #10b981 */}
                <circle cx="50" cy="50" r="35" fill="none" stroke="#10b981" strokeWidth="20" strokeDasharray="219.9" strokeDashoffset="173.7" className="transform origin-center rotate-[230.4deg]" />
                {/* Reels 11% #f59e0b */}
                <circle cx="50" cy="50" r="35" fill="none" stroke="#f59e0b" strokeWidth="20" strokeDasharray="219.9" strokeDashoffset="195.7" className="transform origin-center rotate-[306deg]" />
                {/* Others 4% #64748b */}
                <circle cx="50" cy="50" r="35" fill="none" stroke="#64748b" strokeWidth="20" strokeDasharray="219.9" strokeDashoffset="211.1" className="transform origin-center rotate-[345.6deg]" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">1,245</span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-500">Total</span>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-3 text-xs font-semibold">
              <div className="flex justify-between items-center"><div className="flex items-center gap-2"><div className="w-5 h-5 rounded flex items-center justify-center bg-[#8b5cf6]/20 text-[#8b5cf6] text-[10px]">🎬</div><span className="text-slate-700 dark:text-slate-300">Videos</span></div><div className="flex gap-2 text-slate-900 dark:text-white">423 <span className="text-slate-500 dark:text-slate-500">(34%)</span></div></div>
              <div className="flex justify-between items-center"><div className="flex items-center gap-2"><div className="w-5 h-5 rounded flex items-center justify-center bg-[#3b82f6]/20 text-[#3b82f6] text-[10px]">🖼️</div><span className="text-slate-700 dark:text-slate-300">Images</span></div><div className="flex gap-2 text-slate-900 dark:text-white">378 <span className="text-slate-500 dark:text-slate-500">(30%)</span></div></div>
              <div className="flex justify-between items-center"><div className="flex items-center gap-2"><div className="w-5 h-5 rounded flex items-center justify-center bg-[#10b981]/20 text-[#10b981] text-[10px]">🎙️</div><span className="text-slate-700 dark:text-slate-300">Voices</span></div><div className="flex gap-2 text-slate-900 dark:text-white">256 <span className="text-slate-500 dark:text-slate-500">(21%)</span></div></div>
              <div className="flex justify-between items-center"><div className="flex items-center gap-2"><div className="w-5 h-5 rounded flex items-center justify-center bg-[#f59e0b]/20 text-[#f59e0b] text-[10px]">📱</div><span className="text-slate-700 dark:text-slate-300">Reels</span></div><div className="flex gap-2 text-slate-900 dark:text-white">132 <span className="text-slate-500 dark:text-slate-500">(11%)</span></div></div>
              <div className="flex justify-between items-center"><div className="flex items-center gap-2"><div className="w-5 h-5 rounded flex items-center justify-center bg-slate-700/50 text-slate-600 dark:text-slate-400 text-[10px]">⚙️</div><span className="text-slate-700 dark:text-slate-300">Others</span></div><div className="flex gap-2 text-slate-900 dark:text-white">56 <span className="text-slate-500 dark:text-slate-500">(4%)</span></div></div>
            </div>
          </div>
        </div>

        {/* Top Prompts */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-[24px] p-6 shadow-lg h-[340px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top Performing Prompts</h3>
            <button className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-slate-200 dark:bg-slate-800 transition-colors">View All</button>
          </div>
          
          <div className="w-full">
            <div className="grid grid-cols-12 text-[10px] font-bold text-slate-500 dark:text-slate-500 mb-3 px-2">
              <div className="col-span-8">Prompt</div>
              <div className="col-span-2 text-center">Generations</div>
              <div className="col-span-2 text-right">Success Rate</div>
            </div>
            
            <div className="flex flex-col gap-3">
              {topPrompts.map((p, i) => (
                <div key={i} className="grid grid-cols-12 items-center gap-4 hover:bg-slate-200/30 dark:bg-slate-800/30 p-2 rounded-xl transition-colors">
                  <div className="col-span-8 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center text-sm border border-slate-200 dark:border-slate-800 ${p.color || 'bg-slate-200 dark:bg-slate-800'}`}>
                      {p.img ? <img src={p.img} alt="" className="w-full h-full object-cover" /> : p.icon}
                    </div>
                    <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate" title={p.prompt}>{p.prompt}</div>
                  </div>
                  <div className="col-span-2 text-center text-[11px] font-mono font-bold text-slate-900 dark:text-white">{p.gens}</div>
                  <div className="col-span-2 text-right text-[11px] font-mono font-bold text-[#10b981]">{p.rate}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
      </div>

      {/* Row 4: Activity & Time Saved */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-6">
        
        {/* Recent Activity Overview */}
        <div className="lg:col-span-8 bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-[24px] p-6 shadow-lg">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2"><span>📅</span> Recent Activity Overview</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* Today */}
            <div className="flex flex-col gap-2">
              <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Today</div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">42</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-500">Generations</div>
                </div>
                <svg width="40" height="20" viewBox="0 0 40 20" className="overflow-visible">
                  <path d="M0,15 L10,5 L20,10 L30,2 L40,8" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            {/* This Week */}
            <div className="flex flex-col gap-2">
              <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">This Week</div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">245</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-500">Generations</div>
                </div>
                <svg width="40" height="20" viewBox="0 0 40 20" className="overflow-visible">
                  <path d="M0,10 L10,15 L20,5 L30,12 L40,2" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            {/* This Month */}
            <div className="flex flex-col gap-2">
              <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">This Month</div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">1,032</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-500">Generations</div>
                </div>
                <svg width="40" height="20" viewBox="0 0 40 20" className="overflow-visible">
                  <path d="M0,18 L10,8 L20,12 L30,4 L40,0" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
            {/* Last Month */}
            <div className="flex flex-col gap-2">
              <div className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Last Month</div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">856</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-500">Generations</div>
                </div>
                <svg width="40" height="20" viewBox="0 0 40 20" className="overflow-visible">
                  <path d="M0,12 L10,18 L20,10 L30,14 L40,6" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Time Saved */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-[24px] p-6 shadow-lg relative overflow-hidden flex items-center justify-between">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#8b5cf6]/20 blur-3xl rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />
          
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2"><span>🕒</span> Time Saved</h3>
            <div className="text-3xl font-extrabold text-[#c084fc] mb-1">24h 36m</div>
            <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Using VeoStudio AI</div>
          </div>
          
          <div className="w-20 h-20 rounded-full border-[6px] border-[#8b5cf6]/20 flex items-center justify-center relative z-10 mr-4">
            <div className="w-1.5 h-6 bg-[#a855f7] rounded-full absolute top-2.5 shadow-[0_0_10px_#a855f7]" />
            <div className="w-1.5 h-5 bg-[#c084fc] rounded-full absolute right-5 top-8 rotate-[120deg] shadow-[0_0_10px_#c084fc]" />
            <div className="absolute -top-2 -right-4 text-[#a855f7] text-sm animate-pulse">✦</div>
            <div className="absolute -bottom-1 -left-3 text-[#a855f7] text-xs animate-pulse" style={{animationDelay: '1s'}}>✦</div>
            <div className="absolute top-8 -right-8 text-[#a855f7] text-xs animate-pulse" style={{animationDelay: '0.5s'}}>✦</div>
          </div>
        </div>
      </div>

      <div className="text-center text-[10px] text-slate-500 dark:text-slate-500 font-medium pb-4">
        Analytics are updated in real-time. All times are in your local timezone.
      </div>

    </div>
  )
}
 
