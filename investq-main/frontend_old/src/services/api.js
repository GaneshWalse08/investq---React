// import axios from 'axios';

// const BASE = 'http://localhost:5000/api';

// const api = axios.create({ baseURL: BASE });

// api.interceptors.request.use(cfg => {
//   const token = localStorage.getItem('iq_token');
//   if (token) cfg.headers.Authorization = `Bearer ${token}`;
//   return cfg;
// });

// api.interceptors.response.use(
//   r => r,
//   err => {
//     if (err.response?.status === 401) {
//       localStorage.removeItem('iq_token');
//       localStorage.removeItem('iq_user');
//       window.location.href = '/login';
//     }
//     return Promise.reject(err);
//   }
// );

// export const authAPI = {
//   login: d => api.post('/auth/login', d),
//   signup: d => api.post('/auth/signup', d),
//   profile: () => api.get('/auth/profile'),
//   updateProfile: d => api.put('/auth/profile', d),
// };

// export const stocksAPI = {
//   list: (params = {}) => api.get('/stocks/', { params }),
//   get: (symbol, params = {}) => api.get(`/stocks/${symbol}`, { params }),
//   search: q => api.get('/stocks/search', { params: { q } }),
//   cluster: d => api.post('/stocks/cluster', d),
// };

// export const portfolioAPI = {
//   optimize: d => api.post('/portfolio/optimize', d),
//   backtest: d => api.post('/portfolio/backtest', d),
//   analyze: d => api.post('/portfolio/analyze', d),
// };

// export const dashboardAPI = {
//   get: () => api.get('/dashboard/'),
// };

// export const sentimentAPI = {
//   market: () => api.get('/sentiment/market'),
//   stock: symbol => api.get(`/sentiment/${symbol}`),
// };

// export default api;


import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import MLPredictions from './pages/MLPredictions';
import './App.css'; // Copy your existing CSS here

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [allStocks, setAllStocks] = useState([]);
  const user = { username: "Ganesh" }; // Mock user

  useEffect(() => {
    // Fetch initial stock list for dropdowns
    fetch('http://localhost:5000/api/stocks')
      .then(res => res.json())
      .then(data => setAllStocks(data));
  }, []);

  return (
    <div className="app-container">
      <Sidebar activePage={activePage} setActivePage={setActivePage} user={user} />
      <main className="main">
        {activePage === 'dashboard' && <Dashboard />}
        {activePage === 'ml' && <MLPredictions allStocks={allStocks} />}
        {/* Add other pages like Rankings, Portfolio here */}
      </main>
    </div>
  );
}

export default App;