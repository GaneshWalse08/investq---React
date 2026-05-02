import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const NAV = [
  { to: '/dashboard', icon: '⬡', label: 'Dashboard' },
  { to: '/stocks', icon: '◈', label: 'Stocks' },
  { to: '/portfolio', icon: '◎', label: 'Portfolio' },
  { to: '/optimize', icon: '⬢', label: 'Optimize' },
  { to: '/sentiment', icon: '◉', label: 'Sentiment' },
  { to: '/profile', icon: '◐', label: 'Profile' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-layout">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
        />
      )}

      <aside className={`sidebar${mobileOpen ? ' open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--purple) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 16, color: '#fff'
            }}>IQ</div>
            <div>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.05rem', color: 'var(--text)' }}>InvestIQ</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text3)', letterSpacing: '0.05em' }}>AI Platform</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 'var(--radius)',
                marginBottom: 4,
                textDecoration: 'none',
                color: isActive ? 'var(--accent2)' : 'var(--text2)',
                background: isActive ? 'var(--accent-glow)' : 'transparent',
                fontWeight: isActive ? 500 : 400,
                fontSize: '0.9rem',
                transition: 'all 0.15s',
                border: isActive ? '1px solid rgba(79,142,247,0.2)' : '1px solid transparent',
              })}
            >
              <span style={{ fontSize: '1.1rem', opacity: 0.85 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', marginBottom: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--purple) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 12, color: '#fff', flexShrink: 0
            }}>
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.username}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text3)', textTransform: 'capitalize' }}>{user?.riskTolerance} investor</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm btn-block" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        {/* Mobile topbar */}
        <div style={{ display: 'none', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg2)', alignItems: 'center', justifyContent: 'space-between' }} className="mobile-topbar">
          <span style={{ fontFamily: 'var(--font-head)', fontWeight: 800, color: 'var(--text)' }}>InvestIQ</span>
          <button
            onClick={() => setMobileOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: 20 }}
          >☰</button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
