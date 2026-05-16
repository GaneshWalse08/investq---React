import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import '../styles/global.css';

const formatRupee = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const StockDetailPage = () => {
  const { symbol } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await api.get(`/stocks/${symbol}`);
        
        // Format the 30-day prices for the Recharts graph
        const chartData = response.data.allPrices.map((price, index) => ({
          day: `Day ${index + 1}`,
          price: Math.round(price)
        }));
        
        setData({ ...response.data, chartData });
      } catch (error) {
        console.error("Error fetching detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [symbol]);

  if (loading) return <div className="loading-screen"><h2>Running VADER Sentiment Analysis on {symbol}...</h2></div>;
  if (!data) return <div className="loading-screen"><h2>Asset not found.</h2></div>;

  // Determine colors based on your backend's marketMood
  const moodColor = data.sentiment.marketMood === 'Bullish' ? '#10b981' : data.sentiment.marketMood === 'Bearish' ? '#ef4444' : '#f59e0b';

  return (
    <div className="dashboard-container">
      <Link to="/stocks" style={{ textDecoration: 'none', color: '#3b82f6', fontWeight: 'bold', marginBottom: '20px', display: 'inline-block' }}>
        &larr; Back to Market Intelligence
      </Link>
      
      <div className="header-section">
        <h1>{data.name} ({data.symbol})</h1>
        <p style={{ fontSize: '28px', color: '#0f172a', fontWeight: 'bold', margin: '5px 0' }}>{formatRupee(data.price)}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        
        {/* LEFT COLUMN: Price Chart */}
        <div className="table-card" style={{ padding: '25px' }}>
          <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>30-Day Valuation Trend</h3>
          <div style={{ width: '100%', height: '350px' }}>
            <ResponsiveContainer>
              <LineChart data={data.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" hide />
                <YAxis domain={['auto', 'auto']} tickFormatter={(tick) => `₹${tick}`} stroke="#64748b" />
                <Tooltip 
                  formatter={(value) => [formatRupee(value), "Closing Price"]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Sentiment & Headlines */}
        <div className="table-card" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ margin: 0, color: '#1e293b' }}>VADER Sentiment Analysis</h3>
          
          <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#f8fafc', borderLeft: `6px solid ${moodColor}` }}>
            <h2 style={{ color: moodColor, margin: '0 0 10px 0', fontSize: '24px' }}>{data.sentiment.marketMood}</h2>
            <p style={{ margin: '0', color: '#475569', fontSize: '15px' }}>
              <strong>AI Compound Score:</strong> {data.sentiment.averageScore}
            </p>
          </div>

          <div>
            <h4 style={{ margin: '0 0 10px 0', color: '#475569', fontSize: '14px', textTransform: 'uppercase' }}>Recent News Catalysts</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.sentiment.articles.map((article, index) => (
                <div key={index} style={{ 
                  padding: '12px', 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ fontSize: '13px', color: '#1e293b', fontWeight: '500', lineHeight: '1.4' }}>
                    "{article.headline}"
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                    <span style={{ color: '#94a3b8' }}>{article.date}</span>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      fontWeight: 'bold',
                      backgroundColor: article.label === 'positive' ? '#d1fae5' : article.label === 'negative' ? '#fee2e2' : '#fef3c7',
                      color: article.label === 'positive' ? '#059669' : article.label === 'negative' ? '#dc2626' : '#d97706',
                    }}>
                      {article.label.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default StockDetailPage;