import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

export default function Personalized() {
  // --- 1. Form input states (Combined existing + new KNN features) ---
  const [duration, setDuration] = useState('1-3 years');
  const [budget, setBudget] = useState(100000);
  const [risk, setRisk] = useState('moderate');
  const [capSize, setCapSize] = useState('all');
  const [sector, setSector] = useState('');
  const [esgPriority, setEsgPriority] = useState('medium');
  
  // New KNN specific states
  const [age, setAge] = useState(30);
  const [income, setIncome] = useState(1500000);
  const [taxBracket, setTaxBracket] = useState(30);
  const [healthRisk, setHealthRisk] = useState('Low');
  const [financialGoal, setFinancialGoal] = useState('Wealth Creation');

  // --- 2. API result states ---
  const [stats, setStats] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [allocation, setAllocation] = useState(null); // New state for KNN Allocation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#64748b'];

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        duration, budget: Number(budget), risk_tolerance: risk,
        cap_size: capSize, sectors: sector ? [sector] : [], esg_priority: esgPriority,
        age: Number(age), annual_income: Number(income), tax_bracket: Number(taxBracket),
        health_risk: healthRisk, financial_goal: financialGoal
      };

      // 1. Fetch AI Macro Allocation (KNN Model)
      const allocationRes = await api.post('/ml/recommend_allocation', payload);
      if (allocationRes.data.success) {
        setAllocation(allocationRes.data);
      }

      // 2. Fetch Micro Stock Recommendations (Existing logic)
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

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <div className="page active">
      <div className="page-header">
        <h1>My Personalized AI Recommendations</h1>
        <p>Your complete portfolio blueprint: AI Asset Allocation + Specific Stock filtering.</p>
      </div>

      {/* --- Filter Controls --- */}
      <div className="controls" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem', background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
        
        {/* New KNN Inputs */}
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--smoke)' }}>Age
          <input type="number" className="ctrl-input" value={age} onChange={(e) => setAge(e.target.value)} style={{ width: '100%', marginTop: '0.3rem' }} />
        </label>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--smoke)' }}>Annual Income (₹)
          <input type="number" className="ctrl-input" value={income} onChange={(e) => setIncome(e.target.value)} style={{ width: '100%', marginTop: '0.3rem' }} />
        </label>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--smoke)' }}>Tax Bracket (%)
          <select className="ctrl-select" value={taxBracket} onChange={(e) => setTaxBracket(e.target.value)} style={{ width: '100%', marginTop: '0.3rem' }}>
            <option value="5">5%</option><option value="20">20%</option><option value="30">30%</option>
          </select>
        </label>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--smoke)' }}>Health Risk
          <select className="ctrl-select" value={healthRisk} onChange={(e) => setHealthRisk(e.target.value)} style={{ width: '100%', marginTop: '0.3rem' }}>
            <option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option>
          </select>
        </label>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--smoke)' }}>Financial Goal
          <select className="ctrl-select" value={financialGoal} onChange={(e) => setFinancialGoal(e.target.value)} style={{ width: '100%', marginTop: '0.3rem' }}>
            <option value="Wealth Creation">Wealth Creation</option><option value="Retirement">Retirement</option><option value="House Purchase">House Purchase</option><option value="Emergency Fund">Emergency Fund</option>
          </select>
        </label>

        {/* Existing Inputs */}
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--smoke)' }}>Time Horizon
          <select className="ctrl-select" value={duration} onChange={(e) => setDuration(e.target.value)} style={{ width: '100%', marginTop: '0.3rem' }}>
            <option value="< 1 year">&lt; 1 year (Short Term)</option><option value="1-3 years">1-3 years (Medium Term)</option><option value="5+ years">5+ years (Long Term)</option>
          </select>
        </label>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--smoke)' }}>Total Budget (₹)
          <input type="number" className="ctrl-input" value={budget} onChange={(e) => setBudget(e.target.value)} style={{ width: '100%', marginTop: '0.3rem' }} />
        </label>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--smoke)' }}>Risk Tolerance
          <select className="ctrl-select" value={risk} onChange={(e) => setRisk(e.target.value)} style={{ width: '100%', marginTop: '0.3rem' }}>
            <option value="low">Low Risk (Stable)</option><option value="moderate">Medium Risk</option><option value="high">High Risk (Aggressive)</option>
          </select>
        </label>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--smoke)' }}>ESG Priority
          <select className="ctrl-select" value={esgPriority} onChange={(e) => setEsgPriority(e.target.value)} style={{ width: '100%', marginTop: '0.3rem' }}>
            <option value="low">Low Priority</option><option value="medium">Medium Priority</option><option value="high">High Priority</option><option value="very_high">Very High (Strict)</option>
          </select>
        </label>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--smoke)' }}>Company Size
          <select className="ctrl-select" value={capSize} onChange={(e) => setCapSize(e.target.value)} style={{ width: '100%', marginTop: '0.3rem' }}>
            <option value="all">All Sizes</option><option value="large">Large Cap (&gt; $100B)</option><option value="mid">Mid Cap ($10B - $100B)</option>
          </select>
        </label>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--smoke)' }}>Target Sector
          <select className="ctrl-select" value={sector} onChange={(e) => setSector(e.target.value)} style={{ width: '100%', marginTop: '0.3rem' }}>
            <option value="">All Sectors</option><option value="Technology">Technology</option><option value="Clean Energy">Clean Energy</option><option value="Finance">Finance</option>
          </select>
        </label>
        
        <div style={{ gridColumn: 'span 4', textAlign: 'right', marginTop: '0.5rem' }}>
          <button className="ctrl-btn" onClick={fetchRecommendations} style={{ padding: '0.7rem 2rem', fontSize: '1rem', background: 'var(--moss, #16a34a)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            {loading ? 'Analyzing Profile...' : '🧠 Generate AI Blueprint & Picks'}
          </button>
        </div>
      </div>

      {error && <div className="loading" style={{ color: 'var(--rust)', background: '#fff', padding:'1rem', borderRadius:'8px', marginBottom:'1rem' }}>🚨 {error}</div>}

      {/* --- PART 1: AI ASSET ALLOCATION (KNN) --- */}
      {allocation && !loading && (
        <div className="chart-card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize:'1.1rem' }}>Step 1: AI Asset Allocation Strategy (KNN Model)</h2>
          
          {/* Visual CSS Bar Graph */}
          <div style={{ width: '100%', height: '35px', display: 'flex', borderRadius: '8px', overflow: 'hidden', marginBottom: '1.5rem' }}>
            {Object.entries(allocation.allocations).map(([asset, percentage], index) => (
              <div 
                key={asset} 
                title={`${asset}: ${percentage}%`}
                style={{ 
                  width: `${percentage}%`, background: colors[index % colors.length],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 'bold', fontSize: '0.75rem',
                  transition: 'all 0.3s ease'
                }}
              >
                {percentage > 5 ? `${percentage}%` : ''}
              </div>
            ))}
          </div>

          {/* Reasoning Legend */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'1rem' }}>
             {allocation.reasoning.map((item, index) => (
               <div key={index} style={{ padding:'1rem', background:'#f8fafc', borderRadius:'8px', borderLeft:`4px solid ${colors[index % colors.length]}` }}>
                 <div style={{ fontWeight:'bold', display:'flex', justifyContent:'space-between' }}>
                    <span>{item.asset}</span>
                    <span style={{ color: 'var(--moss, #16a34a)' }}>{item.allocation}%</span>
                 </div>
                 <div style={{ fontSize:'0.8rem', color:'var(--smoke)', marginTop:'0.5rem' }}>{item.reason}</div>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* --- PART 2: EXISTING STOCK RECOMMENDATIONS --- */}
      {stats && (
        <>
          <h2 style={{ marginBottom: '1rem', fontSize:'1.1rem' }}>Step 2: Specific ESG Stock Recommendations</h2>
          <div className="cards-row cards-3" style={{ marginBottom: '1.2rem' }}>
            <div className="card"><div className="card-title">Assets Analyzed</div><div className="card-value">{stats.total}</div></div>
            <div className="card"><div className="card-title">Perfect Matches</div><div className="card-value pos">{stats.filtered}</div></div>
            <div className="card"><div className="card-title">Max Allowed Volatility</div><div className="card-value" style={{ color: 'var(--rust)' }}>{stats.maxVol}%</div><div className="card-sub">Adjusted for {stats.appliedDuration} horizon</div></div>
          </div>
        </>
      )}

      <div className="chart-card">
        {loading ? (
          <div className="loading">Analyzing Market...</div>
        ) : recommendations.length === 0 && !error ? (
          <div className="loading">No stocks match these exact filters. Try loosening your risk or size criteria.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--smoke)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.6rem 0.8rem' }}>#</th><th>Asset</th><th>Size (Cap)</th><th>Live Price (₹)</th><th>Suggested Buy (10%)</th><th>1Y Return</th><th>ESG</th><th>AI Signal</th>
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