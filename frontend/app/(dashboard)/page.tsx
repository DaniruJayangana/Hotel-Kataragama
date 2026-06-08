'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/axios';

export default function Dashboard() {
  const [stats, setStats] = useState({ bookings: 0, billing: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch active bookings
        const bookingsRes = await api.get('/api/bookings/dashboard');
        // Fetch billing info (you may need to add a count route for billing)
        // const billingRes = await api.get('/api/billing/summary');
        
        setStats({ 
          bookings: bookingsRes.data.length, 
          billing: 450 // Replace with actual API data
        });
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-lg shadow border">
                <h2 className="text-gray-500">Active Bookings</h2>
                {/* Use .length if bookings is an array, or just stats.bookings if it's a count */}
                <p className="text-2xl font-bold">{stats.bookings}</p>
            </div>
            
            <div className="p-6 bg-white rounded-lg shadow border">
                <h2 className="text-gray-500">Pending Billing</h2>
                <p className="text-2xl font-bold">${stats.billing}</p>
            </div>
        </div>
  );
}

//use useEffect to fetch data from your API. Note that you have protected routes, so ensure the user is logged in before these calls are made.