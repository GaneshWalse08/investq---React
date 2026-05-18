import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api/axiosConfig';

const RetirementPlanner = () => {
  const [formData, setFormData] = useState({
    age: 30,
    annual_income: 600000,
    current_savings: 100000,
    monthly_sip: 5000,
    epf_balance: 50000,
    ppf_contribution: 2000,
    nps_contribution: 0,
    risk_appetite: 'Moderate',
    inflation_assumption: 6.0, 
    monthly_expenses: 30000,
    dependents: 2
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedStatus, setSavedStatus] = useState(false);
  const [savedPlans, setSavedPlans] = useState([]);

  // Fetch saved plans on page load
  const fetchSavedPlans = async () => {
    try {
      const userId = localStorage.getItem('user_id') || 'guest';
      const res = await api.get(`/retirement/saved?user_id=${userId}`);
      if (res.data && res.data.success) {
        setSavedPlans(res.data.plans || []);
      }
    } catch (err) {
      console.error("Failed to fetch saved plans", err);
    }
  };

  useEffect(() => {
    fetchSavedPlans();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === 'risk_appetite' ? value : parseFloat(value) || 0 
    });
  };

  const analyzeRetirement = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSavedStatus(false);
    try {
      const response = await api.post('/retirement/analyze', formData);
      const data = response.data.outputs || response.data.data;
      if (data) {
        setResults(data);
      } else {
        setError("Invalid response format received from AI.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate AI retirement plan.");
    }
    setLoading(false);
  };

  const handleSavePlan = async () => {
    try {
      const userId = localStorage.getItem('user_id') || 'guest';
      await api.post('/retirement/save', {
        user_id: userId,
        plan_data: { inputs: formData, outputs: results }
      });
      setSavedStatus(true);
      fetchSavedPlans(); // Instantly refresh the cards at the top
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to show the saved plan
      setTimeout(() => setSavedStatus(false), 4000); 
    } catch (err) {
      console.error("Error saving plan:", err);
      setError("Failed to save plan to database.");
    }
  };

  const loadPlan = (plan) => {
    setFormData(plan.plan_data.inputs);
    setResults(plan.plan_data.outputs);
    window.scrollTo({ top: 400, behavior: 'smooth' }); // Scroll down to results
  };

  return (
    <div className="main" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1>Complete Old-Age & Retirement Masterplan</h1>
        <p>A simple, step-by-step guide to secure your financial freedom before you stop working.</p>
      </div>

      {/* --- DISPLAY SAVED PLANS AT THE VERY TOP --- */}
      {savedPlans.length > 0 && (
        <div style={{ marginBottom: '3rem', background: '#f8fafc', padding: '2rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <h3 style={{ fontSize: '1.4rem', color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📂 Your Saved Retirement Plans
          </h3>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {savedPlans.map((plan, idx) => (
              <div 
                key={idx} 
                onClick={() => loadPlan(plan)}
                style={{ padding: '1.5rem', background: '#fff', borderRadius: '10px', border: '2px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.transform = 'translateY(-2px)'; }} 
                onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>{new Date(plan.created_at).toLocaleDateString()}</span>
                  <span style={{ fontSize: '0.85rem', background: plan.plan_data.outputs.score >= 70 ? '#dcfce7' : '#fee2e2', color: plan.plan_data.outputs.score >= 70 ? '#16a34a' : '#dc2626', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                    Score: {plan.plan_data.outputs.score}
                  </span>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.5rem' }}>{plan.plan_data.outputs.total_wealth_at_60}</div>
                <div style={{ fontSize: '0.95rem', color: '#4b5563' }}>Pension: <strong style={{ color: '#047857' }}>{plan.plan_data.outputs.monthly_income_after_60}</strong></div>
                <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#3b82f6', fontWeight: 'bold', textAlign: 'center' }}>Click to Load Plan ➔</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- CALCULATOR UI --- */}
      <div className="retirement-container" style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '2rem' }}>
        
        {/* Left Column: Form */}
        <div className="form-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', height: 'fit-content' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Your Information</h2>
          
          {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>🚨 {error}</div>}

          <form onSubmit={analyzeRetirement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'Your Current Age', name: 'age' },
              { label: 'Yearly Salary (₹)', name: 'annual_income' },
              { label: 'Current Total Savings (₹)', name: 'current_savings' },
              { label: 'Monthly SIP / Stock Market (₹)', name: 'monthly_sip' },
              { label: 'Current EPF/PF Balance (₹)', name: 'epf_balance' },
              { label: 'Monthly PPF/Safe Savings (₹)', name: 'ppf_contribution' },
              { label: 'Monthly Family Expenses (₹)', name: 'monthly_expenses' },
              { label: 'Price Rise Rate / Inflation (%)', name: 'inflation_assumption' }
            ].map((field) => (
              <div key={field.name} style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.2rem' }}>{field.label}</label>
                <input
                  type="number"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  required
                  style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }}
                />
              </div>
            ))}
            
            <div style={{ display: 'flex', flexDirection: 'column', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '0.4rem' }}>Investment Style (Risk)</label>
              <select name="risk_appetite" value={formData.risk_appetite} onChange={handleInputChange} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db', marginBottom: '0.5rem' }}>
                <option value="Conservative">Safe & Slow (Conservative)</option>
                <option value="Moderate">Balanced (Moderate)</option>
                <option value="Aggressive">High Risk, Fast Growth (Aggressive)</option>
              </select>
            </div>

            <button type="submit" disabled={loading} style={{ background: '#16a34a', color: 'white', padding: '1rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: '0.5rem', fontSize: '1.1rem' }}>
              {loading ? 'Calculating Future...' : 'Calculate My Future Wealth'}
            </button>
          </form>
        </div>

        {/* Right Column: Detailed Results */}
        <div>
          {results && (
            <div className="results-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Retirement Safety Score</div>
                  <div style={{ fontSize: '3rem', fontWeight: 'bold', color: results.score >= 70 ? '#16a34a' : '#dc2626' }}>{results.score}<span style={{fontSize: '1.5rem', color: '#9ca3af'}}>/100</span></div>
                </div>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Status</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: results.risk_label === 'Danger Zone' ? '#dc2626' : '#16a34a', marginTop: '0.5rem' }}>{results.risk_label}</div>
                </div>
                <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ color: '#6b7280', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Wealth at Age 60</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#1e293b', marginTop: '0.5rem' }}>{results.total_wealth_at_60}</div>
                </div>
                <div style={{ background: '#ecfdf5', padding: '1.5rem', borderRadius: '12px', border: '2px solid #34d399', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.1)' }}>
                  <div style={{ color: '#047857', fontSize: '0.9rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monthly Pension at Age 60</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#047857', marginTop: '0.5rem' }}>{results.monthly_income_after_60}</div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                <h3 style={{ color: '#0f172a', marginBottom: '1.5rem', fontSize: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>📖 The Simple Truth About Your Money</h3>
                <p style={{ marginBottom: '1rem', fontSize: '1.1rem', lineHeight: '1.6', color: '#334155' }}><strong>1. The AI Verdict:</strong> {results.ai_main_suggestion}</p>
                <p style={{ marginBottom: '1rem', fontSize: '1.1rem', lineHeight: '1.6', color: '#334155' }}><strong>2. The Hidden Enemy (Inflation):</strong> {results.detailed_explanation.inflation_impact}</p>
                <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#334155' }}><strong>3. Your Final Score:</strong> {results.detailed_explanation.score_reason}</p>
              </div>

              <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '1.5rem', color: '#1e293b' }}>📈 Your Wealth Journey vs. Reality</h3>
                <div style={{ background: '#fffbeb', padding: '1.5rem', borderRadius: '8px', borderLeft: '5px solid #f59e0b', marginBottom: '2rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#b45309', fontSize: '1.1rem' }}>How to read this chart:</h4>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#451a03', lineHeight: '1.6', fontSize: '1.05rem' }}>
                    <li style={{ marginBottom: '0.5rem' }}><strong>The Green Line (Your Money):</strong> Your wealth growing year by year through savings and compound interest.</li>
                    <li style={{ marginBottom: '0.5rem' }}><strong>The Red Dotted Line (Danger Zone):</strong> The exact amount of money you *must* have to survive inflation.</li>
                    <li><strong>The Goal:</strong> To have a stress-free old age, your Green Line MUST cross completely above the Red Line before you reach age 60.</li>
                  </ul>
                </div>

                <div style={{ height: '400px', width: '100%', marginBottom: '1rem' }}>
                  <ResponsiveContainer>
                    <LineChart data={results.chart_data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="age" tick={{fontSize: 14}} tickMargin={10} />
                      <YAxis tickFormatter={(val) => `₹${(val/10000000).toFixed(1)}Cr`} width={80} tick={{fontSize: 14}} />
                      <Tooltip contentStyle={{ fontSize: '1.1rem', borderRadius: '8px' }} />
                      <Legend wrapperStyle={{ fontSize: '1.1rem', paddingTop: '20px' }} />
                      <Line type="monotone" dataKey="projected_wealth" name="Your Projected Money (Green Line)" stroke="#16a34a" strokeWidth={4} dot={false} />
                      <Line type="monotone" dataKey="target_corpus" name="Money Needed to Survive (Red Line)" stroke="#dc2626" strokeWidth={3} strokeDasharray="6 6" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ background: '#fff', padding: '2rem', borderRadius: '12px', borderTop: '6px solid #3b82f6', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                <h3 style={{ marginBottom: '1.5rem', color: '#1e293b', fontSize: '1.6rem' }}>🎯 Your Step-by-Step Action Plan</h3>
                <div style={{ display: 'grid', gap: '1.2rem' }}>
                  {results.specific_suggestions.map((sug, idx) => (
                    <div key={idx} style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', borderLeft: '4px solid #3b82f6', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{ background: '#3b82f6', color: 'white', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>
                        {idx + 1}
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1.2rem' }}>{sug.name}</h4>
                        <p style={{ fontSize: '1.05rem', color: '#4b5563', margin: 0, lineHeight: '1.5' }}>{sug.logic}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginTop: '1rem' }}>
                <button onClick={handleSavePlan} style={{ background: '#1e293b', color: 'white', padding: '1.2rem 3rem', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1.2rem', width: '100%', transition: 'background 0.3s' }} onMouseOver={(e) => e.target.style.background='#334155'} onMouseOut={(e) => e.target.style.background='#1e293b'}>
                  💾 Save My Retirement Plan
                </button>
                {savedStatus && (
                  <div style={{ textAlign: 'center', color: '#16a34a', fontWeight: 'bold', marginTop: '1rem', fontSize: '1.1rem', padding: '1rem', background: '#dcfce7', borderRadius: '8px', width: '100%' }}>
                    ✅ Plan Successfully Saved! Check the top of the page.
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RetirementPlanner;