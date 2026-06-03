import { useState, useRef, useCallback } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const GEMINI_MODEL = "gemini-1.5-flash-latest";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function toBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = () => rej(new Error("File read failed"));
    r.readAsDataURL(file);
  });
}

function formatDate(iso) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// Parse Gemini response into parts
function parseScriptParts(text) {
  // Try to split on PART 1, PART 2 etc. or Chapter 1, Scene 1 etc.
  const partRegex = /(?:PART|Part|Chapter|CHAPTER|Scene|SCENE)\s*[\d]+[:\.\-]?\s*/g;
  const matches = [...text.matchAll(partRegex)];

  if (matches.length >= 2) {
    const parts = [];
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index;
      const end = matches[i + 1] ? matches[i + 1].index : text.length;
      parts.push({
        title: matches[i][0].trim().replace(/[:\-]$/, ""),
        content: text.slice(start + matches[i][0].length, end).trim(),
      });
    }
    return parts;
  }

  // Fallback: split by double newline into ~equal parts
  const chunks = text.split(/\n{2,}/).filter(Boolean);
  if (chunks.length >= 2) {
    const half = Math.ceil(chunks.length / 2);
    return [
      { title: "Part 1", content: chunks.slice(0, half).join("\n\n") },
      { title: "Part 2", content: chunks.slice(half).join("\n\n") },
    ];
  }
  return [{ title: "Full Script", content: text }];
}

// ─── GEMINI CALL ─────────────────────────────────────────────────────────────
async function callGemini({ apiKey, prompt, imageFile, numParts, genre, tone, language }) {
  const partsInstruction = numParts > 1
    ? `Structure the script into exactly ${numParts} clearly labeled parts: PART 1, PART 2${numParts > 2 ? Array.from({ length: numParts - 2 }, (_, i) => `, PART ${i + 3}`).join("") : ""}. Each part should be a complete scene/chapter with dialogue, action lines, and descriptions.`
    : "Write a complete single-part script with scenes, dialogue, and action lines.";

  const systemPrompt = `You are a professional screenplay and script writer.
Genre: ${genre}
Tone: ${tone}
Language: ${language}

${partsInstruction}

For each part include:
- Scene heading (INT./EXT. LOCATION - DAY/NIGHT)
- Action lines describing what we see
- Character dialogue with speaker names in CAPS
- Transitions if needed

Make it vivid, cinematic, and engaging. Use the provided prompt${imageFile ? " and analyze the image to incorporate visual elements" : ""}.

User Prompt: ${prompt}`;

  const userContent = [];

  if (imageFile) {
    const b64 = await toBase64(imageFile);
    userContent.push({
      inline_data: { mime_type: imageFile.type, data: b64 },
    });
  }

  userContent.push({ text: systemPrompt });

  const body = {
    contents: [{ parts: userContent }],
    generationConfig: {
      temperature: 0.9,
      maxOutputTokens: 4096,
    },
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || `Gemini API error: ${res.status}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Koi response nahi mila Gemini se");
  return text;
}

// ─── SUB COMPONENTS ──────────────────────────────────────────────────────────
function PartCard({ part, index, total }) {
  const [open, setOpen] = useState(true);
  const colors = ["#f59e0b", "#34d399", "#60a5fa", "#f472b6", "#a78bfa", "#fb923c"];
  const color = colors[index % colors.length];

  return (
    <div style={{
      border: `1px solid ${color}33`,
      borderRadius: 14,
      overflow: "hidden",
      marginBottom: 14,
      background: "#070d1a",
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 20px", background: "transparent", border: "none", cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            background: color, color: "#000", borderRadius: 6, padding: "3px 10px",
            fontSize: 11, fontWeight: 800, fontFamily: "'Syne', sans-serif", letterSpacing: 1,
          }}>
            {part.title.toUpperCase()}
          </span>
          <span style={{ color: "#64748b", fontSize: 12 }}>
            {part.content.split(/\s+/).length} words
          </span>
        </div>
        <span style={{ color: color, fontSize: 18, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>▾</span>
      </button>

      {open && (
        <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${color}22` }}>
          <pre style={{
            color: "#cbd5e1", fontSize: 13, fontFamily: "'DM Mono', 'Courier New', monospace",
            whiteSpace: "pre-wrap", lineHeight: 1.8, margin: "16px 0 0",
          }}>
            {part.content}
          </pre>
        </div>
      )}
    </div>
  );
}

