import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

export default function EventSimulator() {
  const [newsInput, setNewsInput] = useState('');
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await api.get('/simulator/trending_topics');
        if (res.data.success) {
          setTrendingTopics(res.data.topics);
          if (res.data.topics.length > 0) {
            setNewsInput(res.data.topics[0].query);
          }
        }
      } catch (err) { console.error("Failed to fetch trending topics", err); }
    };
    fetchTrending();
  }, []);

  const runNewsAnalysis = async () => {
    if (!newsInput) return alert("Please enter a news headline to analyze.");
    setLoading(true); setError(null);
    try {
      const res = await api.post('/simulator/analyze_news', { news_event: newsInput });
      if (res.data.success) { setAnalysis(res.data); } 
      else { setError(res.data.message); }
    } catch (err) {
      console.error(err); setError("Failed to connect to the AI News Engine. Is Python running?");
    } finally { setLoading(false); }
  };

  const sectorBarData = analysis ? {
    labels: analysis.sector_analysis.map(s => s.sector),
    datasets: [{
      label: 'Predicted Sector Impact (%)',
      data: analysis.sector_analysis.map(s => s.impact),
      backgroundColor: analysis.sector_analysis.map(s => s.impact >= 0 ? '#2d6a4f' : '#b91c1c'), 
      borderRadius: 6
    }]
  } : null;

  const trajectoryLineData = analysis ? {
    labels: analysis.months,
    datasets: [{
      label: 'Broader Market Trajectory (%)',
      data: analysis.trajectory,
      borderColor: '#d4a843', 
      backgroundColor: 'rgba(212, 168, 67, 0.1)',
      fill: true, tension: 0.4, pointRadius: 4, borderWidth: 3
    }]
  } : null;

  // Variables for Dynamic Text Injection
  let topWinner = null;
  let topLoser = null;
  if (analysis && analysis.sector_analysis) {
    const sorted = [...analysis.sector_analysis].sort((a,b) => b.impact - a.impact);
    if (sorted[0].impact > 0) topWinner = sorted[0];
    if (sorted[sorted.length - 1].impact < 0) topLoser = sorted[sorted.length - 1];
  }

  return (
    <div className="page active">
      <div className="page-header">
        <h1>Live Macro Event Analyzer</h1>
        <p>Input breaking news or hypothetical scenarios. The guidance system will predict sector rotations and explain the economic ripple effects.</p>
      </div>

      <div className="chart-card" style={{ background: 'var(--paper)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ink)' }}>
            <span style={{ fontSize: '1.2rem' }}>📡</span> Global News Feed Input
          </h3>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--moss)', background: '#f0fdf4', padding: '0.3rem 0.8rem', borderRadius: '20px', border: '1px solid #bbf7d0' }}>
            <span style={{ width: '8px', height: '8px', background: 'var(--moss)', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }}></span>
            LIVE FEED AGGREGATOR
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input 
            type="text" className="ctrl-input" value={newsInput} onChange={(e) => setNewsInput(e.target.value)}
            placeholder="e.g., OPEC slashes production, oil prices surge..."
            style={{ flex: 1, padding: '1rem', fontSize: '1rem' }}
          />
          <button 
            className="ctrl-btn" onClick={runNewsAnalysis} disabled={loading}
            style={{ padding: '0 2rem', fontSize: '1rem', height: 'auto' }}
          >
            {loading ? '⏳ Processing NLP...' : '⚡ Analyze Market Impact'}
          </button>
        </div>
        
        <div style={{ marginTop: '1.2rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--smoke)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>Trending Today:</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {trendingTopics.length > 0 ? (
              trendingTopics.map((topic, index) => (
                <button 
                  key={index} onClick={() => setNewsInput(topic.query)} 
                  style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--smoke)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s ease' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--moss)'; e.currentTarget.style.color = 'var(--ink)'; e.currentTarget.style.background = '#f8fafc'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--smoke)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  {topic.icon} {topic.label}
                </button>
              ))
            ) : (<span style={{ fontSize: '0.85rem', color: 'var(--smoke)' }}>Loading live trends...</span>)}
          </div>
        </div>
      </div>

      {error && <div className="loading" style={{ color: 'var(--rust)' }}>🚨 {error}</div>}

      {analysis && (
        <>
          <div className="chart-card" style={{ background: '#fdfaf4', borderLeft: '4px solid var(--moss)' }}>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--ink)' }}>AI Executive Summary</h3>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--ink)' }}>
              {analysis.summary}
            </p>
          </div>

          <div className="cards-row cards-2">
            {/* DYNAMIC TEXT SECTOR CHART */}
            <div className="chart-card">
              <h3 style={{ marginBottom: '0.5rem' }}>Sector Capital Rotation</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--smoke)', lineHeight: 1.4, marginBottom: '1rem' }}>
                ℹ️ <strong>What this means:</strong> {topWinner ? `Institutions are aggressively moving money into the ${topWinner.sector} sector right now because ${topWinner.reasoning.toLowerCase()}` : "Capital is remaining stagnant as institutions await further data."}
                {topLoser ? ` At the same time, money is fleeing from ${topLoser.sector} because ${topLoser.reasoning.toLowerCase()}` : ""}
              </p>
              <div style={{ height: '250px' }}>
                <Bar data={sectorBarData} options={{ responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } }} />
              </div>
            </div>

            <div className="chart-card">
              <h3 style={{ marginBottom: '0.5rem' }}>6-Month Market Trajectory</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--smoke)', lineHeight: 1.4, marginBottom: '1rem' }}>
                ℹ️ <strong>What this means:</strong> Markets often overreact to news before stabilizing. This forecasts the broader market index performance over the next 6 months following the initial shock.
              </p>
              <div style={{ height: '250px' }}>
                <Line data={trajectoryLineData} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { title: { display: true, text: 'Overall Impact (%)' } } } }} />
              </div>
            </div>
          </div>

          <div className="chart-card">
            <h3 style={{ marginBottom: '1rem' }}>Deep NLP Sector Reasoning</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
              
              <div style={{ padding: '1.5rem', background: '#fff', borderRadius: '12px', borderTop: '4px solid var(--moss)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <h4 style={{ color: 'var(--moss)', marginBottom: '1rem', fontSize: '1.1rem' }}>📈 Projected Winners (Boom)</h4>
                {analysis.sector_analysis.filter(s => s.impact > 0).length > 0 ? (
                  analysis.sector_analysis.filter(s => s.impact > 0).map((sec, idx) => (
                    <div key={idx} style={{ marginBottom: '1.2rem' }}>
                      <strong style={{ display: 'block', color: 'var(--ink)' }}>{sec.sector} <span style={{ color: 'var(--moss)' }}>+{sec.impact}%</span></strong>
                      <p style={{ fontSize: '0.9rem', color: 'var(--smoke)', marginTop: '0.3rem', lineHeight: 1.5 }}>{sec.reasoning}</p>
                    </div>
                  ))
                ) : (<p style={{ fontSize: '0.9rem', color: 'var(--smoke)', fontStyle: 'italic', margin: 0 }}>No significant positive sector impacts detected.</p>)}
              </div>

              <div style={{ padding: '1.5rem', background: '#fff', borderRadius: '12px', borderTop: '4px solid var(--rust)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                <h4 style={{ color: 'var(--rust)', marginBottom: '1rem', fontSize: '1.1rem' }}>📉 Projected Losers (Bust)</h4>
                {analysis.sector_analysis.filter(s => s.impact < 0).length > 0 ? (
                  analysis.sector_analysis.filter(s => s.impact < 0).map((sec, idx) => (
                    <div key={idx} style={{ marginBottom: '1.2rem' }}>
                      <strong style={{ display: 'block', color: 'var(--ink)' }}>{sec.sector} <span style={{ color: 'var(--rust)' }}>{sec.impact}%</span></strong>
                      <p style={{ fontSize: '0.9rem', color: 'var(--smoke)', marginTop: '0.3rem', lineHeight: 1.5 }}>{sec.reasoning}</p>
                    </div>
                  ))
                ) : (<p style={{ fontSize: '0.9rem', color: 'var(--smoke)', fontStyle: 'italic', margin: 0 }}>No significant negative sector impacts detected.</p>)}
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
}