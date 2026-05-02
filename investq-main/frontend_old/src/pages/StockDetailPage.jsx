import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { stocksAPI } from '../services/api';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, BarChart, Bar
} from 'recharts';

export default function StockDetailPage() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    stocksAPI.get(symbol)
      .then(r => setStock(r.data))
      .catch(() => setStock(null))
      .finally(() => setLoading(false));
  }, [symbol]);

  if (loading) return <div className="page"><div className="loading-center"><div className="spinner" /></div></div>;
  if (!stock) return <div className="page"><div className="card"><p>Stock not found.</p></div></div>;

  const { metrics, esgData, signal, sentiment, prices } = stock;
  const priceData = (prices || []).map((p, i) => ({ i, price: p }));
  const signalBg = s => s === 'INVEST' ? 'badge-invest' : s === 'SELL' ? 'badge-sell' : 'badge-hold';
  const signalColor = s => s === 'INVEST' ? 'var(--green)' : s === 'SELL' ? 'var(--red)' : 'var(--amber)';

  const radarData = [
    { metric: 'Return', value: Math.max(0, Math.min(100, (metrics?.annualReturn || 0) + 20)) },
    { metric: 'Low Risk', value: Math.max(0, 100 - (metrics?.volatility || 50)) },
    { metric: 'Sharpe', value: Math.max(0, Math.min(100, (metrics?.sharpeRatio || 0) * 40)) },
    { metric: 'ESG', value: esgData?.esgScore || 50 },
    { metric: 'Drawdown', value: Math.max(0, 100 + (metrics?.maxDrawdown || -50) * 1.5) },
  ];

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 12 }}>← Back</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--purple) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 18, color: '#fff'
            }}>{symbol[0]}</div>
            <div>
              <h1 style={{ fontSize: '1.8rem' }}>{symbol}</h1>
              <p style={{ marginTop: 2 }}>{stock.name} · {stock.sector}</p>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '2rem', color: 'var(--text)' }}>
            ${stock.currentPrice?.toLocaleString()}
          </div>
          <div className={stock.change >= 0 ? 'up' : 'down'} style={{ fontSize: '1rem', fontWeight: 600 }}>
            {stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Signal banner */}
      <div className="card mb-24" style={{ borderColor: signalColor(signal?.signal), background: signal?.signal === 'INVEST' ? 'rgba(52,211,153,0.05)' : signal?.signal === 'SELL' ? 'rgba(248,113,113,0.05)' : 'rgba(251,191,36,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div className="label mb-4">AI Signal</div>
            <span className={`badge ${signalBg(signal?.signal)}`} style={{ fontSize: '1rem', padding: '6px 16px' }}>{signal?.signal}</span>
          </div>
          <div style={{ width: 1, height: 40, background: 'var(--border)' }} />
          <div>
            <div className="label mb-4">Confidence</div>
            <strong style={{ color: 'var(--text)', fontSize: '1.1rem' }}>{signal?.confidence?.toFixed(1)}%</strong>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="label mb-8">Why this signal?</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {signal?.reasons?.map(r => (
                <span key={r} style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: 999, background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid rgba(52,211,153,0.2)' }}>✓ {r}</span>
              ))}
              {signal?.warnings?.map(w => (
                <span key={w} style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: 999, background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid rgba(248,113,113,0.2)' }}>⚠ {w}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-2 mb-24" style={{ gap: 20 }}>
        {/* Price Chart */}
        <div className="card">
          <h3 className="mb-16">Price (30 days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={priceData}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="i" hide />
              <YAxis domain={['auto', 'auto']} hide />
              <Tooltip formatter={v => [`$${v.toFixed(2)}`, 'Price']} contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="price" stroke="var(--accent)" fill="url(#priceGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div className="card">
          <h3 className="mb-16">Performance Radar</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--text3)', fontSize: 11 }} />
              <Radar dataKey="value" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-3 mb-24">
        {/* Financial metrics */}
        <div className="card">
          <h3 className="mb-16">Financial Metrics</h3>
          {[
            { label: 'Annual Return', value: `${metrics?.annualReturn?.toFixed(2)}%`, color: metrics?.annualReturn >= 0 ? 'var(--green)' : 'var(--red)' },
            { label: 'Volatility', value: `${metrics?.volatility?.toFixed(2)}%`, color: metrics?.volatility > 35 ? 'var(--red)' : 'var(--amber)' },
            { label: 'Sharpe Ratio', value: metrics?.sharpeRatio?.toFixed(3), color: metrics?.sharpeRatio > 1 ? 'var(--green)' : 'var(--text2)' },
            { label: 'Max Drawdown', value: `${metrics?.maxDrawdown?.toFixed(2)}%`, color: 'var(--red)' },
            { label: 'Beta', value: metrics?.beta?.toFixed(3), color: 'var(--text2)' },
            { label: 'Total Return', value: `${metrics?.totalReturn?.toFixed(2)}%`, color: metrics?.totalReturn >= 0 ? 'var(--green)' : 'var(--red)' },
          ].map(m => (
            <div key={m.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text3)' }}>{m.label}</span>
              <strong style={{ color: m.color, fontSize: '0.88rem' }}>{m.value}</strong>
            </div>
          ))}
        </div>

        {/* ESG */}
        <div className="card">
          <h3 className="mb-16">ESG Profile</h3>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <span className="badge badge-esg" style={{ fontSize: '1.1rem', padding: '8px 20px' }}>{esgData?.esgRating}</span>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '2rem', color: 'var(--teal)', marginTop: 8 }}>{esgData?.esgScore?.toFixed(0)}</div>
            <div className="label">Overall ESG Score</div>
          </div>
          {[
            { label: 'Environmental', value: esgData?.environmentScore, color: 'var(--green)' },
            { label: 'Social', value: esgData?.socialScore, color: 'var(--accent)' },
            { label: 'Governance', value: esgData?.governanceScore, color: 'var(--purple)' },
          ].map(e => (
            <div key={e.label} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.82rem' }}>
                <span style={{ color: 'var(--text3)' }}>{e.label}</span>
                <span style={{ color: e.color, fontWeight: 600 }}>{e.value}</span>
              </div>
              <div className="progress">
                <div className="progress-bar" style={{ width: `${e.value}%`, background: e.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* Sentiment */}
        <div className="card">
          <h3 className="mb-16">News Sentiment</h3>
          {sentiment && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, padding: '12px', background: 'var(--surface)', borderRadius: 'var(--radius)' }}>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.4rem', color: sentiment.marketMood === 'Bullish' ? 'var(--green)' : sentiment.marketMood === 'Bearish' ? 'var(--red)' : 'var(--amber)' }}>
                  {sentiment.marketMood}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>Avg: {sentiment.averageScore?.toFixed(3)}</div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                {[['Positive', sentiment.sentimentDistribution?.positive, 'var(--green)'],
                  ['Neutral', sentiment.sentimentDistribution?.neutral, 'var(--amber)'],
                  ['Negative', sentiment.sentimentDistribution?.negative, 'var(--red)']
                ].map(([l, v, c]) => (
                  <div key={l} style={{ flex: 1, textAlign: 'center', padding: '8px', background: 'var(--surface)', borderRadius: 8 }}>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.2rem', color: c }}>{v}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ maxHeight: 160, overflowY: 'auto' }}>
                {sentiment.articles?.slice(0, 4).map((a, i) => (
                  <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.78rem' }}>
                    <div style={{ color: a.label === 'positive' ? 'var(--green)' : a.label === 'negative' ? 'var(--red)' : 'var(--amber)', fontWeight: 500, marginBottom: 2, fontSize: '0.7rem' }}>
                      {a.label?.toUpperCase()} · {a.date}
                    </div>
                    <div style={{ color: 'var(--text2)' }}>{a.headline}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