function ScriptCard({ script, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const copyAll = () => {
    const fullText = script.parts.map(p => `${p.title.toUpperCase()}\n\n${p.content}`).join("\n\n─────────\n\n");
    navigator.clipboard.writeText(fullText);
  };

  return (
    <div style={{
      background: "#0a1120", border: "1px solid #1a2744", borderRadius: 16,
      marginBottom: 16, overflow: "hidden",
      transition: "border-color 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#2a3f6f"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#1a2744"}
    >
      {/* Header */}
      <div style={{ padding: "18px 22px", display: "flex", gap: 16, alignItems: "flex-start" }}>
        {script.imageUrl && (
          <img src={script.imageUrl} alt="ref"
            style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", flexShrink: 0, border: "1px solid #1e3a5f" }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: "#e2e8f0", fontSize: 14, fontWeight: 600, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {script.prompt}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
              {script.genre}
            </span>
            <span style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa", borderRadius: 5, padding: "2px 8px", fontSize: 11 }}>
              {script.parts.length} part{script.parts.length !== 1 ? "s" : ""}
            </span>
            <span style={{ background: "rgba(100,116,139,0.1)", color: "#64748b", borderRadius: 5, padding: "2px 8px", fontSize: 11 }}>
              {formatDate(script.createdAt)}
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button onClick={copyAll} title="Copy script" style={{
            background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.2)",
            color: "#60a5fa", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600,
          }}>📋 Copy</button>
          <button onClick={() => setExpanded(e => !e)} style={{
            background: expanded ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)",
            border: "1px solid #1e3a5f", color: expanded ? "#f59e0b" : "#64748b",
            borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600,
          }}>
            {expanded ? "▲ Hide" : "▼ View"}
          </button>
          <button onClick={() => onDelete(script.id)} title="Delete" style={{
            background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
            color: "#f87171", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 12,
          }}>✕</button>
        </div>
      </div>

      {/* Parts */}
      {expanded && (
        <div style={{ padding: "0 22px 22px", borderTop: "1px solid #0f1e3a" }}>
          <div style={{ marginTop: 18 }}>
            {script.parts.map((part, i) => (
              <PartCard key={i} part={part} index={i} total={script.parts.length} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [apiKey, setApiKey] = useState("");
  const [apiKeySet, setApiKeySet] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [numParts, setNumParts] = useState(2);
  const [genre, setGenre] = useState("Drama");
  const [tone, setTone] = useState("Cinematic");
  const [language, setLanguage] = useState("English");
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [errorMsg, setErrorMsg] = useState("");
  const [scripts, setScripts] = useState([]);
  const [activeTab, setActiveTab] = useState("create");
  const fileRef = useRef();

  const GENRES = ["Drama", "Action", "Thriller", "Comedy", "Horror", "Romance", "Sci-Fi", "Fantasy", "Mystery"];
  const TONES = ["Cinematic", "Dark", "Lighthearted", "Suspenseful", "Emotional", "Epic", "Noir"];
  const LANGUAGES = ["English", "Hindi", "Hinglish", "Urdu"];

  const handleImage = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const generate = async () => {
    if (!prompt.trim()) return;
    if (!apiKey.trim()) { setErrorMsg("Pehle Gemini API key daalo!"); return; }
    setStatus("loading");
    setErrorMsg("");

    try {
      const rawText = await callGemini({ apiKey, prompt, imageFile, numParts, genre, tone, language });
      const parts = parseScriptParts(rawText);

      const newScript = {
        id: uid(),
        prompt: prompt.trim(),
        genre, tone, language,
        parts,
        imageUrl: imagePreview,
        createdAt: new Date().toISOString(),
        raw: rawText,
      };

      setScripts(prev => [newScript, ...prev]);
      setStatus("done");
      setActiveTab("history");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  };

  const deleteScript = (id) => setScripts(prev => prev.filter(s => s.id !== id));

  const totalWords = scripts.reduce((acc, s) => acc + s.parts.reduce((a, p) => a + p.content.split(/\s+/).length, 0), 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        body { background:#030812; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px);} to { opacity:1; transform:none;} }
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:#070d1a; }
        ::-webkit-scrollbar-thumb { background:#1a2744; border-radius:99px; }
        textarea, input, select { font-family:'DM Sans',sans-serif !important; }
        textarea:focus, input:focus, select:focus { outline:none !important; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#030812", color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif" }}>

        {/* Background */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -200, left: "30%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 65%)" }} />
          <div style={{ position: "absolute", bottom: -100, right: "20%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(96,165,250,0.04) 0%, transparent 65%)" }} />
        </div>

        {/* Header */}
        <header style={{
          position: "sticky", top: 0, zIndex: 50,
          background: "rgba(3,8,18,0.92)", backdropFilter: "blur(20px)",
          borderBottom: "1px solid #0f1e3a", padding: "0 28px",
        }}>
          <div style={{ maxWidth: 1000, margin: "0 auto", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>
                🎬
              </div>
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 17, letterSpacing: -0.3 }}>
                Script<span style={{ color: "#f59e0b" }}>AI</span>
              </span>
            </div>

            <nav style={{ display: "flex", gap: 4 }}>
              {[
                { id: "create", label: "✍️ Create" },
                { id: "history", label: `📚 Library (${scripts.length})` },
              ].map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                  padding: "7px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                  background: activeTab === t.id ? "#0f1e3a" : "transparent",
                  color: activeTab === t.id ? "#f59e0b" : "#475569",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                  borderBottom: activeTab === t.id ? "2px solid #f59e0b" : "2px solid transparent",
                  transition: "all 0.15s",
                }}>{t.label}</button>
              ))}
            </nav>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ color: "#334155", fontSize: 12 }}>{totalWords.toLocaleString()} words written</span>
            </div>
          </div>
        </header>

        <main style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 28px", position: "relative", zIndex: 1 }}>

          {/* ── CREATE TAB ── */}
          {activeTab === "create" && (
            <div style={{ animation: "fadeUp 0.3s ease" }}>

              {/* API Key Banner */}
              {!apiKeySet && (
                <div style={{
                  background: "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(239,68,68,0.06))",
                  border: "1px solid rgba(245,158,11,0.25)", borderRadius: 14,
                  padding: "18px 22px", marginBottom: 28,
                  display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap",
                }}>
                  <span style={{ fontSize: 22 }}>🔑</span>
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <p style={{ color: "#f59e0b", fontWeight: 700, fontSize: 14, marginBottom: 3 }}>Gemini API Key Required</p>
                    <p style={{ color: "#64748b", fontSize: 12 }}>aistudio.google.com → Get API Key → Free hai!</p>
                  </div>
                  <div style={{ display: "flex", gap: 8, width: "100%", maxWidth: 440 }}>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={e => setApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      style={{
                        flex: 1, background: "#030812", border: "1px solid #1a2744",
                        borderRadius: 8, color: "#f1f5f9", fontSize: 13,
                        padding: "9px 14px", fontFamily: "monospace",
                      }}
                    />
                    <button
                      onClick={() => { if (apiKey.trim().length > 10) setApiKeySet(true) }}
                      style={{
                        background: "#f59e0b", color: "#000", border: "none", borderRadius: 8,
                        padding: "9px 18px", cursor: "pointer", fontWeight: 700, fontSize: 13,
                        fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap",
                      }}>
                      Save Key
                    </button>
                  </div>
                </div>
              )}

              {apiKeySet && (
                <div style={{
                  background: "rgba(52,211,153,0.07)", border: "1px solid rgba(52,211,153,0.25)",
                  borderRadius: 10, padding: "10px 16px", marginBottom: 24,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ color: "#34d399", fontSize: 13, fontWeight: 600 }}>✅ API Key connected</span>
                  <button onClick={() => { setApiKeySet(false); setApiKey(""); }} style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", fontSize: 12 }}>Change</button>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

                {/* Left Column */}
                <div>
                  {/* Prompt */}
                  <div style={{ background: "#070d1a", border: "1px solid #0f1e3a", borderRadius: 16, padding: 22, marginBottom: 16 }}>
                    <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", display: "block", marginBottom: 10 }}>
                      Script Prompt
                    </label>
                    <textarea
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      placeholder="Ek insaan ki kahani jo apne ghar wapas aata hai 10 saal baad... Ya: A spy discovers his handler is a double agent..."
                      rows={5}
                      style={{
                        width: "100%", background: "#030812", border: "1px solid #0f1e3a",
                        borderRadius: 10, color: "#f1f5f9", fontSize: 14,
                        padding: "12px 14px", resize: "vertical", lineHeight: 1.7,
                        transition: "border-color 0.2s",
                      }}
                      onFocus={e => e.target.style.borderColor = "#f59e0b"}
                      onBlur={e => e.target.style.borderColor = "#0f1e3a"}
                    />
                    <span style={{ color: "#334155", fontSize: 11, display: "block", marginTop: 6, textAlign: "right" }}>{prompt.length} chars</span>
                  </div>

                  {/* Image Upload */}
                  <div style={{ background: "#070d1a", border: "1px solid #0f1e3a", borderRadius: 16, padding: 22, marginBottom: 16 }}>
                    <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", display: "block", marginBottom: 12 }}>
                      Reference Image <span style={{ color: "#334155", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(optional)</span>
                    </label>

                    {!imagePreview ? (
                      <div
                        onDrop={handleDrop}
                        onDragOver={e => e.preventDefault()}
                        onClick={() => fileRef.current?.click()}
                        style={{
                          border: "2px dashed #1a2744", borderRadius: 12,
                          padding: "32px 20px", textAlign: "center", cursor: "pointer",
                          transition: "border-color 0.2s, background 0.2s",
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = "#f59e0b66"; e.currentTarget.style.background = "rgba(245,158,11,0.03)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a2744"; e.currentTarget.style.background = "transparent"; }}
                      >
                        <div style={{ fontSize: 32, marginBottom: 8 }}>🖼️</div>
                        <p style={{ color: "#475569", fontSize: 13 }}>Image drag karo ya click karo</p>
                        <p style={{ color: "#1e3a5f", fontSize: 11, marginTop: 4 }}>PNG, JPG, WEBP • Gemini image analyze karega</p>
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
                      </div>
                    ) : (
                      <div style={{ position: "relative", display: "inline-block" }}>
                        <img src={imagePreview} alt="ref"
                          style={{ maxHeight: 180, maxWidth: "100%", borderRadius: 10, border: "1px solid #1a2744", display: "block" }} />
                        <button onClick={removeImage} style={{
                          position: "absolute", top: 8, right: 8, width: 26, height: 26, borderRadius: "50%",
                          background: "rgba(0,0,0,0.7)", border: "1px solid #334155",
                          color: "#f87171", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center",
                        }}>✕</button>
                        <p style={{ color: "#4ade80", fontSize: 11, marginTop: 8 }}>✅ {imageFile?.name}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Settings */}
                <div>
                  <div style={{ background: "#070d1a", border: "1px solid #0f1e3a", borderRadius: 16, padding: 22, marginBottom: 16 }}>
                    <label style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", display: "block", marginBottom: 16 }}>
                      Script Settings
                    </label>

                    {/* Number of Parts */}
                    <div style={{ marginBottom: 18 }}>
                      <p style={{ color: "#64748b", fontSize: 12, marginBottom: 10, fontWeight: 600 }}>Number of Parts</p>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {[1, 2, 3, 4, 5].map(n => (
                          <button key={n} onClick={() => setNumParts(n)} style={{
                            width: 44, height: 44, borderRadius: 10, border: "none", cursor: "pointer",
                            background: numParts === n ? "#f59e0b" : "#030812",
                            border: numParts === n ? "none" : "1px solid #1a2744",
                            color: numParts === n ? "#000" : "#64748b",
                            fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800,
                            transition: "all 0.15s",
                          }}>{n}</button>
                        ))}
                      </div>
                      <p style={{ color: "#1e3a5f", fontSize: 11, marginTop: 8 }}>
                        {numParts} part{numParts !== 1 ? "s" : ""} = {numParts} chapters/scenes
                      </p>
                    </div>

                    {/* Genre */}
                    <div style={{ marginBottom: 16 }}>
                      <p style={{ color: "#64748b", fontSize: 12, marginBottom: 8, fontWeight: 600 }}>Genre</p>
                      <select value={genre} onChange={e => setGenre(e.target.value)} style={{
                        width: "100%", background: "#030812", border: "1px solid #1a2744",
                        borderRadius: 8, color: "#e2e8f0", padding: "9px 12px", fontSize: 13,
                        cursor: "pointer",
                      }}>
                        {GENRES.map(g => <option key={g}>{g}</option>)}
                      </select>
                    </div>

                    {/* Tone */}
                    <div style={{ marginBottom: 16 }}>
                      <p style={{ color: "#64748b", fontSize: 12, marginBottom: 8, fontWeight: 600 }}>Tone</p>
                      <select value={tone} onChange={e => setTone(e.target.value)} style={{
                        width: "100%", background: "#030812", border: "1px solid #1a2744",
                        borderRadius: 8, color: "#e2e8f0", padding: "9px 12px", fontSize: 13, cursor: "pointer",
                      }}>
                        {TONES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>

                    {/* Language */}
                    <div>
                      <p style={{ color: "#64748b", fontSize: 12, marginBottom: 8, fontWeight: 600 }}>Language</p>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {LANGUAGES.map(l => (
                          <button key={l} onClick={() => setLanguage(l)} style={{
                            padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
                            background: language === l ? "rgba(96,165,250,0.15)" : "#030812",
                            border: language === l ? "1px solid rgba(96,165,250,0.4)" : "1px solid #1a2744",
                            color: language === l ? "#60a5fa" : "#475569",
                            fontSize: 12, fontWeight: language === l ? 700 : 500,
                            transition: "all 0.15s",
                          }}>{l}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div style={{ background: "rgba(245,158,11,0.04)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 12, color: "#64748b", lineHeight: 1.8 }}>
                    <p>📝 <strong style={{ color: "#94a3b8" }}>{numParts} Part</strong> {genre} script</p>
                    <p>🎭 Tone: <strong style={{ color: "#94a3b8" }}>{tone}</strong></p>
                    <p>🌐 Language: <strong style={{ color: "#94a3b8" }}>{language}</strong></p>
                    {imageFile && <p>🖼️ Image: <strong style={{ color: "#4ade80" }}>Attached ✓</strong></p>}
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={generate}
                    disabled={!prompt.trim() || status === "loading" || !apiKeySet}
                    style={{
                      width: "100%", padding: "15px", borderRadius: 12, border: "none",
                      cursor: prompt.trim() && status !== "loading" && apiKeySet ? "pointer" : "not-allowed",
                      background: prompt.trim() && apiKeySet ? "linear-gradient(135deg, #f59e0b, #ef4444)" : "#0f1e3a",
                      color: prompt.trim() && apiKeySet ? "#000" : "#334155",
                      fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 800,
                      transition: "all 0.2s", letterSpacing: 0.3,
                    }}>
                    {status === "loading" ? (
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                        <span style={{ display: "inline-block", animation: "spin 0.8s linear infinite" }}>⟳</span>
                        Generating…
                      </span>
                    ) : "⚡ Generate Script"}
                  </button>

                  {errorMsg && (
                    <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 8, color: "#f87171", fontSize: 12 }}>
                      ❌ {errorMsg}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── HISTORY TAB ── */}
          {activeTab === "history" && (
            <div style={{ animation: "fadeUp 0.3s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                <div>
                  <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: "#f1f5f9", marginBottom: 4 }}>
                    Script Library
                  </h2>
                  <p style={{ color: "#334155", fontSize: 13 }}>
                    {scripts.length} script{scripts.length !== 1 ? "s" : ""} • {totalWords.toLocaleString()} total words
                  </p>
                </div>
                {scripts.length > 0 && (
                  <button onClick={() => setScripts([])} style={{
                    background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)",
                    color: "#f87171", borderRadius: 8, padding: "8px 16px",
                    cursor: "pointer", fontSize: 12, fontWeight: 600,
                  }}>🗑️ Clear All</button>
                )}
              </div>

              {scripts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "80px 0" }}>
                  <div style={{ fontSize: 52, marginBottom: 14, animation: "pulse 2s infinite" }}>🎬</div>
                  <p style={{ color: "#1e3a5f", fontSize: 16, fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>Library empty hai</p>
                  <p style={{ color: "#0f1e3a", fontSize: 13, marginTop: 6 }}>Pehla script generate karo!</p>
                  <button onClick={() => setActiveTab("create")} style={{
                    marginTop: 20, background: "#f59e0b", color: "#000", border: "none",
                    borderRadius: 10, padding: "10px 24px", cursor: "pointer",
                    fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700,
                  }}>✍️ Create Script</button>
                </div>
              ) : (
                scripts.map(s => <ScriptCard key={s.id} script={s} onDelete={deleteScript} />)
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
