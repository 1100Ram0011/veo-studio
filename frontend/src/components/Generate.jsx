import { useState, useRef } from 'react'
import axios from 'axios'
import API_URL from '../config'

const ASPECT_RATIOS = [
  { label: 'Portrait 9:16', value: 'VIDEO_ASPECT_RATIO_PORTRAIT', icon: '▯' },
  { label: 'Landscape 16:9', value: 'VIDEO_ASPECT_RATIO_LANDSCAPE', icon: '▭' },
  { label: 'Square 1:1', value: 'VIDEO_ASPECT_RATIO_SQUARE', icon: '□' },
]

function StatusBadge({ status }) {
  const map = {
    completed: { color: '#4ade80', bg: 'rgba(74,222,128,0.1)', label: 'Completed' },
    generating: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Generating…' },
    failed: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', label: 'Failed' },
    pending: { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', label: 'Pending' },
  }
  const s = map[status] || map.pending
  return (
    <span style={{
      color: s.color, background: s.bg,
      border: `1px solid ${s.color}33`, borderRadius: 6,
      padding: '2px 10px', fontSize: 12, fontWeight: 600,
    }}>
      {status === 'generating' && <span style={{ display: 'inline-block', marginRight: 5, animation: 'spin 1s linear infinite' }}>⟳</span>}
      {s.label}
    </span>
  )
}

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
    if (!prompt.trim() || credits <= 0) return
    setStatus('generating')
    setVideoUrl(null)
    setErrorMsg('')
    setProgress(10)
    setLog([])
    addLog('🚀 Submitting request to backend…')

    try {
      // Step 1: Backend ko request bhejo
      const genRes = await axios.post(`${API_URL}/api/video/generate`, {
        prompt: prompt.trim(),
        aspectRatio: aspect,
      })

      const sceneId = genRes.data.sceneId
      if (!sceneId) throw new Error('Scene ID nahi mila')

      setProgress(35)
      addLog(`✅ Scene ID: ${sceneId}`)
      setStatus('polling')
      addLog('⏳ Video generate ho rahi hai…')

      // Step 2: Poll karo result ke liye
      let attempts = 0
      const maxAttempts = 24

      pollRef.current = setInterval(async () => {
        attempts++
        setProgress(Math.min(35 + attempts * 2.5, 90))
        addLog(`🔄 Checking result ${attempts}/${maxAttempts}…`)

        try {
          const pollRes = await axios.post(`${API_URL}/api/video/result`, { sceneId })
          const url = pollRes.data.videoUrl

          if (url && url.includes('.mp4')) {
            clearInterval(pollRef.current)
            setVideoUrl(url)
            setProgress(100)
            setStatus('done')
            setCredits(c => c - 1)
            addLog('🎬 Video ready!')
            setHistory(prev => [{
              id: sceneId,
              prompt,
              status: 'completed',
              url,
              createdAt: new Date().toISOString(),
              aspect,
            }, ...prev])
          }
        } catch (e) {
          addLog(`⚠️ ${e.message}`)
        }

        if (attempts >= maxAttempts) {
          clearInterval(pollRef.current)
          setStatus('error')
          setErrorMsg('Timeout ho gaya. Dobara try karo.')
          addLog('❌ Max attempts reached.')
        }
      }, 5000)

    } catch (err) {
      setStatus('error')
      setErrorMsg(err.response?.data?.error || err.message)
      addLog('❌ Error: ' + err.message)
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

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>Generate Video</h2>
        <p style={{ color: '#64748b', fontSize: 14 }}>Apna scene describe karo aur AI se video banwao.</p>
      </div>

      {/* Prompt Box */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <label style={{ color: '#94a3b8', fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Prompt</label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="A futuristic city at sunset with flying cars…"
          disabled={status === 'generating' || status === 'polling'}
          rows={4}
          style={{
            width: '100%', background: '#020817', border: '1px solid #1e293b',
            borderRadius: 10, color: '#f1f5f9', fontSize: 15, padding: '12px 16px',
            resize: 'vertical', fontFamily: "'DM Sans', sans-serif", outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = '#f59e0b'}
          onBlur={e => e.target.style.borderColor = '#1e293b'}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ color: '#475569', fontSize: 12 }}>{prompt.length} chars</span>
          <span style={{ color: credits > 0 ? '#4ade80' : '#f87171', fontSize: 12, fontWeight: 600 }}>
            {credits} credit{credits !== 1 ? 's' : ''} remaining
          </span>
        </div>
      </div>

      {/* Aspect Ratio */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: 20, marginBottom: 24 }}>
        <label style={{ color: '#94a3b8', fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', display: 'block', marginBottom: 14 }}>Aspect Ratio</label>
        <div style={{ display: 'flex', gap: 12 }}>
          {ASPECT_RATIOS.map(r => (
            <button key={r.value} onClick={() => setAspect(r.value)} style={{
              flex: 1, padding: '12px 8px', borderRadius: 10, cursor: 'pointer',
              border: aspect === r.value ? '2px solid #f59e0b' : '1px solid #1e293b',
              background: aspect === r.value ? 'rgba(245,158,11,0.1)' : '#020817',
              color: aspect === r.value ? '#f59e0b' : '#64748b',
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
              transition: 'all 0.2s',
            }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{r.icon}</div>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate / Cancel Button */}
      {status === 'idle' || status === 'error' ? (
        <button onClick={generateVideo}
          disabled={!prompt.trim() || credits <= 0}
          style={{
            width: '100%', padding: 16, borderRadius: 12, border: 'none',
            cursor: prompt.trim() && credits > 0 ? 'pointer' : 'not-allowed',
            background: prompt.trim() && credits > 0 ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : '#1e293b',
            color: prompt.trim() && credits > 0 ? '#0f0a00' : '#475569',
            fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 800,
            transition: 'all 0.2s',
          }}>
          ⚡ Generate Video
        </button>
      ) : (
        <button onClick={reset} style={{
          width: '100%', padding: 16, borderRadius: 12,
          border: '1px solid #1e293b', cursor: 'pointer',
          background: 'transparent', color: '#f87171',
          fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 700,
        }}>
          ✕ Cancel
        </button>
      )}

      {/* Error */}
      {errorMsg && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, color: '#f87171', fontSize: 14 }}>
          ❌ {errorMsg}
        </div>
      )}

      {/* Progress */}
      {(status === 'generating' || status === 'polling') && (
        <div style={{ marginTop: 24, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>
              {status === 'generating' ? 'Submitting…' : 'Generating…'}
            </span>
            <span style={{ color: '#f59e0b', fontSize: 13, fontWeight: 700 }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ height: 6, background: '#1e293b', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
              borderRadius: 99, transition: 'width 0.5s ease',
            }} />
          </div>
          <div style={{ marginTop: 14, background: '#020817', borderRadius: 10, padding: '10px 14px', maxHeight: 130, overflow: 'auto' }}>
            {log.map((l, i) => (
              <div key={i} style={{ color: '#475569', fontSize: 12, fontFamily: 'monospace', marginBottom: 3 }}>{l}</div>
            ))}
          </div>
        </div>
      )}

      {/* Video Result */}
      {status === 'done' && videoUrl && (
        <div style={{ marginTop: 24, background: '#0f172a', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ color: '#4ade80', fontWeight: 700, fontSize: 15 }}>🎬 Video Ready!</span>
            <a href={videoUrl} download target="_blank" rel="noreferrer"
              style={{ padding: '8px 18px', background: '#4ade80', color: '#052e16', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              ↓ Download
            </a>
          </div>
          <video controls style={{ width: '100%', borderRadius: 10, maxHeight: 360, background: '#000' }}>
            <source src={videoUrl} type="video/mp4" />
          </video>
          <div style={{ marginTop: 10, color: '#475569', fontSize: 11, fontFamily: 'monospace', wordBreak: 'break-all' }}>{videoUrl}</div>
        </div>
      )}
    </div>
  )
}
