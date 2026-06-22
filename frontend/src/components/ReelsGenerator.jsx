import { useState, useRef } from 'react'
import axios from 'axios'
import API_URL, { getAuthHeaders } from '../config'

const RANDOM_IDEAS = [
  'A premium hypercar drifting through Tokyo streets at midnight, neon reflections on wet asphalt, cinematic slow motion, ultra realistic.',
  'A breathtaking drone shot over a glowing cyberpunk city, flying cars, rain pouring down, 8k resolution.',
  'A peaceful morning coffee on a balcony overlooking the Swiss Alps, crisp air, warm sunlight, photorealistic.',
  'An epic space battle between two massive star cruisers, laser beams, explosions, cinematic sci-fi lighting.',
  'A cute golden retriever puppy running through a field of sunflowers, slow motion, golden hour lighting.',
]

const TEMPLATES = [
  { id: 't1', name: 'Hypercar', image: 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=400&q=80' },
  { id: 't2', name: 'Trending Song', image: 'https://images.unsplash.com/photo-1614680376593-902f74a1ce17?w=400&q=80' },
  { id: 't3', name: 'Travel', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&q=80' },
  { id: 't4', name: 'Fitness', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=80' },
  { id: 't5', name: 'Business', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80' },
]

const POPULAR_REELS = [
  { title: 'Neon City Drive', views: '12.4K reels', image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=100&q=80' },
  { title: 'Ocean Waves', views: '8.7K reels', image: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=100&q=80' },
  { title: 'Night Aesthetic', views: '7.1K reels', image: 'https://images.unsplash.com/photo-1513689405622-c4e2fc1048b1?w=100&q=80' },
  { title: 'Luxury Lifestyle', views: '5.9K reels', image: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=100&q=80' },
]

const VISUAL_STYLES = ['Cinematic', 'Anime', 'Photorealistic', 'Cyberpunk', 'Watercolor']

export default function ReelsGenerator({ history, setHistory, credits, setCredits }) {
  const [prompt, setPrompt] = useState(RANDOM_IDEAS[0])
  
  // Settings
  const [duration, setDuration] = useState('10s')
  const [quality, setQuality] = useState('HD')
  const [visualStyle, setVisualStyle] = useState('Cinematic')
  const [selectedTemplate, setSelectedTemplate] = useState('t1')

  // Toggles
  const [addMusic, setAddMusic] = useState(true)
  const [addTextOverlay, setAddTextOverlay] = useState(false)
  const [autoCaptions, setAutoCaptions] = useState(true)

  // Generation state
  const [status, setStatus] = useState('idle')
  const [videoUrl, setVideoUrl] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [progress, setProgress] = useState(0)
  const [log, setLog] = useState([])
  const pollRef = useRef(null)

  const cost = 3 // matching new screenshot estimated cost

  const addLog = (msg) => setLog(prev => [...prev.slice(-4), msg])

  const handleRandomIdea = () => {
    const random = RANDOM_IDEAS[Math.floor(Math.random() * RANDOM_IDEAS.length)]
    setPrompt(random)
  }

  const generateReel = async () => {
    if (!prompt.trim() || credits < cost || status === 'generating' || status === 'polling') return
    setStatus('generating')
    setVideoUrl(null)
    setErrorMsg('')
    setProgress(15)
    setLog([])
    addLog('Starting generation process...')

    try {
      const modifiedPrompt = `${prompt.trim()}. Style: ${visualStyle}. Duration: ${duration}. Quality: ${quality}.`
      
      const genRes = await axios.post(`${API_URL}/api/reels/generate`, { prompt: modifiedPrompt }, getAuthHeaders())
      const sceneId = genRes.data.sceneId
      if (!sceneId) throw new Error('Scene ID not received')

      setProgress(30)
      setStatus('polling')
      addLog('AI Engine processing request...')

      let attempts = 0
      const maxAttempts = 80
      if (pollRef.current) clearInterval(pollRef.current)

      pollRef.current = setInterval(async () => {
        attempts++
        setProgress(Math.min(30 + attempts * 3.5, 95))
        if (attempts % 3 === 0) addLog(`Rendering frames (${attempts}/${maxAttempts})...`)

        try {
          const pollRes = await axios.post(`${API_URL}/api/reels/result`, { sceneId }, getAuthHeaders())
          if (pollRes.data.ready && pollRes.data.videoUrl) {
            if (!pollRef.current) return;
            clearInterval(pollRef.current)
            pollRef.current = null
            setVideoUrl(pollRes.data.videoUrl)
            setProgress(100)
            setStatus('done')
            setCredits(c => c - cost)
            addLog('Reel successfully generated!')
            setHistory(prev => [{
              id: sceneId, prompt: prompt.trim(), status: 'completed',
              url: pollRes.data.videoUrl, createdAt: new Date().toISOString(),
              aspect: 'VIDEO_ASPECT_RATIO_PORTRAIT', type: 'reels'
            }, ...prev])
          } else if (pollRes.data.failed) {
            if (!pollRef.current) return;
            clearInterval(pollRef.current)
            pollRef.current = null
            setStatus('error')
            setErrorMsg('AI Engine rejected the prompt or failed to generate. Please try a different prompt.')
            addLog('Generation failed.')
          }
        } catch {
          // silent ignore
        }

        if (attempts >= maxAttempts) {
          clearInterval(pollRef.current)
          setStatus('error')
          setErrorMsg('Timed out. Check History tab in a few minutes.')
        }
      }, 9000)

    } catch (err) {
      setStatus('error')
      setErrorMsg(err.response?.data?.error || err.message)
      addLog('Error: ' + err.message)
    }
  }

  const isGenerating = status === 'generating' || status === 'polling'
  const canGenerate = prompt.trim() && credits >= cost && !isGenerating

  return (
    <div className="w-full max-w-[1400px] mx-auto animate-[fadeSlide_0.3s_ease] pb-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent leading-tight mb-2">
          Reels Generator
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Create viral 9:16 short-form videos for Instagram & TikTok</p>
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[10px] font-bold tracking-widest uppercase">
          <span className="text-rose-500">🔒</span> PORTRAIT 9:16 • LOCKED FORMAT
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        
        {/* LEFT COLUMN: Phone Mockup Preview */}
        <div className="lg:col-span-4 xl:col-span-3 sticky top-6">
          <div className="w-full max-w-[320px] mx-auto aspect-[9/19.5] bg-black rounded-[40px] p-2 shadow-2xl relative border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
            
            {/* Phone Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[30px] bg-black rounded-b-3xl z-20 flex justify-center items-center pb-1">
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800 ml-2" />
            </div>

            {/* Content Area */}
            <div className="w-full h-full bg-slate-900 rounded-[32px] overflow-hidden relative border border-slate-200 dark:border-slate-800">
              
              {/* Header Overlay */}
              <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
                <span className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[10px] font-medium text-white border border-white/10">
                  Preview
                </span>
                <span className="text-slate-900 dark:text-white font-medium text-xs drop-shadow-md">9:16</span>
              </div>

              {/* Status Visuals */}
              {status === 'idle' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4 text-3xl">📱</div>
                  <div className="text-slate-900 dark:text-white font-bold mb-2">Ready to Create</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">Describe your reel and hit generate. Your masterpiece will appear here.</div>
                </div>
              )}

              {isGenerating && (
                <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-6">
                  <div className="relative w-20 h-20 mb-6">
                    <svg className="animate-spin w-full h-full text-indigo-500" viewBox="0 0 24 24">
                      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-slate-900 dark:text-white font-bold text-xs">
                      {Math.round(progress)}%
                    </div>
                  </div>
                  <div className="text-slate-900 dark:text-white font-bold mb-2">Generating Reel...</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 text-center space-y-1 h-12">
                    {log.slice(-1).map((l, i) => <div key={i} className="animate-pulse">{l}</div>)}
                  </div>
                </div>
              )}

              {status === 'done' && videoUrl && (
                <video src={videoUrl} controls autoPlay loop playsInline className="w-full h-full object-cover" />
              )}

              {status === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
                  <div className="text-4xl mb-4">❌</div>
                  <div className="text-slate-900 dark:text-white font-bold mb-2">Generation Failed</div>
                  <div className="text-xs text-red-400">{errorMsg}</div>
                </div>
              )}

              {/* Fake UI Overlay (only visible when done or idle to match screenshot) */}
              {(status === 'done' || status === 'idle') && (
                <div className="absolute bottom-0 left-0 right-0 p-4 pt-12 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold">V</div>
                        <span className="text-slate-900 dark:text-white font-bold text-xs drop-shadow-md">Your Reels</span>
                        <span className="w-3 h-3 rounded-full bg-blue-500 text-[8px] flex items-center justify-center text-white">✓</span>
                      </div>
                      <div className="text-slate-900 dark:text-white text-xs drop-shadow-md max-w-[200px] truncate">{prompt || 'Awesome video title'}</div>
                      <div className="text-slate-900 dark:text-white/80 text-[10px] drop-shadow-md flex items-center gap-1">
                        <span>🎵</span> Original audio
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-4 text-slate-900 dark:text-white">
                      <div className="flex flex-col items-center"><span className="text-xl">🤍</span><span className="text-[10px]">12.4K</span></div>
                      <div className="flex flex-col items-center"><span className="text-xl">💬</span><span className="text-[10px]">256</span></div>
                      <div className="flex flex-col items-center"><span className="text-xl">↗</span><span className="text-[10px]">1.2K</span></div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Core Controls */}
        <div className="lg:col-span-8 xl:col-span-6 flex flex-col gap-6">
          
          {/* Section 1: Describe */}
          <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-500/30">1</div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Describe Your Reel <span className="text-slate-600 dark:text-slate-400 text-xs font-normal">ⓘ</span>
              </h2>
            </div>
            
            <div className="relative mb-4">
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                className="w-full bg-white dark:bg-[#0a0f18] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 min-h-[140px] text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-600 dark:text-slate-400 dark:placeholder:text-slate-600 resize-y focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                disabled={isGenerating}
              />
              <div className="absolute bottom-4 right-4 text-[11px] text-slate-600 dark:text-slate-400">
                {prompt.length} / 2000
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors" disabled={isGenerating}>
                <span className="text-sm">✨</span> AI Enhance
              </button>
              <button 
                onClick={handleRandomIdea}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700" 
                disabled={isGenerating}
              >
                <span className="text-sm">🎲</span> Random Idea
              </button>
            </div>
          </div>

          {/* Section 2: Templates */}
          <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-500/30">2</div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Choose a Viral Template <span className="text-slate-600 dark:text-slate-400 font-normal">(Optional)</span></h2>
              </div>
              <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">View all</button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
              {TEMPLATES.map(t => (
                <button 
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className="flex flex-col items-center gap-2 min-w-[80px] flex-shrink-0 group"
                  disabled={isGenerating}
                >
                  <div className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${selectedTemplate === t.id ? 'border-indigo-500 p-0.5' : 'border-transparent p-0'}`}>
                    <div className="w-full h-full rounded-[14px] overflow-hidden relative">
                       <img src={t.image} alt={t.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                       {t.id === 't2' && ( // Add music icon for the trending song template
                         <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-2xl">🎵</div>
                       )}
                    </div>
                  </div>
                  <span className={`text-xs font-medium ${selectedTemplate === t.id ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-400'}`}>{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Settings */}
          <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-500/30">3</div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Settings</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Duration */}
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-500 mb-2 font-medium">Duration</div>
                <div className="flex gap-2 p-1 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-[#0a0f18] w-max">
                  {['5s', '10s', '15s', '30s'].map(d => (
                    <button 
                      key={d} 
                      onClick={() => setDuration(d)}
                      disabled={isGenerating}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${duration === d ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-800 dark:text-slate-200'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality */}
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-500 mb-2 font-medium">Quality</div>
                <div className="flex gap-2 p-1 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-[#0a0f18] w-max">
                  {['HD', 'Ultra'].map(q => (
                    <button 
                      key={q} 
                      onClick={() => setQuality(q)}
                      disabled={isGenerating}
                      className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${quality === q ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-slate-700' : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-800 dark:text-slate-200'}`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style */}
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-500 mb-2 font-medium">Style</div>
                <div className="relative">
                  <select 
                    value={visualStyle} onChange={e => setVisualStyle(e.target.value)} disabled={isGenerating}
                    className="w-full appearance-none bg-white dark:bg-[#0a0f18] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {VISUAL_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 dark:text-slate-400 text-xs">⌄</div>
                </div>
              </div>
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap gap-x-8 gap-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <span className="text-slate-600 dark:text-slate-400">🎵</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Add Music</span>
                <div className={`relative w-9 h-5 rounded-full transition-colors ml-2 ${addMusic ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform ${addMusic ? 'left-5' : 'left-1'}`} />
                </div>
                <input type="checkbox" className="hidden" checked={addMusic} onChange={(e) => setAddMusic(e.target.checked)} disabled={isGenerating} />
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer group">
                <span className="text-slate-600 dark:text-slate-400">T</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Add Text Overlay</span>
                <div className={`relative w-9 h-5 rounded-full transition-colors ml-2 ${addTextOverlay ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform ${addTextOverlay ? 'left-5' : 'left-1'}`} />
                </div>
                <input type="checkbox" className="hidden" checked={addTextOverlay} onChange={(e) => setAddTextOverlay(e.target.checked)} disabled={isGenerating} />
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <span className="text-slate-600 dark:text-slate-400">💬</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Auto Captions</span>
                <div className={`relative w-9 h-5 rounded-full transition-colors ml-2 ${autoCaptions ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform ${autoCaptions ? 'left-5' : 'left-1'}`} />
                </div>
                <input type="checkbox" className="hidden" checked={autoCaptions} onChange={(e) => setAutoCaptions(e.target.checked)} disabled={isGenerating} />
              </label>
            </div>
          </div>

          {/* Generate Button Area */}
          <div className="flex flex-col gap-2">
            {isGenerating && (
              <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm animate-[fadeIn_0.3s_ease]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Generating Reel...</span>
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-[#050a12] rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 mb-2">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 text-center animate-pulse">
                  {log[log.length - 1] || 'Processing...'}
                </div>
              </div>
            )}
            <button
              onClick={generateReel}
              disabled={!canGenerate}
              className={`w-full py-5 rounded-2xl flex items-center justify-center gap-4 transition-all relative overflow-hidden group ${
                (!canGenerate) 
                  ? 'bg-slate-100 dark:bg-[#0b101d] text-slate-600 dark:text-slate-400 dark:text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-800' 
                  : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 text-white shadow-xl shadow-indigo-500/20 hover:scale-[1.01]'
              }`}
            >
              {canGenerate && (
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] group-hover:animate-shimmer" />
              )}
              
              {status === 'error' ? (
                <span className="text-lg font-bold tracking-wide relative z-10 flex items-center gap-2"><span>↻</span> Try Again</span>
              ) : isGenerating ? (
                 <span className="text-lg font-bold tracking-wide relative z-10 flex items-center gap-3">
                   <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   Generating...
                 </span>
              ) : (
                <span className="text-lg font-bold tracking-wide relative z-10 flex items-center gap-2">
                  <span>⚡</span> Generate Reel
                </span>
              )}

              {!isGenerating && status !== 'error' && (
                <span className={`absolute right-6 text-sm font-medium ${canGenerate ? 'text-white/80' : 'text-slate-600 dark:text-slate-400 dark:text-slate-600'}`}>
                  Costs {cost} Credits
                </span>
              )}
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: Info & Stats */}
        <div className="hidden xl:flex flex-col gap-6 col-span-3">
          
          {/* Cost Card */}
          <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Estimated Cost</div>
            <div className="flex items-center gap-2 text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mb-4">
              <span>⚡</span> {cost} Credits
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              Total duration: {duration}
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="text-sm font-bold text-slate-900 dark:text-white mb-4">Reel Tips</div>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="text-indigo-400 text-sm">✧</span>
                <span className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed">Use cinematic keywords for better results</span>
              </li>
              <li className="flex gap-3">
                <span className="text-indigo-400 text-sm">✧</span>
                <span className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed">Add motion and lighting details</span>
              </li>
              <li className="flex gap-3">
                <span className="text-indigo-400 text-sm">✧</span>
                <span className="text-xs text-slate-500 dark:text-slate-500 leading-relaxed">Shorter reels (5-15s) perform better</span>
              </li>
            </ul>
          </div>

          {/* Popular Now Card */}
          <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="text-sm font-bold text-slate-900 dark:text-white mb-4">Popular Now</div>
            <div className="flex flex-col gap-4">
              {POPULAR_REELS.map((reel, i) => (
                <div key={i} className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-12 h-12 rounded-xl overflow-hidden relative">
                    <img src={reel.image} alt={reel.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white text-[10px]">▶</div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-500 transition-colors">{reel.title}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-500 mt-0.5">{reel.views}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
} 
