 
import { useState, useRef } from 'react'
import axios from 'axios'
import API_URL from '../config'

const ASPECT_RATIOS = [
  { label: 'Portrait', sub: '9:16', value: 'VIDEO_ASPECT_RATIO_PORTRAIT', icon: '▯', w: 18, h: 32 },
  { label: 'Landscape', sub: '16:9', value: 'VIDEO_ASPECT_RATIO_LANDSCAPE', icon: '▭', w: 32, h: 18 },
  { label: 'Square', sub: '1:1', value: 'VIDEO_ASPECT_RATIO_SQUARE', icon: '□', w: 26, h: 26 },
]

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .gen-root {
    font-family: 'Outfit', sans-serif;
    background: #050a12;
    min-height: 100vh;
    padding: 32px 20px 60px;
    color: #e2eaf6;
  }

  .gen-inner {
    max-width: 780px;
    margin: 0 auto;
  }

  /* Header */
  .gen-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 36px;
  }

  .gen-title {
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, #e2eaf6 0%, #7dd3fc 60%, #38bdf8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.15;
  }

  .gen-subtitle {
    font-size: 14px;
    color: #4a5f7a;
    margin-top: 6px;
    font-weight: 400;
    letter-spacing: 0.2px;
  }

  .credit-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: 100px;
    border: 1px solid rgba(56,189,248,0.25);
    background: rgba(56,189,248,0.06);
    font-size: 13px;
    font-weight: 600;
    color: #7dd3fc;
    flex-shrink: 0;
    white-space: nowrap;
  }

  .credit-pill.danger {
    border-color: rgba(248,113,113,0.3);
    background: rgba(248,113,113,0.07);
    color: #f87171;
  }

  .credit-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #38bdf8;
    box-shadow: 0 0 8px #38bdf8;
  }

  .credit-dot.danger { background: #f87171; box-shadow: 0 0 8px #f87171; }

  /* Card base */
  .card {
    background: #0b1520;
    border: 1px solid #1a2535;
    border-radius: 20px;
    padding: 24px;
    margin-bottom: 16px;
    transition: border-color 0.2s;
  }

  .card-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #3a5068;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
  }

  .card-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(to right, #1a2535, transparent);
  }

  /* Prompt */
  .prompt-wrap {
    position: relative;
  }

  .prompt-textarea {
    width: 100%;
    background: #040810;
    border: 1px solid #1a2535;
    border-radius: 14px;
    color: #e2eaf6;
    font-size: 15px;
    font-family: 'Outfit', sans-serif;
    padding: 16px 18px;
    resize: vertical;
    outline: none;
    transition: border-color 0.25s, box-shadow 0.25s;
    line-height: 1.6;
    min-height: 120px;
  }

  .prompt-textarea::placeholder { color: #2a3a4e; }

  .prompt-textarea:focus {
    border-color: #38bdf8;
    box-shadow: 0 0 0 3px rgba(56,189,248,0.08), inset 0 1px 4px rgba(0,0,0,0.4);
  }

  .prompt-textarea:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .prompt-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
  }

  .char-count {
    font-size: 12px;
    font-family: 'Space Mono', monospace;
    color: #2e4255;
  }

  /* Aspect Ratio */
  .aspect-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .aspect-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 18px 10px;
    border-radius: 14px;
    cursor: pointer;
    border: 1px solid #1a2535;
    background: #040810;
    color: #3a5068;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }

  .aspect-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at center, rgba(56,189,248,0.07) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.2s;
  }

  .aspect-btn:hover { border-color: #2a3f56; color: #7dd3fc; }
  .aspect-btn:hover::before { opacity: 1; }

  .aspect-btn.active {
    border-color: #38bdf8;
    background: rgba(56,189,248,0.05);
    color: #38bdf8;
  }

  .aspect-btn.active::before { opacity: 1; }

  .aspect-frame {
    border: 2.5px solid currentColor;
    border-radius: 4px;
    opacity: 0.9;
    transition: all 0.2s;
  }

  .aspect-btn.active .aspect-frame {
    box-shadow: 0 0 10px rgba(56,189,248,0.4);
  }

  .aspect-label {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.2px;
  }

  .aspect-sub {
    font-size: 11px;
    font-family: 'Space Mono', monospace;
    opacity: 0.6;
    margin-top: -6px;
  }

  /* Generate Button */
  .gen-btn {
    width: 100%;
    padding: 18px;
    border-radius: 16px;
    border: none;
    cursor: pointer;
    font-family: 'Outfit', sans-serif;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.3px;
    transition: all 0.25s;
    margin-bottom: 16px;
    position: relative;
    overflow: hidden;
  }

  .gen-btn.primary {
    background: linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%);
    color: #fff;
    box-shadow: 0 4px 24px rgba(14,165,233,0.3);
  }

  .gen-btn.primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 32px rgba(14,165,233,0.45);
  }

  .gen-btn.primary:active { transform: translateY(0); }

  .gen-btn.primary:disabled {
    background: #1a2535;
    color: #3a5068;
    box-shadow: none;
    cursor: not-allowed;
    transform: none;
  }

  .gen-btn.cancel {
    background: transparent;
    border: 1px solid rgba(248,113,113,0.25);
    color: #f87171;
  }

  .gen-btn.cancel:hover {
    background: rgba(248,113,113,0.06);
    border-color: rgba(248,113,113,0.5);
  }

  /* Error */
  .error-box {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 18px;
    background: rgba(248,113,113,0.06);
    border: 1px solid rgba(248,113,113,0.2);
    border-radius: 14px;
    color: #f87171;
    font-size: 14px;
    margin-bottom: 16px;
    line-height: 1.5;
  }

  .error-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }

  /* Progress */
  .progress-card {
    background: #0b1520;
    border: 1px solid #1a2535;
    border-radius: 20px;
    padding: 24px;
    margin-bottom: 16px;
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
  }

  .progress-status {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    font-weight: 600;
    color: #7dd3fc;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(56,189,248,0.2);
    border-top-color: #38bdf8;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .progress-pct {
    font-size: 13px;
    font-weight: 700;
    font-family: 'Space Mono', monospace;
    color: #38bdf8;
  }

  .progress-track {
    height: 5px;
    background: #0f1e2e;
    border-radius: 100px;
    overflow: hidden;
    margin-bottom: 16px;
  }

  .progress-bar {
    height: 100%;
    border-radius: 100px;
    background: linear-gradient(90deg, #38bdf8 0%, #0ea5e9 50%, #3b82f6 100%);
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 10px rgba(56,189,248,0.5);
  }

  .log-box {
    background: #040810;
    border-radius: 12px;
    padding: 12px 14px;
    max-height: 140px;
    overflow-y: auto;
    border: 1px solid #111d2a;
  }

  .log-box::-webkit-scrollbar { width: 3px; }
  .log-box::-webkit-scrollbar-track { background: transparent; }
  .log-box::-webkit-scrollbar-thumb { background: #1e3048; border-radius: 10px; }

  .log-line {
    font-size: 12px;
    font-family: 'Space Mono', monospace;
    color: #2e4c66;
    line-height: 1.7;
  }

  .log-line:last-child { color: #4a7a9b; }

  /* Video Result */
  .result-card {
    background: #0b1520;
    border: 1px solid rgba(56,189,248,0.2);
    border-radius: 20px;
    padding: 24px;
    margin-bottom: 16px;
    position: relative;
    overflow: hidden;
  }

  .result-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #38bdf8, transparent);
    opacity: 0.6;
  }

  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 18px;
  }

  .result-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 700;
    color: #4ade80;
  }

  .result-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 10px #4ade80;
    animation: pulse 2s ease infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .download-btn {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 9px 18px;
    background: linear-gradient(135deg, #38bdf8, #2563eb);
    color: #fff;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
    transition: all 0.2s;
    font-family: 'Outfit', sans-serif;
    box-shadow: 0 3px 14px rgba(56,189,248,0.3);
  }

  .download-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(56,189,248,0.45);
  }

  .video-player {
    width: 100%;
    border-radius: 14px;
    max-height: 380px;
    background: #000;
    display: block;
    box-shadow: 0 4px 40px rgba(0,0,0,0.6);
  }

  .video-url {
    margin-top: 10px;
    font-size: 11px;
    font-family: 'Space Mono', monospace;
    color: #1e3048;
    word-break: break-all;
    line-height: 1.5;
  }

  /* Responsive */
  @media (max-width: 560px) {
    .gen-root { padding: 24px 16px 48px; }
    .gen-title { font-size: 26px; }
    .aspect-grid { gap: 8px; }
    .aspect-btn { padding: 14px 6px; }
    .aspect-label { font-size: 12px; }
    .gen-btn { font-size: 15px; padding: 16px; }
  }
