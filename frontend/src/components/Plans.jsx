import { useState } from 'react'
import axios from 'axios'
import API_URL from '../config'

const PLANS = [
  {
    id: 'Free',
    name: 'STARTER',
    price: '₹0',
    period: 'Forever',
    creditsBox: '5 daily credits',
    icon: '★',
    color: 'bg-slate-200/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800',
    iconColor: 'bg-[#8b5cf6]/20 text-[#a855f7]',
    buttonText: 'Free Forever',
    buttonColor: 'bg-slate-50 dark:bg-[#121826] hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800',
    features: [
      { text: '5 Video Credits', active: true },
      { text: '2 Audio Credits', active: true },
      { text: '5 AI Voice Credits', active: true },
      { text: '10 Image Generations', active: true },
      { text: 'Basic Features', active: true },
      { text: 'Community Support', active: false },
    ],
  },
  {
    id: 'Pro',
    name: 'PRO',
    price: '₹10',
    period: '/month\nBilled monthly',
    creditsBox: '50 monthly credits',
    icon: '🔥',
    badge: 'POPULAR',
    color: 'bg-white dark:bg-[#0b101d] border-[#1e40af] shadow-[0_0_30px_rgba(30,64,175,0.2)]',
    iconColor: 'bg-[#3b82f6]/20 text-[#60a5fa]',
    badgeColor: 'bg-[#3b82f6] text-white',
    buttonText: 'Buy for ₹10',
    buttonColor: 'bg-gradient-to-r from-[#2563eb] to-[#3b82f6] hover:opacity-90 text-white',
    features: [
      { text: '50 Video Credits', active: true },
      { text: '25 Audio Credits', active: true },
      { text: '20 AI Voice Credits', active: true },
      { text: 'Image Generator', active: true },
      { text: 'All AI Features', active: true },
      { text: 'Priority Processing', active: true },
      { text: 'Email Support', active: true },
    ],
  },
  {
    id: 'Enterprise',
    name: 'ENTERPRISE',
    price: '₹499',
    period: '/month\nBilled monthly',
    creditsBox: '2000 monthly credits',
    icon: '👑',
    badge: 'BEST VALUE',
    color: 'bg-white dark:bg-[#0b101d] border-[#6b21a8]',
    iconColor: 'bg-[#8b5cf6]/20 text-[#c084fc]',
    badgeColor: 'bg-[#8b5cf6] text-white',
    buttonText: 'Buy for ₹499',
    buttonColor: 'bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] hover:opacity-90 text-white',
    features: [
      { text: '2000 Video Credits', active: true },
      { text: 'Unlimited Audio Credits', active: true },
      { text: 'Unlimited AI Voice Credits', active: true },
      { text: 'Advanced AI Models', active: true },
      { text: 'Commercial Rights', active: true },
      { text: 'Priority Processing', active: true },
      { text: '24/7 VIP Support', active: true },
    ],
  },
]

