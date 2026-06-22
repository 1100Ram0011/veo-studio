import { useState } from 'react'

function StatusBadge({ status }) {
  const map = {
    completed: { color: '#4ade80', bg: 'rgba(74,222,128,0.1)', label: 'Completed' },
    generating: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'Generating' },
    failed: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', label: 'Failed' },
  }
  const s = map[status] || map.completed
  return (
    <span style={{ color: s.color, background: s.bg, border: `1px solid ${s.color}33`, borderRadius: 6, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>
      {s.label}
    </span>
  )
}

export default function History({ history }) {
  const [search, setSearch] = useState('')
  const filtered = history.filter(h => h.prompt.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>Video History</h2>
          <p style={{ color: '#64748b', fontSize: 14 }}>{history.length} total generations</p>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search prompts…"
          style={{
            background: '#0f172a', border: '1px solid #1e293b', borderRadius: 10,
            color: '#f1f5f9', fontSize: 14, padding: '10px 16px', outline: 'none',
            fontFamily: "'DM Sans', sans-serif", width: 220,
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#334155' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
          <p style={{ fontSize: 16 }}>Koi video nahi mili. Pehli video generate karo!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(item => (
            <div key={item.id} style={{
              background: '#0f172a', border: '1px solid #1e293b', borderRadius: 14,
              padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 18,
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#334155'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1e293b'}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 10, background: '#1e293b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, flexShrink: 0,
              }}>🎥</div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#e2e8f0', fontSize: 14, fontWeight: 500, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.prompt}
                </p>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <StatusBadge status={item.status} />
                  <span style={{ color: '#475569', fontSize: 12 }}>
                    {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <span style={{ color: '#334155', fontSize: 11, background: '#1e293b', padding: '2px 8px', borderRadius: 4 }}>
                    {item.aspect?.replace('VIDEO_ASPECT_RATIO_', '').toLowerCase()}
                  </span>
                </div>
              </div>

              {item.url && (
                <a href={item.url} download target="_blank" rel="noreferrer"
                  style={{ color: '#f59e0b', fontSize: 13, fontWeight: 600, textDecoration: 'none', flexShrink: 0, padding: '8px 14px', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8 }}>
                  ↓ Download
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
 
