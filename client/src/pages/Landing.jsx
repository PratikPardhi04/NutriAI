import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, Zap, ShieldCheck, ArrowLeft } from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../lib/api';

export default function Landing({ initialMode = 'login' }) {
  const [isLogin, setIsLogin] = useState(initialMode !== 'register');
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if(isLogin) {
        const res = await api.post('/auth/login', { email, password });
        setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
        navigate('/home');
      } else {
        const res = await api.post('/auth/register', { name, email, password });
        setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
        localStorage.setItem('justRegistered', 'true');
        navigate('/onboarding');
      }
    } catch (err) {
      console.error('[Auth Error]', err);
      const message = err.response?.data?.message || err.message || 'Authentication failed.';
      setError(message);
    }
  };

  return (
    <div className="landing-layout">
      <style>{`
        .landing-layout { min-height: 100vh; display: flex; background: #0A0A0F; color: #fff; font-family: 'Inter', sans-serif; overflow: hidden; position: relative; }
        
        .l-hero { flex: 1.2; position: relative; padding: 60px; display: flex; flex-direction: column; justify-content: center; }
        .l-auth { flex: 0.8; background: #111118; border-left: 1px solid rgba(255,255,255,0.06); padding: 60px; display: flex; flex-direction: column; justify-content: center; position: relative; z-index: 10; }
        
        .blob-bg { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.2; }
        .bb-1 { top: -10%; left: -10%; width: 500px; height: 500px; background: #A3FF6A; }
        .bb-2 { bottom: -10%; right: 20%; width: 400px; height: 400px; background: #6AF0FF; }

        .l-brand { display: flex; align-items: center; gap: 12px; position: absolute; top: 40px; left: 40px; z-index: 20; }
        .l-logo { width: 32px; height: 32px; background: #A3FF6A; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #0A0A0F; font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px; }
        
        .l-title { font-family: 'Space Grotesk', sans-serif; font-size: 64px; line-height: 1.05; letter-spacing: -1.5px; margin-bottom: 24px; z-index: 10; position: relative; }
        .l-title span { background: linear-gradient(135deg, #A3FF6A, #6AF0FF); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .l-desc { font-size: 18px; color: #A0AAB0; max-width: 500px; line-height: 1.6; margin-bottom: 40px; z-index: 10; position: relative; }

        .l-feat-grid { display: grid; gap: 24px; max-width: 500px; z-index: 10; position: relative; }
        .l-feat { display: flex; gap: 16px; align-items: flex-start; }
        .l-f-ico { width: 48px; height: 48px; border-radius: 12px; background: rgba(163,255,106,0.1); color: #A3FF6A; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .l-f-text h4 { font-family: 'Space Grotesk', sans-serif; font-size: 18px; margin-bottom: 4px; }
        .l-f-text p { font-size: 14px; color: #6B7280; line-height: 1.5; }

        /* Auth Panel styling */
        .auth-container { max-width: 400px; width: 100%; margin: 0 auto; animation: pageIn 300ms ease; }
        .auth-container h2 { font-family: 'Space Grotesk', sans-serif; font-size: 32px; margin-bottom: 8px; }
        .auth-container p { color: #6B7280; margin-bottom: 32px; font-size: 15px; }

        .tab-switcher { display: flex; background: #0A0A0F; border-radius: 12px; padding: 4px; margin-bottom: 32px; border: 1px solid rgba(255,255,255,0.06); }
        .tab { flex: 1; text-align: center; padding: 12px; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: 0.2s; }
        .tab.active { background: #18181F; color: #fff; }
        .tab:not(.active) { color: #6B7280; }

        @media (max-width: 1024px) {
          .landing-layout { flex-direction: column; overflow: auto; }
          .l-hero { padding: 60px 40px 80px; flex: none; justify-content: flex-start; order: 2; }
          .l-title { font-size: 48px; }
          .l-brand { top: 24px; left: 24px; }
          .l-auth { flex: none; padding: 100px 24px 60px; border-left: none; border-bottom: 1px solid rgba(255,255,255,0.06); order: 1; }
        }
      `}</style>

      {/* Brand Logo - Fixed to top left */}
      <Link to="/" className="l-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="l-logo">N</div>
        <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18 }}>NutriAI</div>
      </Link>

      {/* Left side: Hero & Features */}
      <div className="l-hero">
        <div className="blob-bg bb-1" />
        <div className="blob-bg bb-2" />

        <h1 className="l-title">Understand food.<br/><span>Transform health.</span></h1>
        <p className="l-desc">NutriAI uses Anthropic Vision models to instantly calculate exact macros, estimate portions, and provide highly-personalized coaching.</p>
        
        <div className="l-feat-grid">
          <div className="l-feat">
            <div className="l-f-ico"><Camera size={24}/></div>
            <div className="l-f-text"><h4>Instant Scans</h4><p>Remove the guesswork. Just point your camera.</p></div>
          </div>
          <div className="l-feat">
            <div className="l-f-ico"><Zap size={24}/></div>
            <div className="l-f-text"><h4>AI Coach</h4><p>Data-driven advice strictly tuned to your genetics.</p></div>
          </div>
        </div>
      </div>

      {/* Right side: Auth forms */}
      <div className="l-auth">
        <Link to="/" style={{ position: 'absolute', top: 32, right: 32, display: 'flex', alignItems: 'center', gap: 6, color: '#6B7280', textDecoration: 'none', fontSize: 13, fontWeight: 500, transition: '0.2s' }}>
          <ArrowLeft size={16} />
          Back to Home
        </Link>
        <div className="auth-container">
          <div className="tab-switcher">
            <div className={`tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>Sign In</div>
            <div className={`tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>Sign Up</div>
          </div>

          <h2>{isLogin ? 'Welcome back' : 'Create profile'}</h2>
          <p>{isLogin ? 'Sign in to access your nutrition dashboard.' : 'Start tracking your meals effortlessly with AI.'}</p>
          
          <form className="flex col gap-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="input-label">Full Name</label>
                <input required type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="Alex Mercer" />
              </div>
            )}
            <div>
              <label className="input-label">Email address</label>
              <input required type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" />
            </div>
            <div>
              <label className="input-label">Password</label>
              <input required type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            
            {error && <div style={{ color: 'var(--pink)', fontSize: 13, background: 'var(--pink-dim)', padding: '8px 12px', borderRadius: 8 }}>{error}</div>}
            
            <button type="submit" className="btn-primary mt-4">
              {isLogin ? 'Sign In →' : 'Start Onboarding →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
