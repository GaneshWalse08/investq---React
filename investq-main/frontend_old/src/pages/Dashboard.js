import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Radar } from 'react-chartjs-2';

const Dashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      const res = await axios.get('http://localhost:5000/api/dashboard/summary');
      setData(res.data);
    };
    fetchSummary();
  }, []);

  if (!data) return <div className="loading">Initializing AI Engine...</div>;

  const esgChartData = {
    labels: data.top_ranked.map(r => r.ticker),
    datasets: [
      { label: 'Total Score', data: data.top_ranked.map(r => r.total_score), backgroundColor: '#2d6a4f99' },
      { label: 'ESG Score', data: data.top_ranked.map(r => r.esg_total), backgroundColor: '#52b78899' }
    ]
  };

  return (
    <div className="page active">
      <div className="page-header">
        <h1>Good morning, Investor</h1>
        <p>Market Mood: <strong>{data.market_overview.market_mood}</strong></p>
      </div>
      
      <div className="cards-row cards-4">
        <div className="card"><div className="card-title">Fear & Greed</div><div className="card-value">{data.sentiment.fear_greed_index}</div></div>
        <div className="card"><div className="card-title">Top Stock</div><div className="card-value">{data.top_esg[0].ticker}</div></div>
      </div>

      <div className="cards-row cards-2">
        <div className="chart-card">
          <h3>Top 5 ESG Ranked Stocks</h3>
          <div className="chart-wrap"><Bar data={esgChartData} /></div>
        </div>
      </div>
    </div>
  );
};