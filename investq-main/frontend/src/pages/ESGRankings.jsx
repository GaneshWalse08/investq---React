import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

export default function ESGRankings() {
  const [rankings, setRankings] = useState([]);
  const [sector, setSector] = useState('all');
  const [esgWeight, setEsgWeight] = useState(0.4);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/rankings?sector=${sector}&esg_weight=${esgWeight}`);
        setRankings(response.data);
      } catch (err) {
        console.error("Rankings Error:", err);
        setError("Failed to load rankings data.");
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, [sector, esgWeight]); // React automatically refetches when these change!

  return (
    <div className="page active">
      <div className="page-header">
        <h1>ESG-Aware Stock Rankings</h1>
        <p>Combined financial performance and ESG sustainability scoring.</p>
      </div>

      <div className="controls" style={{ display: 'flex', gap: '1rem', marginBottom: '1.2rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <select 
          className="ctrl-select" 
          value={sector} 
          onChange={(e) => setSector(e.target.value)}
          style={{ padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1.5px solid var(--border)' }}
        >
          <option value="all">All Sectors</option>
          <option value="Technology">Technology</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Clean Energy">Clean Energy</option>
          <option value="Finance">Finance</option>
          <option value="Consumer Staples">Consumer Staples</option>
          <option value="Utilities">Utilities</option>
          <option value="Energy">Energy</option>
          <option value="Industrial">Industrial</option>
        </select>

        <label style={{ fontSize: '0.88rem', fontWeight: 600 }}>ESG Weight: 
          <input 
            type="range" 
            min="0" max="0.8" step="0.1" 
            value={esgWeight} 
            onChange={(e) => setEsgWeight(parseFloat(e.target.value))}
            style={{ margin: '0 10px' }}
          />
          <span style={{ color: 'var(--moss)' }}>{Math.round(esgWeight * 100)}%</span>
        </label>
      </div>

      <div className="chart-card">
        {loading ? (
          <div className="loading">Computing rankings...</div>
        ) : error ? (
          <div className="loading" style={{ color: 'var(--rust)' }}>🚨 {error}</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--smoke)', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.6rem 0.8rem' }}>#</th>
                  <th>Ticker</th>
                  <th>Sector</th>
                  <th>1Y Return</th>
                  <th>Volatility</th>
                  <th>Sharpe</th>
                  <th>ESG Score</th>
                  <th>Total Score</th>
                  <th>Signal</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((r) => (
                  <tr key={r.ticker} style={{ borderBottom: '1px solid var(--mist)' }}>
                    <td style={{ padding: '0.65rem 0.8rem' }}><strong>{r.rank}</strong></td>
                    <td><strong>{r.ticker}</strong></td>
                    <td><span style={{ fontSize: '0.8rem', color: 'var(--smoke)' }}>{r.sector}</span></td>
                    <td className={r.return_1y >= 0 ? 'pos' : 'neg'}>{r.return_1y}%</td>
                    <td>{r.volatility}%</td>
                    <td>{r.sharpe}</td>
                    <td>{r.esg_total} ({r.esg_rating})</td>
                    <td><strong>{r.total_score}</strong></td>
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