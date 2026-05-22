import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import api from '../api/axiosConfig';
import '../index.css';

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [clusterData, setClusterData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchCommunityData = async () => {
      try {
        const response = await api.get('/dashboard/community-stats');
        setClusterData(response.data);
      } catch (error) {
        console.error("Error fetching community stats", error);
        setErrorMessage(error.message || "Network Error: Is the backend running?");
      } finally {
        setLoading(false);
      }
    };

    fetchCommunityData();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading AI Cluster Analytics...</div>;
  }
  
  if (errorMessage) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
        <h2>Failed to load data.</h2>
        <p><strong>Error Details:</strong> {errorMessage}</p>
        <p>Please make sure your Flask backend is running and you restarted it!</p>
      </div>
    );
  }

  if (!clusterData) return null;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <h1 style={{ margin: 0 }}>Community Clustering Analytics</h1>
        <div style={{ background: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 'bold' }}>
          Total Investors: {clusterData.userCount}
        </div>
      </div>
      
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        A macro-level view of how our AI categorizes all registered investors dynamically using K-Means clustering.
      </p>

      {/* Warning message if there are less than 3 users */}
      {clusterData.error && (
        <div style={{ background: '#fef3c7', color: '#92400e', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #f59e0b' }}>
          <strong>Notice: </strong> {clusterData.error}. Get a few more friends to register to see the AI Persona Donut Chart come alive!
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
        
        {/* --- GRAPH 1: AI Personas --- */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3>Overall Investor Personas</h3>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem' }}>
            The K-Means algorithm groups users based on combined risk, budget, and ESG traits.
          </p>
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {clusterData.personas && clusterData.personas.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={clusterData.personas}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {clusterData.personas.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>Awaiting more user registrations...</p>
            )}
          </div>
        </div>

        {/* --- GRAPH 2: Risk Tolerance --- */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3>Risk Tolerance Distribution</h3>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem' }}>
            A breakdown of how much volatility the community is willing to accept.
          </p>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clusterData.riskDistribution} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" tick={{fontSize: 12}} />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="users" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- GRAPH 3: ESG Priority --- */}
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', gridColumn: '1 / -1' }}>
          <h3>ESG (Environmental, Social, Governance) Priority</h3>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem' }}>
            Shows the community's demand for sustainable investing vs pure returns.
          </p>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={clusterData.esgDistribution} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="users" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;