import { useState, useRef } from 'react'
import axios from 'axios'
import API_URL, { getAuthHeaders } from '../config'

const STYLES = [
  { label: 'Photorealistic', icon: '🖼️' },
  { label: 'Cinematic', icon: '🎬' },
  { label: 'Anime', icon: '👧' },
  { label: 'Oil Painting', icon: '🎨' },
  { label: 'Cyberpunk', icon: '🏙️' },
  { label: '3D Render', icon: '🧊' },
]

const RATIOS = [
  { label: 'Square', sub: '1:1', w: 30, h: 30 },
  { label: 'Portrait', sub: '9:16', w: 20, h: 36 },
  { label: 'Landscape', sub: '16:9', w: 36, h: 20 },
  { label: 'Widescreen', sub: '21:9', w: 42, h: 18 },
  { label: 'Custom', sub: '...', w: 30, h: 30, dashed: true },
]

const RANDOM_PROMPTS = [
  'A futuristic city at sunset, flying cars moving between glowing skyscrapers, ultra detailed, cinematic lighting, hyper realistic.',
  'A cute magical forest with glowing mushrooms, tiny fairies flying around, beautiful fantasy art.',
  'A cinematic portrait of a cyberpunk samurai in a neon-lit alleyway, rain drops, sharp focus.',
  'An astronaut riding a glowing horse on the moon, epic space fantasy, vivid colors.',
]

