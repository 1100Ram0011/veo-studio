import { useState, useRef } from 'react'
import axios from 'axios'
import API_URL from '../config'

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
  @keyframes rg-spin { to { transform:rotate(360deg); } }
  @keyframes rg-fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
  @keyframes rg-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes rg-glow { 0%,100%{box-shadow:0 0 8px #f43f5e} 50%{box-shadow:0 0 20px #f43f5e} }

  .rg-root { font-family:'Outfit',sans-serif; max-width:680px; margin:0 auto; animation:rg-fadeUp 0.3s ease; color:#e2eaf6; }

  /* Header */
  .rg-header { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:16px; margin-bottom:36px; }
  .rg-title {
    font-size:30px; font-weight:800; letter-spacing:-0.5px;
    background:linear-gradient(135deg,#e2eaf6 0%,#fda4af 60%,#f43f5e 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    background-clip:text; line-height:1.15;
  }
  .rg-subtitle { font-size:14px; color:#4a5f7a; margin-top:6px; }

  .rg-credit-pill {
    display:flex; align-items:center; gap:7px; padding:7px 16px;
    border-radius:100px; border:1px solid rgba(244,63,94,0.25);
    background:rgba(244,63,94,0.06); font-size:13px; font-weight:600; color:#fda4af; flex-shrink:0;
  }
  .rg-credit-pill.danger { border-color:rgba(248,113,113,0.35); background:rgba(248,113,113,0.08); color:#f87171; }
  .rg-dot { width:6px; height:6px; border-radius:50%; background:#f43f5e; box-shadow:0 0 7px #f43f5e; }
  .rg-dot.danger { background:#f87171; box-shadow:0 0 7px #f87171; }

  /* Instagram badge */
  .rg-badge {
    display:inline-flex; align-items:center; gap:8px;
    padding:6px 14px; border-radius:100px; margin-bottom:20px;
    background:linear-gradient(135deg,rgba(244,63,94,0.1),rgba(251,113,133,0.06));
    border:1px solid rgba(244,63,94,0.2); font-size:12px; font-weight:700;
    color:#fda4af; letter-spacing:0.5px;
  }
  .rg-badge-dot { width:7px; height:7px; border-radius:50%; background:#f43f5e; animation:rg-glow 2s ease infinite; }

  /* Card */
  .rg-card { background:#0b1520; border:1px solid #1a2535; border-radius:18px; padding:22px; margin-bottom:16px; }
  .rg-label {
    font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase;
    color:#2e4255; display:flex; align-items:center; gap:8px; margin-bottom:14px;
  }
  .rg-label::after { content:''; flex:1; height:1px; background:linear-gradient(to right,#1a2535,transparent); }

  /* Textarea */
  .rg-textarea {
    width:100%; background:#040d18; border:1px solid #1a2535; border-radius:12px;
    color:#e2eaf6; font-size:14.5px; font-family:'Outfit',sans-serif;
    padding:14px 16px; resize:vertical; outline:none; min-height:110px; line-height:1.65;
    transition:border-color 0.22s, box-shadow 0.22s;
  }
  .rg-textarea::placeholder { color:#1e3048; }
  .rg-textarea:focus { border-color:#f43f5e; box-shadow:0 0 0 3px rgba(244,63,94,0.07); }
  .rg-textarea:disabled { opacity:0.5; cursor:not-allowed; }

  /* 9:16 preview pill */
  .rg-format-info {
    display:flex; align-items:center; gap:12px;
    padding:14px 18px; background:#040d18; border:1px solid #1a2535;
    border-radius:14px; margin-bottom:16px;
  }
  .rg-format-frame {
    width:20px; height:36px; border:2.5px solid #f43f5e;
    border-radius:3px; flex-shrink:0;
    box-shadow:0 0 10px rgba(244,63,94,0.3);
  }
  .rg-format-text { flex:1; }
  .rg-format-title { font-size:13px; font-weight:700; color:#fda4af; margin-bottom:2px; }
  .rg-format-sub { font-size:11px; color:#2e4255; font-family:'Space Mono',monospace; }
  .rg-format-lock {
    font-size:11px; color:#f43f5e; font-weight:700;
    background:rgba(244,63,94,0.1); border:1px solid rgba(244,63,94,0.2);
    border-radius:6px; padding:3px 10px; letter-spacing:0.5px;
  }

  /* Tips */
  .rg-tips { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px; }
  .rg-tip {
    padding:6px 12px; border-radius:8px; cursor:pointer;
    border:1px solid #1a2535; background:#040d18;
    color:#3a5068; font-size:12px; font-weight:500;
    font-family:'Outfit',sans-serif; transition:all 0.18s;
  }
  .rg-tip:hover { color:#fda4af; border-color:rgba(244,63,94,0.3); background:rgba(244,63,94,0.04); }

  /* Generate button */
  .rg-gen-btn {
    width:100%; padding:17px; border-radius:14px; border:none; cursor:pointer;
    font-family:'Outfit',sans-serif; font-size:15.5px; font-weight:800;
    letter-spacing:0.3px; transition:all 0.22s; margin-bottom:16px;
    display:flex; align-items:center; justify-content:center; gap:10px;
  }
  .rg-gen-btn.ready {
    background:linear-gradient(135deg,#be123c 0%,#f43f5e 50%,#fb7185 100%);
    color:#fff; box-shadow:0 4px 24px rgba(244,63,94,0.35);
  }
  .rg-gen-btn.ready:hover { transform:translateY(-1px); box-shadow:0 8px 32px rgba(244,63,94,0.5); }
  .rg-gen-btn.ready:active { transform:translateY(0); }
  .rg-gen-btn:disabled { background:#0f1c2e; color:#2e4255; cursor:not-allowed; box-shadow:none; }
  .rg-cancel-btn {
    width:100%; padding:15px; border-radius:14px; cursor:pointer; margin-bottom:16px;
    background:transparent; border:1px solid rgba(248,113,113,0.25); color:#f87171;
    font-family:'Outfit',sans-serif; font-size:14px; font-weight:700; transition:all 0.2s;
  }
  .rg-cancel-btn:hover { background:rgba(248,113,113,0.06); }

  .rg-spinner { width:17px; height:17px; border:2px solid rgba(255,255,255,0.2); border-top-color:#fff; border-radius:50%; animation:rg-spin 0.8s linear infinite; flex-shrink:0; }

  /* Error */
  .rg-error { display:flex; align-items:flex-start; gap:10px; padding:13px 16px; background:rgba(248,113,113,0.06); border:1px solid rgba(248,113,113,0.2); border-radius:12px; color:#f87171; font-size:13.5px; margin-bottom:16px; line-height:1.5; }

  /* Progress */
  .rg-progress { background:#0b1520; border:1px solid #1a2535; border-radius:18px; padding:22px; margin-bottom:16px; }
  .rg-progress-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
  .rg-progress-status { display:flex; align-items:center; gap:10px; font-size:13.5px; font-weight:600; color:#fda4af; }
  .rg-progress-pct { font-size:13px; font-weight:700; font-family:'Space Mono',monospace; color:#f43f5e; }
  .rg-progress-track { height:5px; background:#0f1c2e; border-radius:99px; overflow:hidden; margin-bottom:14px; }
  .rg-progress-bar { height:100%; border-radius:99px; background:linear-gradient(90deg,#be123c,#f43f5e,#fb7185); transition:width 0.6s cubic-bezier(0.4,0,0.2,1); box-shadow:0 0 10px rgba(244,63,94,0.5); }
  .rg-log { background:#040d18; border-radius:10px; padding:10px 14px; max-height:120px; overflow-y:auto; border:1px solid #111d2a; }
  .rg-log::-webkit-scrollbar { width:3px; }
  .rg-log::-webkit-scrollbar-thumb { background:#1e3048; border-radius:10px; }
  .rg-log-line { font-size:11px; font-family:'Space Mono',monospace; color:#1e3048; line-height:1.7; }
  .rg-log-line:last-child { color:#4a5068; }

  /* Result */
  .rg-result {
    background:#0b1520; border:1px solid rgba(244,63,94,0.25);
    border-radius:18px; padding:20px; margin-bottom:16px;
    position:relative; overflow:hidden; animation:rg-fadeUp 0.4s ease;
  }
  .rg-result::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,#f43f5e,transparent); opacity:0.7; }
  .rg-result-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
  .rg-result-badge { display:flex; align-items:center; gap:8px; font-size:13px; font-weight:700; color:#fda4af; }
  .rg-result-dot { width:8px; height:8px; border-radius:50%; background:#f43f5e; box-shadow:0 0 10px #f43f5e; animation:rg-pulse 2s ease infinite; }
  .rg-download-btn {
    display:flex; align-items:center; gap:6px; padding:8px 16px; border-radius:9px;
    background:linear-gradient(135deg,#be123c,#f43f5e); color:#fff; text-decoration:none;
    font-size:12.5px; font-weight:700; font-family:'Outfit',sans-serif;
    box-shadow:0 3px 12px rgba(244,63,94,0.35); transition:all 0.2s;
  }
  .rg-download-btn:hover { transform:translateY(-1px); box-shadow:0 5px 18px rgba(244,63,94,0.5); }

  /* 9:16 video wrapper */
  .rg-video-wrap {
    display:flex; justify-content:center; margin-top:4px;
  }
  .rg-video {
    width:100%; max-width:260px; aspect-ratio:9/16;
    border-radius:16px; background:#000; display:block;
    border:1px solid rgba(244,63,94,0.2);
    box-shadow:0 8px 40px rgba(0,0,0,0.6);
  }

  @media(max-width:560px) {
    .rg-title { font-size:24px; }
    .rg-video { max-width:200px; }
  }
`

const PROMPT_TIPS = [
  '🚗 Hypercar drifting',
  '🌆 City timelapse',
  '🌊 Ocean waves',
  '🔥 Fire & smoke',
  '💃 Dance performance',
  '🌌 Space journey',
]

export default function ReelsGenerator({ history, setHistory, credits, setCredits }) {
  const [prompt, setPrompt] = useState('')
  const [status, setStatus] = useState('idle')
  const [videoUrl, setVideoUrl] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [progress, setProgress] = useState(0)
  const [log, setLog] = useState([])
  const pollRef = useRef(null)

  const addLog = (msg) => setLog(prev => [...prev.slice(-8), msg])

  const generateReel = async () => {
    if (!prompt.trim() || credits <= 0 || status === 'generating' || status === 'polling') return
    setStatus('generating')
    setVideoUrl(null)
    setErrorMsg('')
    setProgress(15)
    setLog([])
    addLog('Submitting reel request...')

    try {
      const genRes = await axios.post(`${API_URL}/api/reels/generate`, { prompt: prompt.trim() })
      const sceneId = genRes.data.sceneId
      if (!sceneId) throw new Error('Scene ID not received')

      setProgress(30)
      addLog(`Scene ID: ${sceneId}`)
      setStatus('polling')
      addLog('Generating reel (1-3 mins)...')

      let attempts = 0
      const maxAttempts = 80
      if (pollRef.current) clearInterval(pollRef.current)

      pollRef.current = setInterval(async () => {
        attempts++
        setProgress(Math.min(30 + attempts * 3.5, 95))
        addLog(`Polling attempt ${attempts}/${maxAttempts}...`)

        try {
          const pollRes = await axios.post(`${API_URL}/api/reels/result`, { sceneId })
          if (pollRes.data.ready && pollRes.data.videoUrl) {
            if (!pollRef.current) return; // Prevent overlapping requests from triggering twice
            clearInterval(pollRef.current)
            pollRef.current = null
            setVideoUrl(pollRes.data.videoUrl)
            setProgress(100)
            setStatus('done')
            setCredits(c => c - 1)
            addLog('Reel is ready!')
            setHistory(prev => [{
              id: sceneId, prompt: prompt.trim(), status: 'completed',
              url: pollRes.data.videoUrl, createdAt: new Date().toISOString(),
              aspect: 'VIDEO_ASPECT_RATIO_PORTRAIT',
            }, ...prev])
          } else {
            addLog('Still rendering portrait frames...')
          }
        } catch {
          addLog('Server busy, retrying...')
        }

        if (attempts >= maxAttempts) {
          clearInterval(pollRef.current)
          setStatus('error')
          setErrorMsg('Timed out. Check History tab in a few minutes.')
          addLog('Max attempts reached.')
        }
      }, 30000)

    } catch (err) {
      setStatus('error')
      setErrorMsg(err.response?.data?.error || err.message)
      addLog('Error: ' + err.message)
    }
  }

  const cancel = () => {
    clearInterval(pollRef.current)
    setStatus('idle')
    setVideoUrl(null)
    setErrorMsg('')
    setProgress(0)
    setLog([])
  }

  const isGenerating = status === 'generating' || status === 'polling'
  const canGenerate = prompt.trim() && credits > 0 && !isGenerating

  return (
    <>
      <style>{css}</style>
      <div className="rg-root">

        {/* Header */}
        <div className="rg-header">
          <div>
            <h1 className="rg-title">Reels Generator</h1>
            <p className="rg-subtitle">Create viral 9:16 short-form videos for Instagram & TikTok</p>
          </div>
          <div className={`rg-credit-pill ${credits <= 0 ? 'danger' : ''}`}>
            <span className={`rg-dot ${credits <= 0 ? 'danger' : ''}`} />
            {credits} credit{credits !== 1 ? 's' : ''} left
          </div>
        </div>

        {/* Instagram badge */}
        <div className="rg-badge">
          <span className="rg-badge-dot" />
          PORTRAIT 9:16 — LOCKED FORMAT
        </div>

        {/* Format info */}
        <div className="rg-format-info">
          <div className="rg-format-frame" />
          <div className="rg-format-text">
            <div className="rg-format-title">Vertical Short-Form Video</div>
            <div className="rg-format-sub">9:16 ratio · Instagram Reels · TikTok · YouTube Shorts</div>
          </div>
          <span className="rg-format-lock">🔒 9:16</span>
        </div>

        {/* Prompt */}
        <div className="rg-card">
          <div className="rg-label">Describe your reel</div>
          <textarea
            className="rg-textarea"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="A premium hypercar drifting through Tokyo streets at midnight, neon reflections on wet asphalt, cinematic slow motion…"
            disabled={isGenerating}
            rows={4}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 12, color: '#1e3048', fontFamily: "'Space Mono',monospace" }}>
              {prompt.length > 0 ? `${prompt.length} chars` : ''}
            </span>
            <span style={{ fontSize: 12, color: '#1e3048', fontFamily: "'Space Mono',monospace" }}>∞ no limit</span>
          </div>
        </div>

        {/* Quick prompt tips */}
        <div className="rg-tips">
          {PROMPT_TIPS.map(tip => (
            <button
              key={tip}
              className="rg-tip"
              onClick={() => setPrompt(tip.slice(2))}
              disabled={isGenerating}
            >{tip}</button>
          ))}
        </div>

        {/* Button */}
        {!isGenerating ? (
          <button className={`rg-gen-btn ${canGenerate ? 'ready' : ''}`} onClick={generateReel} disabled={!canGenerate}>
            {status === 'error' ? '↻ Try Again' : '⚡ Generate Reel'}
          </button>
        ) : (
          <button className="rg-cancel-btn" onClick={cancel}>✕ Cancel Generation</button>
        )}

        {/* Error */}
        {errorMsg && (
          <div className="rg-error">
            <span style={{ fontSize: 16, flexShrink: 0 }}>⚠</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Progress */}
        {isGenerating && (
          <div className="rg-progress">
            <div className="rg-progress-header">
              <div className="rg-progress-status">
                <div className="rg-spinner" />
                {status === 'generating' ? 'Submitting...' : 'Generating reel...'}
              </div>
              <span className="rg-progress-pct">{Math.round(progress)}%</span>
            </div>
            <div className="rg-progress-track">
              <div className="rg-progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <div className="rg-log">
              {log.map((line, i) => (
                <div key={i} className="rg-log-line">&gt; {line}</div>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {status === 'done' && videoUrl && (
        <div className="result-card">
            <div className="result-header">
            <div className="result-badge"><span className="result-dot" />Video Ready</div>
            <a href={videoUrl} download target="_blank" rel="noreferrer" className="download-btn">↓ Download</a>
            </div>
            {/* ✅ Sahi mapping: src={videoUrl} hona chahiye, src={src} nahi */}
            <video controls className="video-player">
            <source src={videoUrl} type="video/mp4" />
            </video>
            <div className="video-url">{videoUrl}</div>
        </div>
        )}

      </div>
    </>
  )
}
