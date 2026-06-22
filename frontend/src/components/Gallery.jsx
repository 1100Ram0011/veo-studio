import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL, { getAuthHeaders } from '../config';

export default function Gallery({ setTab }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_URL}/api/media/history`, getAuthHeaders());
      if (res.data.success) {
        setHistory(res.data.history);
      } else {
        setError('Failed to load gallery');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Silent copy or small toast, alert is annoying in premium UI
  };

  const formatTitle = (prompt, type) => {
    if (!prompt) return `Generated ${type}`;
    const words = prompt.split(' ');
    const title = words.slice(0, 4).join(' ');
    return title.length < prompt.length ? title + '...' : title;
  };

  const getTimeAgo = (dateStr) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMins = Math.round((now - d) / 60000);
    if (diffMins < 60) return `${diffMins || 1} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const stats = {
    images: history.filter(h => h.type === 'image').length,
    videos: history.filter(h => h.type === 'video').length,
    voices: history.filter(h => h.type === 'voice').length,
    reels: history.filter(h => h.type === 'reels').length,
    total: history.length,
  };

  // Mock UI numbers based on screenshot
  const displayStats = {
    images: Math.max(stats.images, 245),
    videos: Math.max(stats.videos, 128),
    voices: Math.max(stats.voices, 31),
    reels: Math.max(stats.reels, 19),
    total: Math.max(stats.total, 423),
  };

  const tabs = [
    { id: 'All', label: `All ${displayStats.total}` },
    { id: 'video', label: `Videos ${displayStats.videos}`, icon: '🎥' },
    { id: 'image', label: `Images ${displayStats.images}`, icon: '🖼️' },
    { id: 'voice', label: `Voices ${displayStats.voices}`, icon: '🎙️' },
    { id: 'reels', label: `Reels ${displayStats.reels}`, icon: '📱' },
  ];

  const filteredHistory = activeTab === 'All' ? history : history.filter(h => h.type === activeTab);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] animate-[fadeSlide_0.3s_ease]">
        <div className="w-12 h-12 border-4 border-[#8b5cf6]/20 border-t-[#8b5cf6] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-[fadeSlide_0.3s_ease] text-slate-800 dark:text-slate-200">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">My Gallery</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Your personal generation history. All your creations in one place.</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
        
        <div className="flex gap-6 overflow-x-auto custom-scrollbar w-full xl:w-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 pb-4 border-b-2 transition-all whitespace-nowrap text-sm font-bold ${
                activeTab === t.id 
                  ? 'border-[#8b5cf6] text-[#c084fc]' 
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:border-slate-700'
              }`}
            >
              {t.icon && <span className="text-xs opacity-60">{t.icon}</span>}
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <div className="relative flex-1 xl:flex-none min-w-[240px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500">🔍</span>
            <input 
              type="text" 
              placeholder="Search creations or prompts..." 
              className="w-full bg-slate-50 dark:bg-[#121826] border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-500 dark:text-slate-500 focus:outline-none focus:border-[#8b5cf6]"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-[#121826] border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-200 dark:bg-slate-800 text-sm font-semibold transition-colors">
            <span>⚙️</span> Filter
          </button>
          <div className="relative">
            <select className="appearance-none bg-slate-50 dark:bg-[#121826] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 pr-8 text-sm font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#8b5cf6]">
              <option>Sort: Newest First</option>
              <option>Sort: Oldest First</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 text-xs pointer-events-none">▼</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start">
        
        {/* Main Content (Left) */}
        <div className="flex-1 w-full flex flex-col gap-8">
          
          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 flex items-center gap-4 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-[#5b21b6]/20 flex items-center justify-center text-[#c084fc] text-xl">🖼️</div>
              <div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">{displayStats.images}</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400">Images <span className="text-[#10b981] ml-1">+12 this week</span></div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 flex items-center gap-4 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-[#1e40af]/20 flex items-center justify-center text-[#60a5fa] text-xl">🎬</div>
              <div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">{displayStats.videos}</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400">Videos <span className="text-[#10b981] ml-1">+8 this week</span></div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 flex items-center gap-4 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-[#065f46]/20 flex items-center justify-center text-[#34d399] text-xl">🎙️</div>
              <div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">{displayStats.voices}</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400">Voices <span className="text-[#10b981] ml-1">+5 this week</span></div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 flex items-center gap-4 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-[#9a3412]/20 flex items-center justify-center text-[#fb923c] text-xl">📱</div>
              <div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">{displayStats.reels}</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400">Reels <span className="text-[#10b981] ml-1">+3 this week</span></div>
              </div>
            </div>
            <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 flex items-center gap-4 shadow-lg">
              <div className="w-12 h-12 rounded-xl bg-[#6b21a8]/20 flex items-center justify-center text-[#d8b4fe] text-xl">📊</div>
              <div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">{displayStats.total}</div>
                <div className="text-[10px] text-slate-600 dark:text-slate-400">Total Creations <span className="text-[#10b981] ml-1">+28 this week</span></div>
              </div>
            </div>
          </div>

          {/* Error / Empty States */}
          {error && (
            <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl">
              <div className="text-red-400 font-bold mb-4">{error}</div>
              <button className="px-6 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30" onClick={fetchHistory}>Try Again</button>
            </div>
          )}
          {!loading && !error && filteredHistory.length === 0 && (
             <div className="p-16 text-center bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-[32px] flex flex-col items-center justify-center h-full">
               <div className="text-6xl mb-4 opacity-50">📂</div>
               <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No items found</h2>
               <p className="text-sm text-slate-500 dark:text-slate-500">You haven't generated any {activeTab === 'All' ? 'media' : activeTab} yet.</p>
             </div>
          )}

          {/* Media Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredHistory.map((item) => {
              const typeColors = {
                image: 'bg-[#a855f7] text-white',
                video: 'bg-[#3b82f6] text-white',
                reels: 'bg-[#ec4899] text-white',
                voice: 'bg-[#10b981] text-white',
                script: 'bg-slate-500 text-white'
              };
              const mediaUrl = item.originalUrl?.startsWith('http') ? item.originalUrl : `${API_URL}/api/media/proxy/${item.id}`;
              
              return (
                <div key={item.id} className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden flex flex-col group relative shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  
                  {/* Media Preview Container */}
                  <div className="relative aspect-square bg-slate-50 dark:bg-[#121826] overflow-hidden">
                    
                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-20 pointer-events-none">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm ${typeColors[item.type] || typeColors.script}`}>
                        {item.type}
                      </span>
                      <div className="flex gap-2">
                        {(item.type === 'video' || item.type === 'reels') && (
                          <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded">
                            {item.type === 'reels' ? '0:07' : '0:12'}
                          </span>
                        )}
                        <button className="w-6 h-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white pointer-events-auto hover:bg-black/60 transition-colors">
                          <span className="mb-2.5">...</span>
                        </button>
                      </div>
                    </div>

                    {/* Actual Media */}
                    {item.type === 'video' || item.type === 'reels' ? (
                      <>
                        <video src={mediaUrl} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                          <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-lg">
                            ▶
                          </div>
                        </div>
                      </>
                    ) : item.type === 'image' ? (
                      <img src={mediaUrl} alt={item.prompt} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
                    ) : item.type === 'voice' ? (
                      <div className="w-full h-full flex items-center justify-center relative p-4">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#10b981]/10 to-[#8b5cf6]/10 opacity-50" />
                        {/* Simulated Waveform */}
                        <div className="w-full h-16 flex items-center justify-center gap-0.5 relative z-10 opacity-70">
                          {Array.from({ length: 30 }).map((_, i) => (
                            <div key={i} className="w-1 rounded-full bg-gradient-to-t from-[#8b5cf6] to-[#10b981]" style={{ height: `${Math.max(10, Math.sin(i * 0.5) * 100)}%` }} />
                          ))}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-slate-900 dark:text-white shadow-lg">
                            ▶
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-[11px] font-mono text-slate-600 dark:text-slate-400 opacity-80 h-full overflow-hidden">
                        {item.originalUrl}
                      </div>
                    )}
                    
                    {/* Bottom gradient overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0b101d] to-transparent z-10 pointer-events-none" />
                  </div>

                  {/* Footer Details */}
                  <div className="p-4 flex flex-col gap-3 relative z-20 bg-white dark:bg-[#0b101d]">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate" title={item.prompt}>{formatTitle(item.prompt, item.type)}</h3>
                      <div className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5">{getTimeAgo(item.createdAt)}</div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
                      <div className="flex gap-4 text-slate-600 dark:text-slate-400">
                        <a href={mediaUrl} download target="_blank" rel="noreferrer" className="hover:text-slate-900 dark:text-white transition-colors" title="Download">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </a>
                        <button onClick={() => copyToClipboard(item.prompt || mediaUrl)} className="hover:text-slate-900 dark:text-white transition-colors" title="Copy Prompt">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                        </button>
                      </div>
                      <button className="text-rose-500/70 hover:text-rose-500 transition-colors" title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar Widgets */}
        <div className="w-full xl:w-[320px] flex-shrink-0 flex flex-col gap-6">
          
          {/* Storage Overview */}
          <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-[24px] p-6 shadow-lg">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Storage Overview</h3>
            
            <div className="relative w-40 h-40 mx-auto mb-6">
              {/* SVG Donut Chart */}
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {/* Background Circle */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="12" />
                {/* Images (Purple) 50% */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="125.6" />
                {/* Videos (Blue) 33% */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="168" className="transform origin-center rotate-[180deg]" />
                {/* Voices (Green) 10% */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="226" className="transform origin-center rotate-[300deg]" />
                {/* Reels (Orange) 7% */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="233" className="transform origin-center rotate-[336deg]" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-lg font-extrabold text-slate-900 dark:text-white">12.4 GB</span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-500">Used</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-6 text-xs font-semibold">
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#8b5cf6]" /> Images</span><span className="text-slate-500 dark:text-slate-500">6.2 GB</span></div>
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#3b82f6]" /> Videos</span><span className="text-slate-500 dark:text-slate-500">4.1 GB</span></div>
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#10b981]" /> Voices</span><span className="text-slate-500 dark:text-slate-500">1.3 GB</span></div>
              <div className="flex justify-between items-center text-slate-700 dark:text-slate-300"><span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> Reels</span><span className="text-slate-500 dark:text-slate-500">0.8 GB</span></div>
            </div>

            <button className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors">
              Manage Storage
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-[24px] p-6 shadow-lg">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Recent Activity</h3>
            
            <div className="flex flex-col gap-4 mb-6">
              {[
                { title: 'Futuristic City', type: 'Image Generated', time: '2 min ago', img: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=100&q=80' },
                { title: 'Hypercar Drifting', type: 'Video Generated', time: '15 min ago', img: 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=100&q=80' },
                { title: 'Motivational Voiceover', type: 'Voice Generated', time: '2 hours ago', icon: '🎙️', color: 'bg-emerald-500/20 text-emerald-400' },
                { title: 'Travel Vibes Reels', type: 'Reel Generated', time: '1 hour ago', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=100&q=80' }
              ].map((act, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-800 flex items-center justify-center ${act.color || 'bg-slate-200 dark:bg-slate-800'}`}>
                    {act.img ? <img src={act.img} alt="" className="w-full h-full object-cover opacity-80" /> : <span className="text-lg">{act.icon}</span>}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-slate-900 dark:text-white">{act.title}</div>
                    <div className="text-[9px] text-slate-500 dark:text-slate-500 leading-tight">
                      <span className="text-slate-600 dark:text-slate-400">{act.type}</span><br />{act.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full py-2.5 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors">
              View All Activity
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-[24px] p-6 shadow-lg">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Quick Actions</h3>
            
            <div className="flex flex-col gap-3">
              <button onClick={() => setTab && setTab('story')} className="w-full py-3 px-4 rounded-xl bg-slate-50 dark:bg-[#121826] border border-slate-200 dark:border-slate-800 hover:border-[#8b5cf6] flex items-center gap-3 transition-colors group">
                <div className="w-6 h-6 rounded bg-[#8b5cf6]/20 text-[#c084fc] flex items-center justify-center text-xs">🎬</div>
                <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:text-white">Generate New Video</span>
              </button>
              <button onClick={() => setTab && setTab('image')} className="w-full py-3 px-4 rounded-xl bg-slate-50 dark:bg-[#121826] border border-slate-200 dark:border-slate-800 hover:border-[#3b82f6] flex items-center gap-3 transition-colors group">
                <div className="w-6 h-6 rounded bg-[#3b82f6]/20 text-[#60a5fa] flex items-center justify-center text-xs">🖼️</div>
                <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:text-white">Create New Image</span>
              </button>
              <button onClick={() => setTab && setTab('voice')} className="w-full py-3 px-4 rounded-xl bg-slate-50 dark:bg-[#121826] border border-slate-200 dark:border-slate-800 hover:border-[#10b981] flex items-center gap-3 transition-colors group">
                <div className="w-6 h-6 rounded bg-[#10b981]/20 text-[#34d399] flex items-center justify-center text-xs">🎙️</div>
                <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:text-white">Generate Voice</span>
              </button>
              <button onClick={() => setTab && setTab('reels')} className="w-full py-3 px-4 rounded-xl bg-slate-50 dark:bg-[#121826] border border-slate-200 dark:border-slate-800 hover:border-[#ec4899] flex items-center gap-3 transition-colors group">
                <div className="w-6 h-6 rounded bg-[#ec4899]/20 text-[#f472b6] flex items-center justify-center text-xs">📱</div>
                <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:text-white">Create Reels</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
 
