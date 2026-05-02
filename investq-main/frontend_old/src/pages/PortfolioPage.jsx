import React, { useState } from 'react';
import { portfolioAPI } from '../services/api';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Legend
} from 'recharts';

const SYMBOLS = ['AAPL','MSFT','GOOGL','AMZN','TSLA','NVDA','JPM','JNJ','NEE','COST','V','MA','UNH','HD','PG'];
const COLORS = ['#4f8ef7','#a78bfa','#34d399','#fbbf24','#f87171','#2dd4bf','#f59e0b','#6ba3ff','#818cf8','#10b981'];

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState({});
  const [newSymbol, setNewSymbol] = useState('AAPL');
  const [newValue, setNewValue] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [backtest, setBacktest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('build');

  const addHolding = () => {
    if (!newSymbol || !newValue || isNaN(+newValue) || +newValue <= 0) return;
    setHoldings(h => ({ ...h, [newSymbol]: (+newValue) + (h[newSymbol] || 0) }));
    setNewValue('');
  };

  const removeHolding = (sym) => setHoldings(h => { const n = { ...h }; delete n[sym]; return n; });

  const totalValue = Object.values(holdings).reduce((a, b) => a + b, 0);
  const symbols = Object.keys(holdings);

  const analyze = async () => {
    if (symbols.length < 1) return;
    setLoading(true);
    try {
      const r = await portfolioAPI.analyze({ holdings });
      setAnalysis(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const runBacktest = async () => {
    if (symbols.length < 1) return;
    setLoading(true);
    const weights = {};
    symbols.forEach(s => { weights[s] = holdings[s] / totalValue; });
    try {
      const r = await portfolioAPI.backtest({ weights });
      setBacktest(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const pieData = symbols.map(s => ({ name: s, value: holdings[s] }));
  const btChartData = backtest ? backtest.portfolioValues.map((v, i) => ({
    i, portfolio: v, sp500: backtest.spValues[i]
  })).filter((_, i) => i % 2 === 0) : [];

  return (
    <div className="page">
      <div className="flex items-center justify-between mb-24">
        <div><h1>Portfolio Builder</h1><p style={{ marginTop: 4 }}>Construct, analyze & backtest your holdings</p></div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg2)', padding: 4, borderRadius: 'var(--radius)', width: 'fit-content', border: '1px solid var(--border)' }}>
        {['build', 'analyze', 'backtest'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.88rem', fontWeight: 500, transition: 'all 0.15s', textTransform: 'capitalize',
              background: tab === t ? 'var(--accent)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--text2)',
            }}>{t}</button>
        ))}
      </div>

      {tab === 'build' && (
        <div className="grid grid-2" style={{ gap: 20, alignItems: 'start' }}>
          <div>
            <div className="card mb-20">
              <h3 className="mb-16">Add Holdings</h3>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <select className="form-input" value={newSymbol} onChange={e => setNewSymbol(e.target.value)} style={{ flex: 1 }}>
                  {SYMBOLS.map(s => <option key={s}>{s}</option>)}
                </select>
                <input className="form-input" type="number" placeholder="Value ($)" value={newValue}
                  onChange={e => setNewValue(e.target.value)} style={{ width: 140 }} />
                <button className="btn btn-primary" onClick={addHolding}>Add</button>
              </div>

              {symbols.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text3)', fontSize: '0.88rem' }}>
                  Add stocks to build your portfolio
                </div>
              ) : (
                <>
                  {symbols.map(s => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <strong style={{ color: 'var(--accent2)', fontFamily: 'var(--font-head)', width: 50 }}>{s}</strong>
                        <span style={{ color: 'var(--text3)', fontSize: '0.82rem' }}>{((holdings[s] / totalValue) * 100).toFixed(1)}%</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <strong style={{ color: 'var(--text)' }}>${holdings[s].toLocaleString()}</strong>
                        <button className="btn btn-ghost btn-sm" onClick={() => removeHolding(s)} style={{ color: 'var(--red)', borderColor: 'transparent', padding: '4px 8px' }}>✕</button>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontWeight: 600, color: 'var(--text)' }}>
                    <span>Total Value</span>
                    <span>${totalValue.toLocaleString()}</span>
                  </div>
                </>
              )}
            </div>

            {symbols.length > 0 && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" onClick={analyze} disabled={loading} style={{ flex: 1 }}>
                  {loading ? 'Analyzing...' : 'Analyze Portfolio'}
                </button>
                <button className="btn btn-ghost" onClick={runBacktest} disabled={loading} style={{ flex: 1 }}>
                  Run Backtest
                </button>
              </div>
            )}
          </div>

          {/* Pie chart */}
          {pieData.length > 0 && (
            <div className="card">
              <h3 className="mb-16">Allocation</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} paddingAngle={2}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => [`$${v.toLocaleString()}`, '']} contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                {pieData.map((d, i) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.78rem', color: 'var(--text2)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                    {d.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'analyze' && (
        <div>
          {!analysis ? (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <p>Build a portfolio first, then click "Analyze Portfolio".</p>
              <button className="btn btn-ghost btn-sm mt-16" onClick={() => setTab('build')}>← Go to Build</button>
            </div>
          ) : (
            <div className="grid grid-3">
              {[
                { label: 'Expected Return', value: `${analysis.metrics?.expectedReturn?.toFixed(2)}%`, color: 'var(--green)' },
                { label: 'Portfolio Volatility', value: `${analysis.metrics?.volatility?.toFixed(2)}%`, color: 'var(--amber)' },
                { label: 'Sharpe Ratio', value: analysis.metrics?.sharpeRatio?.toFixed(3), color: 'var(--accent)' },
                { label: 'Max Drawdown', value: `${analysis.metrics?.maxDrawdown?.toFixed(2)}%`, color: 'var(--red)' },
                { label: 'ESG Score', value: `${analysis.esgScore?.toFixed(1)}/100`, color: 'var(--teal)' },
                { label: 'Total Value', value: `$${analysis.totalValue?.toLocaleString()}`, color: 'var(--purple)' },
              ].map(m => (
                <div key={m.label} className="card card-sm">
                  <div className="stat-label">{m.label}</div>
                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.6rem', color: m.color, marginTop: 6 }}>{m.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'backtest' && (
        <div>
          {!backtest ? (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <p>Build a portfolio first, then click "Run Backtest".</p>
              <button className="btn btn-ghost btn-sm mt-16" onClick={() => setTab('build')}>← Go to Build</button>
            </div>
          ) : (
            <>
              <div className="grid grid-3 mb-24">
                {[
                  { label: 'Portfolio Return', value: `${backtest.totalReturn?.toFixed(2)}%`, color: backtest.totalReturn >= 0 ? 'var(--green)' : 'var(--red)' },
                  { label: 'S&P 500 Return', value: `${backtest.spReturn?.toFixed(2)}%`, color: 'var(--text2)' },
                  { label: 'Alpha', value: `${backtest.alpha?.toFixed(2)}%`, color: backtest.alpha >= 0 ? 'var(--green)' : 'var(--red)' },
                ].map(m => (
                  <div key={m.label} className="card card-sm">
                    <div className="stat-label">{m.label}</div>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.6rem', color: m.color, marginTop: 6 }}>{m.value}</div>
                  </div>
                ))}
              </div>
              <div className="card">
                <h3 className="mb-16">Portfolio vs S&P 500</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={btChartData}>
                    <defs>
                      <linearGradient id="btPort" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="i" hide />
                    <YAxis domain={['auto', 'auto']} tick={{ fill: 'var(--text3)', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} formatter={v => [`${v.toFixed(2)}`, '']} />
                    <Legend wrapperStyle={{ color: 'var(--text2)', fontSize: 12 }} />
                    <Area type="monotone" dataKey="portfolio" name="Your Portfolio" stroke="var(--accent)" fill="url(#btPort)" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="sp500" name="S&P 500" stroke="var(--text3)" fill="none" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
