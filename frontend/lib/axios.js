import axios from 'axios';

const api = axios.create({
  baseURL: 'https://hotel-kataragama.onrender.com', // Your deployed URL
});

// Interceptor to attach the token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;