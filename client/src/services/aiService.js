import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const aiService = {
  summarizeAsync: async (text) => {
    const res = await api.post('/ai/summarize', { text });
    return res.data?.summary || '';
  },
  classifyAsync: async (text) => {
    const res = await api.post('/ai/classify', { text });
    return res.data;
  }
};


