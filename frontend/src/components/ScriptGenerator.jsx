import { useState } from 'react'
import axios from 'axios'
import API_URL from '../config'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .sg-root {
    font-family: 'Outfit', sans-serif;
    background: #050a12;
    min-height: 100vh;
    padding: 32px 20px 60px;
    color: #e2eaf6;
  }

  .sg-inner {
    max-width: 780px;
    margin: 0 auto;
    animation: sg-fadeUp 0.3s ease;
  }

  @keyframes sg-fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }

  /* Header */
  .sg-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 36px;
  }

  .sg-title {
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -0.5px;
    background: linear-gradient(135deg, #e2eaf6 0%, #a78bfa 60%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.15;
  }

  .sg-subtitle {
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
    border: 1px solid rgba(139,92,246,0.25);
    background: rgba(139,92,246,0.06);
    font-size: 13px;
    font-weight: 600;
    color: #a78bfa;
    flex-shrink: 0;
  }

  .credit-pill.danger { border-color: rgba(248,113,113,0.3); background: rgba(248,113,113,0.07); color: #f87171; }
  .credit-dot { width: 7px; height: 7px; border-radius: 50%; background: #a78bfa; box-shadow: 0 0 8px #a78bfa; }
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
    content: ''; flex: 1; height: 1px; background: linear-gradient(to right, #1a2535, transparent);
  }

  /* Prompt */
  .sg-textarea {
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
    transition: all 0.25s;
    line-height: 1.6;
    min-height: 120px;
  }
  .sg-textarea::placeholder { color: #2a3a4e; }
  .sg-textarea:focus {
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139,92,246,0.08), inset 0 1px 4px rgba(0,0,0,0.4);
  }
  .sg-textarea:disabled { opacity: 0.6; cursor: not-allowed; }

  /* Generate Button */
  .sg-btn {
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
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  .sg-btn.primary {
    background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
    color: #fff;
    box-shadow: 0 4px 24px rgba(124,58,237,0.3);
  }
  .sg-btn.primary:hover { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(124,58,237,0.45); }
  .sg-btn.primary:active { transform: translateY(0); }
  .sg-btn:disabled { background: #1a2535; color: #3a5068; box-shadow: none; cursor: not-allowed; transform: none; }

  .sg-spinner {
    width: 18px; height: 18px;
    border: 2.5px solid rgba(255,255,255,0.2);
    border-top-color: #fff; border-radius: 50%;
    animation: sg-spin 0.8s linear infinite;
  }
  @keyframes sg-spin { to { transform: rotate(360deg); } }

  /* Error */
  .error-box {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 14px 18px; background: rgba(248,113,113,0.06);
    border: 1px solid rgba(248,113,113,0.2); border-radius: 14px;
    color: #f87171; font-size: 14px; margin-bottom: 16px; line-height: 1.5;
  }

  /* Result */
  .sg-result-card {
    background: #0b1520;
    border: 1px solid rgba(139,92,246,0.3);
    border-radius: 20px;
    padding: 24px;
    margin-bottom: 16px;
    position: relative;
    animation: sg-fadeUp 0.4s ease;
  }
  .sg-result-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, #8b5cf6, transparent);
    opacity: 0.6;
  }
  .sg-result-header {
    display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px;
  }
  .sg-result-badge {
    display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: #c4b5fd;
  }
  .sg-result-dot {
    width: 8px; height: 8px; border-radius: 50%; background: #a78bfa;
    box-shadow: 0 0 10px #a78bfa; animation: sg-pulse 2s ease infinite;
  }
  @keyframes sg-pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
  
  .copy-btn {
    padding: 8px 16px; border-radius: 10px; border: 1px solid rgba(139,92,246,0.4);
    background: rgba(139,92,246,0.1); color: #ddd6fe; cursor: pointer;
    font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600;
    transition: all 0.2s;
  }
  .copy-btn:hover { background: rgba(139,92,246,0.2); color: #fff; }

  .sg-script-output {
    background: #040810; border: 1px solid #1a2535; border-radius: 12px;
    padding: 20px; font-family: 'Outfit', sans-serif; font-size: 15px;
    color: #e2eaf6; line-height: 1.7; white-space: pre-wrap;
  }

  @media (max-width: 560px) {
    .sg-root { padding: 24px 16px 48px; }
    .sg-title { font-size: 26px; }
    .sg-btn { font-size: 15px; padding: 16px; }
  }
`

export default function ScriptGenerator({ credits, setCredits }) {
  const [idea, setIdea] = useState('')
  const [loading, setLoading] = useState(false)
  const [scriptResult, setScriptResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    // ⚠️ Intercept sequence checks:
    // Call setCredits() function wrapper. If it returns false, it means usage count over, lock screen modal pop-up!
    const canProceed = setCredits();
    if (!canProceed) return;

    if (!idea.trim() || loading) return
    setLoading(true)
    setErrorMsg('')
    setScriptResult(null)
    setCopied(false)

    try {
      const res = await axios.post(`${API_URL}/api/script/generate`, { idea: idea.trim() })
      if (res.data.success) {
        setScriptResult(res.data.scriptText)
      } else {
        setErrorMsg('Failed to generate script.')
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (!scriptResult) return
    navigator.clipboard.writeText(scriptResult)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const creditsTextDisplay = typeof credits === 'string' ? credits : `${credits} left`;
  const canGenerate = idea.trim().length > 0 && !loading

  return (
    <>
      <style>{styles}</style>
      <div className="sg-root">
        <div className="sg-inner">

          {/* Header */}
          <div className="sg-header">
            <div>
              <h1 className="sg-title">Magic Prompt Generator</h1>
              <p className="sg-subtitle">Turn your simple ideas into highly detailed cinematic prompts</p>
            </div>
            <div className={`credit-pill ${typeof credits === 'number' && credits <= 0 ? 'danger' : ''}`}>
              <span className={`credit-dot ${typeof credits === 'number' && credits <= 0 ? 'danger' : ''}`}></span>
              {creditsTextDisplay}
            </div>
          </div>

          {/* Idea Input */}
          <div className="card">
            <div className="card-label">Your Basic Idea</div>
            <textarea
              className="sg-textarea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="E.g., A funny cat trying to catch a laser pointer but slipping on the floor..."
              disabled={loading}
            />
          </div>

          {/* Generate Button */}
          <button
            className={`sg-btn ${canGenerate ? 'primary' : ''}`}
            onClick={handleGenerate}
            disabled={!canGenerate}
          >
            {loading ? (
              <><div className="sg-spinner" /> Conjuring Magic...</>
            ) : (
              '✨ Generate Magic Prompt'
            )}
          </button>

          {/* Error Message */}
          {errorMsg && (
            <div className="error-box">
              <span style={{ fontSize: 16 }}>⚠</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Result */}
          {scriptResult && !loading && (
            <div className="sg-result-card">
              <div className="sg-result-header">
                <div className="sg-result-badge">
                  <span className="sg-result-dot" />
                  Prompt Ready
                </div>
                <button className="copy-btn" onClick={copyToClipboard}>
                  {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
                </button>
              </div>
              <div className="sg-script-output">
                {scriptResult}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}
