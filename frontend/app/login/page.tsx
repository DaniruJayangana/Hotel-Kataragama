'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../lib/axios';

export default function LoginPage() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/login', credentials);
      // Store JWT token (e.g., in localStorage or secure cookie)
      localStorage.setItem('token', res.data.token);
      router.push('/bookings');
    } catch (err: any) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleLogin} className="p-8 bg-white rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-black">Staff Login</h2>
        <input 
          type="text" placeholder="Username" required 
          className="w-full p-2 mb-4 border rounded text-black"
          onChange={(e) => setCredentials({...credentials, username: e.target.value})}
        />
        <input 
          type="password" placeholder="Password" required 
          className="w-full p-2 mb-2 border rounded text-black"
          onChange={(e) => setCredentials({...credentials, password: e.target.value})}
        />
        <div className="text-right mb-6">
            <a href="/login/recovery" className="text-sm text-blue-600 hover:underline">Forgot Password?</a>
        </div>
        <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Sign In
        </button>
      </form>
    </div>
  );
}