export default function ImageGenerator({ credits, setCredits }) {
  const [prompt, setPrompt] = useState(RANDOM_PROMPTS[0])
  const [activeStyle, setActiveStyle] = useState('Photorealistic')
  const [activeRatio, setActiveRatio] = useState('Square')
  
  // Advanced Options
  const [showAdvanced, setShowAdvanced] = useState(true)
  const [quality, setQuality] = useState('HD')
  const [styleStrength, setStyleStrength] = useState(75)
  const [colorPalette, setColorPalette] = useState('Vibrant')
  const [numImages, setNumImages] = useState(4) // UI simulation

  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [imageUrl, setImageUrl] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [lastPrompt, setLastPrompt] = useState('')
  const imgRef = useRef()

  const cost = 2

  const buildFinalPrompt = () => {
    const styleMap = {
      'Photorealistic': 'photorealistic, ultra detailed, 8k, DSLR',
      'Cinematic': 'cinematic shot, movie still, dramatic lighting, anamorphic lens',
      'Anime': 'anime style, Studio Ghibli, vibrant, cel shading',
      'Oil Painting': 'oil painting, impressionist, textured brushstrokes, artistic',
      'Cyberpunk': 'cyberpunk, neon lights, dystopian, blade runner aesthetic',
      '3D Render': '3D render, blender, octane render, physically based rendering',
    }
    return `${prompt.trim()}, ${styleMap[activeStyle]}. Colors: ${colorPalette}. Quality: ${quality}.`
  }

  const generate = async () => {
    if (!prompt.trim() || credits < cost || loading) return
    setLoading(true)
    setImageUrl(null)
    setErrorMsg('')
    setLastPrompt(prompt.trim())

    try {
      const finalPrompt = buildFinalPrompt()
      
      let apiRatio = 'VIDEO_ASPECT_RATIO_SQUARE'
      if (activeRatio === 'Portrait') apiRatio = 'VIDEO_ASPECT_RATIO_PORTRAIT'
      if (activeRatio === 'Landscape' || activeRatio === 'Widescreen') apiRatio = 'VIDEO_ASPECT_RATIO_LANDSCAPE'

      // Simulate progress up to 90%
      let p = 0;
      const progressInterval = setInterval(() => {
        p = Math.min(p + 3, 90);
        setProgress(p);
      }, 300);

      const res = await axios.post(`${API_URL}/api/image/generate`, {
        prompt: finalPrompt,
        aspectRatio: apiRatio,
      }, getAuthHeaders())
      
      clearInterval(progressInterval);
      setProgress(100);

      if (res.data.success) {
        setImageUrl(res.data.image_url)
        setCredits(c => c - cost)
      } else {
        setErrorMsg('Image generation failed. Please try again.')
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }

  const handleRandomPrompt = () => {
    const r = RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)]
    setPrompt(r)
  }

  const handleDownload = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `veostudio-art-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      window.open(imageUrl, '_blank');
    }
  };

  const canGenerate = prompt.trim() && credits >= cost && !loading

  return (
    <div className="w-full max-w-[1400px] mx-auto animate-[fadeSlide_0.3s_ease] pb-10 text-slate-900 dark:text-slate-100">

      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#5b21b6] dark:text-[#a855f7] flex items-center gap-3 mb-2">
            Image Generator <span className="text-[#a855f7]">✨</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-500">Turn your ideas into stunning AI artwork</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#a855f7]/30 bg-[#f3e8ff] dark:bg-[#a855f7]/10 text-[#7e22ce] dark:text-[#c084fc] text-sm font-bold shadow-sm hover:shadow-md transition-shadow">
          <span>🎁</span> Try Example Prompts
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT/CENTER COLUMN: Core Controls */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          
          {/* Section 1: Describe */}
          <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 rounded-full bg-[#6d28d9] flex items-center justify-center text-slate-900 dark:text-white text-xs font-bold shadow-md shadow-[#6d28d9]/30">1</div>
              <h2 className="text-base font-bold">Describe Your Image</h2>
            </div>
            
            <div className="relative mb-4">
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="A futuristic city at sunset, flying cars moving between glowing skyscrapers, ultra detailed, cinematic lighting, hyper realistic."
                className="w-full bg-transparent border border-slate-200 dark:border-slate-800 rounded-2xl p-4 min-h-[120px] text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-600 dark:text-slate-400 resize-y focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6]"
                disabled={loading}
              />
            </div>
            
            <div className="flex justify-between items-center px-1">
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#f3e8ff] dark:bg-[#a855f7]/10 text-[#7e22ce] dark:text-[#c084fc] text-xs font-bold transition-colors hover:bg-[#e9d5ff] dark:hover:bg-[#a855f7]/20" disabled={loading}>
                  <span>✨</span> Enhance Prompt
                </button>
                <button 
                  onClick={handleRandomPrompt}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold transition-colors hover:bg-slate-50 dark:hover:bg-slate-200 dark:bg-slate-800" 
                  disabled={loading}
                >
                  <span>🎲</span> Random Prompt
                </button>
              </div>
              <span className="text-[12px] font-mono text-slate-600 dark:text-slate-400">
                {prompt.length} / 2000
              </span>
            </div>
          </div>

          {/* Section 2: Art Style */}
          <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#6d28d9] flex items-center justify-center text-slate-900 dark:text-white text-xs font-bold shadow-md shadow-[#6d28d9]/30">2</div>
                <h2 className="text-base font-bold">Choose Art Style</h2>
              </div>
              <button className="text-xs font-bold text-[#6d28d9] dark:text-[#a855f7] hover:underline">View all</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {STYLES.map(s => {
                const isActive = activeStyle === s.label;
                return (
                  <button
                    key={s.label}
                    onClick={() => setActiveStyle(s.label)}
                    disabled={loading}
                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all ${
                      isActive 
                        ? 'border-[#8b5cf6] bg-[#f5f3ff] dark:bg-[#8b5cf6]/10 text-[#6d28d9] dark:text-[#c084fc] shadow-sm' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-[#c4b5fd] dark:hover:border-slate-600'
                    }`}
                  >
                    <span className="text-3xl drop-shadow-sm">{s.icon}</span>
                    <span className={`text-[11px] font-bold ${isActive ? 'text-[#6d28d9] dark:text-[#c084fc]' : 'text-slate-700 dark:text-slate-300'}`}>
                      {s.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section 3: Aspect Ratio */}
          <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-6 rounded-full bg-[#6d28d9] flex items-center justify-center text-slate-900 dark:text-white text-xs font-bold shadow-md shadow-[#6d28d9]/30">3</div>
              <h2 className="text-base font-bold">Aspect Ratio</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {RATIOS.map(r => {
                const isActive = activeRatio === r.label;
                return (
                  <button
                    key={r.label}
                    onClick={() => setActiveRatio(r.label)}
                    disabled={loading}
                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all min-h-[100px] ${
                      isActive 
                        ? 'border-[#8b5cf6] bg-[#f5f3ff] dark:bg-[#8b5cf6]/10 text-[#6d28d9] dark:text-[#c084fc] shadow-sm' 
                        : 'border-slate-200 dark:border-slate-800 hover:border-[#c4b5fd] dark:hover:border-slate-600'
                    }`}
                  >
                    <div 
                      className={`border-2 ${r.dashed ? 'border-dashed' : 'border-solid'} ${isActive ? 'border-[#8b5cf6]' : 'border-slate-400 dark:border-slate-600'} rounded-sm`} 
                      style={{ width: r.w, height: r.h }} 
                    />
                    <div className="flex flex-col items-center">
                      <span className={`text-[11px] font-bold ${isActive ? 'text-[#6d28d9] dark:text-[#c084fc]' : 'text-slate-700 dark:text-slate-300'}`}>
                        {r.label}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-500">{r.sub}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section 4: Advanced Options */}
          <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
            <button 
              className="flex justify-between items-center w-full"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#6d28d9] flex items-center justify-center text-slate-900 dark:text-white text-xs font-bold shadow-md shadow-[#6d28d9]/30">4</div>
                <h2 className="text-base font-bold">Advanced Options</h2>
              </div>
              <span className="text-slate-600 dark:text-slate-400">{showAdvanced ? 'ᐱ' : 'ᐯ'}</span>
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                
                {/* Quality */}
                <div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">Quality</div>
                  <div className="flex gap-2">
                    {['Standard', 'HD', 'Ultra'].map(q => (
                      <button 
                        key={q} 
                        onClick={() => setQuality(q)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                          quality === q ? 'border-[#8b5cf6] bg-[#f5f3ff] dark:bg-[#8b5cf6]/10 text-[#6d28d9] dark:text-[#c084fc]' : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style Strength */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Style Strength</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-500">{styleStrength}%</div>
                  </div>
                  <input 
                    type="range" min="0" max="100" value={styleStrength} onChange={(e) => setStyleStrength(e.target.value)}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#8b5cf6]"
                  />
                </div>

                {/* Color Palette */}
                <div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">Color Palette</div>
                  <select 
                    value={colorPalette} onChange={(e) => setColorPalette(e.target.value)}
                    className="w-full appearance-none bg-white dark:bg-[#121826] border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-[#8b5cf6] text-slate-700 dark:text-slate-300"
                  >
                    <option value="Vibrant">Vibrant</option>
                    <option value="Muted">Muted</option>
                    <option value="B&W">B&W</option>
                    <option value="Neon">Neon</option>
                  </select>
                </div>

                {/* Number of Images */}
                <div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3">Number of Images</div>
                  <div className="flex gap-2">
                    {[1, 2, 4].map(n => (
                      <button 
                        key={n} 
                        onClick={() => setNumImages(n)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-[11px] font-bold border transition-colors ${
                          numImages === n ? 'border-[#8b5cf6] bg-[#f5f3ff] dark:bg-[#8b5cf6]/10 text-[#6d28d9] dark:text-[#c084fc]' : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </div>

          {/* Generate Button Area */}
          <div className="flex flex-col gap-2">
            {loading && (
              <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm mb-2 animate-[fadeIn_0.3s_ease]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-[#8b5cf6]">Crafting Image...</span>
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
              onClick={generate}
              disabled={!canGenerate}
              className={`w-full py-5 rounded-[20px] flex justify-between px-8 items-center relative overflow-hidden group transition-all ${
                (!canGenerate) 
                  ? 'bg-slate-200 dark:bg-[#1a2333] text-slate-500 dark:text-slate-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-[#6d28d9] to-[#8b5cf6] text-white shadow-xl shadow-[#8b5cf6]/30 hover:-translate-y-0.5 hover:shadow-[#8b5cf6]/40'
              }`}
            >
              {canGenerate && <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] group-hover:animate-shimmer" />}
              
              <div className="flex-1" />
              
              <span className="text-lg font-bold tracking-wide relative z-10 flex items-center gap-2">
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <><span>⚡</span> Generate Image</>
                )}
              </span>

              <div className="flex-1 flex justify-end">
                {!loading && (
                  <span className={`text-sm font-medium ${canGenerate ? 'text-white/80' : 'text-slate-500 dark:text-slate-500'}`}>
                    Cost: {cost} Credits
                  </span>
                )}
              </div>
            </button>
            <p className="text-center text-[11px] text-slate-500 dark:text-slate-500">Each generation consumes {cost} credits. Results may vary.</p>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400 leading-relaxed mt-2">
              <span className="text-lg mt-0.5">⚠</span>
              <span>{errorMsg}</span>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Preview & Actions */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
          
          {/* Generated Preview Card */}
          <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-[32px] p-6 shadow-xl flex flex-col">
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Generated Preview</h3>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-500">1 of {numImages}</span>
                <div className="flex gap-1">
                  <button className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">&lt;</button>
                  <button className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">&gt;</button>
                </div>
              </div>
            </div>

            <div className="w-full aspect-square rounded-[24px] overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 relative shadow-inner mb-6 flex items-center justify-center">
              {loading ? (
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 via-purple-50 to-pink-100 dark:from-indigo-950 dark:via-purple-900/20 dark:to-pink-950 animate-pulse flex flex-col items-center justify-center">
                  <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4" />
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-500">Crafting artwork...</div>
                </div>
              ) : imageUrl ? (
                <img src={imageUrl} alt="Generated Art" className="w-full h-full object-cover" />
              ) : (
                <div className="text-slate-600 dark:text-slate-400 dark:text-slate-600 flex flex-col items-center">
                  <span className="text-4xl mb-2">🖼️</span>
                  <span className="text-xs font-medium">Image will appear here</span>
                </div>
              )}
            </div>

            {/* Icon Actions */}
            <div className="flex justify-between items-center mb-6 px-2 text-slate-500 dark:text-slate-500">
              <button className="hover:text-rose-500 transition-colors"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></button>
              <button onClick={handleDownload} disabled={!imageUrl} className="hover:text-[#8b5cf6] transition-colors"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></button>
              <button className="hover:text-[#8b5cf6] transition-colors"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg></button>
            </div>

            {/* Download/Edit Buttons */}
            <div className="flex flex-col gap-3">
              <div className="flex w-full">
                <button 
                  onClick={handleDownload} 
                  disabled={!imageUrl}
                  className={`flex-1 py-3.5 rounded-l-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    imageUrl ? 'bg-[#7e22ce] hover:bg-[#6b21a8] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <span className="text-lg">↓</span> Download HD
                </button>
                <button 
                  disabled={!imageUrl}
                  className={`px-4 rounded-r-xl border-l border-white/20 flex items-center justify-center transition-all ${
                    imageUrl ? 'bg-[#7e22ce] hover:bg-[#6b21a8] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
              </div>

              <button 
                disabled={!imageUrl}
                className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border ${
                  imageUrl ? 'bg-white dark:bg-[#121826] border-slate-200 dark:border-slate-700 text-[#d97706] dark:text-[#fbbf24] hover:bg-slate-50 dark:hover:bg-slate-200 dark:bg-slate-800' : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>👑</span> Download 4K
              </button>

              <button 
                disabled={!imageUrl}
                className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border ${
                  imageUrl ? 'bg-white dark:bg-[#121826] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-200 dark:bg-slate-800' : 'bg-transparent border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>✏️</span> Edit with AI
              </button>
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Tips for better results</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#f3e8ff] dark:bg-[#a855f7]/20 flex items-center justify-center text-[#a855f7] text-[10px] mt-0.5">✓</div>
                <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Be specific in your description</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#f3e8ff] dark:bg-[#a855f7]/20 flex items-center justify-center text-[#a855f7] text-[10px] mt-0.5">✓</div>
                <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Use quality keywords like ultra realistic, 4k, detailed</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-[#f3e8ff] dark:bg-[#a855f7]/20 flex items-center justify-center text-[#a855f7] text-[10px] mt-0.5">✓</div>
                <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">Try different styles and aspect ratios</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  )
} 
