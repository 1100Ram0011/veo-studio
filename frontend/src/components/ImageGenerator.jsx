import { useState, useRef } from 'react'
import axios from 'axios'
import API_URL from '../config'

const STYLES = [
  { label: 'Photorealistic', icon: '📷' },
  { label: 'Cinematic', icon: '🎬' },
  { label: 'Anime', icon: '✨' },
  { label: 'Oil Painting', icon: '🎨' },
  { label: 'Cyberpunk', icon: '🌆' },
  { label: '3D Render', icon: '🧊' },
]

const RATIOS = [
  { label: 'Square', sub: '1:1', w: 26, h: 26 },
  { label: 'Portrait', sub: '3:4', w: 20, h: 26 },
  { label: 'Landscape', sub: '16:9', w: 32, h: 18 },
]

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
  @keyframes ig-spin { to { transform:rotate(360deg); } }
  @keyframes ig-fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
  @keyframes ig-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes ig-shimmer {
    0%{background-position:-600px 0}
    100%{background-position:600px 0}
  }

  .ig-root {
    font-family:'Outfit',sans-serif;
    max-width:800px;
    margin:0 auto;
    animation:ig-fadeUp 0.3s ease;
    color:#e2eaf6;
  }

  /* Header */
  .ig-header {
    display:flex; align-items:flex-start;
    justify-content:space-between; flex-wrap:wrap;
    gap:16px; margin-bottom:36px;
  }
  .ig-title {
    font-size:30px; font-weight:800; letter-spacing:-0.5px;
    background:linear-gradient(135deg,#e2eaf6 0%,#c084fc 60%,#a855f7 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    background-clip:text; line-height:1.15;
  }
  .ig-subtitle { font-size:14px; color:#4a5f7a; margin-top:6px; }

  .ig-credit-pill {
    display:flex; align-items:center; gap:7px;
    padding:7px 16px; border-radius:100px;
    border:1px solid rgba(168,85,247,0.25);
    background:rgba(168,85,247,0.06);
    font-size:13px; font-weight:600; color:#c084fc; flex-shrink:0;
  }
  .ig-credit-pill.danger { border-color:rgba(248,113,113,0.3); background:rgba(248,113,113,0.07); color:#f87171; }
  .ig-dot { width:6px; height:6px; border-radius:50%; background:#a855f7; box-shadow:0 0 7px #a855f7; }
  .ig-dot.danger { background:#f87171; box-shadow:0 0 7px #f87171; }

  /* Cards */
  .ig-card {
    background:#0b1520; border:1px solid #1a2535;
    border-radius:18px; padding:22px; margin-bottom:16px;
  }
  .ig-label {
    font-size:11px; font-weight:700; letter-spacing:1.5px;
    text-transform:uppercase; color:#2e4255;
    display:flex; align-items:center; gap:8px; margin-bottom:14px;
  }
  .ig-label::after { content:''; flex:1; height:1px; background:linear-gradient(to right,#1a2535,transparent); }

  /* Textarea */
  .ig-textarea {
    width:100%; background:#040d18; border:1px solid #1a2535;
    border-radius:12px; color:#e2eaf6; font-size:14.5px;
    font-family:'Outfit',sans-serif; padding:14px 16px;
    resize:vertical; outline:none; min-height:110px; line-height:1.65;
    transition:border-color 0.22s, box-shadow 0.22s;
  }
  .ig-textarea::placeholder { color:#1e3048; }
  .ig-textarea:focus { border-color:#a855f7; box-shadow:0 0 0 3px rgba(168,85,247,0.08); }
  .ig-textarea:disabled { opacity:0.5; cursor:not-allowed; }

  /* Style pills */
  .ig-styles { display:flex; gap:8px; flex-wrap:wrap; }
  .ig-style-btn {
    display:flex; align-items:center; gap:6px;
    padding:8px 14px; border-radius:10px; cursor:pointer;
    border:1px solid #1a2535; background:#040d18;
    color:#3a5068; font-size:12.5px; font-weight:500;
    font-family:'Outfit',sans-serif; transition:all 0.18s;
  }
  .ig-style-btn:hover { color:#c084fc; border-color:#2a3650; }
  .ig-style-btn.active {
    border-color:rgba(168,85,247,0.5);
    background:rgba(168,85,247,0.08);
    color:#c084fc; font-weight:700;
    box-shadow:0 0 12px rgba(168,85,247,0.1);
  }

  /* Ratio */
  .ig-ratios { display:flex; gap:10px; }
  .ig-ratio-btn {
    flex:1; display:flex; flex-direction:column;
    align-items:center; justify-content:center; gap:10px;
    padding:14px 8px; border-radius:12px; cursor:pointer;
    border:1px solid #1a2535; background:#040d18;
    color:#3a5068; font-size:12px; font-weight:600;
    font-family:'Outfit',sans-serif; transition:all 0.2s;
    position:relative; overflow:hidden;
  }
  .ig-ratio-btn::before {
    content:''; position:absolute; inset:0;
    background:radial-gradient(circle at center,rgba(168,85,247,0.07) 0%,transparent 70%);
    opacity:0; transition:opacity 0.2s;
  }
  .ig-ratio-btn:hover { color:#c084fc; border-color:#2a3650; }
  .ig-ratio-btn:hover::before { opacity:1; }
  .ig-ratio-btn.active {
    border-color:#a855f7; background:rgba(168,85,247,0.06);
    color:#a855f7;
  }
  .ig-ratio-btn.active::before { opacity:1; }
  .ig-ratio-frame {
    border:2.5px solid currentColor; border-radius:3px;
    transition:all 0.2s;
  }
  .ig-ratio-btn.active .ig-ratio-frame { box-shadow:0 0 10px rgba(168,85,247,0.4); }
  .ig-ratio-sub { font-size:10px; font-family:'Space Mono',monospace; opacity:0.6; margin-top:-6px; }

  /* Generate button */
  .ig-gen-btn {
    width:100%; padding:17px; border-radius:14px; border:none;
    cursor:pointer; font-family:'Outfit',sans-serif;
    font-size:15.5px; font-weight:800; letter-spacing:0.3px;
    transition:all 0.22s; margin-bottom:16px; display:flex;
    align-items:center; justify-content:center; gap:10px;
  }
  .ig-gen-btn.ready {
    background:linear-gradient(135deg,#7c3aed 0%,#a855f7 50%,#c084fc 100%);
    color:#fff; box-shadow:0 4px 24px rgba(168,85,247,0.35);
  }
  .ig-gen-btn.ready:hover { transform:translateY(-1px); box-shadow:0 8px 32px rgba(168,85,247,0.5); }
  .ig-gen-btn.ready:active { transform:translateY(0); }
  .ig-gen-btn:disabled { background:#0f1c2e; color:#2e4255; cursor:not-allowed; box-shadow:none; }

  .ig-spinner {
    width:17px; height:17px;
    border:2px solid rgba(255,255,255,0.2);
    border-top-color:#fff; border-radius:50%;
    animation:ig-spin 0.8s linear infinite; flex-shrink:0;
  }

  /* Error */
  .ig-error {
    display:flex; align-items:flex-start; gap:10px;
    padding:13px 16px; background:rgba(248,113,113,0.06);
    border:1px solid rgba(248,113,113,0.2); border-radius:12px;
    color:#f87171; font-size:13.5px; margin-bottom:16px; line-height:1.5;
  }

  /* Skeleton loader */
  .ig-skeleton {
    width:100%; aspect-ratio:1/1; border-radius:14px;
    background:linear-gradient(90deg, #0b1520 25%, #111e30 50%, #0b1520 75%);
    background-size:600px 100%;
    animation:ig-shimmer 1.5s infinite linear;
  }

  /* Result */
  .ig-result {
    background:#0b1520; border:1px solid rgba(168,85,247,0.25);
    border-radius:18px; padding:20px; margin-bottom:16px;
    position:relative; overflow:hidden;
    animation:ig-fadeUp 0.4s ease;
  }
  .ig-result::before {
    content:''; position:absolute; top:0; left:0; right:0; height:1px;
    background:linear-gradient(90deg,transparent,#a855f7,transparent);
    opacity:0.7;
  }
  .ig-result-header {
    display:flex; justify-content:space-between;
    align-items:center; margin-bottom:14px;
  }
  .ig-result-badge {
    display:flex; align-items:center; gap:8px;
    font-size:13px; font-weight:700; color:#c084fc;
  }
  .ig-result-dot {
    width:8px; height:8px; border-radius:50%;
    background:#a855f7; box-shadow:0 0 10px #a855f7;
    animation:ig-pulse 2s ease infinite;
  }
  .ig-result-actions { display:flex; gap:8px; }
  .ig-download-btn {
    display:flex; align-items:center; gap:6px;
    padding:8px 16px; border-radius:9px;
    background:linear-gradient(135deg,#7c3aed,#a855f7);
    color:#fff; text-decoration:none; font-size:12.5px;
    font-weight:700; font-family:'Outfit',sans-serif;
    box-shadow:0 3px 12px rgba(168,85,247,0.35);
    transition:all 0.2s;
  }
  .ig-download-btn:hover { transform:translateY(-1px); box-shadow:0 5px 18px rgba(168,85,247,0.5); }
  .ig-regen-btn {
    padding:8px 14px; border-radius:9px; cursor:pointer;
    background:transparent; border:1px solid #1a2535;
    color:#3a5068; font-size:12.5px; font-weight:600;
    font-family:'Outfit',sans-serif; transition:all 0.2s;
  }
  .ig-regen-btn:hover { border-color:#2a3650; color:#7dd3fc; }

  .ig-image {
    width:100%; border-radius:12px; display:block;
    max-height:480px; object-fit:contain; background:#040d18;
    border:1px solid #1a2535;
  }

  .ig-prompt-tag {
    margin-top:10px; font-size:11px;
    font-family:'Space Mono',monospace; color:#1e3048;
    word-break:break-all; line-height:1.5;
  }

  /* Negative prompt */
  .ig-neg-textarea {
    width:100%; background:#040d18; border:1px solid #1a2535;
    border-radius:10px; color:#4a5f7a; font-size:13px;
    font-family:'Outfit',sans-serif; padding:11px 14px;
    resize:none; outline:none; line-height:1.6;
    transition:border-color 0.2s;
  }
  .ig-neg-textarea::placeholder { color:#1a2535; }
  .ig-neg-textarea:focus { border-color:#2a3650; }

  @media(max-width:560px) {
    .ig-title { font-size:24px; }
    .ig-styles { gap:6px; }
    .ig-style-btn { padding:7px 10px; font-size:12px; }
    .ig-ratios { gap:7px; }
    .ig-gen-btn { font-size:14px; padding:15px; }
  }
`

export default function ImageGenerator({ credits, setCredits }) {
  const [prompt, setPrompt] = useState('')
  const [negPrompt, setNegPrompt] = useState('')
  const [activeStyle, setActiveStyle] = useState('Photorealistic')
  const [activeRatio, setActiveRatio] = useState('Square')
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [lastPrompt, setLastPrompt] = useState('')
  const imgRef = useRef()

  const buildFinalPrompt = () => {
    const styleMap = {
      'Photorealistic': 'photorealistic, ultra detailed, 8k, DSLR',
      'Cinematic': 'cinematic shot, movie still, dramatic lighting, anamorphic lens',
      'Anime': 'anime style, Studio Ghibli, vibrant, cel shading',
      'Oil Painting': 'oil painting, impressionist, textured brushstrokes, artistic',
      'Cyberpunk': 'cyberpunk, neon lights, dystopian, blade runner aesthetic',
      '3D Render': '3D render, blender, octane render, physically based rendering',
    }
    return `${prompt.trim()}, ${styleMap[activeStyle]}`
  }

  const generate = async () => {
    // ⚠️ Intercept sequence checks:
    // Call setCredits() function wrapper. If it returns false, it means usage count over, lock screen modal pop-up!
    const canProceed = setCredits();
    if (!canProceed) return;

    if (!prompt.trim() || loading) return
    setLoading(true)
    setImageUrl(null)
    setErrorMsg('')
    setLastPrompt(prompt.trim())

    try {
      const finalPrompt = buildFinalPrompt()
      const res = await axios.post(`${API_URL}/api/image/generate`, {
        prompt: finalPrompt,
        negativePrompt: negPrompt.trim() || undefined,
        aspectRatio: activeRatio,
      })
      if (res.data.success) {
        setImageUrl(res.data.image_url)
      } else {
        setErrorMsg('Image generation failed. Please try again.')
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // Adjusted local state validation indices mapping
  const canGenerate = prompt.trim() && !loading
  const ratio = RATIOS.find(r => r.label === activeRatio)
  
  // Custom text representation adjustments matching App.jsx credits hook parameters
  const creditsTextDisplay = typeof credits === 'string' ? credits : `${credits} left`;

  return (
    <>
      <style>{css}</style>
      <div className="ig-root">

        {/* Header */}
        <div className="ig-header">
          <div>
            <h1 className="ig-title">Image Generator</h1>
            <p className="ig-subtitle">Turn your words into stunning AI artwork</p>
          </div>
          <div className={`ig-credit-pill ${typeof credits === 'number' && credits <= 0 ? 'danger' : ''}`}>
            <span className={`ig-dot ${typeof credits === 'number' && credits <= 0 ? 'danger' : ''}`} />
            {creditsTextDisplay}
          </div>
        </div>

        {/* Prompt */}
        <div className="ig-card">
          <div className="ig-label">Describe your image</div>
          <textarea
            className="ig-textarea"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="A futuristic city at sunset, flying cars weaving between glowing skyscrapers, ultra detailed…"
            disabled={loading}
            rows={4}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 12, color: '#1e3048', fontFamily: "'Space Mono',monospace" }}>
              {prompt.length > 0 ? `${prompt.length} chars` : ''}
            </span>
            <span style={{ fontSize: 12, color: '#1e3048', fontFamily: "'Space Mono',monospace" }}>∞ no limit</span>
          </div>
        </div>

        {/* Style */}
        <div className="ig-card">
          <div className="ig-label">Art Style</div>
          <div className="ig-styles">
            {STYLES.map(s => (
              <button
                key={s.label}
                className={`ig-style-btn ${activeStyle === s.label ? 'active' : ''}`}
                onClick={() => setActiveStyle(s.label)}
                disabled={loading}
              >
                <span>{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ratio */}
        <div className="ig-card">
          <div className="ig-label">Aspect Ratio</div>
          <div className="ig-ratios">
            {RATIOS.map(r => (
              <button
                key={r.label}
                className={`ig-ratio-btn ${activeRatio === r.label ? 'active' : ''}`}
                onClick={() => setActiveRatio(r.label)}
                disabled={loading}
              >
                <div className="ig-ratio-frame" style={{ width: r.w, height: r.h }} />
                <span style={{ fontSize: 13, fontWeight: 700 }}>{r.label}</span>
                <span className="ig-ratio-sub">{r.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Negative prompt */}
        <div className="ig-card">
          <div className="ig-label">
            Negative Prompt
            <span style={{ color: '#1e3048', textTransform: 'none', letterSpacing: 0, fontWeight: 400, fontSize: 11 }}>— optional</span>
          </div>
          <textarea
            className="ig-neg-textarea"
            value={negPrompt}
            onChange={e => setNegPrompt(e.target.value)}
            placeholder="blurry, low quality, distorted, watermark, text, ugly…"
            rows={2}
            disabled={loading}
          />
        </div>

        {/* Button */}
        <button
          className={`ig-gen-btn ${canGenerate ? 'ready' : ''}`}
          onClick={generate}
          disabled={!canGenerate}
        >
          {loading
            ? <><div className="ig-spinner" /> Generating image…</>
            : '✦ Generate Image'
          }
        </button>

        {/* Error */}
        {errorMsg && (
          <div className="ig-error">
            <span style={{ fontSize: 16, flexShrink: 0 }}>⚠</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Skeleton while loading */}
        {loading && (
          <div className="ig-card">
            <div className="ig-skeleton" style={{ aspectRatio: activeRatio === 'Landscape' ? '16/9' : activeRatio === 'Portrait' ? '3/4' : '1/1' }} />
            <div style={{ marginTop: 12, height: 12, borderRadius: 6, width: '60%', background: 'linear-gradient(90deg,#0b1520 25%,#111e30 50%,#0b1520 75%)', backgroundSize: '600px 100%', animation: 'ig-shimmer 1.5s infinite linear' }} />
          </div>
        )}

        {/* Result */}
        {imageUrl && !loading && (
          <div className="ig-result">
            <div className="ig-result-header">
              <div className="ig-result-badge">
                <span className="ig-result-dot" />
                Image Ready
              </div>
              <div className="ig-result-actions">
                <a href={imageUrl} download="ai-image.png" target="_blank" rel="noreferrer" className="ig-download-btn">
                  ↓ Download
                </a>
                <button className="ig-regen-btn" onClick={generate} disabled={loading}>
                  ↺ Regenerate
                </button>
              </div>
            </div>
            <img
              ref={imgRef}
              src={imageUrl}
              alt="AI Generated"
              className="ig-image"
            />
            <p className="ig-prompt-tag">"{lastPrompt}"</p>
          </div>
        )}

      </div>
    </>
  )
}