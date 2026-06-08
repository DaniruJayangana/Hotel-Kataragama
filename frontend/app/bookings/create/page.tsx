'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/axios';

export default function CreateBooking() {
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    booking_id: '',
    guest_nic: '',
    first_name: '',
    last_name: '',
    email: '',
    contact_number: '',
    room_id: '',
    check_in_date: '',
    check_out_date: ''
  });

  // 1. Fetch available rooms so the user can select one
  useEffect(() => {
    const fetchAvailableRooms = async () => {
      try {
        const res = await api.get('/api/bookings/rooms');
        // Filter only available rooms to avoid booking already occupied ones
        setRooms(res.data.filter((r: any) => r.status === 'Available'));
      } catch (err) { console.error("Error fetching rooms", err); }
    };
    fetchAvailableRooms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation Logic
    if (new Date(formData.check_out_date) <= new Date(formData.check_in_date)) {
      alert("Check-out date must be after Check-in date.");
      return;
    }

    try {
      await api.post('/api/bookings/create', formData);
      alert("Booking successfully created!");
      router.push('/bookings'); // Redirect to dashboard
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create booking.");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Create New Reservation</h2>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <input placeholder="Booking ID (e.g., BK001)" className="w-full p-2 border rounded text-black placeholder-gray-500" required onChange={(e) => setFormData({...formData, booking_id: e.target.value})} />
        <input placeholder="Guest NIC" className="w-full p-2 border rounded text-black placeholder-gray-500" required onChange={(e) => setFormData({...formData, guest_nic: e.target.value})} />
        <div className="grid grid-cols-2 gap-4">
          <input placeholder="First Name" className="w-full p-2 border rounded text-black placeholder-gray-500" required onChange={(e) => setFormData({...formData, first_name: e.target.value})} />
          <input placeholder="Last Name" className="w-full p-2 border rounded text-black placeholder-gray-500" required onChange={(e) => setFormData({...formData, last_name: e.target.value})} />
        </div>
        <input placeholder="Contact Number" className="w-full p-2 border rounded text-black placeholder-gray-500" required onChange={(e) => setFormData({...formData, contact_number: e.target.value})} />
        
        <select className="w-full p-2 border rounded" required onChange={(e) => setFormData({...formData, room_id: e.target.value})}>
          <option value="" className="text-gray-500" disabled selected>Select an Available Room</option>
          {rooms.map((r: any) => (<option key={r._id} value={r._id} className="text-black">{r._id}</option>))}
        </select>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm">Check-in</label>
            <input type="date" className="w-full p-2 border rounded text-black placeholder-gray-500" required onChange={(e) => setFormData({...formData, check_in_date: e.target.value})} />
          </div>
          <div>
            <label className="text-sm">Check-out</label>
            <input type="date" className="w-full p-2 border rounded text-black placeholder-gray-500" required onChange={(e) => setFormData({...formData, check_out_date: e.target.value})} />
          </div>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Confirm Reservation
        </button>
      </form>
    </div>
  );
}