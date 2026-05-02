import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(form.email, form.password);
    if (res.ok) navigate('/dashboard');
    else setError(res.error);
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-up">
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--purple) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 22, color: '#fff'
          }}>IQ</div>
          <h1 style={{ fontSize: '1.6rem', marginBottom: 6 }}>Welcome back</h1>
          <p style={{ fontSize: '0.9rem' }}>Sign in to your InvestIQ account</p>
        </div>

        {error && (
          <div style={{ background: 'var(--red-bg)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 'var(--radius)', padding: '10px 14px', color: 'var(--red)', fontSize: '0.85rem', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
          </div>
          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="divider" />
        <p style={{ textAlign: 'center', fontSize: '0.88rem' }}>
          No account? <Link to="/signup" style={{ color: 'var(--accent2)', textDecoration: 'none', fontWeight: 500 }}>Create one</Link>
        </p>
        <div style={{ marginTop: 16, padding: '12px', background: 'var(--surface)', borderRadius: 'var(--radius)', fontSize: '0.78rem', color: 'var(--text3)' }}>
          <strong style={{ color: 'var(--text2)' }}>Demo:</strong> signup with any email/password to get started.
        </div>
      </div>
    </div>
  );
}
