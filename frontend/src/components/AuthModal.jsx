import { useState } from 'react';
import axios from 'axios';
import API_URL from '../config';

export default function AuthModal({ onAuthSuccess, onClose, initialMode = 'login' }) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin ? { email, password } : { name, email, password };
    
    try {
      const res = await axios.post(`${API_URL}${endpoint}`, payload);
      if (res.data.success) {
        localStorage.setItem('veo_token', res.data.token);
        localStorage.setItem('userEmail', res.data.user.email);
        onAuthSuccess(res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-xl z-[999999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-[420px] bg-white dark:bg-gradient-to-b dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-sky-500/20 rounded-3xl p-8 sm:p-10 text-slate-900 dark:text-slate-200 shadow-[0_24px_64px_rgba(0,0,0,0.1)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.6)] relative overflow-hidden animate-[modalFadeIn_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards]"
        onClick={e => e.stopPropagation()}
      >
        {/* Background glow */}
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] hidden dark:block bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.08),transparent_60%)] pointer-events-none z-0" />

        {onClose && (
          <button 
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 dark:text-slate-500 dark:bg-white/5 dark:hover:bg-white/10 dark:text-slate-400 dark:hover:text-slate-900 dark:text-white flex items-center justify-center transition-all z-10"
            onClick={onClose} 
            aria-label="Close"
          >
            ✕
          </button>
        )}

        <div className="text-center mb-8 relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/30 transform hover:scale-105 transition-all">
              <span className="text-3xl font-bold ml-1">▶</span>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-indigo-300 bg-clip-text text-transparent">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {isLogin ? 'Sign in to continue generating masterpieces' : 'Join VeoStudio and unlock premium generation'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm text-center mb-5 relative z-10 flex items-center justify-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form className="relative z-10 flex flex-col gap-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-field border-slate-200 bg-slate-50 focus:bg-white dark:border-slate-800 dark:bg-slate-900/50"
              required
            />
          )}
          
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input-field border-slate-200 bg-slate-50 focus:bg-white dark:border-slate-800 dark:bg-slate-900/50"
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input-field border-slate-200 bg-slate-50 focus:bg-white dark:border-slate-800 dark:bg-slate-900/50"
            required
          />
          
          <button type="submit" className="btn-primary mt-2 flex items-center justify-center gap-2" disabled={loading}>
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-500 relative z-10">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <span 
            className="text-blue-600 dark:text-sky-400 font-semibold cursor-pointer hover:text-blue-500 dark:hover:text-sky-300 transition-colors"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </span>
        </div>
      </div>
    </div>
  );
}
 
