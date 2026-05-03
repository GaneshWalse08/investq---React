import { useState } from 'react';
import api from '../api/axiosConfig';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export default function FDAnalyzer() {
  const [principal, setPrincipal] = useState(500000);
  const [rate, setRate] = useState(7.0);
  const [years, setYears] = useState(5);
  // UPDATE: AI sets the realistic current Indian CPI (Inflation) by default
  const [inflation, setInflation] = useState(5.1); 
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runAnalysis = async () => {
    if (principal <= 0 || years <= 0 || rate <= 0) return alert("Please enter valid positive numbers.");
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.post('/investments/fd_analyze', {
        principal,
        rate,
        years,
        inflation
      });

      if (res.data.success) {
        setResult(res.data);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the AI Backend. Is Python running?");
    } finally {
      setLoading(false);
    }
  };

  // --- CHART GENERATOR: Nominal vs Real Wealth ---
  const getChartData = () => {
    if (!result) return null;

    const labels = [];
    const nominalData = [];
    const realData = [];

    for (let i = 0; i <= years; i++) {
      labels.push(i === 0 ? 'Today' : `Year ${i}`);
      
      // Nominal Value: Indian FDs typically compound quarterly
      const nomValue = principal * Math.pow(1 + (rate / 100) / 4, 4 * i);
      nominalData.push(nomValue);
      
      // Real Value (Purchasing Power): Discounted by annual inflation
      const realValue = nomValue / Math.pow(1 + (inflation / 100), i);
      realData.push(realValue);
    }

    return {
      labels,
      datasets: [
        {
          label: 'Bank Account Balance (Illusion of Wealth)',
          data: nominalData,
          borderColor: '#64748b',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.2
        },
        {
          label: 'Actual Purchasing Power (Reality)',
          data: realData,
          borderColor: result.real_rate > 0 ? 'var(--moss)' : 'var(--rust)',
          backgroundColor: result.real_rate > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          fill: true,
          borderWidth: 3,
          pointRadius: 4,
          tension: 0.2
        }
      ]
    };
  };

  const chartData = getChartData();
  const isLosingMoney = result && result.real_rate <= 0;

  return (
    <div className="page active">
      <div className="page-header">
        <h1>FD vs. Inflation Reality Checker</h1>
        <p>A mathematical analysis proving how inflation silently erodes the purchasing power of "safe" Fixed Deposits over time.</p>
      </div>

      {/* 1. INPUT FORM */}
      <div className="chart-card" style={{ background: 'var(--paper)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'flex-end' }}>
          
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--smoke)', display: 'block', marginBottom: '0.4rem' }}>Principal Deposit (₹)</label>
            <input type="number" className="ctrl-input" value={principal} onChange={(e) => setPrincipal(Number(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--smoke)', display: 'block', marginBottom: '0.4rem' }}>Bank FD Rate (%)</label>
            <input type="number" step="0.1" className="ctrl-input" value={rate} onChange={(e) => setRate(Number(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--rust)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span>Actual Inflation Rate (%)</span>
              {/* NEW: AI Auto-Detected Badge */}
              <span style={{ fontSize: '0.65rem', background: '#fee2e2', color: '#991b1b', padding: '0.2rem 0.5rem', borderRadius: '12px', letterSpacing: '0.5px' }}>🤖 AI DETECTED</span>
            </label>
            <input type="number" step="0.1" className="ctrl-input" value={inflation} onChange={(e) => setInflation(Number(e.target.value))} style={{ width: '100%', borderColor: 'var(--rust)' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--smoke)', display: 'block', marginBottom: '0.4rem' }}>Lock-in Tenure (Years)</label>
            <input type="number" className="ctrl-input" value={years} onChange={(e) => setYears(Number(e.target.value))} style={{ width: '100%' }} />
          </div>

        </div>
        
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="ctrl-btn" onClick={runAnalysis} disabled={loading} style={{ padding: '0 2rem', fontSize: '1.05rem', height: '45px' }}>
            {loading ? '⏳ Calculating Math...' : '🔍 Reveal Reality'}
          </button>
        </div>
      </div>

      {error && <div className="loading" style={{ color: 'var(--rust)' }}>🚨 {error}</div>}

      {/* 2. DASHBOARD RESULTS */}
      {result && chartData && (
        <>
          {/* Executive Summary */}
          <div className="chart-card" style={{ background: '#fdfaf4', borderLeft: `4px solid ${isLosingMoney ? 'var(--rust)' : 'var(--moss)'}` }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ink)' }}>
              <span style={{ fontSize: '1.4rem' }}>⚖️</span> AI Verdict: The Silent Wealth Tax
            </h3>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--ink)', marginTop: '0.5rem' }} dangerouslySetInnerHTML={{ __html: result.verdict }} />
          </div>

          {/* Core Stats */}
          <div className="cards-row cards-3">
            <div className="card" style={{ background: '#fff' }}>
              <div className="card-title">Nominal Maturity (Bank Balance)</div>
              <div className="card-value" style={{ color: 'var(--smoke)' }}>₹{(result.maturity / 100000).toFixed(2)}L</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--smoke)', marginTop: '0.5rem' }}>What your screen shows</div>
            </div>
            
            <div className="card" style={{ background: '#fff', border: `1px solid ${isLosingMoney ? 'var(--rust)' : 'var(--border)'}` }}>
              <div className="card-title">Real Purchasing Power</div>
              <div className="card-value" style={{ color: isLosingMoney ? 'var(--rust)' : 'var(--moss)' }}>
                ₹{(chartData.datasets[1].data[years] / 100000).toFixed(2)}L
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--smoke)', marginTop: '0.5rem' }}>What you can actually buy</div>
            </div>

            <div className="card" style={{ background: '#fff', border: `1px solid ${isLosingMoney ? 'var(--rust)' : 'var(--border)'}` }}>
              <div className="card-title">Real Rate of Return</div>
              <div className="card-value" style={{ color: isLosingMoney ? 'var(--rust)' : 'var(--moss)' }}>
                {result.real_rate > 0 ? '+' : ''}{result.real_rate}%
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--smoke)', marginTop: '0.5rem' }}>Bank Rate minus Inflation</div>
            </div>
          </div>

          {/* Big Interactive Chart */}
          <div className="chart-card">
            <h3 style={{ marginBottom: '0.5rem' }}>The Wealth Illusion Gap</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--smoke)', lineHeight: 1.4, marginBottom: '1.5rem' }}>
              ℹ️ <strong>What this means:</strong> The dashed grey line is your bank balance growing. The solid colored line is what your money is <em>actually</em> worth in today's terms. 
              {isLosingMoney && <span style={{ color: 'var(--rust)', fontWeight: 'bold' }}> Because inflation is eating away at your money faster than the bank is paying you, the gap between the two lines represents your hidden loss.</span>}
            </p>
            <div style={{ height: '350px' }}>
              <Line 
                data={chartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  interaction: { mode: 'index', intersect: false },
                  scales: { 
                    y: { 
                      ticks: { 
                        callback: (val) => '₹' + (val / 100000).toFixed(1) + 'L' 
                      } 
                    } 
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          let label = context.dataset.label || '';
                          if (label) { label += ': '; }
                          if (context.parsed.y !== null) {
                            label += '₹' + context.parsed.y.toLocaleString('en-IN', { maximumFractionDigits: 0 });
                          }
                          return label;
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}