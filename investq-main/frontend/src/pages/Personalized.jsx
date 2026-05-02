import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

export default function Personalized() {
  // --- 1. Form input states ---
  const [duration, setDuration] = useState('1-3 years');
  const [budget, setBudget] = useState(100000);
  const [risk, setRisk] = useState('moderate');
  const [capSize, setCapSize] = useState('all');
  const [sector, setSector] = useState('');
  const [esgPriority, setEsgPriority] = useState('medium');

  // --- 2. API result states ---
  const [stats, setStats] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- 3. DEFINE THE FUNCTION FIRST ---
  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        duration,
        budget: Number(budget),
        risk_tolerance: risk,
        cap_size: capSize,
        sectors: sector ? [sector] : [],
        esg_priority: esgPriority,
      };

      // Sending a POST request with the user's filters
      const response = await api.post('/rankings/personalized', payload);
      
      setStats({
        total: response.data.total_candidates,
        filtered: response.data.filtered_count,
        maxVol: response.data.applied_filters.max_volatility,
        appliedDuration: response.data.applied_filters.investment_duration
      });
      setRecommendations(response.data.recommendations);
    } catch (err) {
      console.error("Personalized Error:", err);
      setError("Failed to generate recommendations. Ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // --- 4. CALL THE FUNCTION SECOND ---
  // Automatically fetch recommendations when the page first loads
  useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <div className="page active">
      <div className="page-header">
        <h1>My Personalized Recommendations</h1>
        <p>Filtered for your risk tolerance, budget, and sector preferences.</p>
      </div>

      {/* --- Filter Controls --- */}
      <div className="controls" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem', background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
        
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--smoke)' }}>1. Time Horizon
          <select className="ctrl-select" value={duration} onChange={(e) => setDuration(e.target.value)} style={{ width: '100%', marginTop: '0.3rem' }}>
            <option value="< 1 year">&lt; 1 year (Short Term)</option>
            <option value="1-3 years">1-3 years (Medium Term)</option>
            <option value="5+ years">5+ years (Long Term)</option>
          </select>
        </label>

        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--smoke)' }}>2. Total Budget (₹ INR)
          <input type="number" className="ctrl-input" value={budget} onChange={(e) => setBudget(e.target.value)} style={{ width: '100%', marginTop: '0.3rem' }} />
        </label>

        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--smoke)' }}>3. Risk Tolerance
          <select className="ctrl-select" value={risk} onChange={(e) => setRisk(e.target.value)} style={{ width: '100%', marginTop: '0.3rem' }}>
            <option value="low">Low Risk (Stable)</option>
            <option value="moderate">Medium Risk</option>
            <option value="high">High Risk (Aggressive)</option>
          </select>
        </label>

        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--smoke)' }}>4. Company Size
          <select className="ctrl-select" value={capSize} onChange={(e) => setCapSize(e.target.value)} style={{ width: '100%', marginTop: '0.3rem' }}>
            <option value="all">All Sizes</option>
            <option value="large">Large Cap (&gt; $100B)</option>
            <option value="mid">Mid Cap ($10B - $100B)</option>
            <option value="small">Small Cap (&lt; $10B)</option>
          </select>
        </label>

        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--smoke)' }}>5. Target Sector
          <select className="ctrl-select" value={sector} onChange={(e) => setSector(e.target.value)} style={{ width: '100%', marginTop: '0.3rem' }}>
            <option value="">All Sectors</option>
            <option value="Technology">Technology</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Clean Energy">Clean Energy</option>
            <option value="Finance">Finance</option>
            <option value="Consumer Staples">Consumer Staples</option>
            <option value="Utilities">Utilities</option>
            <option value="Energy">Energy</option>
            <option value="Industrial">Industrial</option>
          </select>
        </label>

        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--smoke)' }}>6. ESG Priority
          <select className="ctrl-select" value={esgPriority} onChange={(e) => setEsgPriority(e.target.value)} style={{ width: '100%', marginTop: '0.3rem' }}>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
            <option value="very_high">Very High (Strict)</option>
          </select>
        </label>
        
        <div style={{ gridColumn: 'span 3', textAlign: 'right', marginTop: '0.5rem' }}>
          <button className="ctrl-btn" onClick={fetchRecommendations} style={{ padding: '0.7rem 2rem', fontSize: '1rem', background: 'var(--moss)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            🔍 Analyze & Recommend
          </button>
        </div>
      </div>

      {/* --- Stats Row --- */}
      {stats && (
        <div className="cards-row cards-3" style={{ marginBottom: '1.2rem' }}>
          <div className="card">
            <div className="card-title">Assets Analyzed</div>
            <div className="card-value">{stats.total}</div>
          </div>
          <div className="card">
            <div className="card-title">Perfect Matches</div>
            <div className="card-value pos">{stats.filtered}</div>
          </div>
          <div className="card">
            <div className="card-title">Max Allowed Volatility</div>
            <div className="card-value" style={{ color: 'var(--rust)' }}>{stats.maxVol}%</div>
            <div className="card-sub">Adjusted for {stats.appliedDuration} horizon</div>
          </div>
        </div>
      )}

      {/* --- Results Table --- */}
      <div className="chart-card">
        {loading ? (
          <div className="loading">Analyzing Market...</div>
        ) : error ? (
          <div className="loading" style={{ color: 'var(--rust)' }}>🚨 {error}</div>
        ) : recommendations.length === 0 ? (
          <div className="loading">No stocks match these exact filters. Try loosening your risk or size criteria.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--smoke)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.6rem 0.8rem' }}>#</th>
                  <th>Asset</th>
                  <th>Size (Cap)</th>
                  <th>Live Price (₹)</th>
                  <th>Suggested Buy (10%)</th>
                  <th>1Y Return</th>
                  <th>ESG</th>
                  <th>AI Signal</th>
                </tr>
              </thead>
              <tbody>
                {recommendations.map((r, i) => (
                  <tr key={r.ticker} style={{ borderBottom: '1px solid var(--mist)' }}>
                    <td style={{ padding: '0.65rem 0.8rem' }}>{i + 1}</td>
                    <td><strong>{r.ticker}</strong><br/><span style={{ fontSize: '0.75rem', color: 'var(--smoke)' }}>{r.sector}</span></td>
                    <td>${r.market_cap}B</td>
                    <td><strong>₹{r.price_inr.toLocaleString('en-IN')}</strong></td>
                    <td style={{ color: 'var(--moss)', fontWeight: 600 }}>{r.suggested_shares} Shares</td>
                    <td className={r.return_1y >= 0 ? 'pos' : 'neg'}>{r.return_1y}%</td>
                    <td>{r.esg_total} <span className={`badge badge-esg-${r.esg_rating.toLowerCase()}`}>{r.esg_rating}</span></td>
                    <td>
                      <span className={`badge badge-${r.classification.toLowerCase()}`} style={{
                        padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                        background: r.classification === 'Invest' ? '#dcfce7' : r.classification === 'Hold' ? '#fef9c3' : '#fee2e2',
                        color: r.classification === 'Invest' ? '#166534' : r.classification === 'Hold' ? '#854d0e' : '#991b1b'
                      }}>
                        {r.classification}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}