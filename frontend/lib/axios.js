import axios from 'axios';

const api = axios.create({
  // This will use the value from .env.local or Render Environment Variables
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;