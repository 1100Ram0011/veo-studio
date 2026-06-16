import { useState } from 'react';
import axios from 'axios';
import API_URL from '../config';

const modalStyles = `
  .auth-overlay {
    position: fixed;
    inset: 0;
    background: rgba(3,7,18,0.98);
    backdrop-filter: blur(24px);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }
  .auth-card {
    max-width: 400px;
    width: 100%;
    background: #0b1520;
    border: 1px solid rgba(56,189,248,0.3);
    border-radius: 20px;
    padding: 30px;
    color: #e2eaf6;
    font-family: 'Outfit', sans-serif;
  }
  .auth-input {
    width: 100%;
    padding: 12px;
    margin-bottom: 15px;
    border-radius: 8px;
    border: 1px solid #1a2535;
    background: #050a12;
    color: #fff;
  }
  .auth-btn {
    width: 100%;
    padding: 14px;
    border-radius: 10px;
    background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);
    color: #fff;
    font-weight: bold;
    border: none;
    cursor: pointer;
  }
  .toggle-auth {
    margin-top: 15px;
    text-align: center;
    font-size: 13px;
    color: #7dd3fc;
    cursor: pointer;
  }
`;

export default function AuthModal({ onAuthSuccess, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
      setError(err.response?.data?.error || 'Authentication failed');
    }
  };

  return (
    <>
      <style>{modalStyles}</style>
      <div className="auth-overlay">
        <div className="auth-card">
          <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>
            {isLogin ? 'Login to Continue' : 'Create an Account'}
          </h2>
          {error && <div style={{ color: '#ef4444', marginBottom: '10px', textAlign: 'center' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="auth-input"
                required
              />
            )}
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="auth-input"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="auth-input"
              required
            />
            <button type="submit" className="auth-btn">
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>
          <div className="toggle-auth" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </div>
          {onClose && (
            <div style={{ marginTop: '15px', textAlign: 'center', cursor: 'pointer', color: '#64748b' }} onClick={onClose}>
              Cancel
            </div>
          )}
        </div>
      </div>
    </>
  );
}
