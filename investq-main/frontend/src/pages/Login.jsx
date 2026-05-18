import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        const res = await api.post('/auth/register', { username, email, password });
        if (res.data.success) {
          localStorage.setItem('esg_user', JSON.stringify(res.data.user));
          navigate('/dashboard');
        } else {
          setError(res.data.message);
        }
      } else {
        const res = await api.post('/auth/login', { username, password });
        if (res.data.success) {
          localStorage.setItem('esg_user', JSON.stringify(res.data.user));
          navigate('/dashboard');
        } else {
          setError(res.data.message);
        }
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to the server. Is Python Flask running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%', background: 'var(--paper)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem' }}>
        
        <div className="sidebar-logo" style={{ textAlign: 'center', border: 'none', marginBottom: '1rem', padding: 0 }}>
          ESG<span>Vision</span>
        </div>
        
        <h2 style={{ textAlign: 'center', marginBottom: '0.3rem', fontFamily: 'DM Serif Display', fontSize: '1.8rem' }}>
          {isRegistering ? 'Create account' : 'Welcome back'}
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--smoke)', fontSize: '0.9rem', marginBottom: '1.8rem' }}>
          {isRegistering ? 'Start your sustainable investing journey' : 'Sign in to your ESGVision account'}
        </p>
        
        {error && <div style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fca5a5', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)' }}>Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1.5px solid var(--border)', marginTop: '0.4rem', fontFamily: 'inherit' }}
              placeholder={isRegistering ? "john_doe" : "demo_investor"}
              required
            />
          </div>

          {isRegistering && (
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)' }}>Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1.5px solid var(--border)', marginTop: '0.4rem', fontFamily: 'inherit' }}
                placeholder="john@email.com"
                required
              />
            </div>
          )}
          
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)' }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1.5px solid var(--border)', marginTop: '0.4rem', fontFamily: 'inherit' }}
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ background: 'var(--moss)', color: '#fff', padding: '0.85rem', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', marginTop: '0.5rem', fontSize: '1rem' }}
          >
            {loading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '0.9rem', color: 'var(--smoke)' }}>
          {isRegistering ? "Already have an account? " : "Don't have an account? "}
          <span 
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }} 
            style={{ color: 'var(--moss)', fontWeight: 600, cursor: 'pointer' }}
          >
            {isRegistering ? 'Sign In' : 'Register'}
          </span>
        </div>

      </div>
    </div>
  );
}