import React, { useState } from 'react';
import api from '../api/axiosConfig';

const InsuranceComparison = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const [formData, setFormData] = useState({
    age: 25, gender: 'Male', income: 600000,
    budget: 3000, 
    paymentFrequency: 'Monthly', // NEW: Selection for Monthly/Yearly
    insuranceType: 'Term Insurance',
    bmi: 22, smoker: 'No', diseases: [],
    dependents: 2, outstandingLoans: 500000
  });

  const handleCheckboxChange = (e, field) => {
    const value = e.target.value;
    setFormData(prev => {
      const list = prev[field];
      if (list.includes(value)) return { ...prev, [field]: list.filter(i => i !== value) };
      return { ...prev, [field]: [...list, value] };
    });
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await api.post('/investments/insurance/advanced', formData);
      if (res.data && res.data.success) {
        setResults(res.data);
        setStep(6); 
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const getRankBadge = (index) => {
    if (index === 0) return { label: '🥇 MUST BUY', bg: 'var(--gold)', color: '#fff' };
    if (index === 1) return { label: '🥈 HIGHLY RECOMMENDED', bg: 'var(--sage)', color: 'var(--moss)' };
    return { label: '⚪ GOOD OPTION', bg: 'var(--mist)', color: 'var(--smoke)' };
  };

  const calculateMoneyBack = (policy, budget, freq) => {
    const annualBudget = freq === 'Monthly' ? budget * 12 : budget;
    
    // Health Insurance Specific Logic (Indemnity)
    if (policy.category === 'Health Insurance') {
      return {
        mainValue: "Up to 2x Base Cover",
        subText: "Cashless Medical Treatment",
        detail: "Note: Health Insurance is an indemnity plan. It pays hospital bills directly. By covering your 10L-20L surgery costs, it prevents the depletion of your lifetime savings."
      };
    }

    if (policy.category === 'Term Insurance') {
      const cover = (formData.income * 15) + Number(formData.outstandingLoans);
      return {
        mainValue: `₹${(cover / 100000).toFixed(0)} Lakhs`,
        subText: "Guaranteed Payout for family",
        detail: "This is a pure protection payout. If the insured survives the term, usually ₹0 is returned unless 'Return of Premium' rider is active."
      };
    }

    // Wealth / ULIP / Retirement (Investment)
    let total = 0;
    for (let i = 0; i < 10; i++) total = (total + annualBudget) * 1.12;
    return { 
      mainValue: `~₹${Math.round(total / 100000).toLocaleString()} Lakhs`, 
      subText: "Projected Wealth (10 Years)", 
      detail: "Estimated based on 12% average market growth for investment-linked insurance." 
    };
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="animate-fade-in">
            <h3 style={{ color: 'var(--moss)', marginBottom: '1.5rem' }}>Step 1: Personal & Investment Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div><label className="card-sub">Age</label><input type="number" className="card" style={{ width: '100%', padding: '12px' }} value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} /></div>
              <div><label className="card-sub">Annual Income (₹)</label><input type="number" className="card" style={{ width: '100%', padding: '12px' }} value={formData.income} onChange={e => setFormData({...formData, income: e.target.value})} /></div>
              
              {/* FREQUENCY SELECTION */}
              <div>
                <label className="card-sub">Investment Mode</label>
                <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                  {['Monthly', 'Yearly'].map(f => (
                    <button key={f} onClick={() => setFormData({...formData, paymentFrequency: f})} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: formData.paymentFrequency === f ? 'var(--moss)' : '#fff', color: formData.paymentFrequency === f ? '#fff' : 'var(--ink)', cursor: 'pointer', fontWeight: 'bold' }}>{f}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="card-sub">Budget ({formData.paymentFrequency === 'Monthly' ? '₹/mo' : '₹/yr'})</label>
                <input type="number" className="card" style={{ width: '100%', padding: '12px', borderLeft: '4px solid var(--gold)' }} value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})} />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="animate-fade-in">
            <h3 style={{ color: 'var(--moss)', marginBottom: '1.5rem' }}>Step 2: Choose Policy Type</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {['Term Insurance', 'Health Insurance', 'Life / ULIP', 'Retirement Plan'].map(type => (
                <button key={type} onClick={() => setFormData({...formData, insuranceType: type})} style={{ 
                  padding: '1.5rem', border: formData.insuranceType === type ? '2px solid var(--moss)' : '1px solid var(--border)', 
                  borderRadius: '12px', background: formData.insuranceType === type ? 'var(--mist)' : 'var(--paper)', cursor: 'pointer', fontWeight: 'bold', color: 'var(--ink)'
                }}>{type}</button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="animate-fade-in">
            <h3 style={{ color: 'var(--moss)', marginBottom: '1.5rem' }}>Step 3: Medical Check</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div><label className="card-sub">BMI</label><input type="number" className="card" style={{ width: '100%', padding: '12px' }} value={formData.bmi} onChange={e => setFormData({...formData, bmi: e.target.value})} /></div>
              <div><label className="card-sub">Smoker?</label><select className="card" style={{ width: '100%', padding: '12px' }} value={formData.smoker} onChange={e => setFormData({...formData, smoker: e.target.value})}><option>No</option><option>Yes</option></select></div>
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <label className="card-sub">Medical History</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                {['Diabetes', 'Heart Disease', 'Asthma', 'Thyroid'].map(d => (
                  <label key={d} className="card" style={{ padding: '10px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" value={d} checked={formData.diseases.includes(d)} onChange={e => handleCheckboxChange(e, 'diseases')} /> {d}
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      case 4:
        const safetyNet = (formData.income * 15) + Number(formData.outstandingLoans);
        return (
          <div className="animate-fade-in">
            <h3 style={{ color: 'var(--moss)', marginBottom: '1.5rem' }}>Step 4: Financial Safety</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <div><label className="card-sub">Dependents</label><input type="number" className="card" style={{ width: '100%', padding: '12px' }} value={formData.dependents} onChange={e => setFormData({...formData, dependents: e.target.value})} /></div>
              <div><label className="card-sub">Outstanding Loans (₹)</label><input type="number" className="card" style={{ width: '100%', padding: '12px' }} value={formData.outstandingLoans} onChange={e => setFormData({...formData, outstandingLoans: e.target.value})} /></div>
            </div>
            <div className="card" style={{ textAlign: 'center', background: 'var(--ink)', color: '#fff', padding: '2rem' }}>
               <div className="card-sub" style={{ color: 'var(--gold)' }}>AI CALCULATED SAFETY NET</div>
               <div className="card-value" style={{ fontSize: '2.5rem' }}>₹{(safetyNet / 100000).toFixed(0)} Lakhs</div>
               <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Recommended cover to protect your family based on annual income of ₹{formData.income.toLocaleString()}.</p>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="main" style={{ background: 'var(--paper)', minHeight: '100vh' }}>
      
      {step < 5 && (
        <div style={{ maxWidth: '700px', margin: '0 auto', paddingTop: '3rem' }}>
          <header className="page-header" style={{ textAlign: 'center' }}>
            <h1>🛡️ Insurance AI Advisor</h1>
            <p>Smart Analysis for {formData.paymentFrequency} Investment Planning</p>
          </header>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            {[1, 2, 3, 4].map(s => (
              <div key={s} style={{ width: '22%', height: '6px', background: step >= s ? 'var(--moss)' : 'var(--mist)', borderRadius: '10px' }} />
            ))}
          </div>

          <div className="card" style={{ padding: '2.5rem' }}>
            {renderStepContent()}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem' }}>
              <button disabled={step === 1} onClick={() => setStep(step - 1)} className="card" style={{ padding: '10px 25px', cursor: 'pointer' }}>Back</button>
              {step < 4 ? 
                <button onClick={() => setStep(step + 1)} className="card" style={{ background: 'var(--ink)', color: '#fff', padding: '10px 25px', cursor: 'pointer' }}>Next</button> :
                <button onClick={handleAnalyze} className="card" style={{ background: 'var(--moss)', color: '#fff', padding: '10px 25px', cursor: 'pointer' }}>{loading ? 'Analyzing...' : 'Fetch Best Policies'}</button>
              }
            </div>
          </div>
        </div>
      )}

      {step === 6 && results && (
        <div style={{ padding: '2rem' }}>
          <header className="page-header">
            <h1>Sovereign Policy Rankings</h1>
            <p>{results.profile_analysis}</p>
          </header>

          <div className="cards-row cards-3">
            {results.schemes.map((item, idx) => {
              const badge = getRankBadge(idx);
              return (
                <div key={idx} className="card" style={{ borderTop: `6px solid ${badge.bg}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ background: badge.bg, color: badge.color, padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 'bold', display: 'inline-block', marginBottom: '10px' }}>{badge.label}</div>
                    <div className="card-sub">{item.policy.company}</div>
                    <h3 style={{ margin: '5px 0' }}>{item.policy.name}</h3>
                    <div style={{ display: 'flex', gap: '10px', margin: '10px 0' }}>
                      <span className="card-sub" style={{ background: 'var(--mist)', padding: '2px 8px', borderRadius: '4px' }}>CSR: {item.policy.claim_ratio}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--smoke)' }}>{item.policy.about.substring(0, 80)}...</p>
                  </div>
                  <button onClick={() => setSelectedPolicy(item.policy)} className="card" style={{ width: '100%', background: 'var(--ink)', color: '#fff', marginTop: '20px', cursor: 'pointer' }}>View Simple Details</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedPolicy && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
          <div style={{ background: 'var(--paper)', width: '100%', maxWidth: '900px', maxHeight: '95vh', overflowY: 'auto', borderRadius: '20px', padding: '3.5rem', position: 'relative', border: '1px solid var(--border)' }}>
            <button onClick={() => setSelectedPolicy(null)} style={{ position: 'absolute', top: 20, right: 20, fontSize: '1.5rem', cursor: 'pointer', border: 'none', background: 'none', color: 'var(--smoke)' }}>✖</button>
            
            <div className="card-sub" style={{ color: 'var(--moss)', letterSpacing: '1px', fontWeight: 'bold' }}>{selectedPolicy.company.toUpperCase()}</div>
            <h2 style={{ fontFamily: 'DM Serif Display', fontSize: '3rem', marginBottom: '2rem', color: 'var(--ink)' }}>{selectedPolicy.name}</h2>
            
            {/* NEW TECHNICAL STATS ROW */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
               <div className="card" style={{ background: 'var(--mist)', padding: '15px' }}>
                  <div className="card-sub">MINIMUM INVESTMENT</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{selectedPolicy.min_invest || "₹500 /mo"}</div>
               </div>
               <div className="card" style={{ background: 'var(--mist)', padding: '15px' }}>
                  <div className="card-sub">MAXIMUM ALLOWED</div>
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{selectedPolicy.max_invest || "No upper limit"}</div>
               </div>
            </div>

            <div style={{ display: 'grid', gap: '2.5rem' }}>
              <section>
                <h4 style={{ color: 'var(--moss)', fontSize: '1.5rem', marginBottom: '0.8rem' }}>📖 What exactly is this policy?</h4>
                <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: '#333' }}>{selectedPolicy.about}</p>
              </section>

              <section style={{ background: 'var(--mist)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <h4 style={{ color: 'var(--moss)', fontSize: '1.5rem', marginBottom: '0.8rem' }}>✨ How will it benefit my family?</h4>
                <p style={{ fontSize: '1.15rem', lineHeight: '1.8', color: '#111', fontWeight: '500' }}>{selectedPolicy.benefits}</p>
              </section>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.3rem', color: 'var(--moss)', marginBottom: '0.5rem' }}>⚖️ Tax Benefits</h4>
                  <p className="card-sub" style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', lineHeight: '1.6' }}>{selectedPolicy.tax_benefit}</p>
                </div>
                <div>
                  <h4 style={{ fontSize: '1.3rem', color: 'var(--moss)', marginBottom: '0.5rem' }}>⚠️ Terms & Conditions</h4>
                  <p className="card-sub" style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border)', lineHeight: '1.6', color: '#991b1b' }}>{selectedPolicy.terms}</p>
                </div>
              </div>

              <section style={{ background: 'var(--ink)', color: '#fff', padding: '2.5rem', borderRadius: '20px', borderLeft: '10px solid var(--gold)' }}>
                <h4 style={{ color: 'var(--gold)', fontSize: '1.5rem', marginBottom: '1rem' }}>🤖 AI Advisor Verdict</h4>
                <p style={{ fontSize: '1.2rem', opacity: 0.9, lineHeight: '1.6' }}>{selectedPolicy.ai_suggestion}</p>
              </section>

              <section style={{ textAlign: 'center', border: '3px dashed var(--moss)', padding: '3.5rem', borderRadius: '24px', background: 'var(--mist)' }}>
                <h4 style={{ color: 'var(--moss)', fontSize: '1.6rem', marginBottom: '1rem' }}>💰 When & How Much Will You Get Back?</h4>
                {(() => {
                  const calc = calculateMoneyBack(selectedPolicy, formData.budget, formData.paymentFrequency);
                  return (
                    <div>
                      <div className="card-value" style={{ fontSize: '4.5rem', color: 'var(--moss)', lineHeight: '1' }}>{calc.mainValue}</div>
                      <p style={{ fontWeight: 'bold', color: 'var(--ink)', fontSize: '1.4rem', marginTop: '10px' }}>{calc.subText}</p>
                      <p className="card-sub" style={{ marginTop: '1.5rem', fontSize: '1rem', maxWidth: '80%', margin: '20px auto 0' }}>{calc.detail}</p>
                    </div>
                  );
                })()}
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsuranceComparison;