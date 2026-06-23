import { useState, useRef } from 'react'
import axios from 'axios'
import API_URL, { getAuthHeaders } from '../config'

const ASPECT_RATIOS = [
  { label: '9:16', value: 'VIDEO_ASPECT_RATIO_PORTRAIT', icon: '📱' },
  { label: '16:9', value: 'VIDEO_ASPECT_RATIO_LANDSCAPE', icon: '💻' },
  { label: '1:1', value: 'VIDEO_ASPECT_RATIO_SQUARE', icon: '⬜' },
]

const STYLES = [
  { label: 'Cinematic', icon: '🎬' },
  { label: 'Realistic', icon: '📷' },
  { label: 'Anime', icon: '✨' },
  { label: 'Cyberpunk', icon: '🌆' },
  { label: 'More', icon: '⚙️' },
]

const DURATIONS = ['5s', '10s', '15s']
const QUALITIES = ['Standard', 'HD', 'Ultra']

const QUICK_TEMPLATES = [
  { label: 'Tech News', prompt: 'A highly engaging tech news background, futuristic studio setting, holographic displays showing code and binary, cinematic lighting.', icon: '💻' },
  { label: 'Motivation', prompt: 'A cinematic slow-motion shot of a person reaching the peak of a mountain at sunrise, golden hour lighting, highly inspiring.', icon: '⛰️' },
  { label: 'Product Promo', prompt: 'A sleek, modern 3D render of a smart gadget floating in a studio environment with clean white lighting, hyper-realistic details.', icon: '📦' },
];

