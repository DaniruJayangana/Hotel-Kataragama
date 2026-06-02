import React, { useEffect, useState } from 'react';
import { getAllBookings } from '../../services/bookingService';

const BookingList = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await getAllBookings();
        setBookings(data);
      } catch (err) {
        alert("Error fetching bookings: " + (err.response?.data?.message || err.message));
      }
    };
    fetchBookings();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Current Bookings</h2>
      <table border="1" style={{ width: '100%', textAlign: 'left' }}>
        <thead>
          <tr><th>Guest</th><th>Room ID</th><th>Check In</th><th>Check Out</th></tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b._id}>
              <td>{b.guest_name}</td>
              <td>{b.room_id}</td>
              <td>{new Date(b.check_in).toLocaleDateString()}</td>
              <td>{new Date(b.check_out).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BookingList;