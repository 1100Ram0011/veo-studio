import { useState, useRef } from 'react'
import axios from 'axios'
import API_URL from '../config'

const VOICES = [
  { id: 'Adam - Deep Narrative', name: 'Adam', desc: 'Deep & Narrative', gender: '♂', tone: 'Warm bass, storytelling' },
  { id: 'Rachel - Premium Energetic', name: 'Rachel', desc: 'Premium Energetic', gender: '♀', tone: 'Clear, lively, upbeat' },
  { id: 'Josh - Professional', name: 'Josh', desc: 'Professional', gender: '♂', tone: 'Corporate, confident' },
  { id: 'Bella - Soft Calm', name: 'Bella', desc: 'Soft & Calm', gender: '♀', tone: 'Gentle, soothing ASMR' },
]

const SPEEDS = [
  { label: '0.75x', value: 0.75 },
  { label: '1x', value: 1 },
  { label: '1.25x', value: 1.25 },
  { label: '1.5x', value: 1.5 },
]

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
  @keyframes vg-spin  { to{transform:rotate(360deg)} }
  @keyframes vg-fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
  @keyframes vg-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes vg-wave  {
    0%,100%{transform:scaleY(0.4)}
    50%{transform:scaleY(1)}
  }
  @keyframes vg-glow  { 0%,100%{box-shadow:0 0 8px #10b981} 50%{box-shadow:0 0 20px #10b981} }

  .vg-root { font-family:'Outfit',sans-serif; max-width:740px; margin:0 auto; animation:vg-fadeUp 0.3s ease; color:#e2eaf6; }

  /* Header */
  .vg-header { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:16px; margin-bottom:36px; }
  .vg-title {
    font-size:30px; font-weight:800; letter-spacing:-0.5px;
    background:linear-gradient(135deg,#e2eaf6 0%,#6ee7b7 60%,#10b981 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    background-clip:text; line-height:1.15;
  }
  .vg-subtitle { font-size:14px; color:#4a5f7a; margin-top:6px; }

  .vg-credit-pill { display:flex; align-items:center; gap:7px; padding:7px 16px; border-radius:100px; border:1px solid rgba(16,185,129,0.25); background:rgba(16,185,129,0.06); font-size:13px; font-weight:600; color:#6ee7b7; flex-shrink:0; }
  .vg-credit-pill.danger { border-color:rgba(248,113,113,0.3); background:rgba(248,113,113,0.07); color:#f87171; }
  .vg-dot { width:6px; height:6px; border-radius:50%; background:#10b981; box-shadow:0 0 7px #10b981; }
  .vg-dot.danger { background:#f87171; box-shadow:0 0 7px #f87171; }

  /* Card */
  .vg-card { background:#0b1520; border:1px solid #1a2535; border-radius:18px; padding:22px; margin-bottom:16px; }
  .vg-label { font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#2e4255; display:flex; align-items:center; gap:8px; margin-bottom:14px; }
  .vg-label::after { content:''; flex:1; height:1px; background:linear-gradient(to right,#1a2535,transparent); }

  /* Textarea */
  .vg-textarea { width:100%; background:#040d18; border:1px solid #1a2535; border-radius:12px; color:#e2eaf6; font-size:14.5px; font-family:'Outfit',sans-serif; padding:14px 16px; resize:vertical; outline:none; min-height:120px; line-height:1.7; transition:border-color 0.22s, box-shadow 0.22s; }
  .vg-textarea::placeholder { color:#1e3048; }
  .vg-textarea:focus { border-color:#10b981; box-shadow:0 0 0 3px rgba(16,185,129,0.07); }
  .vg-textarea:disabled { opacity:0.5; cursor:not-allowed; }

  /* Voice grid */
  .vg-voices { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .vg-voice-btn {
    display:flex; align-items:center; gap:12px;
    padding:14px 16px; border-radius:14px; cursor:pointer;
    border:1px solid #1a2535; background:#040d18;
    text-align:left; transition:all 0.2s; position:relative; overflow:hidden;
  }
  .vg-voice-btn::before { content:''; position:absolute; inset:0; background:radial-gradient(circle at 30% 50%,rgba(16,185,129,0.06) 0%,transparent 70%); opacity:0; transition:opacity 0.2s; }
  .vg-voice-btn:hover { border-color:#243650; }
  .vg-voice-btn:hover::before { opacity:1; }
  .vg-voice-btn.active { border-color:#10b981; background:rgba(16,185,129,0.05); }
  .vg-voice-btn.active::before { opacity:1; }
  .vg-voice-btn:disabled { opacity:0.5; cursor:not-allowed; }

  .vg-avatar {
    width:40px; height:40px; border-radius:50%; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    font-size:18px; border:1px solid #1a2535;
    background:linear-gradient(135deg,#0b1520,#111e30);
    transition:border-color 0.2s;
  }
  .vg-voice-btn.active .vg-avatar { border-color:rgba(16,185,129,0.4); box-shadow:0 0 12px rgba(16,185,129,0.15); }

  .vg-voice-info { flex:1; min-width:0; }
  .vg-voice-name { font-size:14px; font-weight:700; color:#c8daea; margin-bottom:2px; }
  .vg-voice-desc { font-size:11px; color:#3a5068; font-weight:500; }
  .vg-voice-tone { font-size:10px; color:#1e3048; font-family:'Space Mono',monospace; margin-top:3px; }

  .vg-check { width:18px; height:18px; border-radius:50%; border:1.5px solid #1a2535; flex-shrink:0; display:flex; align-items:center; justify-content:center; transition:all 0.2s; }
  .vg-voice-btn.active .vg-check { background:#10b981; border-color:#10b981; box-shadow:0 0 8px rgba(16,185,129,0.4); }
  .vg-check-mark { color:#fff; font-size:10px; font-weight:900; display:none; }
  .vg-voice-btn.active .vg-check-mark { display:block; }

  /* Speed */
  .vg-speeds { display:flex; gap:8px; }
  .vg-speed-btn { padding:8px 16px; border-radius:9px; cursor:pointer; border:1px solid #1a2535; background:#040d18; color:#3a5068; font-size:13px; font-weight:600; font-family:'Space Mono',monospace; transition:all 0.18s; }
  .vg-speed-btn:hover { color:#6ee7b7; border-color:#243650; }
  .vg-speed-btn.active { border-color:rgba(16,185,129,0.4); background:rgba(16,185,129,0.07); color:#10b981; }

  /* Generate button */
  .vg-gen-btn { width:100%; padding:17px; border-radius:14px; border:none; cursor:pointer; font-family:'Outfit',sans-serif; font-size:15.5px; font-weight:800; letter-spacing:0.3px; transition:all 0.22s; margin-bottom:16px; display:flex; align-items:center; justify-content:center; gap:10px; }
  .vg-gen-btn.ready { background:linear-gradient(135deg,#059669 0%,#10b981 50%,#34d399 100%); color:#fff; box-shadow:0 4px 24px rgba(16,185,129,0.35); }
  .vg-gen-btn.ready:hover { transform:translateY(-1px); box-shadow:0 8px 32px rgba(16,185,129,0.5); }
  .vg-gen-btn.ready:active { transform:translateY(0); }
  .vg-gen-btn:disabled { background:#0f1c2e; color:#2e4255; cursor:not-allowed; box-shadow:none; }

  .vg-spinner { width:17px; height:17px; border:2px solid rgba(255,255,255,0.2); border-top-color:#fff; border-radius:50%; animation:vg-spin 0.8s linear infinite; flex-shrink:0; }

  /* Error */
  .vg-error { display:flex; align-items:flex-start; gap:10px; padding:13px 16px; background:rgba(248,113,113,0.06); border:1px solid rgba(248,113,113,0.2); border-radius:12px; color:#f87171; font-size:13.5px; margin-bottom:16px; line-height:1.5; }

  /* Audio wave animation */
  .vg-wave-anim { display:flex; align-items:center; gap:3px; height:24px; }
  .vg-bar { width:3px; border-radius:99px; background:#10b981; }
  .vg-bar:nth-child(1) { animation:vg-wave 1.0s ease infinite 0.0s; }
  .vg-bar:nth-child(2) { animation:vg-wave 1.0s ease infinite 0.1s; }
  .vg-bar:nth-child(3) { animation:vg-wave 1.0s ease infinite 0.2s; }
  .vg-bar:nth-child(4) { animation:vg-wave 1.0s ease infinite 0.3s; }
  .vg-bar:nth-child(5) { animation:vg-wave 1.0s ease infinite 0.2s; }
  .vg-bar:nth-child(6) { animation:vg-wave 1.0s ease infinite 0.1s; }
  .vg-bar:nth-child(7) { animation:vg-wave 1.0s ease infinite 0.0s; }

  /* Result */
  .vg-result { background:#0b1520; border:1px solid rgba(16,185,129,0.25); border-radius:18px; padding:20px; margin-bottom:16px; position:relative; overflow:hidden; animation:vg-fadeUp 0.4s ease; }
  .vg-result::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,#10b981,transparent); opacity:0.7; }
  .vg-result-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
  .vg-result-badge { display:flex; align-items:center; gap:10px; font-size:13px; font-weight:700; color:#6ee7b7; }
  .vg-result-dot { width:8px; height:8px; border-radius:50%; background:#10b981; box-shadow:0 0 10px #10b981; animation:vg-pulse 2s ease infinite; }

  .vg-result-actions { display:flex; gap:8px; }
  .vg-download-btn { display:flex; align-items:center; gap:6px; padding:8px 16px; border-radius:9px; background:linear-gradient(135deg,#059669,#10b981); color:#fff; text-decoration:none; font-size:12.5px; font-weight:700; font-family:'Outfit',sans-serif; box-shadow:0 3px 12px rgba(16,185,129,0.35); transition:all 0.2s; }
  .vg-download-btn:hover { transform:translateY(-1px); box-shadow:0 5px 18px rgba(16,185,129,0.5); }

  .vg-audio { width:100%; height:52px; border-radius:10px; accent-color:#10b981; display:block; }

  .vg-meta { display:flex; gap:10px; margin-top:12px; flex-wrap:wrap; }
  .vg-meta-chip { font-size:11px; color:#2e4255; background:#040d18; border:1px solid #1a2535; border-radius:7px; padding:3px 10px; font-family:'Space Mono',monospace; }
  .vg-meta-chip.green { color:#6ee7b7; border-color:rgba(16,185,129,0.2); background:rgba(16,185,129,0.05); }

  @media(max-width:560px) {
    .vg-title { font-size:24px; }
    .vg-voices { grid-template-columns:1fr; }
    .vg-speeds { flex-wrap:wrap; }
  }
`

export default function VoiceGenerator({ credits, setCredits }) {
  const [text, setText] = useState('')
  const [model, setModel] = useState('Adam - Deep Narrative')
  const [speed, setSpeed] = useState(1)
  const [loading, setLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [wordCount, setWordCount] = useState(0)

  const handleText = (e) => {
    setText(e.target.value)
    setWordCount(e.target.value.trim() ? e.target.value.trim().split(/\s+/).length : 0)
  }

  const synthesize = async () => {
    if (!text.trim() || credits <= 0 || loading) return
    setLoading(true)
    setAudioUrl(null)
    setErrorMsg('')

    try {
      const res = await axios.post(`${API_URL}/api/voice/generate`, {
        text: text.trim(),
        voiceModel: model,
        speed,
      })
      if (res.data.success) {
        setAudioUrl(res.data.audio_url)
        setCredits(c => c - 1)
      } else {
        setErrorMsg('Voice generation failed. Please try again.')
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const selectedVoice = VOICES.find(v => v.id === model)
  const canGenerate = text.trim() && credits > 0 && !loading
  const estDuration = Math.round((wordCount / 150) * 60 / speed)

  return (
    <>
      <style>{css}</style>
      <div className="vg-root">

        {/* Header */}
        <div className="vg-header">
          <div>
            <h1 className="vg-title">Voice Generator</h1>
            <p className="vg-subtitle">Convert text into natural AI voiceovers instantly</p>
          </div>
          <div className={`vg-credit-pill ${credits <= 0 ? 'danger' : ''}`}>
            <span className={`vg-dot ${credits <= 0 ? 'danger' : ''}`} />
            {credits} credit{credits !== 1 ? 's' : ''} left
          </div>
        </div>

        {/* Text input */}
        <div className="vg-card">
          <div className="vg-label">Your Script</div>
          <textarea
            className="vg-textarea"
            value={text}
            onChange={handleText}
            placeholder="Type or paste your voiceover script here. The AI will read it naturally with the selected voice…"
            disabled={loading}
            rows={5}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <span style={{ fontSize: 12, color: '#1e3048', fontFamily: "'Space Mono',monospace" }}>{wordCount} words</span>
              {wordCount > 0 && <span style={{ fontSize: 12, color: '#1e3048', fontFamily: "'Space Mono',monospace" }}>~{estDuration}s at {speed}x</span>}
            </div>
            <span style={{ fontSize: 12, color: '#1e3048', fontFamily: "'Space Mono',monospace" }}>∞ no limit</span>
          </div>
        </div>

        {/* Voice selection */}
        <div className="vg-card">
          <div className="vg-label">Select Voice</div>
          <div className="vg-voices">
            {VOICES.map(v => (
              <button
                key={v.id}
                className={`vg-voice-btn ${model === v.id ? 'active' : ''}`}
                onClick={() => setModel(v.id)}
                disabled={loading}
              >
                <div className="vg-avatar">
                  {v.gender === '♂' ? '👨' : '👩'}
                </div>
                <div className="vg-voice-info">
                  <div className="vg-voice-name">{v.name}</div>
                  <div className="vg-voice-desc">{v.desc}</div>
                  <div className="vg-voice-tone">{v.tone}</div>
                </div>
                <div className="vg-check">
                  <span className="vg-check-mark">✓</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Speed */}
        <div className="vg-card">
          <div className="vg-label">Playback Speed</div>
          <div className="vg-speeds">
            {SPEEDS.map(s => (
              <button
                key={s.value}
                className={`vg-speed-btn ${speed === s.value ? 'active' : ''}`}
                onClick={() => setSpeed(s.value)}
                disabled={loading}
              >{s.label}</button>
            ))}
          </div>
        </div>

        {/* Generate */}
        <button className={`vg-gen-btn ${canGenerate ? 'ready' : ''}`} onClick={synthesize} disabled={!canGenerate}>
          {loading
            ? <><div className="vg-spinner" />Generating voice…</>
            : '🎙 Generate Voiceover'
          }
        </button>

        {/* Loading wave animation */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div style={{ background: '#0b1520', border: '1px solid #1a2535', borderRadius: 14, padding: '16px 28px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="vg-wave-anim">
                {[28, 40, 56, 44, 56, 40, 28].map((h, i) => (
                  <div key={i} className="vg-bar" style={{ height: h }} />
                ))}
              </div>
              <span style={{ fontSize: 13, color: '#3a5068', fontFamily: "'Space Mono',monospace" }}>synthesizing audio...</span>
            </div>
          </div>
        )}

        {/* Error */}
        {errorMsg && (
          <div className="vg-error">
            <span style={{ fontSize: 16, flexShrink: 0 }}>⚠</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Result */}
        {audioUrl && !loading && (
          <div className="vg-result">
            <div className="vg-result-header">
              <div className="vg-result-badge">
                <span className="vg-result-dot" />
                Voice Ready
              </div>
              <div className="vg-result-actions">
                <a href={audioUrl} download="voiceover.mp3" target="_blank" rel="noreferrer" className="vg-download-btn">
                  ↓ Download
                </a>
              </div>
            </div>
            <audio src={audioUrl} controls className="vg-audio" />
            <div className="vg-meta">
              <span className="vg-meta-chip green">✓ {selectedVoice?.name}</span>
              <span className="vg-meta-chip">{speed}x speed</span>
              <span className="vg-meta-chip">{wordCount} words</span>
              <span className="vg-meta-chip">~{estDuration}s</span>
            </div>
          </div>
        )}

      </div>
    </>
  )
}