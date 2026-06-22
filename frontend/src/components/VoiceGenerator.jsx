import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import API_URL, { getAuthHeaders } from '../config'

const VOICES = [
  { id: 'Adam', name: 'Adam', desc: 'Deep & Narrative', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80', tags: ['Warm', 'Deep', 'Storytelling'], badge: 'Popular' },
  { id: 'Rachel', name: 'Rachel', desc: 'Premium Energetic', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80', tags: ['Clear', 'Lively', 'Upbeat'], badge: 'Trending' },
  { id: 'Josh', name: 'Josh', desc: 'Professional', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80', tags: ['Corporate', 'Confident', 'Calm'] },
  { id: 'Bella', name: 'Bella', desc: 'Soft & Calm', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80', tags: ['Gentle', 'Soothing', 'ASMR'] },
  { id: 'Liam', name: 'Liam', desc: 'Irish Accent', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80', tags: ['Friendly', 'Folksy', 'Irish'] },
  { id: 'Sophia', name: 'Sophia', desc: 'South African Accent', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&q=80', tags: ['Smooth', 'Articulate', 'African'] },
  { id: 'Noah', name: 'Noah', desc: 'Kiwi Accent', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80', tags: ['Relaxed', 'Friendly', 'NZ'] },
]

const SPEEDS = ['0.75x', '1x', '1.25x', '1.5x']
const EMOTIONS = [
  { label: 'Happy', emoji: '😊' },
  { label: 'Calm', emoji: '😌' },
  { label: 'Motivational', emoji: '🔥' },
  { label: 'Sad', emoji: '😔' },
]

export default function VoiceGenerator({ credits, setCredits }) {
  const [text, setText] = useState('')
  const [model, setModel] = useState('Adam')
  const [speed, setSpeed] = useState('1x')
  const [emotion, setEmotion] = useState('Calm')
  const [language, setLanguage] = useState('English (US)')
  
  // Advanced Toggles
  const [addPause, setAddPause] = useState(true)
  const [emphasis, setEmphasis] = useState(true)
  const [pronunciation, setPronunciation] = useState(true)

  // Filter state
  const [filter, setFilter] = useState('All Voices')

  // Generation state
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [audioUrl, setAudioUrl] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackProgress, setPlaybackProgress] = useState(0)
  const audioRef = useRef(null)

  const cost = 1
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const speedMultiplier = parseFloat(speed) || 1
  const estDurationStr = `00:${Math.min(59, Math.round((wordCount / 150) * 60 / speedMultiplier)).toString().padStart(2, '0')}`

  const synthesize = async () => {
    if (!text.trim() || credits < cost || loading) return
    setLoading(true)
    setAudioUrl(null)
    setErrorMsg('')

    try {
      // Simulate progress
      let p = 0;
      const progressInterval = setInterval(() => {
        p = Math.min(p + 5, 90);
        setProgress(p);
      }, 200);

      const res = await axios.post(`${API_URL}/api/voice/generate`, {
        text: text.trim(),
        voiceModel: model,
        speed: speedMultiplier,
      }, getAuthHeaders())
      
      clearInterval(progressInterval);
      setProgress(100);

      if (res.data.success) {
        setAudioUrl(res.data.audio_url)
        setCredits(c => c - cost)
      } else {
        setErrorMsg('Voice generation failed. Please try again.')
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (!audioRef.current) return
    const current = audioRef.current.currentTime
    const duration = audioRef.current.duration || 1
    setPlaybackProgress((current / duration) * 100)
  }

  const handleAudioEnd = () => {
    setIsPlaying(false)
    setPlaybackProgress(0)
  }

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.load()
      setPlaybackProgress(0)
      setIsPlaying(false)
    }
  }, [audioUrl])

  const selectedVoiceInfo = VOICES.find(v => v.id === model)
  const canGenerate = text.trim() && credits >= cost && !loading

  return (
    <div className="w-full max-w-[1400px] mx-auto animate-[fadeSlide_0.3s_ease] pb-10 text-slate-800 dark:text-slate-200">
      
      {/* Header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3 mb-2">
            <span className="text-[#10b981] text-4xl">🎙</span> Voice Generator
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Convert text into natural, human-like AI speech</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT/CENTER COLUMN: Core Controls */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Section 1: Script */}
          <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-[24px] p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#10b981] flex items-center justify-center text-slate-900 dark:text-white text-xs font-bold shadow-lg shadow-[#10b981]/30">1</div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Your Script</h2>
              </div>
              <button 
                onClick={() => setText('')}
                className="px-4 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
              >
                Clear
              </button>
            </div>
            
            <div className="relative">
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="In the heart of the neon city, where every light tells a story, dreams chase the stars and the future waits for no one. This is where legends are born."
                className="w-full bg-transparent border border-slate-200 dark:border-slate-800 rounded-[16px] p-5 min-h-[160px] text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-500 dark:text-slate-500 resize-y focus:outline-none focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] leading-relaxed"
                disabled={loading}
              />
            </div>
            
            <div className="flex justify-between items-center mt-4 px-1 text-[12px] font-mono text-slate-500 dark:text-slate-500">
              <span>{text.length} / 2000 characters</span>
              <span>Estimated duration: <span className="text-slate-700 dark:text-slate-300">~ {estDurationStr}</span></span>
            </div>
          </div>

          {/* Section 2: Select Voice */}
          <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-[24px] p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-6 h-6 rounded-full bg-[#10b981] flex items-center justify-center text-slate-900 dark:text-white text-xs font-bold shadow-lg shadow-[#10b981]/30">2</div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Select Voice</h2>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 custom-scrollbar">
              {['All Voices', '🔥 Trending', 'Narration', 'Characters', 'Commercial', 'News'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    filter === f ? 'bg-slate-700 text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 hover:bg-slate-200/50 dark:bg-slate-800/50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Voice Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {VOICES.map(v => {
                const isActive = model === v.id;
                return (
                  <div
                    key={v.id}
                    onClick={() => setModel(v.id)}
                    className={`relative p-4 rounded-2xl cursor-pointer transition-all ${
                      isActive 
                        ? 'bg-slate-50 dark:bg-[#121826] border border-[#10b981] shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                        : 'bg-slate-50 dark:bg-[#121826] border border-slate-200 dark:border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#10b981] rounded-full flex items-center justify-center shadow-lg border-[2px] border-[#0b101d]">
                        <span className="text-[10px] font-bold text-slate-900 dark:text-white">✓</span>
                      </div>
                    )}
                    {isActive && <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(16,185,129,0.15)_0%,transparent_60%)] pointer-events-none rounded-2xl" />}
                    
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-800 flex-shrink-0">
                        <img src={v.avatar} alt={v.name} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-bold ${isActive ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>{v.name}</span>
                          {v.badge && (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                              v.badge === 'Popular' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {v.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-2 truncate">{v.desc}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {v.tags.map(tag => (
                            <span key={tag} className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700/50">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button 
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                          isActive ? 'bg-[#5b21b6] text-white hover:bg-[#6d28d9]' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-700'
                        }`}
                        onClick={(e) => { e.stopPropagation(); /* Play preview logic here */ }}
                      >
                        ▶
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            <button className="w-full mt-6 py-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-slate-200/50 dark:bg-slate-800/50 hover:text-slate-800 dark:text-slate-200 transition-colors">
              <span className="text-lg">🎧</span> Explore all voices
            </button>
          </div>

          {/* Section 3: Advanced Settings */}
          <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-[24px] p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-6 rounded-full bg-[#10b981] flex items-center justify-center text-slate-900 dark:text-white text-xs font-bold shadow-lg shadow-[#10b981]/30">3</div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Advanced Settings</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Playback Speed */}
              <div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">Playback Speed</div>
                <div className="flex bg-slate-50 dark:bg-[#121826] rounded-xl p-1 w-max border border-slate-200 dark:border-slate-800">
                  {SPEEDS.map(s => (
                    <button 
                      key={s} 
                      onClick={() => setSpeed(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        speed === s ? 'bg-[#10b981] text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Emotion */}
              <div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">Emotion</div>
                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar w-max max-w-full">
                  {EMOTIONS.map(e => (
                    <button 
                      key={e.label} 
                      onClick={() => setEmotion(e.label)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border whitespace-nowrap ${
                        emotion === e.label ? 'border-[#10b981] bg-[#10b981]/10 text-white' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#121826] text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <span>{e.emoji}</span> {e.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-3">Language</div>
                <div className="relative">
                  <select 
                    value={language} onChange={(e) => setLanguage(e.target.value)}
                    className="w-full appearance-none bg-slate-50 dark:bg-[#121826] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#10b981]"
                  >
                    <option value="English (US)">🇺🇸 English (US)</option>
                    <option value="English (UK)">🇬🇧 English (UK)</option>
                    <option value="Hindi">🇮🇳 Hindi</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 dark:text-slate-500 text-xs">⌄</div>
                </div>
              </div>
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#121826] rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-slate-300 dark:border-slate-700 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="text-lg text-slate-600 dark:text-slate-400">⏱</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Add Pause</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-500">Add natural pauses</span>
                  </div>
                </div>
                <div className={`relative w-8 h-4 rounded-full transition-colors ${addPause ? 'bg-[#10b981]' : 'bg-slate-700'}`}>
                  <div className={`absolute top-[2px] w-3 h-3 rounded-full bg-white transition-transform ${addPause ? 'left-[18px]' : 'left-0.5'}`} />
                </div>
                <input type="checkbox" className="hidden" checked={addPause} onChange={(e) => setAddPause(e.target.checked)} />
              </label>

              <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#121826] rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-slate-300 dark:border-slate-700 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="text-lg text-slate-600 dark:text-slate-400">🎯</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Emphasis</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-500">Emphasize words</span>
                  </div>
                </div>
                <div className={`relative w-8 h-4 rounded-full transition-colors ${emphasis ? 'bg-[#10b981]' : 'bg-slate-700'}`}>
                  <div className={`absolute top-[2px] w-3 h-3 rounded-full bg-white transition-transform ${emphasis ? 'left-[18px]' : 'left-0.5'}`} />
                </div>
                <input type="checkbox" className="hidden" checked={emphasis} onChange={(e) => setEmphasis(e.target.checked)} />
              </label>

              <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-[#121826] rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-slate-300 dark:border-slate-700 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="text-lg text-slate-600 dark:text-slate-400">🗣</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Pronunciation</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-500">Improve delivery</span>
                  </div>
                </div>
                <div className={`relative w-8 h-4 rounded-full transition-colors ${pronunciation ? 'bg-[#10b981]' : 'bg-slate-700'}`}>
                  <div className={`absolute top-[2px] w-3 h-3 rounded-full bg-white transition-transform ${pronunciation ? 'left-[18px]' : 'left-0.5'}`} />
                </div>
                <input type="checkbox" className="hidden" checked={pronunciation} onChange={(e) => setPronunciation(e.target.checked)} />
              </label>
            </div>
          </div>

          {/* Generate Button Area */}
          {loading && (
            <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm mb-2 animate-[fadeIn_0.3s_ease]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-[#8b5cf6]">Synthesizing Voice...</span>
                <span className="text-xs font-mono font-bold text-[#8b5cf6]">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-[#050a12] rounded-full overflow-hidden border border-slate-200 dark:border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-[#6d28d9] to-[#c084fc] transition-all duration-300" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
            </div>
          )}
          <button
            onClick={synthesize}
            disabled={!canGenerate}
            className={`w-full py-5 rounded-[20px] flex justify-center items-center relative overflow-hidden group transition-all ${
              (!canGenerate) 
                ? 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-800' 
                : 'bg-gradient-to-r from-[#6d28d9] via-[#8b5cf6] to-[#6d28d9] text-white shadow-xl shadow-[#8b5cf6]/20 hover:shadow-[#8b5cf6]/40'
            }`}
          >
            {canGenerate && (
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] group-hover:animate-shimmer" />
            )}
            
            {loading ? (
               <span className="text-lg font-bold tracking-wide relative z-10 flex items-center gap-3">
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 Generating...
               </span>
            ) : (
              <>
                <span className="text-lg font-bold tracking-wide relative z-10 flex items-center gap-2">
                  <span className="text-xl">⚡</span> Generate Voice
                </span>
                <span className={`absolute right-6 text-[11px] font-bold px-3 py-1.5 rounded-full ${canGenerate ? 'bg-white/10 text-white/90' : 'bg-slate-200 dark:bg-slate-800 text-slate-600'}`}>
                  Cost: {cost} Credit
                </span>
              </>
            )}
          </button>

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 leading-relaxed">
              <span className="text-lg mt-0.5">⚠</span>
              <span>{errorMsg}</span>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Audio Player & Stats */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Audio Player Card */}
          <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-[24px] p-6 shadow-xl flex flex-col">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">Generated Audio</h3>

            {/* Waveform Visualization (Simulated for aesthetics) */}
            <div className="w-full h-24 flex items-center justify-center gap-1 mb-6 px-4">
              {Array.from({ length: 40 }).map((_, i) => {
                // Generate a static waveform shape
                const heightBase = Math.sin(i * 0.3) * Math.sin(i * 0.1) * 100;
                const height = Math.max(10, Math.abs(heightBase));
                const isActive = audioUrl && (i / 40) * 100 <= playbackProgress;
                
                return (
                  <div 
                    key={i} 
                    className={`w-1 rounded-full transition-colors duration-300 ${isActive ? 'bg-[#10b981]' : 'bg-[#10b981]/20'}`}
                    style={{ 
                      height: `${height}%`,
                      animation: (isPlaying && audioUrl) ? `wave 1.2s ease-in-out infinite ${(i * 0.05)}s` : 'none'
                    }} 
                  />
                )
              })}
            </div>

            {/* Voice Info */}
            <div className="flex items-center gap-3 mb-8 justify-center">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-300 dark:border-slate-700">
                <img src={selectedVoiceInfo?.avatar || VOICES[0].avatar} alt="Voice" className="w-full h-full object-cover" />
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {selectedVoiceInfo?.name || 'Adam'} <span className="text-slate-500 dark:text-slate-500 font-normal ml-1">– {selectedVoiceInfo?.desc || 'Deep & Narrative'}</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex flex-col items-center mb-8 w-full">
              <div className="flex items-center gap-8 mb-6">
                <button className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors" disabled={!audioUrl}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><text x="12" y="16" fontSize="8" textAnchor="middle" fill="currentColor" strokeWidth="0">10</text></svg>
                </button>
                <button 
                  onClick={togglePlay}
                  disabled={!audioUrl}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                    audioUrl ? 'bg-[#5b21b6] text-white hover:bg-[#6d28d9] shadow-[0_0_20px_rgba(91,33,182,0.4)] hover:scale-105' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  {isPlaying ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  )}
                </button>
                <button className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors" disabled={!audioUrl}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><text x="12" y="16" fontSize="8" textAnchor="middle" fill="currentColor" strokeWidth="0">10</text></svg>
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full flex items-center gap-3">
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-500">
                  {audioUrl && audioRef.current ? `00:${Math.floor(audioRef.current.currentTime || 0).toString().padStart(2, '0')}` : '00:00'}
                </span>
                <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 h-full bg-[#10b981] transition-all" style={{ width: `${audioUrl ? playbackProgress : 0}%` }} />
                </div>
                <span className="text-[10px] font-mono text-slate-500 dark:text-slate-500">
                  {audioUrl && audioRef.current && audioRef.current.duration ? `00:${Math.floor(audioRef.current.duration).toString().padStart(2, '0')}` : estDurationStr}
                </span>
              </div>
            </div>

            {/* Hidden Audio Element */}
            {audioUrl && (
              <audio 
                ref={audioRef} 
                src={audioUrl} 
                onTimeUpdate={handleTimeUpdate} 
                onEnded={handleAudioEnd} 
                className="hidden" 
              />
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <a 
                href={audioUrl || '#'}
                download={audioUrl ? "voiceover.mp3" : undefined}
                className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  audioUrl ? 'bg-[#5b21b6] text-white hover:bg-[#6d28d9]' : 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 cursor-not-allowed border border-slate-200 dark:border-slate-800'
                }`}
              >
                <span className="text-sm">MP3</span> Download MP3
              </a>
              <a 
                href={audioUrl || '#'}
                download={audioUrl ? "voiceover.wav" : undefined}
                className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  audioUrl ? 'bg-slate-50 dark:bg-[#121826] border border-slate-300 dark:border-slate-700 text-white hover:bg-slate-200 dark:bg-slate-800' : 'bg-transparent border border-slate-800/50 text-slate-600 cursor-not-allowed'
                }`}
              >
                <span className="text-sm">WAV</span> Download WAV
              </a>
              <button 
                disabled={!audioUrl}
                className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  audioUrl ? 'bg-transparent text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-200/50 dark:bg-slate-800/50' : 'bg-transparent text-slate-600 cursor-not-allowed'
                }`}
              >
                <span className="text-lg">🔗</span> Share Audio
              </button>
            </div>
          </div>

          {/* Cost Warning */}
          <div className="bg-slate-50 dark:bg-[#121826]/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3 text-slate-600 dark:text-slate-400 text-xs font-semibold justify-center">
             <span className="text-amber-500 text-sm">⚡</span> Each generation costs {cost} credit
          </div>

        </div>

      </div>
    </div>
  )
} 
