import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RevenueReport from './components/RevenueReport'; // Adjust path
import BookingList from './components/Bookings/BookingList'; // Adjust path
import AddBooking from './components/Bookings/AddBooking';   // Adjust path
import Login from './components/Login';

function App() {
  return (
    <Router>
      <div>
        <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
          <Link to="/">Revenue Report</Link> | 
          <Link to="/bookings"> View Bookings</Link> | 
          <Link to="/add-booking"> Add Booking</Link>
        </nav>

        <Routes>
          <Route path="/" element={<RevenueReport />} />
          <Route path="/bookings" element={<BookingList />} />
          <Route path="/add-booking" element={<AddBooking />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;