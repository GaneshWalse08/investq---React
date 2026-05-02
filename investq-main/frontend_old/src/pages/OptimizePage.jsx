import React, { useState } from 'react';
import { portfolioAPI } from '../services/api';
import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceDot
} from 'recharts';

const ALL_SYMBOLS = ['AAPL','MSFT','GOOGL','AMZN','TSLA','NVDA','JPM','JNJ','NEE','COST','V','MA','UNH','HD','PG'];

export default function OptimizePage() {
  const [selected, setSelected] = useState(['AAPL', 'MSFT', 'NVDA', 'JNJ']);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleSymbol = (s) => {
    setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const optimize = async () => {
    if (selected.length < 2) return;
    setLoading(true);
    try {
      const r = await portfolioAPI.optimize({ symbols: selected });
      setResult(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const { optimalPortfolio: opt, minVolatilityPortfolio: mv, simulation: sim } = result || {};
  const scatterData = sim ? sim.volatilities.map((v, i) => ({
    vol: v, ret: sim.returns[i], sharpe: sim.sharpes[i]
  })) : [];

  return (
    <div className="page">
      <div className="mb-24">
        <h1>MPT Optimizer</h1>
        <p style={{ marginTop: 4 }}>Modern Portfolio Theory — maximize Sharpe ratio across your selected assets</p>
      </div>

      <div className="grid grid-2" style={{ gap: 20, alignItems: 'start' }}>
        <div>
          <div className="card mb-20">
            <h3 className="mb-16">Select Assets ({selected.length} chosen)</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {ALL_SYMBOLS.map(s => (
                <button key={s} onClick={() => toggleSymbol(s)}
                  style={{
                    padding: '6px 14px', borderRadius: 8, border: '1px solid',
                    cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'var(--font-head)', fontWeight: 600,
                    transition: 'all 0.15s',
                    background: selected.includes(s) ? 'var(--accent-glow)' : 'var(--surface)',
                    color: selected.includes(s) ? 'var(--accent2)' : 'var(--text3)',
                    borderColor: selected.includes(s) ? 'rgba(79,142,247,0.4)' : 'var(--border)',
                  }}>
                  {s}
                </button>
              ))}
            </div>

            <button className="btn btn-primary btn-block btn-lg" onClick={optimize} disabled={loading || selected.length < 2}>
              {loading ? 'Optimizing...' : `Optimize ${selected.length} Assets`}
            </button>
            {selected.length < 2 && <p style={{ fontSize: '0.8rem', color: 'var(--red)', marginTop: 8, textAlign: 'center' }}>Select at least 2 assets</p>}
          </div>

          {opt && (
            <div className="card">
              <h3 className="mb-16" style={{ color: 'var(--accent2)' }}>Optimal Portfolio (Max Sharpe)</h3>
              <div className="grid grid-3 mb-16">
                {[
                  { l: 'Expected Return', v: `${opt.expectedReturn?.toFixed(2)}%`, c: 'var(--green)' },
                  { l: 'Volatility', v: `${opt.volatility?.toFixed(2)}%`, c: 'var(--amber)' },
                  { l: 'Sharpe', v: opt.sharpeRatio?.toFixed(3), c: 'var(--accent)' },
                ].map(m => (
                  <div key={m.l} style={{ textAlign: 'center', padding: '12px', background: 'var(--surface)', borderRadius: 'var(--radius)' }}>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.2rem', color: m.c }}>{m.v}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: 4 }}>{m.l}</div>
                  </div>
                ))}
              </div>
              <h4 className="mb-12">Optimal Weights</h4>
              {Object.entries(opt.weights || {}).sort((a, b) => b[1] - a[1]).map(([sym, w]) => (
                <div key={sym} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.83rem' }}>
                    <strong style={{ color: 'var(--accent2)', fontFamily: 'var(--font-head)' }}>{sym}</strong>
                    <span style={{ color: 'var(--text)' }}>{(w * 100).toFixed(1)}%</span>
                  </div>
                  <div className="progress">
                    <div className="progress-bar" style={{ width: `${w * 100}%`, background: 'var(--accent)' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {mv && (
            <div className="card mt-16">
              <h3 className="mb-12" style={{ color: 'var(--teal)' }}>Min Volatility Portfolio</h3>
              <div className="grid grid-2">
                <div style={{ textAlign: 'center', padding: 12, background: 'var(--surface)', borderRadius: 'var(--radius)' }}>
                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--green)' }}>{mv.expectedReturn?.toFixed(2)}%</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: 4 }}>Expected Return</div>
                </div>
                <div style={{ textAlign: 'center', padding: 12, background: 'var(--surface)', borderRadius: 'var(--radius)' }}>
                  <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--teal)' }}>{mv.volatility?.toFixed(2)}%</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: 4 }}>Volatility</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Efficient Frontier */}
        <div className="card">
          <h3 className="mb-16">Efficient Frontier (Monte Carlo)</h3>
          {!result ? (
            <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: '0.88rem' }}>
              Run optimization to see frontier
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
                <XAxis dataKey="vol" name="Volatility %" label={{ value: 'Volatility (%)', position: 'insideBottom', offset: -10, fill: 'var(--text3)', fontSize: 12 }} tick={{ fill: 'var(--text3)', fontSize: 11 }} domain={['auto', 'auto']} />
                <YAxis dataKey="ret" name="Return %" label={{ value: 'Return (%)', angle: -90, position: 'insideLeft', fill: 'var(--text3)', fontSize: 12 }} tick={{ fill: 'var(--text3)', fontSize: 11 }} domain={['auto', 'auto']} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }}
                  formatter={(v, n) => [v.toFixed(2) + '%', n]} />
                <Scatter data={scatterData} fill="var(--accent)" opacity={0.4} r={3} />
                {opt && (
                  <ReferenceDot x={opt.volatility} y={opt.expectedReturn} r={8} fill="var(--green)" stroke="#fff" strokeWidth={2} label={{ value: 'Max Sharpe', position: 'top', fill: 'var(--green)', fontSize: 11 }} />
                )}
                {mv && (
                  <ReferenceDot x={mv.volatility} y={mv.expectedReturn} r={8} fill="var(--teal)" stroke="#fff" strokeWidth={2} label={{ value: 'Min Vol', position: 'top', fill: 'var(--teal)', fontSize: 11 }} />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          )}
          <p style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: 12 }}>
            Each dot = a random portfolio. Green = max Sharpe, Teal = minimum volatility.
          </p>
        </div>
      </div>
    </div>
  );
}