`

export default function Generate({ history, setHistory, credits, setCredits }) {
  const [prompt, setPrompt] = useState('')
  const [aspect, setAspect] = useState('VIDEO_ASPECT_RATIO_PORTRAIT')
  const [status, setStatus] = useState('idle')
  const [videoUrl, setVideoUrl] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [progress, setProgress] = useState(0)
  const [log, setLog] = useState([])
  const pollRef = useRef(null)

  const addLog = (msg) => setLog(prev => [...prev.slice(-8), msg])

  const generateVideo = async () => {
    if (!prompt.trim() || credits <= 0 || status === 'generating' || status === 'polling') return
    setStatus('generating')
    setVideoUrl(null)
    setErrorMsg('')
    setProgress(10)
    setLog([])
    addLog('Submitting request to backend…')

    try {
      const genRes = await axios.post(`${API_URL}/api/video/generate`, {
        prompt: prompt.trim(),
        aspectRatio: aspect,
      })
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
          const pollRes = await axios.post(`${API_URL}/api/video/result`, { sceneId })
          const url = pollRes.data.videoUrl
          if (url && (url.includes('.mp4') || url.startsWith('http'))) {
            clearInterval(pollRef.current)
            setVideoUrl(url)
            setProgress(100)
            setStatus('done')
            setCredits(c => c - 1)
            addLog('Video is ready!')
            setHistory(prev => [{
              id: sceneId, prompt: prompt.trim(), status: 'completed',
              url, createdAt: new Date().toISOString(), aspect,
            }, ...prev])
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
      }, 15000)
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
  const canGenerate = prompt.trim() && credits > 0 && !isGenerating

  return (
    <>
      <style>{styles}</style>
      <div className="gen-root">
        <div className="gen-inner">

          {/* Header */}
          <div className="gen-header">
            <div>
              <h1 className="gen-title">Generate Video</h1>
              <p className="gen-subtitle">Describe your scene — AI will render it for you</p>
            </div>
            <div className={`credit-pill ${credits <= 0 ? 'danger' : ''}`}>
              <span className={`credit-dot ${credits <= 0 ? 'danger' : ''}`}></span>
              {credits} credit{credits !== 1 ? 's' : ''} left
            </div>
          </div>

          {/* Prompt */}
          <div className="card">
            <div className="card-label">Prompt</div>
            <div className="prompt-wrap">
              <textarea
                className="prompt-textarea"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="A cinematic shot of a futuristic city at golden hour, with flying vehicles weaving between neon-lit towers…"
                disabled={isGenerating}
                rows={4}
              />
              <div className="prompt-meta">
                <span className="char-count">{prompt.length > 0 ? `${prompt.length} chars` : ''}</span>
                <span style={{ fontSize: 11, color: '#1e3a52', fontFamily: "'Space Mono', monospace" }}>∞ no limit</span>
              </div>
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="card">
            <div className="card-label">Aspect Ratio</div>
            <div className="aspect-grid">
              {ASPECT_RATIOS.map(r => (
                <button
                  key={r.value}
                  className={`aspect-btn ${aspect === r.value ? 'active' : ''}`}
                  onClick={() => setAspect(r.value)}
                  disabled={isGenerating}
                >
                  <div
                    className="aspect-frame"
                    style={{ width: r.w, height: r.h }}
                  />
                  <span className="aspect-label">{r.label}</span>
                  <span className="aspect-sub">{r.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          {!isGenerating ? (
            <button
              className="gen-btn primary"
              onClick={generateVideo}
              disabled={!canGenerate}
            >
              {status === 'error' ? '↻ Try Again' : '⚡ Generate Video'}
            </button>
          ) : (
            <button className="gen-btn cancel" onClick={reset}>
              ✕ Cancel Generation
            </button>
          )}

          {/* Error */}
          {errorMsg && (
            <div className="error-box">
              <span className="error-icon">⚠</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Progress */}
          {isGenerating && (
            <div className="progress-card">
              <div className="progress-header">
                <div className="progress-status">
                  <div className="spinner" />
                  {status === 'generating' ? 'Submitting…' : 'Generating video…'}
                </div>
                <span className="progress-pct">{Math.round(progress)}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-bar" style={{ width: `${progress}%` }} />
              </div>
              <div className="log-box">
                {log.map((line, i) => (
                  <div key={i} className="log-line">&gt; {line}</div>
                ))}
              </div>
            </div>
          )}

          {/* Video Result */}
          {status === 'done' && videoUrl && (
            <div className="result-card">
              <div className="result-header">
                <div className="result-badge">
                  <span className="result-dot" />
                  Video Ready
                </div>
                <a href={videoUrl} download target="_blank" rel="noreferrer" className="download-btn">
                  ↓ Download
                </a>
              </div>
              <video controls className="video-player">
                <source src={videoUrl} type="video/mp4" />
              </video>
              <div className="video-url">{videoUrl}</div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
