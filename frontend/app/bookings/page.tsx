'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/axios';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    // Fetches the live occupancy dashboard we discussed
    api.get('/api/bookings/dashboard')
       .then(res => setBookings(res.data))
       .catch(err => console.error("Error loading bookings:", err));
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Active Bookings</h2>
      {bookings.map((b: any) => (
        <div key={b._id} className="p-4 border rounded shadow mb-2">
          <p>Guest: {b.guest_id.first_name} {b.guest_id.last_name}</p>
          <p>Room: {b.room_id.room_type_id.type_name}</p>
        </div>
      ))}
    </div>
  );
}