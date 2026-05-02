import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { stocksAPI } from '../services/api';

export default function ProfilePage() {
  const { user, updatePrefs } = useAuth();
  const [form, setForm] = useState({
    riskTolerance: user?.riskTolerance || 'moderate',
    esgPreference: user?.esgPreference || 50,
  });
  const [cluster, setCluster] = useState(null);
  const [saved, setSaved] = useState(false);
  const [budget, setBudget] = useState(10000);
  const [duration, setDuration] = useState(5);

  const handleSave = async () => {
    const r = await updatePrefs(form);
    if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  const getCluster = async () => {
    try {
      const r = await stocksAPI.cluster({ ...form, budget, duration });
      setCluster(r.data);
    } catch (e) { console.error(e); }
  };

  const clusterColor = c => c === 'Conservative' ? 'var(--green)' : c === 'Aggressive' ? 'var(--red)' : 'var(--accent)';

  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <div className="mb-24">
        <h1>Profile & Preferences</h1>
        <p style={{ marginTop: 4 }}>Personalize your investment experience</p>
      </div>

      <div className="grid grid-2" style={{ gap: 20, alignItems: 'start' }}>
        {/* Account info */}
        <div>
          <div className="card mb-20">
            <h3 className="mb-16">Account</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--purple) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: 22, color: '#fff', flexShrink: 0
              }}>{user?.username?.[0]?.toUpperCase()}</div>
              <div>
                <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)' }}>{user?.username}</div>
                <div style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>{user?.email}</div>
              </div>
            </div>
            <div className="divider" />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '8px 0' }}>
              <span style={{ color: 'var(--text3)' }}>Current risk profile</span>
              <span style={{ color: 'var(--text)', fontWeight: 500, textTransform: 'capitalize' }}>{user?.riskTolerance}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '8px 0' }}>
              <span style={{ color: 'var(--text3)' }}>ESG weight</span>
              <span style={{ color: 'var(--teal)', fontWeight: 500 }}>{user?.esgPreference}%</span>
            </div>
          </div>

          {/* Update prefs */}
          <div className="card">
            <h3 className="mb-16">Update Preferences</h3>
            <div className="form-group">
              <label className="form-label">Risk Tolerance</label>
              <select className="form-input" value={form.riskTolerance}
                onChange={e => setForm(f => ({ ...f, riskTolerance: e.target.value }))}>
                <option value="conservative">Conservative — Capital preservation</option>
                <option value="moderate">Moderate — Balanced growth</option>
                <option value="aggressive">Aggressive — High growth</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">ESG Preference — {form.esgPreference}%</label>
              <input type="range" min={0} max={100} value={form.esgPreference}
                onChange={e => setForm(f => ({ ...f, esgPreference: +e.target.value }))}
                style={{ width: '100%', accentColor: 'var(--teal)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text3)', marginTop: 4 }}>
                <span>Financial only</span><span>Balanced</span><span>ESG-first</span>
              </div>
            </div>
            <button className="btn btn-primary btn-block" onClick={handleSave}>
              {saved ? '✓ Saved!' : 'Save Preferences'}
            </button>
          </div>
        </div>

        {/* Investor cluster */}
        <div className="card">
          <h3 className="mb-16">Investor Profiler (K-Means)</h3>
          <p style={{ fontSize: '0.85rem', marginBottom: 20 }}>Discover which investor archetype you belong to based on your parameters.</p>

          <div className="form-group">
            <label className="form-label">Investment Budget ($)</label>
            <input className="form-input" type="number" value={budget} onChange={e => setBudget(+e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Time Horizon (years)</label>
            <input className="form-input" type="number" min={1} max={30} value={duration} onChange={e => setDuration(+e.target.value)} />
          </div>

          <button className="btn btn-primary btn-block mb-16" onClick={getCluster}>Determine My Profile</button>

          {cluster && (
            <div style={{ padding: '20px', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: `1px solid ${clusterColor(cluster.cluster)}33`, textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Your Investor Type</div>
              <div style={{ fontFamily: 'var(--font-head)', fontWeight: 800, fontSize: '1.8rem', color: clusterColor(cluster.cluster), marginBottom: 10 }}>{cluster.cluster}</div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text2)' }}>{cluster.description}</p>
              <div className="divider" />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                {cluster.cluster === 'Conservative' && ['Low volatility stocks', 'Bonds & dividend payers', 'High ESG rated', 'Capital preservation'].map(t => (
                  <span key={t} className="tag">{t}</span>
                ))}
                {cluster.cluster === 'Balanced' && ['Mixed asset class', 'Growth + income', 'Moderate ESG focus', 'Diversified sectors'].map(t => (
                  <span key={t} className="tag">{t}</span>
                ))}
                {cluster.cluster === 'Aggressive' && ['High growth stocks', 'Tech & innovation', 'Higher volatility OK', 'Long time horizon'].map(t => (
                  <span key={t} className="tag">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
