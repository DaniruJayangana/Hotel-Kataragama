'use client';
import { useEffect, useState } from 'react';
import api from '../lib/axios'; // This uses your NEXT_PUBLIC_API_URL

export default function Dashboard() {
  const [stats, setStats] = useState({ bookings: 0, billing: 0, restaurant: 0 });

  useEffect(() => {
    // Replace these endpoints with the ones you defined in server.js
    api.get('/api/bookings/count').then(res => setStats(prev => ({...prev, bookings: res.data.count})));
    api.get('/api/billing/total').then(res => setStats(prev => ({...prev, billing: res.data.total})));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Hotel Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow border">
          <h2 className="text-gray-500">Active Bookings</h2>
          <p className="text-2xl font-bold">{stats.bookings}</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow border">
          <h2 className="text-gray-500">Pending Billing</h2>
          <p className="text-2xl font-bold">${stats.billing}</p>
        </div>
      </div>
    </div>
  );
}