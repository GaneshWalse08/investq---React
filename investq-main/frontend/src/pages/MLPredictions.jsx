import { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function MLPredictions() {
  const [availableStocks, setAvailableStocks] = useState([]);
  const [selectedTicker, setSelectedTicker] = useState('');
  const [mlData, setMlData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1. Fetch available stocks for the dropdown on load
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const res = await api.get('/stocks');
        setAvailableStocks(res.data);
        if (res.data.length > 0) setSelectedTicker(res.data[0].ticker);
      } catch (err) {
        console.error("Failed to fetch stocks", err);
      }
    };
    fetchStocks();
  }, []);

  // 2. Run the ML Prediction
  const runPrediction = async () => {
    if (!selectedTicker) return;
    
    setLoading(true);
    setError(null);
    setMlData(null);

    try {
      const res = await api.get(`/ml/predict/${selectedTicker}`);
      if (res.data.error) {
        setError(res.data.error);
      } else {
        setMlData(res.data);
      }
    } catch (err) {
      console.error("ML Prediction Error:", err);
      setError("Failed to generate prediction. Check if the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Prepare Chart Data (if mlData exists)
  let chartData = null;
  if (mlData) {
    const combinedDates = [...mlData.historical_dates, ...mlData.future_dates];
    
    // Pad arrays so the lines connect perfectly
    const historyData = [...mlData.historical_prices, ...Array(mlData.future_dates.length).fill(null)];
    const futureData = [
      ...Array(mlData.historical_prices.length - 1).fill(null), 
      mlData.historical_prices[mlData.historical_prices.length - 1], // Connection point
      ...mlData.future_prices
    ];

    chartData = {
      labels: combinedDates,
      datasets: [
        {
          label: 'Historical Price (USD)',
          data: historyData,
          borderColor: '#0d1117',
          backgroundColor: '#0d1117',
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHitRadius: 15,
          borderWidth: 2,
          tension: 0.1
        },
        {
          label: 'AI Prediction (30 Days)',
          data: futureData,
          borderColor: '#d4a843',
          backgroundColor: '#d4a843',
          borderDash: [5, 5], 
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHitRadius: 15,
          borderWidth: 3,
          tension: 0.1
        }
      ]
    };
  }

  return (
    <div className="page active">
      <div className="page-header">
        <h1>Machine Learning Price Prediction</h1>
        <p>Auto-regressive AI model trained on live historical data to forecast 30-day trends.</p>
      </div>
      
      <div className="chart-card">
        <h3>Select Asset for AI Analysis</h3>
        <div className="controls" style={{ display: 'flex', gap: '1rem', marginTop: '1rem', alignItems: 'center' }}>
          <select 
            className="ctrl-select" 
            value={selectedTicker} 
            onChange={(e) => setSelectedTicker(e.target.value)}
            style={{ minWidth: '180px' }}
          >
            {availableStocks.map(s => (
              <option key={s.ticker} value={s.ticker}>{s.ticker} — {s.name}</option>
            ))}
          </select>
          <button className="ctrl-btn" onClick={runPrediction}>
            🤖 Run Prediction
          </button>
        </div>
      </div>

      {loading && <div className="loading"><span className="spinner"></span> Running Scikit-Learn Model...</div>}
      {error && <div className="loading" style={{ color: 'var(--rust)' }}>🚨 {error}</div>}

      {mlData && !loading && (
        <div id="mlResults">
          <div className="cards-row cards-3">
            <div className="card">
              <div className="card-title">Current Price</div>
              <div className="card-value">${mlData.current_price.toLocaleString()}</div>
              <div className="card-sub">₹{mlData.current_price_inr.toLocaleString('en-IN')}</div>
            </div>
            <div className="card">
              <div className="card-title">Predicted Price (30 Days)</div>
              <div className="card-value">${mlData.predicted_price.toLocaleString()}</div>
              <div className="card-sub">₹{mlData.predicted_price_inr.toLocaleString('en-IN')}</div>
            </div>
            <div className="card">
              <div className="card-title">AI Trend Signal</div>
              <div className={`card-value ${mlData.change_pct > 0 ? 'pos' : 'neg'}`}>{mlData.trend}</div>
              <div className="card-sub">Expected Change: {mlData.change_pct > 0 ? '+' : ''}{mlData.change_pct}%</div>
            </div>
          </div>
          
          <div className="chart-card">
            <h3>30-Day Forecast vs Historical Price</h3>
            <div className="chart-wrap" style={{ height: '400px' }}>
              <Line 
                data={chartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  interaction: { mode: 'index', intersect: false },
                  scales: {
                    x: { ticks: { maxTicksLimit: 15 } },
                    y: { title: { display: true, text: 'Price (USD)' } }
                  }
                }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}