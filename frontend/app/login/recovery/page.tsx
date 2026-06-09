'use client';
import { useState } from 'react';
import api from '../../../lib/axios';

export default function RecoveryPage() {
  const [username, setUsername] = useState('');

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/auth/forgot-password', { username });
      alert("If this username exists, a recovery link has been sent.");
    } catch (err) {
      alert("Error processing request.");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleRecover} className="p-8 bg-white rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-black">Recover Password</h2>
        
        {/* Notice for future implementation */}
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
          <p className="text-sm text-yellow-700 font-semibold">
            Note: To enable email recovery, please update your <strong>Staff.js</strong> and <strong>UserAccount.js</strong> models to include an <strong>email</strong> field.
          </p>
        </div>

        <p className="text-sm text-gray-600 mb-6">Enter your username to receive recovery instructions.</p>
        <input 
          type="text" placeholder="Username" required 
          className="w-full p-2 mb-4 border rounded text-black"
          onChange={(e) => setUsername(e.target.value)}
        />
        <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Send Recovery Email
        </button>
        <a href="/login" className="block mt-4 text-center text-sm text-blue-600 hover:underline">Back to Login</a>
      </form>
    </div>
  );
}