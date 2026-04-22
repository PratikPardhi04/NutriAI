import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both fields');
      return;
    }
    setError('');
    // Demo login implementation
    setAuth({ _id: '1', name: 'Demo User' }, 'fake-token', 'fake-refresh');
    navigate('/home');
  };

  return (
    <div className="app-wrapper page-enter flex col items-center justify-center p-6" style={{ minHeight: '100vh', paddingBottom: 0 }}>
      {/* Brand Header */}
      <div className="flex col items-center text-center mb-8">
        <div style={{ width: 48, height: 48, background: 'var(--lime)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0A0F', fontSize: 28 }} className="space-font mb-4">N</div>
        <h1 style={{ fontSize: 22, color: 'var(--text)' }} className="space-font mb-1">NutriAI</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>Your AI nutrition coach</p>
      </div>

      {/* Form Card */}
      <div className="card w-full" style={{ maxWidth: 420, padding: 32, borderRadius: 24 }}>
        <form onSubmit={handleSubmit} className="flex col gap-4">
          <div>
            <label className="input-label">Email address</label>
            <input 
              type="email" 
              className="input-field" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
            {error && !email && <p style={{ color: 'var(--pink)', fontSize: 12, marginTop: 4 }}>Required</p>}
          </div>

          <div style={{ position: 'relative' }}>
            <label className="input-label">Password</label>
            <input 
              type={showPwd ? 'text' : 'password'} 
              className="input-field" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ paddingRight: 40 }}
            />
            <div 
              style={{ position: 'absolute', right: 16, top: 44, color: 'var(--muted)', cursor: 'pointer' }}
              onClick={() => setShowPwd(!showPwd)}
            >
              {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
            {error && !password && <p style={{ color: 'var(--pink)', fontSize: 12, marginTop: 4 }}>Required</p>}
          </div>

          <button type="submit" className="btn-primary mt-4">Sign in</button>
        </form>

        <div className="text-center mt-6" style={{ fontSize: 14 }}>
          <span style={{ color: 'var(--muted)' }}>Don't have an account? </span>
          <Link to="/register" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}>Create one</Link>
        </div>
      </div>
    </div>
  );
}
