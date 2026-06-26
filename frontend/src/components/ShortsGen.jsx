import { useState, useRef } from 'react'
import axios from 'axios'
import API_URL, { getAuthHeaders } from '../config'

const STYLES = [
  { label: 'Cinematic', icon: '🎬' },
  { label: 'Realistic', icon: '📷' },
  { label: 'Anime', icon: '✨' },
  { label: 'Cyberpunk', icon: '🌆' },
  { label: 'Horror', icon: '👻' },
]

const DURATIONS = ['5s', '10s', '15s']
const QUALITIES = ['Standard', 'HD', 'Ultra']

const QUICK_TEMPLATES = [
  { label: 'Horror Fact', prompt: 'A creepy, dark abandoned asylum hallway with flickering lights and a shadowy figure at the end. High tension.', icon: '👻' },
  { label: 'Motivation', prompt: 'A luxurious lifestyle scene, golden hour, a sleek sports car driving on an ocean highway, highly inspiring.', icon: '💰' },
  { label: 'Space Facts', prompt: 'A hyper-realistic view of a massive black hole pulling in stars, cinematic lighting, deep space background.', icon: '🪐' },
  { label: 'Funny Fail', prompt: 'A goofy, colorful cartoon-style scene of a cat slipping on a banana peel, exaggerated expressions.', icon: '😂' },
];

