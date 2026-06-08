'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/axios';

export default function Dashboard() {
  const [stats, setStats] = useState({ bookings: 0, billing: 0 });
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all three data points in parallel
        const [bookingsRes, billingRes, inventoryRes] = await Promise.all([
          api.get('/api/bookings/count'),
          api.get('/api/billing/total'),
          api.get('/api/restaurant/inventory/low-stock')
        ]);

        setStats({ 
          bookings: bookingsRes.data.count,
          billing: billingRes.data.total
        });
        setLowStock(inventoryRes.data);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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
        <div className="p-6 bg-red-50 rounded-lg shadow border border-red-200">
          <h2 className="text-red-700 font-bold flex items-center">
            ⚠️ Low Stock Alert ({lowStock.length} items)
          </h2>
          <ul className="mt-2 text-sm text-red-600 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {lowStock.map((item: any) => (
              <li key={item._id} className="bg-white p-2 rounded border border-red-100">
                <strong>{item.item_name}</strong>: {item.quantity_in_stock} left
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}