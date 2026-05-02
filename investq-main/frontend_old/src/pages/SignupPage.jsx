import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function SignupPage() {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', riskTolerance: 'moderate', esgPreference: 50 });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await signup(form);
    if (res.ok) navigate('/dashboard');
    else setError(res.error);
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-up" style={{ width: 480 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--purple) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 22, color: '#fff'
          }}>IQ</div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: 6 }}>Create your account</h1>
          <p style={{ fontSize: '0.9rem' }}>Personalized AI-driven investing starts here</p>
        </div>

        {error && (
          <div style={{ background: 'var(--red-bg)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--red)', fontSize: '0.85rem', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-2" style={{ gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Username</label>
              <input className="form-input" placeholder="johndoe" value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 12 }}>
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Min 6 characters" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} minLength={6} required />
          </div>

          <div className="grid grid-2" style={{ gap: 12 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Risk Tolerance</label>
              <select className="form-input" value={form.riskTolerance}
                onChange={e => setForm(f => ({ ...f, riskTolerance: e.target.value }))}>
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">ESG Preference: {form.esgPreference}%</label>
              <input type="range" min={0} max={100} value={form.esgPreference}
                onChange={e => setForm(f => ({ ...f, esgPreference: +e.target.value }))}
                style={{ width: '100%', marginTop: 14, accentColor: 'var(--teal)' }} />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: 20 }}>
            {loading ? 'Creating account...' : 'Get Started'}
          </button>
        </form>

        <div className="divider" />
        <p style={{ textAlign: 'center', fontSize: '0.88rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent2)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
