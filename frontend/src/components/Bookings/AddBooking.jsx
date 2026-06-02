import React, { useState } from 'react';
import { createBooking } from '../../services/bookingService';

function AddBooking() {
    const [formData, setFormData] = useState({ room_id: '', guest_name: '', check_in: '', check_out: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createBooking(formData);
            alert("Booking created successfully!");
        } catch (err) {
            alert("Failed to create booking: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Room ID" onChange={(e) => setFormData({...formData, room_id: e.target.value})} />
            <input type="text" placeholder="Guest Name" onChange={(e) => setFormData({...formData, guest_name: e.target.value})} />
            <input type="date" onChange={(e) => setFormData({...formData, check_in: e.target.value})} />
            <input type="date" onChange={(e) => setFormData({...formData, check_out: e.target.value})} />
            <button type="submit">Create Booking</button>
        </form>
    );
}

export default AddBooking;