const PLANS = [
  {
    name: 'Free',
    price: '$0',
    credits: 5,
    features: ['5 videos/month', '720p quality', 'Portrait only', 'Community support'],
    accent: '#4ade80',
  },
  {
    name: 'Pro',
    price: '$19',
    credits: 100,
    features: ['100 videos/month', '1080p quality', 'All aspect ratios', 'Priority queue', 'Email support'],
    accent: '#f59e0b',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '$99',
    credits: 9999,
    features: ['Unlimited videos', '4K quality', 'All aspect ratios', 'Dedicated queue', 'API access', 'SLA support'],
    accent: '#a78bfa',
  },
]

export default function Plans({ currentPlan, setCurrentPlan, setCredits }) {
  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>Subscription Plans</h2>
        <p style={{ color: '#64748b', fontSize: 14 }}>Upgrade karke aur videos generate karo.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
        {PLANS.map(plan => (
          <div key={plan.name} style={{
            background: '#0f172a',
            border: `1px solid ${plan.popular ? plan.accent + '55' : '#1e293b'}`,
            borderRadius: 20, padding: 28, position: 'relative',
            boxShadow: plan.popular ? `0 0 30px ${plan.accent}18` : 'none',
          }}>
            {plan.popular && (
              <div style={{
                position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
                background: plan.accent, color: '#000', fontSize: 11, fontWeight: 800,
                padding: '4px 16px', borderRadius: 99, letterSpacing: 1, whiteSpace: 'nowrap',
              }}>⭐ MOST POPULAR</div>
            )}

            <div style={{ marginBottom: 22 }}>
              <h3 style={{ color: plan.accent, fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
                {plan.name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ color: '#f1f5f9', fontSize: 34, fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>{plan.price}</span>
                <span style={{ color: '#475569', fontSize: 13 }}>/month</span>
              </div>
            </div>

            <ul style={{ listStyle: 'none', padding: 0, marginBottom: 26 }}>
              {plan.features.map(f => (
                <li key={f} style={{ color: '#94a3b8', fontSize: 13, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: plan.accent, fontWeight: 700 }}>✓</span> {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => { setCurrentPlan(plan.name); setCredits(plan.credits) }}
              style={{
                width: '100%', padding: '13px', borderRadius: 10,
                border: `1px solid ${plan.accent}`,
                cursor: 'pointer',
                background: currentPlan === plan.name ? plan.accent : 'transparent',
                color: currentPlan === plan.name ? '#000' : plan.accent,
                fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700,
                transition: 'all 0.2s',
              }}>
              {currentPlan === plan.name ? '✓ Current Plan' : `Choose ${plan.name}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
