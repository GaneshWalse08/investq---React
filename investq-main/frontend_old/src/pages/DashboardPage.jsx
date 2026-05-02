import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import {
  LineChart, Line, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis
} from 'recharts';

function FearGreedGauge({ value, label }) {
  const color = value > 65 ? 'var(--red)' : value > 45 ? 'var(--amber)' : 'var(--green)';
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 120, height: 60, margin: '0 auto 12px' }}>
        <svg viewBox="0 0 120 60" style={{ width: '100%' }}>
          <path d="M10 55 A50 50 0 0 1 110 55" fill="none" stroke="var(--surface2)" strokeWidth="10" strokeLinecap="round" />
          <path d="M10 55 A50 50 0 0 1 110 55" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${(value / 100) * 157} 157`} />
          <text x="60" y="52" textAnchor="middle" fill="var(--text)" fontSize="18" fontWeight="800" fontFamily="Syne">{value}</text>
        </svg>
      </div>
      <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, color, fontSize: '0.95rem' }}>{label}</div>
      <div className="label" style={{ marginTop: 4 }}>Fear & Greed Index</div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.get()
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const signalColor = s => s === 'INVEST' ? 'var(--green)' : s === 'SELL' ? 'var(--red)' : 'var(--amber)';
  const signalBg = s => s === 'INVEST' ? 'badge-invest' : s === 'SELL' ? 'badge-sell' : 'badge-hold';

  return (
    <div className="page">
      {/* Header */}
      <div className="flex items-center justify-between mb-32">
        <div>
          <h1>Dashboard</h1>
          <p style={{ marginTop: 4 }}>Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.username} 👋</p>
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text3)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : !data ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <p>Backend offline. Start the Flask server on port 5000.</p>
          <div style={{ marginTop: 12, padding: 12, background: 'var(--surface)', borderRadius: 8, fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--text3)' }}>
            cd backend && pip install -r requirements.txt && python app.py
          </div>
        </div>
      ) : (
        <>
          {/* Top stats row */}
          <div className="grid grid-4 mb-24">
            <div className="card card-sm">
              <FearGreedGauge value={data.marketSentiment?.fearGreedIndex || 55}
                label={data.marketSentiment?.fearGreedLabel || 'Neutral'} />
            </div>

            <div className="card card-sm">
              <div className="stat">
                <div className="stat-label">Market Mood</div>
                <div className="stat-value" style={{ color: data.marketSentiment?.marketMood === 'Bullish' ? 'var(--green)' : data.marketSentiment?.marketMood === 'Bearish' ? 'var(--red)' : 'var(--amber)' }}>
                  {data.marketSentiment?.marketMood || 'Neutral'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>Based on NLP sentiment</div>
              </div>
            </div>

            <div className="card card-sm">
              <div className="stat">
                <div className="stat-label">Your Profile</div>
                <div className="stat-value" style={{ fontSize: '1.1rem' }}>{user?.riskTolerance?.charAt(0).toUpperCase() + user?.riskTolerance?.slice(1)}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>ESG weight: {user?.esgPreference}%</div>
              </div>
            </div>

            <div className="card card-sm">
              <div className="stat">
                <div className="stat-label">Tracking</div>
                <div className="stat-value">15</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>stocks analyzed</div>
              </div>
            </div>
          </div>

          {/* Top Stocks */}
          <div className="card mb-24">
            <div className="flex items-center justify-between mb-16">
              <h2>AI Top Picks</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate('/stocks')}>View all →</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Change</th>
                    <th>Signal</th>
                    <th>ESG</th>
                    <th>Sharpe</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topStocks?.map(s => (
                    <tr key={s.symbol} onClick={() => navigate(`/stocks/${s.symbol}`)}>
                      <td><strong style={{ color: 'var(--accent2)', fontFamily: 'var(--font-head)' }}>{s.symbol}</strong></td>
                      <td>{s.name}</td>
                      <td style={{ color: 'var(--text)' }}>${s.price?.toLocaleString()}</td>
                      <td className={s.change >= 0 ? 'up' : 'down'}>{s.change >= 0 ? '+' : ''}{s.change?.toFixed(2)}%</td>
                      <td><span className={`badge ${signalBg(s.signal)}`}>{s.signal}</span></td>
                      <td><span className="badge badge-esg">{s.esgRating}</span></td>
                      <td style={{ color: s.sharpe > 1 ? 'var(--green)' : 'var(--text2)' }}>{s.sharpe?.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid grid-3">
            {[
              { title: 'Explore Stocks', desc: 'AI-ranked with ESG & signals', path: '/stocks', color: 'var(--accent)' },
              { title: 'Build Portfolio', desc: 'Construct & analyze holdings', path: '/portfolio', color: 'var(--purple)' },
              { title: 'MPT Optimizer', desc: 'Maximize Sharpe ratio', path: '/optimize', color: 'var(--teal)' },
            ].map(c => (
              <div key={c.path} className="card" style={{ cursor: 'pointer', borderColor: 'transparent', transition: 'all 0.2s' }}
                onClick={() => navigate(c.path)}
                onMouseEnter={e => e.currentTarget.style.borderColor = c.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}>
                <div style={{ width: 40, height: 4, background: c.color, borderRadius: 2, marginBottom: 14 }} />
                <h3>{c.title}</h3>
                <p style={{ fontSize: '0.85rem', marginTop: 6 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