export default function Generate({ history, setHistory, credits, setCredits }) {
  const [prompt, setPrompt] = useState('')
  const [aspect, setAspect] = useState('VIDEO_ASPECT_RATIO_PORTRAIT')
  const [style, setStyle] = useState('Cinematic')
  const [duration, setDuration] = useState('10s')
  const [quality, setQuality] = useState('HD')
  
  const [status, setStatus] = useState('idle')
  const [videoUrl, setVideoUrl] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [progress, setProgress] = useState(0)
  const [log, setLog] = useState([])
  const pollRef = useRef(null)

  const recentVideos = history.filter(h => h.type === 'video').slice(0, 4)
  const estimatedCost = quality === 'Ultra' ? 10 : quality === 'HD' ? 7 : 5

  const addLog = (msg) => setLog(prev => [...prev.slice(-8), msg])

  const generateVideo = async () => {
    if (!prompt.trim() || credits < estimatedCost || status === 'generating' || status === 'polling') return
    setStatus('generating')
    setVideoUrl(null)
    setErrorMsg('')
    setProgress(10)
    setLog([])
    addLog('Submitting request to backend…')

    try {
      const modifiedPrompt = `${prompt.trim()}, ${style} style, ${quality} quality, ${duration}`
      
      const genRes = await axios.post(`${API_URL}/api/video/generate`, {
        prompt: modifiedPrompt,
        aspectRatio: aspect,
      }, getAuthHeaders())
      const sceneId = genRes.data.sceneId
      if (!sceneId) throw new Error('Scene ID not received')
      setProgress(25)
      addLog(`Scene ID received: ${sceneId}`)
      setStatus('polling')
      addLog('Video generation started (1-3 mins)…')

      let attempts = 0
      const maxAttempts = 80
      if (pollRef.current) clearInterval(pollRef.current)

      pollRef.current = setInterval(async () => {
        attempts++
        setProgress(Math.min(25 + attempts * 3.5, 95))
        addLog(`Polling server — attempt ${attempts}/${maxAttempts}`)
        try {
          const pollRes = await axios.post(`${API_URL}/api/video/result`, { sceneId }, getAuthHeaders())
          const url = pollRes.data.videoUrl
          if (url && (url.includes('.mp4') || url.startsWith('http'))) {
            if (!pollRef.current) return;
            clearInterval(pollRef.current)
            pollRef.current = null
            setVideoUrl(url)
            setProgress(100)
            setStatus('done')
            for(let i=0; i<estimatedCost; i++) setCredits(c => c - 1)
            addLog('Video is ready!')
            setHistory(prev => [{
              id: sceneId, prompt: prompt.trim(), status: 'completed',
              url, createdAt: new Date().toISOString(), aspect, type: 'video'
            }, ...prev])
          } else if (pollRes.data.failed) {
            if (!pollRef.current) return;
            clearInterval(pollRef.current)
            pollRef.current = null
            setStatus('error')
            setErrorMsg('AI Engine rejected the prompt or failed to generate. Please try a different prompt.')
            addLog('Provider returned a generation failure.')
          } else {
            addLog('AI is still rendering frames…')
          }
        } catch (e) {
          if (axios.isCancel(e)) addLog('Connection interrupted, retrying…')
          else addLog('Server processing, keeping channel open…')
        }
        if (attempts >= maxAttempts) {
          clearInterval(pollRef.current)
          setStatus('error')
          setErrorMsg('Request timed out. Video may still be generating — check History in a few minutes.')
          addLog('Max attempts reached.')
        }
      }, 90000)
    } catch (err) {
      setStatus('error')
      if (axios.isCancel(err)) setErrorMsg('Request was cancelled. Please try again with a new prompt.')
      else setErrorMsg(err.response?.data?.error || err.message)
      addLog('Error: ' + err.message)
    }
  }

  const reset = () => {
    clearInterval(pollRef.current)
    setStatus('idle')
    setVideoUrl(null)
    setErrorMsg('')
    setProgress(0)
    setLog([])
  }

  const isGenerating = status === 'generating' || status === 'polling'
  const canGenerate = prompt.trim() && credits >= estimatedCost && !isGenerating

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-24 md:pb-0 animate-[fadeSlide_0.3s_ease]">

      {/* Top Header - Hidden on Mobile to save space (since Mobile Header has VeoStudio) */}
      <div className="hidden md:flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            Master Video <span className="text-blue-500 dark:text-blue-400">✨</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-500">Describe your scene — AI will render it for you</p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 md:gap-6">
        
        {/* LEFT COLUMN (Mobile: Stacks Naturally) */}
        <div className="flex-[1.5] flex flex-col gap-4 md:gap-5 order-1">

          {/* Quick Templates Section */}
          <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-sm">
             <div className="flex justify-between items-center mb-3">
               <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                 Quick Templates <span className="text-blue-500">⚡</span>
               </h3>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {QUICK_TEMPLATES.map((t) => (
                  <button 
                    key={t.label} 
                    onClick={() => setPrompt(t.prompt)}
                    className="flex flex-col items-center justify-center p-3 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-all transform hover:scale-[1.02]"
                  >
                    <span className="text-2xl mb-1">{t.icon}</span>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{t.label}</span>
                  </button>
                ))}
             </div>
          </div>
          
          {/* Prompt Section */}
          <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                Prompt <span className="text-blue-500">✨</span>
              </h3>
              <button className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 font-medium">
                <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[8px]">?</span>
                How to create?
              </button>
            </div>
            
            <div className="relative bg-slate-50 dark:bg-transparent rounded-xl border border-slate-200 dark:border-slate-800 p-3 mb-3">
              <textarea
                className="w-full bg-transparent border-none text-sm text-slate-900 dark:text-slate-300 placeholder:text-slate-600 dark:text-slate-400 dark:placeholder:text-slate-600 resize-none focus:ring-0 p-0 min-h-[80px]"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="A cinematic shot of a futuristic city at golden hour, with flying vehicles weaving between neon-lit towers..."
                disabled={isGenerating}
                rows={4}
              />
              <div className="text-right text-[11px] text-slate-600 dark:text-slate-400 dark:text-slate-500 font-mono mt-1">
                {prompt.length} / 2000
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-[#121929] hover:bg-blue-100 dark:hover:bg-[#1a2333] border border-blue-100 dark:border-slate-800 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 transition-colors">
                <span className="text-blue-500">✨</span> Enhance Prompt
              </button>
              <button className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-[#121929] hover:bg-slate-100 dark:hover:bg-[#1a2333] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 transition-colors" onClick={() => setPrompt('')}>
                <span className="text-slate-600 dark:text-slate-400">🗑️</span> Clear
              </button>
            </div>
          </div>

          {/* Style Section */}
          <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Style <span className="text-slate-600 dark:text-slate-400 dark:text-slate-500 font-normal text-xs">(Optional)</span>
              </h3>
              <a href="#" className="text-xs text-blue-600 dark:text-blue-400 font-medium">View all</a>
            </div>
            <div className="flex overflow-x-auto gap-3 pb-2 custom-scrollbar snap-x">
              {STYLES.map(s => (
                <button
                  key={s.label}
                  onClick={() => setStyle(s.label)}
                  className={`flex-none w-20 flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all snap-start ${
                    style === s.label 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-[inset_0_0_12px_rgba(59,130,246,0.1)]' 
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0f18] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-300 hover:text-slate-900 dark:hover:text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <span className="text-xl mb-1">{s.icon}</span>
                  <span className="text-[10px] font-semibold tracking-wide whitespace-nowrap">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Mobile Preview Area (Inserted here on Mobile, hidden on Desktop) */}
          <div className="xl:hidden order-2 mt-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Preview <span className="text-slate-600 dark:text-slate-400 dark:text-slate-500 font-normal ml-1">(Example)</span></h3>
            <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800 rounded-2xl p-2 relative shadow-sm">
              {status === 'done' && videoUrl ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center">
                  <video controls className="w-full h-full object-contain">
                    <source src={videoUrl} type="video/mp4" />
                  </video>
                </div>
              ) : (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-[#121929] border border-slate-200 dark:border-slate-800/50">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-80 dark:opacity-60 mix-blend-luminosity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 dark:from-[#0b101d]/80 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xl pl-1 shadow-lg">▶</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Aspect Ratio & Duration - Side by Side Grid */}
          <div className="grid grid-cols-2 gap-4 order-3">
            {/* Aspect Ratio */}
            <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Aspect Ratio</h3>
              <div className="flex gap-2">
                {ASPECT_RATIOS.map(r => (
                  <button
                    key={r.label}
                    onClick={() => setAspect(r.value)}
                    className={`flex flex-col items-center justify-center flex-1 py-2 rounded-xl border transition-all ${
                      aspect === r.value 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0f18] text-slate-500 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-300'
                    }`}
                  >
                    <span className="text-base mb-1 leading-none">{r.icon}</span>
                    <span className="text-[10px] font-semibold">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Duration</h3>
              <div className="flex gap-2 h-[52px]">
                {DURATIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`flex items-center justify-center flex-1 rounded-xl border transition-all text-xs font-bold ${
                      duration === d 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0f18] text-slate-500 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-300'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quality & Estimated Cost - Side by Side Grid */}
          <div className="grid grid-cols-2 gap-4 order-4 mb-2">
            {/* Quality */}
            <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Quality</h3>
              <div className="flex gap-2 h-[52px]">
                {QUALITIES.slice(1).map(q => (
                  <button
                    key={q}
                    onClick={() => setQuality(q)}
                    className={`flex items-center justify-center flex-1 rounded-xl border transition-all text-xs font-bold ${
                      quality === q 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0f18] text-slate-500 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-300'
                    }`}
                  >
                    {q} {q === 'Ultra' && <span className="ml-1 text-blue-500">✨</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated Cost */}
            <div className="bg-slate-50 dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-sm flex flex-col justify-center items-center">
               <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2 text-center">Estimated Cost</h3>
               <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold text-base">
                 <span>⚡</span> {estimatedCost} Credits
               </div>
            </div>
          </div>

          {/* Generate Area */}
          <div className="order-5 mt-2 flex flex-col gap-3">
            {isGenerating && (
              <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm animate-[fadeIn_0.3s_ease]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Generating Video...</span>
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-[#050a12] rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 mb-2">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 text-center animate-pulse">
                  {log[log.length - 1] || 'Processing...'}
                </div>
              </div>
            )}
            {!isGenerating ? (
              <button
                className={`w-full py-4 rounded-2xl text-white font-bold text-[15px] shadow-[0_4px_15px_rgba(59,130,246,0.25)] transition-all flex justify-between items-center px-6 ${
                  canGenerate ? 'bg-blue-600 hover:bg-blue-700 dark:bg-gradient-to-r dark:from-blue-600 dark:to-indigo-500 hover:scale-[1.01]' : 'bg-slate-300 dark:bg-[#1a2333] text-slate-500 dark:text-slate-500 cursor-not-allowed shadow-none'
                }`}
                onClick={generateVideo}
                disabled={!canGenerate}
              >
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400 text-lg">⚡</span> Generate Video
                </div>
                <span className="text-slate-900 dark:text-white/80 text-sm font-medium">{estimatedCost} Credits</span>
              </button>
            ) : (
              <button 
                className="w-full py-3 rounded-2xl text-red-500 font-bold bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition-all flex justify-center items-center gap-2" 
                onClick={reset}
              >
                ✕ Cancel Generation
              </button>
            )}
          </div>
          
        </div>

        {/* RIGHT COLUMN: Desktop Preview & History (Hidden on Mobile) */}
        <div className="hidden xl:flex flex-1 flex-col gap-6 order-2">
          
          {/* Desktop Preview Panel */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Preview <span className="text-slate-600 dark:text-slate-400 dark:text-slate-500 font-normal ml-1">(Example)</span></h3>
              <button className="text-blue-600 dark:text-blue-400 text-xs font-semibold flex items-center gap-1"><span className="text-lg">↻</span> Refresh</button>
            </div>
            <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800 rounded-2xl p-2 relative group overflow-hidden shadow-sm">
              
              {status === 'done' && videoUrl ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center">
                  <video controls className="w-full h-full object-contain">
                    <source src={videoUrl} type="video/mp4" />
                  </video>
                </div>
              ) : (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-[#121929] border border-slate-200 dark:border-slate-800/50">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center opacity-80 dark:opacity-60 mix-blend-luminosity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 dark:from-[#0b101d]/80 via-transparent to-transparent" />
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-2xl pl-1 shadow-2xl cursor-pointer group-hover:scale-110 transition-all">
                      ▶
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recent Generations */}
          <div className="flex flex-col flex-1 mt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Generations</h3>
              <a href="#" className="text-xs font-semibold text-blue-600 dark:text-blue-400">View all</a>
            </div>
            
            <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex-1 overflow-y-auto max-h-[380px] custom-scrollbar space-y-3 shadow-sm">
              {recentVideos.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 dark:text-slate-400 dark:text-slate-500 text-sm py-10">
                  <div className="text-3xl mb-2 opacity-50">🎬</div>
                  No recent generations
                </div>
              ) : (
                recentVideos.map((vid, idx) => (
                  <div key={idx} className="flex gap-4 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#121929] border border-transparent hover:border-slate-200 dark:hover:border-slate-200 dark:border-slate-800 transition-colors cursor-pointer group">
                    <div className="w-24 h-16 rounded-lg bg-black border border-slate-200 dark:border-slate-800 overflow-hidden flex-shrink-0 relative">
                       <video src={vid.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                         <span className="text-slate-900 dark:text-white text-xs">▶</span>
                       </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-[13px] font-bold text-slate-900 dark:text-slate-200 truncate pr-2">{vid.prompt || 'Generated Video'}</h4>
                        <span className="text-[10px] text-slate-600 dark:text-slate-400 dark:text-slate-500 whitespace-nowrap">
                           {new Date(vid.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500 dark:text-slate-500">
                        <span className="flex items-center gap-1">📱 9:16</span>
                        <span className="flex items-center gap-1">⏱ 10s</span>
                        <span className="flex items-center gap-1 text-yellow-500">⚡ 7 Credits</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
 
