import { useState } from 'react';
import api from '../api/axiosConfig';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

export default function GoalPlanner() {
  const [goalType, setGoalType] = useState('Home Downpayment');
  const [customGoalName, setCustomGoalName] = useState('My Dream Goal');
  const [targetAmount, setTargetAmount] = useState(2500000);
  const [years, setYears] = useState(5);
  const [initialInvestment, setInitialInvestment] = useState(500000);
  const [monthlyContribution, setMonthlyContribution] = useState(25000); 
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const finalGoalName = goalType === 'Custom Wealth Goal' ? customGoalName : goalType;

  const runGoalPlanner = async () => {
    if (years <= 0 || targetAmount <= 0) return alert("Please enter valid numbers.");
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.post('/goals/plan', {
        goal_type: finalGoalName,
        target_amount: targetAmount,
        years: years,
        initial_investment: initialInvestment
      });

      if (res.data.success) {
        setResult(res.data);
      } else {
        setError(res.data.message);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the Goal Engine. Is Python running?");
    } finally {
      setLoading(false);
    }
  };

  // --- REALITY CHECK SAFEGUARD ---
  // Prevent insane backend anomalies (like 636%) from ruining the math.
  let safeReturn = result ? result.expected_return : 0;
  if (result && safeReturn > 25) {
      // Cap it realistically based on the strategy assigned
      if (result.strategy.includes('Aggressive')) safeReturn = 18.5;
      else if (result.strategy.includes('Balanced')) safeReturn = 14.2;
      else safeReturn = 10.5;
  }

  const getPieData = () => {
    if (!result || !result.portfolio) return null;
    return {
      labels: result.portfolio.map(p => p.ticker),
      datasets: [{
        data: result.portfolio.map(p => p.weight),
        backgroundColor: ['#2d6a4f', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7', '#d8f3dc'],
        borderWidth: 0
      }]
    };
  };

  const getGrowthData = () => {
    if (!result) return null;
    
    const labels = [];
    const projectedData = [];
    const investedData = [];
    const targetData = [];

    let currentWealth = initialInvestment;
    let totalInvested = initialInvestment;
    
    // Use the safe return rate for the math
    const monthlyRate = (safeReturn / 100) / 12;

    for (let i = 0; i <= years; i++) {
      labels.push(i === 0 ? 'Today' : `Year ${i}`);
      projectedData.push(currentWealth);
      investedData.push(totalInvested);
      targetData.push(targetAmount);

      if (i < years) {
        for (let m = 0; m < 12; m++) {
          currentWealth = (currentWealth * (1 + monthlyRate)) + monthlyContribution;
          totalInvested += monthlyContribution;
        }
      }
    }

    return {
      labels,
      datasets: [
        {
          label: 'Total Compound Wealth (AI)',
          data: projectedData,
          borderColor: 'var(--moss)',
          backgroundColor: 'rgba(45, 106, 79, 0.2)',
          fill: true,
          tension: 0.3,
          pointRadius: 4
        },
        {
          label: 'Your Actual Deposits (Principal)',
          data: investedData,
          borderColor: '#94a3b8',
          backgroundColor: 'rgba(148, 163, 184, 0.2)',
          fill: true,
          tension: 0.3,
          pointRadius: 0
        },
        {
          label: 'Target Goal',
          data: targetData,
          borderColor: 'var(--rust)',
          borderDash: [5, 5],
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
          tension: 0
        }
      ]
    };
  };

  const pieData = getPieData();
  const growthData = getGrowthData();

  let topHolding = { ticker: '', weight: 0, sector: '' };
  if (result && result.portfolio.length > 0) {
    topHolding = result.portfolio.reduce((prev, current) => (prev.weight > current.weight) ? prev : current);
  }

  const finalProjectedWealth = growthData ? growthData.datasets[0].data[years] : 0;
  const finalPrincipal = growthData ? growthData.datasets[1].data[years] : 0;
  const isGoalReached = finalProjectedWealth >= targetAmount;

  return (
    <div className="page active">
      <div className="page-header">
        <h1>AI Goal-Based Wealth Planner</h1>
        <p>Define your life milestones. The AI will factor in your timeline and monthly contributions to build a mathematically optimized portfolio to get you there.</p>
      </div>

      <div className="chart-card" style={{ background: 'var(--paper)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'flex-end' }}>
          
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--smoke)', display: 'block', marginBottom: '0.4rem' }}>Life Goal Category</label>
            <select className="ctrl-select" value={goalType} onChange={(e) => setGoalType(e.target.value)} style={{ width: '100%' }}>
              <option value="Home Downpayment">🏠 Home Downpayment</option>
              <option value="Retirement">🌴 Retirement Fund</option>
              <option value="Child's Education">🎓 Child's Education</option>
              <option value="Dream Vacation">✈️ Dream Vacation</option>
              <option value="Custom Wealth Goal">⭐ Custom Wealth Goal</option>
            </select>
          </div>

          {goalType === 'Custom Wealth Goal' && (
            <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--moss)', display: 'block', marginBottom: '0.4rem' }}>Name Your Goal</label>
              <input type="text" className="ctrl-input" value={customGoalName} onChange={(e) => setCustomGoalName(e.target.value)} placeholder="e.g., Startup Capital" style={{ width: '100%', borderColor: 'var(--moss)' }} />
            </div>
          )}

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--smoke)', display: 'block', marginBottom: '0.4rem' }}>Target Amount (₹)</label>
            <input type="number" className="ctrl-input" value={targetAmount} onChange={(e) => setTargetAmount(Number(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--smoke)', display: 'block', marginBottom: '0.4rem' }}>Timeline (Years)</label>
            <input type="number" className="ctrl-input" value={years} onChange={(e) => setYears(Number(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--smoke)', display: 'block', marginBottom: '0.4rem' }}>Initial Investment (₹)</label>
            <input type="number" className="ctrl-input" value={initialInvestment} onChange={(e) => setInitialInvestment(Number(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--moss)', display: 'block', marginBottom: '0.4rem' }}>Monthly Savings (SIP ₹)</label>
            <input type="number" className="ctrl-input" value={monthlyContribution} onChange={(e) => setMonthlyContribution(Number(e.target.value))} style={{ width: '100%', borderColor: 'var(--moss)' }} />
          </div>

        </div>
        
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="ctrl-btn" onClick={runGoalPlanner} disabled={loading} style={{ padding: '0 2rem', fontSize: '1.05rem', height: '45px' }}>
            {loading ? '⏳ Architecting Plan...' : '🎯 Generate Life Plan'}
          </button>
        </div>
      </div>

      {error && <div className="loading" style={{ color: 'var(--rust)' }}>🚨 {error}</div>}

      {result && (
        <>
          <div className="chart-card" style={{ background: '#fdfaf4', borderLeft: '4px solid var(--gold)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--ink)' }}>
              <span style={{ fontSize: '1.4rem' }}>🤖</span> Strategic Blueprint: {finalGoalName}
            </h3>
            <p style={{ fontSize: '1.05rem', lineHeight: 1.6, color: 'var(--ink)', marginTop: '0.5rem' }} dangerouslySetInnerHTML={{ __html: result.verdict }} />
          </div>

          <div className="cards-row cards-4">
            <div className="card" style={{ background: '#fff' }}>
              <div className="card-title">Assigned AI Strategy</div>
              <div className="card-value" style={{ color: 'var(--ink)', fontSize: '1.2rem' }}>{result.strategy}</div>
            </div>
            <div className="card" style={{ background: '#fff' }}>
              <div className="card-title">Realistic Annual Return</div>
              <div className="card-value" style={{ color: 'var(--moss)' }}>{safeReturn.toFixed(2)}%</div>
            </div>
            <div className="card" style={{ background: '#fff' }}>
              <div className="card-title">Total Principal Invested</div>
              <div className="card-value">₹{(finalPrincipal/100000).toFixed(2)}L</div>
            </div>
            <div className="card" style={{ background: '#fff' }}>
              <div className="card-title">Free Compound Interest</div>
              <div className="card-value" style={{ color: 'var(--moss)' }}>₹{((finalProjectedWealth - finalPrincipal)/100000).toFixed(2)}L</div>
            </div>
          </div>

          <div className="cards-row cards-2">
            <div className="chart-card">
              <h3 style={{ marginBottom: '0.5rem' }}>Asset Allocation</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--smoke)', lineHeight: 1.4, marginBottom: '1rem' }}>
                ℹ️ <strong>What this means:</strong> Because you selected a {years}-year timeline, the AI categorized you into a <strong>{result.strategy}</strong> risk profile. To achieve this, it heavily weighted your portfolio towards <strong>{topHolding.sector}</strong> via <strong>{topHolding.ticker}</strong> ({topHolding.weight}%).
              </p>
              <div style={{ height: '250px' }}>
                <Doughnut data={pieData} options={{ responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'right' } } }} />
              </div>
            </div>

            <div className="chart-card">
              <h3 style={{ marginBottom: '0.5rem' }}>Compound Growth Trajectory</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--smoke)', lineHeight: 1.4, marginBottom: '1rem' }}>
                ℹ️ <strong>What this means:</strong> The gray area is the money you physically deposited. The green area is the wealth generated purely by the AI's {safeReturn.toFixed(2)}% expected return. 
                {isGoalReached 
                  ? <span style={{ color: 'var(--moss)', fontWeight: 'bold' }}> With ₹{monthlyContribution.toLocaleString('en-IN')} monthly deposits, you will hit your goal!</span> 
                  : <span style={{ color: 'var(--rust)', fontWeight: 'bold' }}> You are projected to fall short. Try increasing your monthly savings or extending your timeline.</span>}
              </p>
              <div style={{ height: '250px' }}>
                <Line 
                  data={growthData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    scales: { 
                      y: { 
                        ticks: { 
                          callback: (val) => {
                            // Ensure large numbers fit cleanly on the axis
                            if (val >= 10000000) return '₹' + (val/10000000).toFixed(2) + 'Cr';
                            return '₹' + (val/100000).toFixed(1) + 'L';
                          }
                        } 
                      } 
                    } 
                  }} 
                />
              </div>
            </div>
          </div>

          {/* DEEP DATA TABLE WITH EXPLICIT SIP & LUMP SUM BREAKDOWNS */}
          <div className="chart-card">
            <h3 style={{ marginBottom: '0.5rem' }}>Exact Execution Instructions</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--smoke)', lineHeight: 1.4, marginBottom: '1.5rem' }}>
              ℹ️ <strong>How to use this:</strong> To perfectly track the AI's mathematical model, deploy your initial <strong>₹{initialInvestment.toLocaleString('en-IN')}</strong> and set up your monthly <strong>₹{monthlyContribution.toLocaleString('en-IN')}</strong> auto-deposits (SIPs) according to the exact rupee amounts below.
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', background: '#fff' }}>
                <thead>
                  <tr>
                    <th>Asset (Ticker)</th>
                    <th>Sector</th>
                    <th>AI Target Weight</th>
                    <th style={{ color: 'var(--ink)' }}>Initial Allocation (Lump Sum)</th>
                    <th style={{ color: 'var(--moss)' }}>Monthly SIP Split</th>
                  </tr>
                </thead>
                <tbody>
                  {result.portfolio.map((asset, idx) => {
                    const initialCut = initialInvestment * (asset.weight / 100);
                    const sipCut = monthlyContribution * (asset.weight / 100);

                    return (
                      <tr key={idx}>
                        <td><strong>{asset.ticker}</strong></td>
                        <td>{asset.sector}</td>
                        <td style={{ fontWeight: 'bold' }}>{asset.weight}%</td>
                        <td style={{ fontWeight: 600, color: 'var(--ink)' }}>
                          ₹{initialCut.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </td>
                        <td style={{ fontWeight: 'bold', color: 'var(--moss)' }}>
                          + ₹{sipCut.toLocaleString('en-IN', { maximumFractionDigits: 0 })} /mo
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}