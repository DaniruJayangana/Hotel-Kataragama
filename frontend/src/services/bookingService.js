import axios from 'axios';

const API_URL = '/api/bookings/';

const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const createBooking = (bookingData) => axios.post(API_URL, bookingData, getAuthHeaders());
export const getAllBookings = () => axios.get(API_URL, getAuthHeaders());