export default function Plans({ currentPlan, setCurrentPlan, setCredits, userEmail }) {
  const [loading, setLoading] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 4000)
  }

  const handleBuy = async (plan) => {
    if (plan.id === 'Free' || plan.id === currentPlan) return
    
    const emailToUse = userEmail || localStorage.getItem('userEmail') || 'user@veostudio.com'

    setLoading(plan.id)
    try {
      const res = await axios.post(`${API_URL}/api/payment/initiate`, {
        planId: plan.id,
        email: emailToUse,
      })
      
      if (res.data.success && res.data.payment_session_id) {
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
          if (result.paymentDetails) {
            // Assume 50 credits for Pro, 2000 for Enterprise based on UI
            const creditsToAdd = plan.id === 'Pro' ? 50 : 2000;
            verifyPayment(res.data.order_id, plan.id, emailToUse, creditsToAdd)
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
    <div className="w-full max-w-[1200px] mx-auto animate-[fadeSlide_0.3s_ease] text-slate-800 dark:text-slate-200">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
            Plans & Pricing
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Choose the perfect plan to unlock the power of VeoStudio AI</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#1e1b4b]/50 border border-[#8b5cf6]/30 dark:border-[#8b5cf6]/30 text-[#c084fc] rounded-xl text-xs font-bold transition-colors">
          <span>✨</span> Save up to 40%
        </button>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {PLANS.map(plan => {
          const isPro = plan.id === 'Pro';
          return (
            <div
              key={plan.id}
              className={`relative flex flex-col bg-white dark:bg-[#0b101d] border ${isPro ? 'border-[#1e40af] shadow-[0_0_30px_rgba(30,64,175,0.2)]' : 'border-slate-200 dark:border-slate-800/80'} rounded-[24px] p-6 lg:p-8 transition-all duration-300`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className={`absolute -top-3 right-6 px-3 py-1 text-[10px] font-bold rounded-lg ${plan.badgeColor}`}>
                  {plan.badge}
                </div>
              )}

              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={`text-xs font-black tracking-widest uppercase mb-4 ${isPro ? 'text-[#60a5fa]' : plan.id === 'Enterprise' ? 'text-[#c084fc]' : 'text-slate-600 dark:text-slate-400'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-end gap-1 mb-2">
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white leading-none">{plan.price}</span>
                    {plan.period.split('\n')[0] && <span className="text-xs text-slate-500 dark:text-slate-500 font-medium mb-1">{plan.period.split('\n')[0]}</span>}
                  </div>
                  {plan.period.split('\n')[1] ? (
                    <div className="text-[11px] text-slate-500 dark:text-slate-500">{plan.period.split('\n')[1]}</div>
                  ) : (
                    <div className="text-[11px] text-slate-500 dark:text-slate-500">{plan.period}</div>
                  )}
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${plan.iconColor}`}>
                  {plan.icon}
                </div>
              </div>

              {/* Credits Box */}
              <div className="w-full bg-slate-50 dark:bg-[#121826] border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-6">
                {plan.creditsBox}
              </div>

              {/* Features */}
              <ul className="flex-1 space-y-4 mb-8">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs">
                    {f.active ? (
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${isPro ? 'bg-[#3b82f6] text-white' : plan.id === 'Enterprise' ? 'bg-[#8b5cf6] text-white' : 'bg-[#8b5cf6] text-white'}`}>
                        ✓
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-500 dark:text-slate-500">
                        —
                      </div>
                    )}
                    <span className={f.active ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-500'}>{f.text}</span>
                  </li>
                ))}
              </ul>

              {/* Button */}
              <button
                onClick={() => handleBuy(plan)}
                disabled={loading === plan.id || currentPlan === plan.id}
                className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all flex justify-center items-center gap-2 ${plan.buttonColor}`}
              >
                {loading === plan.id ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  currentPlan === plan.id ? 'Current Plan' : plan.buttonText
                )}
              </button>
            </div>
          )
        })}
      </div>

      {/* Trust Badges */}
      <div className="w-full bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-[20px] p-6 lg:px-10 flex flex-col md:flex-row justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#8b5cf6]/10 text-[#a855f7] flex items-center justify-center text-lg">🛡️</div>
          <div>
            <div className="text-[11px] font-bold text-slate-900 dark:text-white mb-0.5">Secure & Safe</div>
            <div className="text-[9px] text-slate-500 dark:text-slate-500 leading-tight">Your data is encrypted<br/>and fully protected.</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#8b5cf6]/10 text-[#a855f7] flex items-center justify-center text-lg">🚫</div>
          <div>
            <div className="text-[11px] font-bold text-slate-900 dark:text-white mb-0.5">Cancel Anytime</div>
            <div className="text-[9px] text-slate-500 dark:text-slate-500 leading-tight">No lock-in. Cancel or<br/>upgrade anytime.</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#8b5cf6]/10 text-[#a855f7] flex items-center justify-center text-lg">🔄</div>
          <div>
            <div className="text-[11px] font-bold text-slate-900 dark:text-white mb-0.5">Instant Access</div>
            <div className="text-[9px] text-slate-500 dark:text-slate-500 leading-tight">Credits are added<br/>instantly after upgrade.</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#8b5cf6]/10 text-[#a855f7] flex items-center justify-center text-lg">✅</div>
          <div>
            <div className="text-[11px] font-bold text-slate-900 dark:text-white mb-0.5">Satisfaction Guaranteed</div>
            <div className="text-[9px] text-slate-500 dark:text-slate-500 leading-tight">Not satisfied? Get a full<br/>refund within 7 days.</div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-10">
        
        {/* FAQs */}
        <div className="md:col-span-8 bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-[24px] p-6 lg:p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h3>
            <button className="text-[11px] font-semibold text-[#a855f7] hover:text-[#c084fc] transition-colors">View all FAQs →</button>
          </div>
          <div className="flex flex-col divide-y divide-slate-800">
            <div className="py-4 flex justify-between items-center cursor-pointer group">
              <span className="text-[13px] text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:text-white transition-colors">Do unused credits roll over to the next month?</span>
              <span className="text-slate-500 dark:text-slate-500 group-hover:text-slate-900 dark:text-white transition-colors">›</span>
            </div>
            <div className="py-4 flex justify-between items-center cursor-pointer group">
              <span className="text-[13px] text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:text-white transition-colors">Can I upgrade or downgrade my plan anytime?</span>
              <span className="text-slate-500 dark:text-slate-500 group-hover:text-slate-900 dark:text-white transition-colors">›</span>
            </div>
            <div className="py-4 flex justify-between items-center cursor-pointer group">
              <span className="text-[13px] text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:text-white transition-colors">What payment methods do you accept?</span>
              <span className="text-slate-500 dark:text-slate-500 group-hover:text-slate-900 dark:text-white transition-colors">›</span>
            </div>
          </div>
        </div>

        {/* Extra Credits */}
        <div className="md:col-span-4 bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-[24px] p-6 lg:p-8 relative overflow-hidden flex flex-col justify-center items-center text-center">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#8b5cf6]/10 blur-3xl rounded-full pointer-events-none" />
          
          <div className="w-24 h-24 mb-4 relative z-10">
            {/* 3D Wallet SVG representation */}
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
              <rect x="15" y="30" width="70" height="50" rx="8" fill="#7c3aed" />
              <path d="M15,45 Q50,60 85,45 L85,72 Q50,85 15,72 Z" fill="#6d28d9" />
              <rect x="70" y="45" width="20" height="10" rx="3" fill="#4c1d95" />
              <circle cx="85" cy="50" r="3" fill="#a855f7" />
              {/* Coins */}
              <circle cx="30" cy="20" r="8" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
              <circle cx="45" cy="15" r="6" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
              <circle cx="20" cy="35" r="10" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
            </svg>
          </div>

          <div className="relative z-10">
            <h3 className="text-[13px] font-bold text-slate-900 dark:text-white mb-2">Need more credits?</h3>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 mb-6 px-4">Top up your credits anytime and use them instantly.</p>
            <button className="px-6 py-2.5 rounded-lg border border-[#8b5cf6]/50 hover:bg-[#8b5cf6]/10 text-[#c084fc] text-[11px] font-bold transition-colors">
              Buy Extra Credits
            </button>
          </div>
        </div>

      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-2xl px-6 py-3 flex items-center gap-3 z-[10000] shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-[fadeSlide_0.3s_ease]">
          <span className="text-sm text-slate-700 dark:text-slate-200 font-semibold">{toast}</span>
        </div>
      )}

    </div>
  )
} 
