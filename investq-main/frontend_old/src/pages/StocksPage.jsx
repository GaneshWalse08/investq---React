import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { stocksAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const SECTORS = ['All', 'Technology', 'Financial', 'Healthcare', 'Consumer Cyclical', 'Consumer Staples', 'Utilities', 'Automotive'];

export default function StocksPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('All');
  const [signal, setSignal] = useState('All');
  const [risk, setRisk] = useState(user?.riskTolerance || 'moderate');
  const [esgPref, setEsgPref] = useState(user?.esgPreference || 50);

  const fetchStocks = useCallback(() => {
    setLoading(true);
    stocksAPI.list({ risk, esgPref })
      .then(r => setStocks(r.data))
      .catch(() => setStocks([]))
      .finally(() => setLoading(false));
  }, [risk, esgPref]);

  useEffect(() => { fetchStocks(); }, [fetchStocks]);

  const filtered = stocks.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.symbol?.toLowerCase().includes(q) || s.name?.toLowerCase().includes(q);
    const matchSector = sector === 'All' || s.sector === sector;
    const matchSignal = signal === 'All' || s.signal?.signal === signal;
    return matchSearch && matchSector && matchSignal;
  });

  const signalBg = s => s === 'INVEST' ? 'badge-invest' : s === 'SELL' ? 'badge-sell' : 'badge-hold';

  return (
    <div className="page">
      <div className="flex items-center justify-between mb-24">
        <div>
          <h1>Stocks</h1>
          <p style={{ marginTop: 4 }}>AI-ranked with financial metrics & ESG scores</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select className="form-input" style={{ width: 140 }} value={risk} onChange={e => setRisk(e.target.value)}>
            <option value="conservative">Conservative</option>
            <option value="moderate">Moderate</option>
            <option value="aggressive">Aggressive</option>
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--text3)' }}>
            <span>ESG {esgPref}%</span>
            <input type="range" min={0} max={100} value={esgPref}
              onChange={e => setEsgPref(+e.target.value)}
              style={{ width: 80, accentColor: 'var(--teal)' }} />
          </div>
          <button className="btn btn-primary btn-sm" onClick={fetchStocks}>Apply</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-12 mb-20" style={{ flexWrap: 'wrap' }}>
        <input className="form-input" placeholder="Search symbol or name..." value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 240 }} />
        <select className="form-input" value={sector} onChange={e => setSector(e.target.value)} style={{ width: 180 }}>
          {SECTORS.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className="form-input" value={signal} onChange={e => setSignal(e.target.value)} style={{ width: 140 }}>
          <option value="All">All Signals</option>
          <option value="INVEST">INVEST</option>
          <option value="HOLD">HOLD</option>
          <option value="SELL">SELL</option>
        </select>
        <div style={{ fontSize: '0.82rem', color: 'var(--text3)', alignSelf: 'center' }}>
          {filtered.length} stocks
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>1D Change</th>
                  <th>Ann. Return</th>
                  <th>Volatility</th>
                  <th>Sharpe</th>
                  <th>ESG</th>
                  <th>Signal</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <tr key={s.symbol} onClick={() => navigate(`/stocks/${s.symbol}`)}>
                    <td style={{ color: 'var(--text3)', width: 40 }}>{s.rank || i + 1}</td>
                    <td><strong style={{ color: 'var(--accent2)', fontFamily: 'var(--font-head)', fontSize: '0.95rem' }}>{s.symbol}</strong></td>
                    <td>{s.name}</td>
                    <td style={{ color: 'var(--text)' }}>${s.currentPrice?.toLocaleString()}</td>
                    <td className={s.change >= 0 ? 'up' : 'down'}>{s.change >= 0 ? '+' : ''}{s.change?.toFixed(2)}%</td>
                    <td className={s.metrics?.annualReturn >= 0 ? 'up' : 'down'}>{s.metrics?.annualReturn?.toFixed(1)}%</td>
                    <td style={{ color: s.metrics?.volatility > 35 ? 'var(--red)' : 'var(--text2)' }}>{s.metrics?.volatility?.toFixed(1)}%</td>
                    <td style={{ color: s.metrics?.sharpeRatio > 1 ? 'var(--green)' : 'var(--text2)' }}>{s.metrics?.sharpeRatio?.toFixed(2)}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span className="badge badge-esg" style={{ fontSize: '0.7rem' }}>{s.esgData?.esgRating}</span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{s.esgData?.esgScore?.toFixed(0)}/100</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span className={`badge ${signalBg(s.signal?.signal)}`}>{s.signal?.signal}</span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text3)', marginTop: 2 }}>{s.signal?.confidence?.toFixed(0)}%</div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 50, height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(100, s.rankScore || 0)}%`, height: '100%', background: 'var(--accent)', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text)' }}>{s.rankScore?.toFixed(0)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
