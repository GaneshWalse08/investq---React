import axios from 'axios';

const api = axios.create({
  baseURL: 'https://investq-react.onrender.com/api', 
});

export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const getDashboardSummary = () => api.get('/dashboard/summary');
export const getStocks = () => api.get('/stocks');
export const getESGRankings = (sector, weight) => api.get(`/rankings?sector=${sector}&esg_weight=${weight}`);

export default api;