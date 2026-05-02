import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PortfolioBuilder() {
  const [availableStocks, setAvailableStocks] = useState([]);
  const [selectedTicker, setSelectedTicker] = useState('');
  const [shares, setShares] = useState(1);
  
  const [portfolio, setPortfolio] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [projInvestment, setProjInvestment] = useState(50000);
  const [loading, setLoading] = useState(false);

  // Save/Load Modal States
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedPortfolios, setSavedPortfolios] = useState([]);

  // 1. Fetch available stocks for the dropdown on load
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const res = await api.get('/stocks');
        setAvailableStocks(res.data);
        if (res.data.length > 0) setSelectedTicker(res.data[0].ticker);
      } catch (err) {
        console.error("Failed to fetch stocks", err);
      }
    };
    fetchStocks();
  }, []);

  // 2. Automatically re-analyze the portfolio whenever the assets change
  useEffect(() => {
    const analyzePortfolio = async () => {
      if (portfolio.length === 0) {
        setAnalysis(null);
        return;
      }
      setLoading(true);
      try {
        const res = await api.post('/portfolio/analyze', { holdings: portfolio });
        setAnalysis(res.data);
      } catch (err) {
        console.error("Analysis Error:", err);
      } finally {
        setLoading(false);
      }
    };
    analyzePortfolio();
  }, [portfolio]);

  const addAsset = () => {
    if (!selectedTicker || shares <= 0) return;
    
    setPortfolio(prev => {
      const existing = prev.find(p => p.ticker === selectedTicker);
      if (existing) {
        return prev.map(p => p.ticker === selectedTicker ? { ...p, shares: Number(p.shares) + Number(shares) } : p);
      }
      return [...prev, { ticker: selectedTicker, shares: Number(shares) }];
    });
  };

  const removeAsset = (tickerToRemove) => {
    setPortfolio(prev => prev.filter(p => p.ticker !== tickerToRemove));
  };

  // --- SAVE / LOAD LOGIC ---
  const saveModelPortfolio = async () => {
    if (portfolio.length === 0) return alert("Cannot save an empty portfolio!");
    const userStr = localStorage.getItem('esg_user');
    if (!userStr) return alert("You must be logged in to save.");
    
    const user = JSON.parse(userStr);
    const portName = prompt("Enter a name for this portfolio:", "My ESG Portfolio");
    if (!portName) return; 

    try {
      const res = await api.post('/portfolio/save', { 
        user_id: user.id, 
        name: portName, 
        portfolio: portfolio 
      });
      if (res.data.success) alert("✅ " + res.data.message);
      else alert("Error: " + res.data.message);
    } catch(e) {
      alert("Failed to connect to the server to save.");
    }
  };

  const loadModelPortfolio = async () => {
    const userStr = localStorage.getItem('esg_user');
    if (!userStr) return alert("You must be logged in to load.");
    
    const user = JSON.parse(userStr);
    try {
      const res = await api.get(`/portfolio/load?user_id=${user.id}`);
      if (res.data.success && res.data.portfolios && res.data.portfolios.length > 0) {
        setSavedPortfolios(res.data.portfolios);
        setShowLoadModal(true);
      } else {
        alert("No saved portfolios found. Build and save one first!");
      }
    } catch(e) { 
      alert("Failed to fetch portfolios from the server."); 
    }
  };

  const applyLoadedPortfolio = (portfolioData) => {
    setPortfolio(portfolioData);
    setShowLoadModal(false);
  };

  // 3. Projections Math
  const r = analysis ? analysis.expected_return / 100 : 0;
  const val1Y = projInvestment * Math.pow(1 + r, 1);
  const val3Y = projInvestment * Math.pow(1 + r, 3);
  const val5Y = projInvestment * Math.pow(1 + r, 5);

  // 4. Chart Data
  const chartData = {
    labels: analysis?.assets.map(a => a.ticker) || [],
    datasets: [{
      data: analysis?.assets.map(a => a.value_inr) || [],
      backgroundColor: ['#1e4d38', '#d4a843', '#2c3e50', '#8c7a4b', '#4a6b5d', '#e6c875', '#c0392b', '#8e44ad'],
      borderWidth: 0
    }]
  };

  return (
    <div className="page active" style={{ position: 'relative' }}>
      <div className="page-header">
        <h1>Model Portfolio Analyzer</h1>
        <p>Build a theoretical ESG portfolio to analyze expected returns, risk, and sustainability scores.</p>
      </div>

      <div className="cards-row cards-3">
        <div className="card"><div className="card-title">Total Model Value</div><div className="card-value">₹{analysis ? analysis.total_value_inr.toLocaleString('en-IN') : '0.00'}</div></div>
        <div className="card"><div className="card-title">Expected 1Y Return</div><div className={`card-value ${analysis?.expected_return >= 0 ? 'pos' : 'neg'}`}>{analysis ? `${analysis.expected_return > 0 ? '+' : ''}${analysis.expected_return}%` : '0.00%'}</div></div>
        <div className="card"><div className="card-title">Overall ESG Score</div><div className="card-value" style={{ color: 'var(--moss)' }}>{analysis ? analysis.esg_score : '0.0'}</div></div>
      </div>

      <div className="cards-row cards-2">
        {/* ADD ASSET CONTROLS */}
        <div className="chart-card">
          <h3><span style={{ fontSize: '1.2rem' }}>⚡</span> Add Asset to Model</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--smoke)' }}>1. Select Asset</label>
              <select className="ctrl-select" value={selectedTicker} onChange={e => setSelectedTicker(e.target.value)} style={{ width: '100%', marginTop: '0.3rem' }}>
                {availableStocks.map(s => <option key={s.ticker} value={s.ticker}>{s.ticker} - {s.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--smoke)' }}>2. Quantity (Shares to set model weight)</label>
              <input type="number" className="ctrl-input" value={shares} onChange={e => setShares(e.target.value)} step="0.01" min="0.01" style={{ width: '100%', marginTop: '0.3rem' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              <button className="ctrl-btn" onClick={addAsset} style={{ flex: 1, minWidth: '100px' }}>+ Add</button>
              <button className="ctrl-btn" onClick={() => setPortfolio([])} style={{ flex: 1, minWidth: '100px', background: 'var(--rust)' }}>✕ Clear</button>
              <button className="ctrl-btn" onClick={saveModelPortfolio} style={{ flex: 1, minWidth: '100px', background: 'var(--gold)', color: 'var(--ink)' }}>💾 Save</button>
              <button className="ctrl-btn outline" onClick={loadModelPortfolio} style={{ flex: 1, minWidth: '100px' }}>📂 Load</button>
            </div>
          </div>
        </div>

        {/* PIE CHART */}
        <div className="chart-card">
          <h3>Asset Allocation</h3>
          <div className="chart-wrap" style={{ height: '250px' }}>
            {analysis && analysis.assets.length > 0 ? <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'right' } } }} /> : <div className="loading" style={{marginTop: '2rem'}}>Add assets to see allocation.</div>}
          </div>
        </div>
      </div>

      {/* AI VERDICT & PROJECTIONS */}
      {analysis && (
        <div className="chart-card" style={{ background: '#fdfaf4', borderLeft: '4px solid var(--moss)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ fontSize: '1.4rem' }}>🤖</span> AI Portfolio Verdict</h3>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--ink)', marginBottom: '1.5rem' }}>
            You have built a diversified portfolio of <strong>{analysis.assets.length} assets</strong>. 
            The overall weighted ESG score is <strong>{analysis.esg_score}/100</strong>, reflecting a {analysis.esg_score >= 70 ? 'strong' : analysis.esg_score >= 50 ? 'moderate' : 'weak'} commitment to sustainability. 
            Based on historical performance, this exact allocation has an estimated annual return of <strong style={{ color: 'var(--moss)' }}>{analysis.expected_return}%</strong>.
          </p>

          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--smoke)' }}>Hypothetical Investment Amount (₹)</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
              <input type="number" className="ctrl-input" value={projInvestment} onChange={e => setProjInvestment(Number(e.target.value))} step="1000" style={{ width: '200px', fontSize: '1.1rem', fontWeight: 'bold' }} />
            </div>
            
            <div className="cards-row cards-3" style={{ marginTop: '1.5rem', marginBottom: 0 }}>
              <div className="card"><div className="card-title">1 Year Projection</div><div className="card-value" style={{ color: 'var(--moss)' }}>₹{Math.round(val1Y).toLocaleString('en-IN')}</div></div>
              <div className="card"><div className="card-title">3 Year Projection</div><div className="card-value" style={{ color: 'var(--moss)' }}>₹{Math.round(val3Y).toLocaleString('en-IN')}</div></div>
              <div className="card"><div className="card-title">5 Year Projection</div><div className="card-value" style={{ color: 'var(--moss)' }}>₹{Math.round(val5Y).toLocaleString('en-IN')}</div></div>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC HOLDINGS TABLE */}
      <div className="chart-card">
        <h3>Actionable Shopping List</h3>
        {loading ? <div className="loading">Updating portfolio...</div> : 
         !analysis ? <div className="loading">Add assets above to build your model portfolio.</div> : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--smoke)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.6rem 0.8rem' }}>Asset</th>
                  <th>Model Weight</th>
                  <th>Target Inv. (₹)</th>
                  <th>Shares to Buy</th>
                  <th>1Y Return</th>
                  <th>ESG</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {analysis.assets.map(a => {
                  // DYNAMIC MATH: Calculate exact INR and Shares based on user's inputted total investment
                  const targetInvestment = projInvestment * (a.weight / 100);
                  const pricePerShareInr = a.value_inr / a.shares; 
                  const targetSharesToBuy = targetInvestment / pricePerShareInr;

                  return (
                    <tr key={a.ticker} style={{ borderBottom: '1px solid var(--mist)' }}>
                      <td style={{ padding: '0.65rem 0.8rem' }}><strong>{a.ticker}</strong><br/><span style={{ fontSize: '0.75rem', color: 'var(--smoke)' }}>{a.sector}</span></td>
                      <td>{a.weight}%</td>
                      <td style={{ color: 'var(--moss)', fontWeight: 600 }}>₹{targetInvestment.toLocaleString('en-IN', {maximumFractionDigits: 2})}</td>
                      <td style={{ fontWeight: 600 }}>{targetSharesToBuy.toFixed(2)}</td>
                      <td className={a.return_1y >= 0 ? 'pos' : 'neg'}>{a.return_1y}%</td>
                      <td>{a.esg_total} <span className={`badge badge-esg-${a.esg_rating.toLowerCase()}`}>{a.esg_rating}</span></td>
                      <td><button onClick={() => removeAsset(a.ticker)} style={{ background: 'none', border: 'none', color: 'var(--rust)', cursor: 'pointer', fontWeight: 'bold' }}>✕ Remove</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* LOAD PORTFOLIO MODAL */}
      {showLoadModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '400px', position: 'relative', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <button onClick={() => setShowLoadModal(false)} style={{ position: 'absolute', top: '1rem', right: '1.2rem', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--smoke)' }}>✕</button>
            <h2 style={{ fontFamily: 'DM Serif Display', fontSize: '1.5rem', marginBottom: '0.2rem' }}>Saved Portfolios</h2>
            <p style={{ color: 'var(--smoke)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Select a portfolio to analyze</p>
            
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {savedPortfolios.map(p => (
                <div 
                  key={p.id}
                  onClick={() => applyLoadedPortfolio(p.data)}
                  style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '0.8rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--moss)'; e.currentTarget.style.background = 'var(--mist)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <div>
                    <strong style={{ color: 'var(--ink)' }}>{p.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--smoke)', marginTop: '0.2rem' }}>
                      Saved: {p.date.split(' ')[0]} • {p.data.length} Assets
                    </div>
                  </div>
                  <span style={{ color: 'var(--moss)', fontSize: '1.2rem' }}>➔</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}