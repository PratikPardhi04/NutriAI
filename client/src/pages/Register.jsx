import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const getStrengthScore = () => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password)) score += 1;
    return score;
  };
  const score = getStrengthScore();
  const getStrengthColor = () => {
    if (password.length === 0) return 'var(--raised)';
    if (password.length < 8) return 'var(--pink)';
    if (score === 1) return 'var(--amber)';
    return 'var(--lime)';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(password !== confirm) return alert("Passwords don't match");
    // Simulate register success -> goto onboarding
    localStorage.setItem('justRegistered', 'true');
    navigate('/onboarding');
  };

  return (
    <div className="app-wrapper page-enter flex col items-center justify-center p-6" style={{ minHeight: '100vh', paddingBottom: 0 }}>
      {/* Brand Header */}
      <div className="flex col items-center text-center mb-8">
        <div style={{ width: 48, height: 48, background: 'var(--lime)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0A0F', fontSize: 28 }} className="space-font mb-4">N</div>
        <h1 style={{ fontSize: 22, color: 'var(--text)' }} className="space-font mb-1">NutriAI</h1>
        <p style={{ fontSize: 14, color: 'var(--muted)' }}>Create your account</p>
      </div>

      {/* Form Card */}
      <div className="card w-full" style={{ maxWidth: 420, padding: 32, borderRadius: 24 }}>
        <form onSubmit={handleSubmit} className="flex col gap-4">
          <div>
            <label className="input-label">Full name</label>
            <input required type="text" className="input-field" value={name} onChange={e => setName(e.target.value)} placeholder="Alex Mercer" />
          </div>

          <div>
            <label className="input-label">Email address</label>
            <input required type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" />
          </div>

          <div>
            <label className="input-label">Password</label>
            <input required type="password" className="input-field" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 99, marginTop: 12, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: password.length > 0 ? `${(score || 0.5) * 33.33}%` : '0%', background: getStrengthColor(), transition: 'all 0.3s' }} />
            </div>
          </div>

          <div>
            <label className="input-label">Confirm password</label>
            <input required type="password" className="input-field" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" />
          </div>

          <button type="submit" className="btn-primary mt-4">Create account</button>
        </form>

        <div className="text-center mt-6" style={{ fontSize: 14 }}>
          <span style={{ color: 'var(--muted)' }}>Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--text)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
