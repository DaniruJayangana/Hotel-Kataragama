'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/axios';

export default function Dashboard() {
  const [stats, setStats] = useState({ bookings: 0, billing: 0 });
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  console.log("DEBUG: useEffect triggered");

  const fetchData = async () => {
    try {
      // 1. Fetch Bookings and Billing (These work, keep them)
      const [bookingsRes, billingRes] = await Promise.all([
        api.get('/api/bookings/count'),
        api.get('/api/billing/total')
      ]);
      setStats({ bookings: bookingsRes.data.count, billing: billingRes.data.total });
      console.log("DEBUG: Stats fetched");

      // 2. Fetch Inventory (The one that isn't showing)
      // We are forcing this to run as a completely independent promise
      console.log("DEBUG: Initiating low-stock request...");
      const invRes = await api.get('/api/restaurant/inventory/low-stock');
      console.log("DEBUG: Inventory request completed. Data:", invRes.data);
      setLowStock(invRes.data);

    } catch (err) {
      console.error("DEBUG: ERROR CAUGHT IN FETCH:", err);
    }
  };

  fetchData();
}, []);

  if (loading) return <div className="p-6">Loading dashboard data...</div>;

  return (
    <div className="p-6 space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-lg shadow border">
          <h2 className="text-gray-500">Active Bookings</h2>
          <p className="text-2xl font-bold">{stats.bookings}</p>
        </div>
        
        <div className="p-6 bg-white rounded-lg shadow border">
          <h2 className="text-gray-500">Total Unpaid Revenue</h2>
          <p className="text-2xl font-bold">${stats.billing.toLocaleString()}</p>
        </div>
      </div>

      {/* Low Stock Alert Section */}
{lowStock.length > 0 && (
  <div className="mt-8 p-6 bg-red-900 text-white rounded-lg shadow border border-red-700">
    <h2 className="text-xl font-bold flex items-center">
      ⚠️ Low Stock Alert ({lowStock.length} items)
    </h2>
    <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {lowStock.map((item: any) => (
        <li key={item._id} className="bg-red-800 p-3 rounded">
          <span className="font-bold">{item.item_name}</span>
          <p className="text-sm">Current: {item.quantity_in_stock} | Reorder: {item.reorder_level}</p>
        </li>
      ))}
    </ul>
  </div>
)}
    </div>
  );
}