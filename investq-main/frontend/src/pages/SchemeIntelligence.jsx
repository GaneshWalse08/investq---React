import React, { useState } from 'react';
import api from '../api/axiosConfig';

const SchemeIntelligence = () => {
  const [formData, setFormData] = useState({
    age: 30,
    income: 800000,
    job_type: 'Private',
    gender: 'Male',
    num_children: 0,
    num_daughters: 0,
    youngest_daughter_age: '',
    goal: 'Wealth Creation',
    budget: 10000
  });

  const [results, setResults] = useState(null);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAnalyze = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/investments/schemes', formData);
      if (res.data && res.data.success) {
        setResults(res.data);
      } else {
        setErrorMsg(res.data?.message || "Server returned an error.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to connect to the backend. Is Flask running on port 5000?");
    }
    setLoading(false);
  };

  // Ranking System Visuals
  const getRankBadge = (index) => {
    if (index === 0) return { label: '🥇 #1 TOP MATCH: MUST INVEST', bg: '#fef08a', color: '#854d0e', border: '2px solid #eab308' };
    if (index <= 2) return { label: '🥈 HIGHLY RECOMMENDED', bg: '#dcfce7', color: '#166534', border: '1px solid #86efac' };
    if (index <= 5) return { label: '🥉 GOOD ADDITION', bg: '#e0f2fe', color: '#0369a1', border: '1px solid #7dd3fc' };
    return { label: '⚪ SKIPPABLE / OPTIONAL', bg: '#f1f5f9', color: '#64748b', border: '1px dashed #cbd5e1' };
  };

  // Upgraded Financial Engine for Beginners
  const calculateDetailedReturns = (scheme, monthlyBudget) => {
    const yearly = monthlyBudget * 12;

    if (['PPF', 'SSY', 'EPF', 'NSC', 'KVP'].includes(scheme.id)) {
      const rate = parseFloat(scheme.interest_rate) / 100 || 0.075;
      const years = parseInt(scheme.lock_in) || 15;
      let total = 0;
      for (let i = 0; i < years; i++) total = (total + yearly) * (1 + rate);
      return { invested: yearly * years, profit: total - (yearly * years), final: total, timeframe: `${years} Years`, disclaimer: 'Guaranteed by Govt. of India. Zero Market Risk.' };
    }

    if (['SCSS', 'POMIS', 'MSSC'].includes(scheme.id)) {
      const rate = parseFloat(scheme.interest_rate) / 100 || 0.08;
      const years = parseInt(scheme.lock_in) || 5;
      const lumpsum = yearly;
      return { invested: lumpsum, profit: lumpsum * rate * years, final: lumpsum + (lumpsum * rate * years), timeframe: `${years} Years`, disclaimer: 'Calculated assuming you deposit 1 year of your savings as a Lumpsum. Gives guaranteed regular payouts.' };
    }

    if (scheme.id === 'NPS') {
      const rate = 0.10;
      const years = 20;
      let total = 0;
      for (let i = 0; i < years; i++) total = (total + yearly) * (1 + rate);
      return { invested: yearly * years, profit: total - (yearly * years), final: total, timeframe: `20 Years (Retirement Horizon)`, disclaimer: 'Based on a conservative 10% historical stock market average. Actual returns may vary.' };
    }

    if (scheme.id === 'ELSS') {
      const rate = 0.12;
      const years = 10;
      let total = 0;
      for (let i = 0; i < years; i++) total = (total + yearly) * (1 + rate);
      return { invested: yearly * years, profit: total - (yearly * years), final: total, timeframe: `10 Years (Recommended Horizon)`, disclaimer: 'Based on 12% historical average of Indian Mutual Funds. Wealth creation relies on compounding.' };
    }

    if (scheme.category === 'Insurance') {
      return { invested: scheme.min_investment, profit: 200000 - scheme.min_investment, final: 200000, timeframe: 'Annual Cover', disclaimer: 'This is a pure insurance cover. The final amount is paid out only in case of a qualifying mishap.' };
    }

    return { invested: yearly * 5, profit: (yearly * 5) * 0.4, final: (yearly * 5) * 1.4, timeframe: '5 Years', disclaimer: 'Standard mathematical estimation.' };
  };

  return (
    <div className="main" style={{ paddingBottom: '5rem', background: '#f8fafc' }}>
      <header className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: 'DM Serif Display', fontSize: '2.5rem', color: 'var(--ink)' }}>🏛️ Sovereign Scheme Intelligence</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--smoke)' }}>The simplest way to find the best Government Schemes for your family.</p>
      </header>

      {/* THE BIG FORM */}
      <div className="card" style={{ marginBottom: '2rem', padding: '2rem', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h3 style={{ marginBottom: '1.5rem', fontFamily: 'DM Serif Display', fontSize: '1.5rem', color: 'var(--moss)' }}>
          Tell us about yourself
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#475569' }}>Your Age</label>
            <input type="number" className="card" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} value={formData.age}
              onChange={(e) => setFormData({...formData, age: e.target.value})} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#475569' }}>Annual Income (₹)</label>
            <input type="number" className="card" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} value={formData.income}
              onChange={(e) => setFormData({...formData, income: e.target.value})} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#475569' }}>Gender</label>
            <select className="card" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#475569' }}>Employment Type</label>
            <select className="card" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} value={formData.job_type}
              onChange={(e) => setFormData({...formData, job_type: e.target.value})}>
              <option value="Private">Private Job / Corporate</option>
              <option value="Govt">Government / PSU</option>
              <option value="Business">Self-Employed / Business</option>
              <option value="Unemployed">Unemployed / Homemaker</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#475569' }}>Number of Children</label>
            <input type="number" className="card" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} value={formData.num_children} min="0" max="10"
              onChange={(e) => setFormData({...formData, num_children: e.target.value})} />
          </div>

          {formData.num_children > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#475569' }}>How many are daughters?</label>
              <input type="number" className="card" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', borderLeft: '4px solid #ec4899' }} value={formData.num_daughters} min="0" max={formData.num_children}
                onChange={(e) => setFormData({...formData, num_daughters: e.target.value})} />
            </div>
          )}

          {formData.num_daughters > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#475569' }}>Age of youngest daughter</label>
              <input type="number" className="card" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', borderLeft: '4px solid #ec4899' }} value={formData.youngest_daughter_age} min="0"
                onChange={(e) => setFormData({...formData, youngest_daughter_age: e.target.value})} placeholder="e.g. 4" />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#475569' }}>What is your main goal?</label>
            <select className="card" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} value={formData.goal}
              onChange={(e) => setFormData({...formData, goal: e.target.value})}>
              <option value="Wealth Creation">Max Return / Wealth Creation</option>
              <option value="Tax Saving">Save on Income Tax</option>
              <option value="Pension">Retirement / Monthly Pension</option>
              <option value="Safe Returns">Zero Risk / 100% Safety</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#475569' }}>Monthly Investment Budget (₹)</label>
            <input type="number" className="card" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', borderLeft: '4px solid var(--gold)', fontSize: '1.1rem', fontWeight: 'bold' }} value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: e.target.value})} />
          </div>

        </div>

        {errorMsg && (
          <div style={{ marginTop: '1.5rem', padding: '15px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', fontWeight: 'bold' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        <button onClick={handleAnalyze} style={{ 
          marginTop: '2.5rem', width: '100%', background: 'var(--moss)', color: '#fff', 
          border: 'none', padding: '18px', borderRadius: '12px', cursor: 'pointer',
          fontFamily: 'DM Sans', fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '1px',
          boxShadow: '0 4px 14px 0 rgba(45, 106, 79, 0.39)'
        }}>
          {loading ? 'Finding the best schemes for you...' : 'Find My Schemes'}
        </button>
      </div>

      {/* RESULTS GRID WITH RANKING BADGES */}
      {results && (
        <>
          <div style={{ padding: '1.5rem', background: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '12px', color: '#0369a1', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.5' }}>
            <strong>💡 AI Analysis Complete:</strong> {results.profile_analysis}
          </div>

          <div className="cards-row cards-3">
            {results.schemes.map((scheme, index) => {
              const badge = getRankBadge(index);
              return (
                <div key={scheme.id} className="card" style={{ 
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between', 
                  borderRadius: '16px', border: badge.border, 
                  background: index === 0 ? '#fffbeb' : '#fff', // Slight yellow tint for the top match
                  boxShadow: index === 0 ? '0 10px 15px -3px rgba(250, 204, 21, 0.2)' : 'none'
                }}>
                  <div>
                    {/* RANKING BADGE */}
                    <div style={{ 
                      background: badge.bg, color: badge.color, padding: '6px 12px', 
                      borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', 
                      marginBottom: '1rem', display: 'inline-block' 
                    }}>
                      {badge.label}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--smoke)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {scheme.category}
                      </span>
                      <span style={{ fontSize: '0.9rem', background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold' }}>
                        {scheme.interest_rate}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.3rem', marginBottom: '10px', color: 'var(--ink)' }}>{scheme.name}</h3>
                    <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '20px', lineHeight: '1.5' }}>
                      {scheme.about.substring(0, 85)}...
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => setSelectedScheme(scheme)}
                    style={{ width: '100%', padding: '12px', background: 'var(--ink)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#fff', border: 'none', fontSize: '1rem' }}>
                    View Full Details
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* DETAILED MODAL OVERLAY (THE "ELI5" BEGINNER VIEW) */}
      {selectedScheme && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(15, 23, 42, 0.8)', zIndex: 100, display: 'flex', 
          justifyContent: 'center', alignItems: 'center', padding: '1.5rem'
        }}>
          <div style={{
            background: '#fff', width: '100%', maxWidth: '900px', 
            maxHeight: '90vh', overflowY: 'auto', borderRadius: '24px', 
            padding: '3rem', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            
            <button onClick={() => setSelectedScheme(null)} style={{
              position: 'absolute', top: '25px', right: '25px', background: '#f1f5f9',
              border: 'none', width: '45px', height: '45px', borderRadius: '50%',
              fontSize: '1.4rem', cursor: 'pointer', color: '#64748b', fontWeight: 'bold', transition: '0.2s'
            }}>✖</button>

            <span style={{ textTransform: 'uppercase', fontSize: '0.9rem', fontWeight: '800', color: '#0ea5e9', letterSpacing: '2px', background: '#e0f2fe', padding: '6px 14px', borderRadius: '20px' }}>
              {selectedScheme.category}
            </span>
            
            <h2 style={{ fontFamily: 'DM Serif Display', fontSize: '2.8rem', margin: '1rem 0 0.5rem', color: 'var(--ink)', lineHeight: '1.1' }}>
              {selectedScheme.name}
            </h2>
            
            <div style={{ fontSize: '1.2rem', color: '#475569', marginBottom: '2.5rem', fontWeight: '500' }}>
              Current Expected Return Rate: <strong style={{ color: '#16a34a', background: '#dcfce7', padding: '4px 10px', borderRadius: '8px' }}>{selectedScheme.interest_rate}</strong>
            </div>

            {/* QUICK STATS ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', marginBottom: '8px' }}>⏳ TIME NEEDED</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--ink)' }}>{selectedScheme.lock_in}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', marginBottom: '8px' }}>⬇️ MIN TO START</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--ink)' }}>₹{selectedScheme.min_investment.toLocaleString()}</div>
              </div>
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', marginBottom: '8px' }}>⬆️ MAX ALLOWED</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--ink)' }}>₹{selectedScheme.max_investment.toLocaleString()}</div>
              </div>
            </div>

            {/* BIG BEGINNER FRIENDLY TEXT SECTIONS */}
            <div style={{ display: 'grid', gap: '2.5rem', marginBottom: '3rem' }}>
              
              <div>
                <h4 style={{ color: 'var(--ink)', fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  📖 What exactly is this?
                </h4>
                <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: '#334155' }}>
                  {selectedScheme.about}
                </p>
              </div>

              <div style={{ background: '#f0fdf4', padding: '1.8rem', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
                <h4 style={{ color: '#166534', fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  ✨ How will it benefit me?
                </h4>
                <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: '#15803d', fontWeight: '500' }}>
                  ✓ {selectedScheme.benefits}
                </p>
              </div>

              <div>
                <h4 style={{ color: 'var(--ink)', fontSize: '1.4rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  ⚖️ Do I have to pay tax on this?
                </h4>
                <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: '#334155' }}>
                  The government classifies this under <strong>{selectedScheme.tax_benefit}</strong>. If it says "EEE" or "Tax Free", it means the money you put in, the interest you earn, and the final amount you take home are ALL completely free from income tax!
                </p>
              </div>

              <div style={{ background: '#0f172a', color: '#f8fafc', padding: '2.5rem', borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}>
                <h4 style={{ color: '#fbbf24', fontSize: '1.5rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  🤖 AI Advisor: Should you invest?
                </h4>
                <p style={{ fontSize: '1.2rem', lineHeight: '1.8', letterSpacing: '0.3px' }}>
                  {selectedScheme.ai_suggestion}
                </p>
              </div>

            </div>

            {/* THE NEW MASSIVE WEALTH BREAKDOWN CALCULATOR */}
            {(() => {
              const calc = calculateDetailedReturns(selectedScheme, formData.budget);
              return (
                <div style={{ background: '#fff', border: '2px solid #e2e8f0', borderRadius: '24px', overflow: 'hidden' }}>
                  
                  <div style={{ background: '#f8fafc', padding: '2rem', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--ink)', fontSize: '1.8rem', margin: 0 }}>
                      💰 Your Wealth Breakdown
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                      If you put <strong>₹{formData.budget.toLocaleString()}</strong> every month into this scheme for <strong>{calc.timeframe}</strong>:
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '2.5rem', gap: '2rem', textAlign: 'center' }}>
                    
                    <div>
                      <div style={{ color: '#64748b', fontSize: '1rem', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>You Invest</div>
                      <div style={{ fontSize: '2rem', fontWeight: '800', color: '#475569' }}>₹{Math.round(calc.invested).toLocaleString()}</div>
                    </div>

                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: '-20px', top: '30%', fontSize: '1.5rem', color: '#cbd5e1' }}>+</div>
                      <div style={{ color: '#16a34a', fontSize: '1rem', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>Est. Profit Generated</div>
                      <div style={{ fontSize: '2rem', fontWeight: '800', color: '#16a34a' }}>₹{Math.round(calc.profit).toLocaleString()}</div>
                      <div style={{ position: 'absolute', right: '-20px', top: '30%', fontSize: '1.5rem', color: '#cbd5e1' }}>=</div>
                    </div>

                    <div style={{ background: '#fffbeb', padding: '1.5rem', borderRadius: '16px', border: '2px solid #fde68a', marginTop: '-1.5rem' }}>
                      <div style={{ color: '#b45309', fontSize: '1rem', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase' }}>Total Final Value</div>
                      <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#d97706' }}>₹{Math.round(calc.final).toLocaleString()}</div>
                    </div>

                  </div>

                  <div style={{ background: '#f1f5f9', padding: '1rem 2rem', fontSize: '0.95rem', color: '#64748b', fontStyle: 'italic', textAlign: 'center' }}>
                    * {calc.disclaimer}
                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      )}

    </div>
  );
};

export default SchemeIntelligence;