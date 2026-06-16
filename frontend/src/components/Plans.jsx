import { useState } from 'react'
import axios from 'axios'
import API_URL from '../config'

const PLANS = [
  {
    id: 'Free',
    name: 'Starter',
    price: '₹0',
    period: 'forever',
    credits: 5,
    color: '#3a5068',
    accent: '#4a7a9b',
    features: [
      '5 Video Credits',
      'Standard Rendering',
      '9:16 Portrait Mode',
      'Script Generator',
      'Community Support',
    ],
  },
  {
    id: 'Pro',
    name: 'Pro',
    price: '₹10',
    period: 'one-time',
    credits: 50,
    color: '#38bdf8',
    accent: '#0ea5e9',
    badge: 'Most Popular',
    features: [
      '50 Video Credits',
      'Priority Rendering',
      'All Aspect Ratios',
      'Image Generator',
      'Voice Generator',
      'Email Support',
    ],
  },
  {
    id: 'Enterprise',
    name: 'Enterprise',
    price: '₹499',
    period: 'one-time',
    credits: 200,
    color: '#a855f7',
    accent: '#7c3aed',
    badge: 'Best Value',
    features: [
      '200 Video Credits',
      'Ultra HD Output',
      'Commercial Rights',
      'All Pro Features',
      'Reels Generator',
      'Priority Support',
    ],
  },
]

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
  @keyframes pl-fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
  @keyframes pl-fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes pl-pulse  { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes pl-spin   { to{transform:rotate(360deg)} }
  @keyframes pl-modalIn { from{opacity:0;transform:scale(0.95) translateY(10px)} to{opacity:1;transform:none} }

  .pl-root { font-family:'Outfit',sans-serif; max-width:900px; margin:0 auto; animation:pl-fadeUp 0.3s ease; color:#e2eaf6; }

  /* Header */
  .pl-header { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:16px; margin-bottom:10px; }
  .pl-title { font-size:30px; font-weight:800; letter-spacing:-0.5px; background:linear-gradient(135deg,#e2eaf6 0%,#7dd3fc 60%,#38bdf8 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; line-height:1.15; }
  .pl-subtitle { font-size:14px; color:#4a5f7a; margin-top:6px; }

  .pl-active-badge { display:flex; align-items:center; gap:7px; padding:7px 16px; border-radius:100px; border:1px solid rgba(56,189,248,0.25); background:rgba(56,189,248,0.06); font-size:13px; font-weight:600; color:#7dd3fc; flex-shrink:0; }
  .pl-active-dot { width:6px; height:6px; border-radius:50%; background:#38bdf8; box-shadow:0 0 7px #38bdf8; animation:pl-pulse 2s ease infinite; }

  /* Plans grid */
  .pl-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-top:28px; }

  .pl-card {
    background:#0b1520; border-radius:20px; padding:24px;
    display:flex; flex-direction:column; justify-content:space-between;
    position:relative; overflow:hidden; transition:transform 0.2s, box-shadow 0.2s;
    border:1px solid #1a2535;
  }
  .pl-card:hover { transform:translateY(-3px); }
  .pl-card.active { border-width:1.5px; }
  .pl-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; opacity:0.7; }

  .pl-badge { position:absolute; top:16px; right:16px; font-size:10px; font-weight:800; letter-spacing:1px; text-transform:uppercase; padding:3px 10px; border-radius:100px; }

  .pl-plan-name { font-size:13px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; margin-bottom:6px; }
  .pl-price { font-size:36px; font-weight:800; font-family:'Space Mono',monospace; letter-spacing:-1px; line-height:1.1; margin-bottom:4px; }
  .pl-period { font-size:11px; color:#2e4255; font-family:'Space Mono',monospace; margin-bottom:20px; }
  .pl-credits { display:flex; align-items:center; gap:8px; padding:10px 14px; border-radius:10px; margin-bottom:18px; }
  .pl-credits-num { font-size:18px; font-weight:800; font-family:'Space Mono',monospace; }
  .pl-credits-lbl { font-size:12px; color:#3a5068; font-weight:500; }

  .pl-features { list-style:none; padding:0; margin:0 0 22px; flex:1; }
  .pl-feature { display:flex; align-items:center; gap:10px; font-size:13px; color:#3a5068; padding:5px 0; border-bottom:1px solid #0f1c2e; }
  .pl-feature:last-child { border-bottom:none; }
  .pl-feature.active-feat { color:#8ca9c4; }
  .pl-check { width:18px; height:18px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:900; flex-shrink:0; }

  .pl-btn {
    width:100%; padding:14px; border-radius:12px; border:none; cursor:pointer;
    font-family:'Outfit',sans-serif; font-size:14px; font-weight:800;
    letter-spacing:0.3px; transition:all 0.22s; display:flex;
    align-items:center; justify-content:center; gap:8px;
  }
  .pl-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none !important; box-shadow:none !important; }
  .pl-btn.current { background:#0f1c2e; color:#2e4255; cursor:default; }
  .pl-btn.buy { color:#fff; }
  .pl-btn.buy:hover { transform:translateY(-1px); }

  /* Modal overlay */
  .pl-overlay { position:fixed; inset:0; background:rgba(2,5,12,0.88); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); z-index:9999; display:flex; align-items:center; justify-content:center; padding:20px; animation:pl-fadeIn 0.2s ease; }

  .pl-modal { background:#0b1520; border-radius:22px; padding:28px; max-width:360px; width:100%; text-align:center; position:relative; animation:pl-modalIn 0.3s ease; border:1px solid rgba(56,189,248,0.2); }
  .pl-modal::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,#38bdf8,transparent); border-radius:22px 22px 0 0; }

  .pl-modal-title { font-size:18px; font-weight:800; color:#e2eaf6; margin-bottom:4px; }
  .pl-modal-sub { font-size:12.5px; color:#2e4255; margin-bottom:20px; }

  .pl-qr-wrap { background:#fff; padding:12px; border-radius:14px; display:inline-block; box-shadow:0 4px 24px rgba(0,0,0,0.5); margin-bottom:18px; }
  .pl-qr-img { display:block; width:220px; height:220px; }

  .pl-amount-row { margin-bottom:6px; }
  .pl-amount-label { font-size:12px; color:#2e4255; margin-bottom:4px; }
  .pl-amount-value { font-size:28px; font-weight:800; color:#4ade80; font-family:'Space Mono',monospace; }
  .pl-ref { font-size:10px; color:#1e3048; font-family:'Space Mono',monospace; margin-top:4px; margin-bottom:20px; }

  .pl-verify-btn { width:100%; padding:14px; border-radius:12px; border:none; cursor:pointer; font-family:'Outfit',sans-serif; font-size:14px; font-weight:800; margin-bottom:10px; background:linear-gradient(135deg,#0ea5e9,#2563eb); color:#fff; box-shadow:0 3px 14px rgba(14,165,233,0.3); transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:8px; }
  .pl-verify-btn:hover { transform:translateY(-1px); box-shadow:0 5px 20px rgba(14,165,233,0.45); }
  .pl-verify-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; box-shadow:none; }

  .pl-close-btn { width:100%; padding:11px; border-radius:12px; border:1px solid #1a2535; background:transparent; color:#3a5068; cursor:pointer; font-family:'Outfit',sans-serif; font-size:13px; font-weight:600; transition:all 0.2s; }
  .pl-close-btn:hover { border-color:#243650; color:#7dd3fc; }

  .pl-spinner { width:15px; height:15px; border:2px solid rgba(255,255,255,0.25); border-top-color:#fff; border-radius:50%; animation:pl-spin 0.8s linear infinite; }

  /* Success toast */
  .pl-toast { position:fixed; bottom:28px; left:50%; transform:translateX(-50%); background:#0b1520; border:1px solid rgba(74,222,128,0.3); border-radius:14px; padding:14px 24px; display:flex; align-items:center; gap:10px; z-index:10000; animation:pl-fadeUp 0.3s ease; box-shadow:0 8px 32px rgba(0,0,0,0.5); white-space:nowrap; }

  @media(max-width:700px) {
    .pl-grid { grid-template-columns:1fr; }
    .pl-card { padding:20px; }
    .pl-title { font-size:24px; }
  }
`

const getQRUrl = (upiPayload) =>
  `https://chart.googleapis.com/chart?cht=qr&chs=280x280&chl=${encodeURIComponent(upiPayload)}`

export default function Plans({ currentPlan, setCurrentPlan, setCredits, userEmail }) {
  const [loading, setLoading] = useState(null) // which plan is loading
  const [toast, setToast] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  const handleBuy = async (plan) => {
    if (plan.id === 'Free' || plan.id === currentPlan) return
    
    // Fallback email if userEmail is not passed in props
    const emailToUse = userEmail || localStorage.getItem('userEmail') || 'user@veostudio.com'

    setLoading(plan.id)
    try {
      const res = await axios.post(`${API_URL}/api/payment/initiate`, {
        planId: plan.id,
        email: emailToUse,
      })
      
      if (res.data.success && res.data.payment_session_id) {
        // Dynamic import to avoid SSR issues if this was Next.js, but safe here anyway
        const { load } = await import('@cashfreepayments/cashfree-js')
        const cashfree = await load({ mode: 'production' })

        let checkoutOptions = {
          paymentSessionId: res.data.payment_session_id,
          redirectTarget: '_modal'
        }

        cashfree.checkout(checkoutOptions).then((result) => {
          if (result.error) {
            showToast('❌ Payment failed or cancelled.')
            setLoading(null)
          }
          if (result.redirect) {
            // Payment is done
          }
          if (result.paymentDetails) {
            verifyPayment(res.data.order_id, plan.id, emailToUse, plan.credits)
          }
        })
      }
    } catch (err) {
      showToast('❌ Payment gateway error. Try again.')
      setLoading(null)
    }
  }

  const verifyPayment = async (orderId, planId, email, creditsToAdd) => {
    try {
      const res = await axios.post(`${API_URL}/api/payment/verify`, {
        orderId,
        planId,
        email
      })
      if (res.data.success && res.data.status === 'SUCCESS') {
        setCredits(prev => prev + creditsToAdd)
        setCurrentPlan(planId)
        showToast(`🎉 Payment verified! ${creditsToAdd} credits added.`)
      } else {
        showToast('⏳ Payment not confirmed yet. Try again in a moment.')
      }
    } catch {
      showToast('❌ Verification failed. Please contact support.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <style>{css}</style>
      <div className="pl-root">

        {/* Header */}
        <div className="pl-header">
          <div>
            <h1 className="pl-title">Plans & Pricing</h1>
            <p className="pl-subtitle">Top up your credits with a one-time purchase — no subscriptions</p>
          </div>
          <div className="pl-active-badge">
            <span className="pl-active-dot" />
            {currentPlan} Plan
          </div>
        </div>

        {/* Plans grid */}
        <div className="pl-grid">
          {PLANS.map(plan => {
            const isActive = currentPlan === plan.id
            return (
              <div
                key={plan.id}
                className={`pl-card ${isActive ? 'active' : ''}`}
                style={{
                  borderColor: isActive ? plan.color : '#1a2535',
                  boxShadow: isActive ? `0 0 30px ${plan.color}18` : 'none',
                }}
              >
                {/* Top color line */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${plan.color}, transparent)`, opacity: isActive ? 0.9 : 0.3 }} />

                {/* Popular badge */}
                {plan.badge && (
                  <div className="pl-badge" style={{ background: `${plan.color}18`, color: plan.color, border: `1px solid ${plan.color}40` }}>
                    {plan.badge}
                  </div>
                )}

                <div>
                  {/* Plan name */}
                  <div className="pl-plan-name" style={{ color: plan.color }}>{plan.name}</div>

                  {/* Price */}
                  <div className="pl-price" style={{ color: '#e2eaf6' }}>{plan.price}</div>
                  <div className="pl-period">{plan.period}</div>

                  {/* Credits chip */}
                  <div className="pl-credits" style={{ background: `${plan.color}0f`, border: `1px solid ${plan.color}28` }}>
                    <span className="pl-credits-num" style={{ color: plan.color }}>{plan.credits}</span>
                    <span className="pl-credits-lbl">video credits</span>
                  </div>

                  {/* Features */}
                  <ul className="pl-features">
                    {plan.features.map((f, i) => (
                      <li key={i} className={`pl-feature ${isActive ? 'active-feat' : ''}`}>
                        <div className="pl-check" style={{ background: `${plan.color}18`, color: plan.color }}>✓</div>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Button */}
                <button
                  className={`pl-btn ${isActive ? 'current' : 'buy'}`}
                  style={!isActive ? {
                    background: `linear-gradient(135deg, ${plan.accent}, ${plan.color})`,
                    boxShadow: `0 4px 18px ${plan.color}30`,
                  } : {}}
                  onClick={() => handleBuy(plan)}
                  disabled={isActive || loading === plan.id}
                >
                  {loading === plan.id
                    ? <><div className="pl-spinner" /> Processing…</>
                    : isActive
                      ? '✓ Current Plan'
                      : plan.id === 'Free' ? 'Free Forever' : `Buy for ${plan.price}`
                  }
                </button>
              </div>
            )
          })}
        </div>

        {/* Toast notification */}
        {toast && (
          <div className="pl-toast">
            <span style={{ fontSize: 14, color: '#e2eaf6', fontWeight: 600 }}>{toast}</span>
          </div>
        )}

      </div>
    </>
  )
}