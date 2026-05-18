import React, { useState } from 'react';
import axios from 'axios';

const FinancialHealth = () => {
  const [formData, setFormData] = useState({
    savings_ratio: 0.2,
    total_debt: 50000,
    emi_per_month: 5000,
    insurance_coverage: 100000,
    emergency_fund: 30000,
    total_investments: 15000,
    income_stability: 'Moderate',
    monthly_expenses: 20000,
    retirement_savings: 10000
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post('http://localhost:5000/api/ml/financial_health', formData);
      if (response.data.success) {
        setResult(response.data);
      } else {
        setError(response.data.message || 'Prediction failed.');
      }
    } catch (err) {
      setError('Server error. Make sure your Flask backend is running.');
    }
    setLoading(false);
  };

  return (
    <div className="fh-container">
      <h1 className="fh-title">AI Financial Health Analyzer</h1>
      <p className="fh-subtitle">Enter your financial details to receive a health score and improvement plan.</p>

      <div className="fh-grid">
        {/* INPUT FORM */}
        <div className="fh-card">
          <h2 className="fh-card-title">Enter Your Financials</h2>
          <form onSubmit={handlePredict}>
            
            <div className="fh-input-group">
              <div>
                <label className="fh-label">Savings Ratio</label>
                <input type="number" step="0.01" name="savings_ratio" value={formData.savings_ratio} onChange={handleChange} className="fh-input" required />
                <small className="fh-help-text">Percentage of income saved (e.g., 0.20 = 20%).</small>
              </div>
              <div>
                <label className="fh-label">Income Stability</label>
                <select name="income_stability" value={formData.income_stability} onChange={handleChange} className="fh-input">
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                  <option value="Strong">Strong</option>
                </select>
                <small className="fh-help-text">How reliable is your monthly paycheck?</small>
              </div>
            </div>

            <div className="fh-input-group">
              <div>
                <label className="fh-label">Monthly Expenses (₹)</label>
                <input type="number" name="monthly_expenses" value={formData.monthly_expenses} onChange={handleChange} className="fh-input" required />
                <small className="fh-help-text">Total spend on food, rent, bills, etc.</small>
              </div>
              <div>
                <label className="fh-label">Monthly EMI (₹)</label>
                <input type="number" name="emi_per_month" value={formData.emi_per_month} onChange={handleChange} className="fh-input" required />
                <small className="fh-help-text">Total monthly loan/credit card repayments.</small>
              </div>
            </div>

            <div className="fh-input-group">
              <div>
                <label className="fh-label">Total Debt (₹)</label>
                <input type="number" name="total_debt" value={formData.total_debt} onChange={handleChange} className="fh-input" required />
                <small className="fh-help-text">Outstanding balance of all active loans.</small>
              </div>
              <div>
                <label className="fh-label">Emergency Fund (₹)</label>
                <input type="number" name="emergency_fund" value={formData.emergency_fund} onChange={handleChange} className="fh-input" required />
                <small className="fh-help-text">Cash set aside for unexpected crises.</small>
              </div>
            </div>

            <div className="fh-input-group three-cols">
              <div>
                <label className="fh-label">Investments (₹)</label>
                <input type="number" name="total_investments" value={formData.total_investments} onChange={handleChange} className="fh-input" required />
                <small className="fh-help-text">Value of Stocks/Gold/Funds.</small>
              </div>
              <div>
                <label className="fh-label">Retirement (₹)</label>
                <input type="number" name="retirement_savings" value={formData.retirement_savings} onChange={handleChange} className="fh-input" required />
                <small className="fh-help-text">Total in PF/PPF/NPS.</small>
              </div>
              <div>
                <label className="fh-label">Insurance (₹)</label>
                <input type="number" name="insurance_coverage" value={formData.insurance_coverage} onChange={handleChange} className="fh-input" required />
                <small className="fh-help-text">Total life/health cover sum.</small>
              </div>
            </div>

            <button type="submit" disabled={loading} className="fh-btn">
              {loading ? 'Processing...' : 'Analyze My Financial Health 🧠'}
            </button>
          </form>
          {error && <div className="fh-error">{error}</div>}
        </div>

        {/* RESULTS SECTION */}
        {result ? (
          <div className="fh-card fh-result-center">
            <h2 className="fh-card-title">Health Report</h2>
            
            <div className={`fh-score-circle ${result.financial_health_score >= 70 ? 'fh-score-good' : result.financial_health_score >= 40 ? 'fh-score-moderate' : 'fh-score-poor'}`}>
              <span>{result.financial_health_score}</span>
            </div>

            <div className="fh-metrics">
              <div className="fh-metric-box">
                <p className="fh-metric-label">AI Risk Assessment</p>
                <p className={`fh-metric-value ${result.financial_risk_level === 'Low' ? 'good' : 'bad'}`}>
                  {result.financial_risk_level}
                </p>
              </div>
              <div className="fh-metric-box">
                <p className="fh-metric-label">Savings Grade</p>
                <p className="fh-metric-value neutral">{result.savings_quality}</p>
              </div>
            </div>

            <div className="fh-ai-reasoning">
              <h3 className="fh-ai-title">🤖 AI Deep Reasoning</h3>
              <p className="fh-ai-text">{result.ai_reasoning}</p>
              
              <hr style={{ margin: '15px 0', borderColor: 'rgba(30, 58, 138, 0.1)' }} />
              
              <h3 className="fh-ai-title" style={{ color: '#047857' }}>📈 How to Increase Your Score</h3>
              <ul className="fh-ai-text" style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                {result.financial_health_score < 80 && (
                  <li><strong>Boost Emergency Reserves:</strong> Aim for 6 months of expenses (₹{formData.monthly_expenses * 6}) to lower risk.</li>
                )}
                {formData.savings_ratio < 0.3 && (
                  <li><strong>Increase Savings:</strong> Try to reach a 30% savings ratio by cutting non-essential costs.</li>
                )}
                {formData.total_debt > (formData.monthly_expenses * 12) && (
                  <li><strong>Debt Reduction:</strong> Prioritize high-interest debt to lower your Debt-to-Income ratio.</li>
                )}
                <li><strong>Insurance Optimization:</strong> Ensure your cover is at least 10x your annual expenses.</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="fh-empty-state">
            <span>🧠</span>
            <p>Fill in the data and let the AI evaluate your financial stability.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialHealth;