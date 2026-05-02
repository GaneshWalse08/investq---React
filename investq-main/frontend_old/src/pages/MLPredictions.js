import React, { useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';

const MLPredictions = ({ allStocks }) => {
  const [ticker, setTicker] = useState('');
  const [prediction, setPrediction] = useState(null);

  const runPrediction = async () => {
    const res = await axios.get(`http://localhost:5000/api/ml/predict/${ticker}`);
    setPrediction(res.data);
  };

  return (
    <div className="page active">
      <div className="page-header"><h1>AI Price Forecast</h1></div>
      <div className="chart-card">
        <select className="ctrl-select" onChange={(e) => setTicker(e.target.value)}>
          {allStocks.map(s => <option key={s.ticker} value={s.ticker}>{s.ticker}</option>)}
        </select>
        <button className="ctrl-btn" onClick={runPrediction}>Run AI Model</button>
      </div>

      {prediction && (
        <div className="chart-card">
          <h3>30-Day Trend: {prediction.trend}</h3>
          <div className="chart-wrap">
            <Line data={{
              labels: [...prediction.historical_dates, ...prediction.future_dates],
              datasets: [{
                label: 'Forecast',
                data: [...prediction.historical_prices, ...prediction.future_prices],
                borderColor: '#d4a843',
                borderDash: [5, 5]
              }]
            }} />
          </div>
        </div>
      )}
    </div>
  );
};