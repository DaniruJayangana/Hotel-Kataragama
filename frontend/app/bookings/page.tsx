'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/axios';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);

  // Function to fetch bookings - extracted to be reusable
  const fetchBookings = async () => {
    try {
      const res = await api.get('/api/bookings/dashboard');
      setBookings(res.data);
    } catch (err) {
      console.error("Error loading bookings:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Function to handle the check-in API call
  const handleCheckIn = async (bookingId: string) => {
    try {
      await api.post(`/api/bookings/checkin/${bookingId}`);
      alert("Guest checked in successfully!");
      // Refresh the list to move the booking into the 'CheckedIn' view
      fetchBookings(); 
    } catch (err) {
      console.error("Check-in failed:", err);
      alert("Failed to check in guest.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Active Bookings</h2>
      
      {bookings.length === 0 && <p>No active bookings found.</p>}

      {bookings.map((b: any) => (
        <div key={b._id} className="p-4 border rounded shadow mb-4 flex justify-between items-center bg-white">
          <div>
            <p className="font-semibold">Guest: {b.guest_id.first_name} {b.guest_id.last_name}</p>
            <p className="text-sm text-gray-600">Room: {b.room_id.room_type_id.type_name}</p>
            <p className="text-sm font-bold">Status: {b.booking_status}</p>
          </div>

          {/* Only show Check-in button if status is 'Confirmed' */}
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