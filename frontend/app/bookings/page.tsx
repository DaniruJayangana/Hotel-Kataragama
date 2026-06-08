'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/axios';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/bookings/dashboard');
      setBookings(res.data);
    } catch (err: any) {
      console.error("DEBUG ERROR:", err.response?.data || err.message);
      alert("Error: " + (err.response?.data?.message || "Check console for details"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCheckIn = async (bookingId: string) => {
    try {
      await api.post(`/api/bookings/checkin/${bookingId}`);
      alert("Guest checked in successfully!");
      fetchBookings(); 
    } catch (err: any) {
      console.error("CHECK-IN ERROR:", err.response?.data || err.message);
      alert("Check-in failed. Ensure you are logged in as Admin/Manager/Receptionist.");
    }
  };

  if (loading) return <div className="p-6">Loading bookings...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Active Bookings</h2>
      
      {bookings.length === 0 && <p>No active bookings found.</p>}

      {bookings.map((b: any) => (
        <div key={b._id} className="p-4 border rounded shadow mb-4 flex justify-between items-center bg-white">
          <div>
            <p className="font-semibold">Guest: {b.guest_id?.first_name} {b.guest_id?.last_name}</p>
            <p className="text-sm text-gray-600">Room: {b.room_id?.room_type_id?.type_name}</p>
            <p className="text-sm font-bold text-blue-600">Status: {b.booking_status}</p>
          </div>

          {b.booking_status === 'Confirmed' && (
            <button 
              onClick={() => handleCheckIn(b._id)}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Check-in Guest
            </button>
          )}
        </div>
      ))}
    </div>
  );
}