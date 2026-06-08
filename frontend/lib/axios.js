import axios from 'axios';

const api = axios.create({
  baseURL: 'https://hotel-kataragama-backend-api.onrender.com', // Change this to your live Backend URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;