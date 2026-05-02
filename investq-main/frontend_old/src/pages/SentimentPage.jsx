import React, { useEffect, useState } from 'react';
import { sentimentAPI, stocksAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const SYMBOLS = ['AAPL','MSFT','GOOGL','AMZN','TSLA','NVDA','JPM','JNJ','NEE','COST'];

export default function SentimentPage() {
  const [market, setMarket] = useState(null);
  const [selected, setSelected] = useState('AAPL');
  const [stockSentiment, setStockSentiment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sentimentAPI.market().then(r => setMarket(r.data)).catch(() => {});
    setLoading(false);
  }, []);

  useEffect(() => {
    sentimentAPI.stock(selected).then(r => setStockSentiment(r.data)).catch(() => {});
  }, [selected]);

  const moodColor = m => m === 'Bullish' ? 'var(--green)' : m === 'Bearish' ? 'var(--red)' : 'var(--amber)';

  const barData = stockSentiment?.articles?.map((a, i) => ({
    name: `Art ${i + 1}`,
    score: a.score,
    label: a.label,
    headline: a.headline,
  })) || [];

  return (
    <div className="page">
      <div className="mb-24">
        <h1>Sentiment Analysis</h1>
        <p style={{ marginTop: 4 }}>NLP-powered news sentiment using VADER — market mood & stock-specific signals</p>
      </div>

      {/* Market overview */}
      {market && (
        <div className="grid grid-4 mb-24">
          <div className="card card-sm" style={{ textAlign: 'center' }}>
            <div className="stat-label mb-8">Fear & Greed</div>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '2.5rem', color: moodColor(market.marketMood) }}>{market.fearGreedIndex}</div>
            <div style={{ color: moodColor(market.marketMood), fontWeight: 600, fontSize: '0.9rem' }}>{market.fearGreedLabel}</div>
          </div>
          <div className="card card-sm" style={{ textAlign: 'center' }}>
            <div className="stat-label mb-8">Market Mood</div>
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.5rem', color: moodColor(market.marketMood) }}>{market.marketMood}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>Avg score: {market.averageSentiment?.toFixed(3)}</div>
          </div>
          <div className="card card-sm" style={{ textAlign: 'center', gridColumn: 'span 2' }}>
            <div className="stat-label mb-8">Sentiment Scale</div>
            <div style={{ position: 'relative', height: 20, background: 'linear-gradient(to right, var(--red), var(--amber), var(--green))', borderRadius: 10, overflow: 'visible', marginBottom: 6 }}>
              <div style={{
                position: 'absolute', top: -4, width: 28, height: 28, borderRadius: '50%',
                background: 'var(--bg2)', border: '2px solid var(--text)',
                transform: 'translateX(-50%)',
                left: `${((market.fearGreedIndex) / 100) * 100}%`,
                transition: 'left 0.5s ease',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text3)' }}>
              <span>Extreme Fear</span><span>Neutral</span><span>Extreme Greed</span>
            </div>
          </div>
        </div>
      )}

      {/* Stock Sentiment */}
      <div className="grid grid-2" style={{ gap: 20, alignItems: 'start' }}>
        <div>
          <div className="card mb-20">
            <h3 className="mb-16">Stock Sentiment</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {SYMBOLS.map(s => (
                <button key={s} onClick={() => setSelected(s)}
                  style={{
                    padding: '6px 14px', borderRadius: 8, border: '1px solid', cursor: 'pointer',
                    fontSize: '0.82rem', fontFamily: 'var(--font-head)', fontWeight: 600, transition: 'all 0.15s',
                    background: selected === s ? 'var(--accent-glow)' : 'var(--surface)',
                    color: selected === s ? 'var(--accent2)' : 'var(--text3)',
                    borderColor: selected === s ? 'rgba(79,142,247,0.4)' : 'var(--border)',
                  }}>
                  {s}
                </button>
              ))}
            </div>

            {stockSentiment && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px', background: 'var(--surface)', borderRadius: 'var(--radius)', marginBottom: 16 }}>
                  <div>
                    <div className="label mb-4">Mood for {selected}</div>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.3rem', color: moodColor(stockSentiment.marketMood) }}>{stockSentiment.marketMood}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div className="label mb-4">Avg Score</div>
                    <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.1rem', color: moodColor(stockSentiment.marketMood) }}>{stockSentiment.averageScore?.toFixed(3)}</div>
                  </div>
                </div>

                {/* Distribution */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                  {[
                    ['Positive', stockSentiment.sentimentDistribution?.positive, 'var(--green)'],
                    ['Neutral', stockSentiment.sentimentDistribution?.neutral, 'var(--amber)'],
                    ['Negative', stockSentiment.sentimentDistribution?.negative, 'var(--red)'],
                  ].map(([l, v, c]) => (
                    <div key={l} style={{ flex: 1, textAlign: 'center', padding: '10px', background: 'var(--surface)', borderRadius: 'var(--radius)' }}>
                      <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.4rem', color: c }}>{v}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{l}</div>
                    </div>
                  ))}
                </div>

                {/* Headlines */}
                <h4 className="mb-12">Recent Headlines</h4>
                {stockSentiment.articles?.map((a, i) => (
                  <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: a.label === 'positive' ? 'var(--green)' : a.label === 'negative' ? 'var(--red)' : 'var(--amber)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {a.label}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>{a.date}</span>
                    </div>
                    <div style={{ fontSize: '0.83rem', color: 'var(--text2)' }}>{a.headline}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: 2 }}>Score: {a.score?.toFixed(3)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bar chart */}
        <div className="card">
          <h3 className="mb-16">Sentiment Scores — {selected}</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barData} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
              <XAxis dataKey="name" tick={{ fill: 'var(--text3)', fontSize: 11 }} />
              <YAxis domain={[-1, 1]} tick={{ fill: 'var(--text3)', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }}
                formatter={(v, n, p) => [v.toFixed(3), 'Sentiment']}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.headline?.substring(0, 60) + '...'}
              />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {barData.map((d, i) => (
                  <Cell key={i} fill={d.score > 0.05 ? 'var(--green)' : d.score < -0.05 ? 'var(--red)' : 'var(--amber)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 12, fontSize: '0.75rem', color: 'var(--text3)' }}>
            {[['var(--green)', 'Positive'], ['var(--amber)', 'Neutral'], ['var(--red)', 'Negative']].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: c }} /> {l}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
