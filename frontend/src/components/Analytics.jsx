const ASPECT_RATIOS = [
  { label: 'Portrait', value: 'VIDEO_ASPECT_RATIO_PORTRAIT' },
  { label: 'Landscape', value: 'VIDEO_ASPECT_RATIO_LANDSCAPE' },
  { label: 'Square', value: 'VIDEO_ASPECT_RATIO_SQUARE' },
]

export default function Analytics({ history }) {
  const total = history.length
  const completed = history.filter(h => h.status === 'completed').length
  const failed = history.filter(h => h.status === 'failed').length
  const successRate = total > 0 ? Math.round((completed / total) * 100) : 0

  const byAspect = ASPECT_RATIOS.map(r => ({
    label: r.label,
    count: history.filter(h => h.aspect === r.value).length,
  }))
  const maxCount = Math.max(...byAspect.map(b => b.count), 1)

  const stats = [
    { label: 'Total Generated', value: total, color: '#a78bfa', icon: '🎬' },
    { label: 'Completed', value: completed, color: '#4ade80', icon: '✅' },
    { label: 'Failed', value: failed, color: '#f87171', icon: '❌' },
    { label: 'Success Rate', value: `${successRate}%`, color: '#f59e0b', icon: '📈' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>Analytics</h2>
        <p style={{ color: '#64748b', fontSize: 14 }}>Tumhari usage stats ek nazar mein.</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        {stats.map(stat => (
          <div key={stat.label} style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: 22 }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{stat.icon}</div>
            <div style={{ color: stat.color, fontSize: 30, fontWeight: 800, fontFamily: "'Syne', sans-serif", marginBottom: 4 }}>
              {stat.value}
            </div>
            <div style={{ color: '#475569', fontSize: 13 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Aspect Ratio Chart */}
      <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 16, padding: 24 }}>
        <h3 style={{ color: '#94a3b8', fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 20 }}>
          Aspect Ratio Breakdown
        </h3>
        {byAspect.map(b => (
          <div key={b.label} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ color: '#94a3b8', fontSize: 13 }}>{b.label}</span>
              <span style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>{b.count} videos</span>
            </div>
            <div style={{ height: 8, background: '#1e293b', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(b.count / maxCount) * 100}%`,
                background: 'linear-gradient(90deg, #a78bfa, #f59e0b)',
                borderRadius: 99, transition: 'width 0.8s ease',
                minWidth: b.count > 0 ? 16 : 0,
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
