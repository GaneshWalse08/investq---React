// frontend/src/pages/RetirementPlanner.jsx
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api/axiosConfig';

const RetirementPlanner = () => {
  const [formData, setFormData] = useState({
    age: 25,
    annual_income: 1200000,
    current_savings: 500000,
    monthly_sip: 15000,
    epf_balance: 200000,
    ppf_contribution: 5000,
    nps_contribution: 3000,
    risk_appetite: 'Moderate',
    inflation_assumption: 6,
    monthly_expenses: 45000,
    dependents: 3
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

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
    try {
      const response = await api.post('/retirement/predict', formData);
      setResults(response.data.outputs);
    } catch (error) {
      console.error("Error", error);
    }
    setLoading(false);
  };

  return (
    <div className="main">
      <div className="page-header">
        <h1>AI Retirement Planning Module</h1>
        <p>Predict retirement readiness, corpus sufficiency, and deep financial modeling using Machine Learning.</p>
      </div>

      <div className="retirement-container">
        {/* Left Column: Form */}
        <div className="form-card">
          <h2>Input Features</h2>
          <form onSubmit={analyzeRetirement} className="space-y-3">
            {[
              { label: 'Age', name: 'age' },
              { label: 'Salary (Annual ₹)', name: 'annual_income' },
              { label: 'Current Savings (₹)', name: 'current_savings' },
              { label: 'Monthly SIP (₹)', name: 'monthly_sip' },
              { label: 'EPF Balance (₹)', name: 'epf_balance' },
              { label: 'PPF Contribution/month (₹)', name: 'ppf_contribution' },
              { label: 'NPS Contribution/month (₹)', name: 'nps_contribution' },
              { label: 'Expenses/month (₹)', name: 'monthly_expenses' },
              { label: 'Dependents', name: 'dependents' },
              { label: 'Inflation Assumption (%)', name: 'inflation_assumption' }
            ].map((field) => (
              <div className="form-group" key={field.name}>
                <label>{field.label}</label>
                <input
                  type="number"
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleInputChange}
                  required
                />
              </div>
            ))}
            
            <div className="form-group"><label>Risk Appetite</label>
              <select name="risk_appetite" value={formData.risk_appetite} onChange={handleInputChange} 
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <option value="Conservative">Conservative</option>
                <option value="Moderate">Moderate</option>
                <option value="Aggressive">Aggressive</option>
              </select>
            </div>

            <button type="submit" className="btn-primary mt-4" disabled={loading}>
              {loading ? 'Processing ML Model...' : 'Run Full AI Prediction'}
            </button>
          </form>
        </div>

        {/* Right Column: Massive Detailed Results */}
        {results && (
          <div className="results-panel space-y-6">
            
            {/* 1. Core Outputs */}
            <div className="cards-row cards-2">
              <div className="card">
                <div className="card-title">Retirement Readiness Score</div>
                <div className={`card-value ${parseInt(results.score) >= 70 ? 'pos' : 'neg'}`}>{results.score}</div>
              </div>
              <div className="card">
                <div className="card-title">Retirement Risk</div>
                <div className="card-value" style={{color: results.risk === 'High' ? 'var(--rust)' : 'var(--moss)'}}>
                  {results.risk}
                </div>
              </div>
              <div className="card">
                <div className="card-title">Predicted Corpus</div>
                <div className="card-value">{results.predicted_corpus}</div>
              </div>
              <div className="card" style={{ borderLeft: '4px solid var(--moss)' }}>
                <div className="card-title text-moss font-bold">Pension Estimate</div>
                <div className="card-value" style={{ color: 'var(--moss)' }}>{results.pension_estimate}</div>
              </div>
            </div>

            {/* 2. Detailed AI Explanation */}
            <div className="card" style={{ backgroundColor: 'var(--paper)' }}>
              <h3 style={{ fontFamily: 'DM Serif Display', color: 'var(--moss)', marginBottom: '1rem' }}>🧠 Detailed AI Analysis</h3>
              <p style={{ color: 'var(--ink)', marginBottom: '0.5rem' }}><strong>Primary AI Suggestion:</strong> {results.ai_main_suggestion}</p>
              <p style={{ color: 'var(--smoke)', marginBottom: '0.5rem' }}><strong>Inflation Reality:</strong> {results.detailed_explanation.inflation_impact}</p>
              <p style={{ color: 'var(--smoke)' }}><strong>Why this Score?</strong> {results.detailed_explanation.score_reason}</p>
            </div>

            {/* 3. Graphical Representation & Explanation */}
            <div className="chart-card">
              <h3>Graphical Representation: Wealth vs. Requirement</h3>
              <div style={{ height: '300px', width: '100%', marginBottom: '1rem' }}>
                <ResponsiveContainer>
                  <LineChart data={results.chart_data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d1c9be" />
                    <XAxis dataKey="age" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" tickFormatter={(val) => `₹${(val/10000000).toFixed(1)}Cr`} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #d1c9be', borderRadius: '8px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="projected_wealth" name="Predicted Wealth" stroke="#2d6a4f" strokeWidth={3} dot={false} />
                    <Line type="monotone" dataKey="target_corpus" name="Target Required" stroke="#c0392b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ padding: '1rem', backgroundColor: '#fff', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--smoke)' }}><strong>Graph Explanation:</strong> {results.graph_explanation}</p>
              </div>
            </div>

            {/* 4. Best Investment Planning & Suggestions */}
            <div className="card" style={{ borderTop: '4px solid var(--gold)' }}>
              <h3 style={{ fontFamily: 'DM Serif Display', marginBottom: '1rem' }}>📈 Specific Investment Suggestions</h3>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {results.specific_suggestions.map((sug, idx) => (
                  <div key={idx} style={{ padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <h4 style={{ color: 'var(--ink)', fontSize: '1rem', marginBottom: '0.3rem' }}>{sug.type}: <strong>{sug.name}</strong></h4>
                    <p style={{ color: 'var(--smoke)', fontSize: '0.9rem' }}>{sug.logic}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Retirement Roadmap */}
            <div className="card">
              <h3 style={{ fontFamily: 'DM Serif Display', marginBottom: '1rem' }}>🗺️ Your Long-Term Roadmap</h3>
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {results.investment_roadmap.map((step, idx) => (
                  <li key={idx} style={{ padding: '1rem 0', borderBottom: idx !== 3 ? '1px solid var(--mist)' : 'none' }}>
                    <strong style={{ color: 'var(--moss)', display: 'block', marginBottom: '0.3rem' }}>{step.phase}</strong>
                    <span style={{ color: 'var(--smoke)', fontSize: '0.95rem' }}>{step.action}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default RetirementPlanner;