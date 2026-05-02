import axios from 'axios';

const api = axios.create({
  // Change localhost to 127.0.0.1 right here!
  baseURL: 'http://127.0.0.1:5000/api', 
});

export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const getDashboardSummary = () => api.get('/dashboard/summary');
export const getStocks = () => api.get('/stocks');
export const getESGRankings = (sector, weight) => api.get(`/rankings?sector=${sector}&esg_weight=${weight}`);

export default api;