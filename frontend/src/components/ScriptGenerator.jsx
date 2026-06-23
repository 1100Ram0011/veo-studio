import { useState } from 'react'
import axios from 'axios'
import API_URL, { getAuthHeaders } from '../config'

export default function ScriptGenerator({ credits, setCredits }) {
  const [idea, setIdea] = useState('')
  const [loading, setLoading] = useState(false)
  const [scriptResult, setScriptResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    const canProceed = setCredits();
    if (!canProceed) return;

    if (!idea.trim() || loading) return
    setLoading(true)
    setErrorMsg('')
    setScriptResult(null)
    setCopied(false)

    try {
      const res = await axios.post(`${API_URL}/api/script/generate`, { idea: idea.trim() }, getAuthHeaders())
      if (res.data.success) {
        setScriptResult(res.data.script)
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
    <div className="w-full max-w-[780px] mx-auto animate-[fadeSlide_0.3s_ease]">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-500 to-purple-600 dark:from-slate-100 dark:via-violet-300 dark:to-violet-500 bg-clip-text text-transparent leading-tight mb-1">
            Magic Prompt Generator
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-500">Turn your simple ideas into highly detailed cinematic prompts</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold shadow-sm dark:shadow-lg ${
          typeof credits === 'number' && credits <= 0 
            ? 'border-red-200 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400' 
            : 'border-violet-200 bg-violet-50 text-violet-600 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-400'
        }`}>
          <span className={`w-2 h-2 rounded-full animate-pulse ${typeof credits === 'number' && credits <= 0 ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-violet-500 dark:bg-violet-400 shadow-[0_0_8px_#8b5cf6]'}`} />
          {creditsTextDisplay}
        </div>
      </div>

      {/* Idea Input */}
      <div className="glass-card p-6 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold tracking-[1.5px] uppercase text-slate-500 dark:text-slate-500">Your Basic Idea</span>
          <div className="flex-1 h-[1px] bg-slate-200 dark:bg-gradient-to-r dark:from-slate-700/50 dark:to-transparent" />
        </div>
        
        <textarea
          className="input-field min-h-[120px] resize-y focus:border-violet-500 focus:ring-violet-500/20"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="E.g., A funny cat trying to catch a laser pointer but slipping on the floor..."
          disabled={loading}
        />
      </div>

      {/* Generate Button */}
      <button
        className={`mb-5 w-full ${canGenerate ? 'btn-primary !bg-gradient-to-r !from-violet-500 !to-purple-600 !shadow-violet-500/25' : 'btn-secondary opacity-50 cursor-not-allowed'}`}
        onClick={handleGenerate}
        disabled={!canGenerate}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Conjuring Magic...
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">✨ Generate Magic Prompt</div>
        )}
      </button>

      {/* Error Message */}
      {errorMsg && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400 mb-5 leading-relaxed">
          <span className="text-lg mt-0.5">⚠</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Result */}
      {scriptResult && !loading && (
        <div className="glass-card p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-60" />
          
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2 text-sm font-bold text-violet-600 dark:text-violet-300">
              <span className="w-2 h-2 rounded-full bg-violet-500 dark:bg-violet-400 shadow-[0_0_10px_#a78bfa] animate-pulse" />
              Prompt Ready
            </div>
            <button 
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all border ${
                copied 
                  ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/50 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/40 text-violet-600 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-500/20 hover:text-violet-700 dark:hover:text-white'
              }`}
              onClick={copyToClipboard}
            >
              {copied ? '✓ Copied!' : '📋 Copy to Clipboard'}
            </button>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 font-mono text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap shadow-inner">
            {scriptResult}
          </div>
        </div>
      )}

    </div>
  )
}
 