export default function ShortsGenerator({ history, setHistory, credits, setCredits }) {
  const [prompt, setPrompt] = useState('')
  // Aspect ratio is strictly locked to Portrait for Shorts
  const aspect = 'VIDEO_ASPECT_RATIO_PORTRAIT'
  const [style, setStyle] = useState('Cinematic')
  const [duration, setDuration] = useState('10s')
  const [quality, setQuality] = useState('HD')
  
  const [status, setStatus] = useState('idle')
  const [videoUrl, setVideoUrl] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [progress, setProgress] = useState(0)
  const [log, setLog] = useState([])
  const pollRef = useRef(null)

  const recentVideos = history.filter(h => h.type === 'video' && h.aspect === 'VIDEO_ASPECT_RATIO_PORTRAIT').slice(0, 4)
  const estimatedCost = quality === 'Ultra' ? 10 : quality === 'HD' ? 7 : 5

  const addLog = (msg) => setLog(prev => [...prev.slice(-8), msg])

  const generateVideo = async () => {
    if (!prompt.trim() || credits < estimatedCost || status === 'generating' || status === 'polling') return
    setStatus('generating')
    setVideoUrl(null)
    setErrorMsg('')
    setProgress(10)
    setLog([])
    addLog('Preparing viral short prompt…')

    try {
      // Magically add viral keywords to make it look like a YouTube short
      const modifiedPrompt = `${prompt.trim()}, viral youtube shorts style, highly engaging, vertical format, fast paced, ${style} style, ${quality} quality, ${duration}`
      
      addLog('Submitting request to backend…')
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
      const maxAttempts = 3 // Only 3 attempts to save Scrape.do tokens
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
            addLog('Shorts Video is ready!')
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
            addLog('AI is rendering short frames…')
          }
        } catch (e) {
          if (axios.isCancel(e)) addLog('Connection interrupted, retrying…')
          else addLog('Server processing, keeping channel open…')
        }
        if (attempts >= maxAttempts) {
          clearInterval(pollRef.current)
          setStatus('error')
          setErrorMsg('Request timed out. Video may still be generating — check History in a few minutes.')
          addLog('Max attempts reached (3/3).')
        }
      }, 60000)
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

      {/* Top Header */}
      <div className="hidden md:flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-1 flex items-center gap-2">
            Viral Shorts <span className="text-red-500">🔥</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-500">Generate highly engaging 9:16 portrait videos optimized for YouTube Shorts.</p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 md:gap-6">
        
        {/* LEFT COLUMN */}
        <div className="flex-[1.5] flex flex-col gap-4 md:gap-5 order-1">

          {/* Quick Viral Templates Section */}
          <div className="bg-white dark:bg-[#0b101d] border border-red-100 dark:border-red-900/30 rounded-2xl p-4 md:p-5 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[50px] pointer-events-none" />
             <div className="flex justify-between items-center mb-3">
               <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                 Viral Niches <span className="text-red-500">🔥</span>
               </h3>
             </div>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
                {QUICK_TEMPLATES.map((t) => (
                  <button 
                    key={t.label} 
                    onClick={() => setPrompt(t.prompt)}
                    className="flex flex-col items-center justify-center p-3 border border-red-50 dark:border-red-500/10 bg-red-50/30 dark:bg-red-500/5 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-xl transition-all transform hover:scale-[1.02]"
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
                Shorts Prompt <span className="text-blue-500">✨</span>
              </h3>
            </div>
            
            <div className="relative bg-slate-50 dark:bg-transparent rounded-xl border border-slate-200 dark:border-slate-800 p-3 mb-3">
              <textarea
                className="w-full bg-transparent border-none text-sm text-slate-900 dark:text-slate-300 placeholder:text-slate-600 dark:text-slate-400 dark:placeholder:text-slate-600 resize-none focus:ring-0 p-0 min-h-[80px]"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="A scary abandoned hospital hallway, flickering lights..."
                disabled={isGenerating}
                rows={4}
              />
              <div className="text-right text-[11px] text-slate-600 dark:text-slate-400 font-mono mt-1">
                {prompt.length} / 2000
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="flex-1 flex justify-center items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-[#121929] hover:bg-slate-100 dark:hover:bg-[#1a2333] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 transition-colors" onClick={() => setPrompt('')}>
                <span className="text-slate-600 dark:text-slate-400">🗑️</span> Clear
              </button>
            </div>
          </div>

          {/* Style Section */}
          <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Style <span className="text-slate-500 font-normal text-xs">(Optional)</span>
              </h3>
            </div>
            <div className="flex overflow-x-auto gap-3 pb-2 custom-scrollbar snap-x">
              {STYLES.map(s => (
                <button
                  key={s.label}
                  onClick={() => setStyle(s.label)}
                  className={`flex-none w-20 flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all snap-start ${
                    style === s.label 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-[inset_0_0_12px_rgba(59,130,246,0.1)]' 
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0f18] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl mb-1">{s.icon}</span>
                  <span className="text-[10px] font-semibold tracking-wide whitespace-nowrap">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Mobile Preview Area */}
          <div className="xl:hidden order-2 mt-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Preview</h3>
            <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800 rounded-2xl p-2 relative shadow-sm max-w-[300px] mx-auto">
              {status === 'done' && videoUrl ? (
                <div className="relative w-full aspect-[9/16] rounded-xl overflow-hidden bg-black flex items-center justify-center">
                  <video controls className="w-full h-full object-cover">
                    <source src={videoUrl} type="video/mp4" />
                  </video>
                </div>
              ) : (
                <div className="relative w-full aspect-[9/16] rounded-xl overflow-hidden bg-slate-100 dark:bg-[#121929] border border-slate-200 dark:border-slate-800/50">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-4xl opacity-20">📱</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Duration & Quality - Side by Side Grid */}
          <div className="grid grid-cols-2 gap-4 order-3 mb-2">
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
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0f18] text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

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
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0a0f18] text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Area */}
          <div className="order-5 mt-2 flex flex-col gap-3">
            {isGenerating && (
              <div className="bg-white dark:bg-[#0b101d] border border-red-200 dark:border-red-900/30 rounded-2xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-red-600 dark:text-red-400">Generating Viral Short...</span>
                  <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-[#050a12] rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 mb-2">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 transition-all duration-300" 
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
                className={`w-full py-4 rounded-2xl text-white font-bold text-[15px] shadow-lg transition-all flex justify-between items-center px-6 ${
                  canGenerate ? 'bg-gradient-to-r from-red-600 to-orange-500 hover:scale-[1.01]' : 'bg-slate-300 dark:bg-[#1a2333] text-slate-500 cursor-not-allowed shadow-none'
                }`}
                onClick={generateVideo}
                disabled={!canGenerate}
              >
                <div className="flex items-center gap-2">
                  <span className="text-white text-lg">🔥</span> Generate Viral Short
                </div>
                <span className="text-white/80 text-sm font-medium">{estimatedCost} Credits</span>
              </button>
            ) : (
              <button 
                className="w-full py-3 rounded-2xl text-slate-500 font-bold bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all flex justify-center items-center gap-2" 
                onClick={reset}
              >
                ✕ Cancel Generation
              </button>
            )}
          </div>
          
        </div>

        {/* RIGHT COLUMN: Desktop Preview */}
        <div className="hidden xl:flex flex-1 flex-col gap-6 order-2 items-center">
          
          <div className="w-[340px]">
            <div className="flex justify-between items-center mb-3 w-full">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Preview</h3>
            </div>
            <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800 rounded-[2rem] p-3 relative group shadow-2xl h-[600px] flex flex-col">
              
              {status === 'done' && videoUrl ? (
                <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden bg-black flex items-center justify-center">
                  <video controls className="w-full h-full object-cover">
                    <source src={videoUrl} type="video/mp4" />
                  </video>
                </div>
              ) : (
                <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden bg-slate-100 dark:bg-[#121929] border border-slate-200 dark:border-slate-800/50 flex flex-col items-center justify-center">
                   <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4 backdrop-blur-md border border-white/20">
                     <span className="text-4xl">📱</span>
                   </div>
                   <p className="text-slate-500 dark:text-slate-400 font-medium text-sm text-center px-6">
                     Your Viral 9:16 Short will appear here
                   </p>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
