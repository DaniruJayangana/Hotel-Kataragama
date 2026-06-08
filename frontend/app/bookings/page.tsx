'use client';
import { useEffect, useState } from 'react';
import api from '../../lib/axios';

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/api/bookings/dashboard');
      setBookings(res.data);
    } catch (err) {
      console.error("Error loading bookings:", err);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCheckIn = async (bookingId: string) => {
    try {
      await api.post(`/api/bookings/checkin/${bookingId}`);
      alert("Guest checked in!");
      fetchBookings();
    } catch (err) { console.error(err); }
  };

  const handleCheckOut = async (bookingId: string) => {
  try {
    const res = await api.post(`/api/bookings/checkout/${bookingId}`);
    
    // Alert the staff
    const confirmPrint = confirm(`Checkout successful! Final Bill: $${res.data.finalBill}. Do you want to print the invoice?`);
    
    if (confirmPrint) {
      // Create a small hidden window for printing
      const printWindow = window.open('', '_blank', 'width=600,height=600');
      printWindow?.document.write(`
        <html>
          <head><title>Invoice</title></head>
          <body style="font-family: sans-serif; padding: 20px;">
            <h1>Hotel Kataragama - Invoice</h1>
            <p>Booking ID: ${bookingId}</p>
            <hr />
            <p><strong>Room Charges:</strong> $${res.data.details.roomTotal}</p>
            <p><strong>Restaurant Charges:</strong> $${res.data.details.restaurantTotal}</p>
            <h2>Total Amount Due: $${res.data.finalBill}</h2>
          </body>
        </html>
      `);
      printWindow?.document.close();
      printWindow?.print();
    }
    
    fetchBookings();
  } catch (err) { 
    console.error(err); 
    alert("Checkout failed.");
  }
};

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Active Bookings</h2>
      {bookings.map((b: any) => (
        <div key={b._id} className="p-4 border rounded shadow mb-4 flex justify-between items-center bg-white">
          <div>
            <p className="font-semibold">Guest: {b.guest_id?.first_name} {b.guest_id?.last_name}</p>
            <p className="text-sm text-gray-600">Room: {b.room_id?.room_type_id?.type_name}</p>
            <p className="text-sm font-bold text-blue-600">Status: {b.booking_status}</p>
          </div>

          <div>
            {/* Logic for Check-in */}
            {b.booking_status === 'Confirmed' && (
              <button 
                onClick={() => handleCheckIn(b._id)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Check-in
              </button>
            )}

            {/* Logic for Check-out */}
            {b.booking_status === 'CheckedIn' && (
              <button 
                onClick={() => handleCheckOut(b._id)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Check-out
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}