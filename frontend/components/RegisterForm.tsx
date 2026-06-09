'use client';
import { useState } from 'react';
import axios from 'axios';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    staff_id: '',
    first_name: '',
    last_name: '',
    role: 'Receptionist',
    hire_date: '', // Added
    salary: '',    // Added
    username: '',
    password: '',
    access_level: 'Receptionist'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Matches: router.post('/register', ...) in authRoutes.js
      await axios.post('http://localhost:5000/api/auth/register', formData);
      alert('Staff and User Account created successfully!');
    } catch (error) {
      console.error(error);
      alert('Registration failed. Please check the inputs.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
      <h3>Register New Staff</h3>
      <input type="text" placeholder="Staff ID (e.g., STF001)" onChange={(e) => setFormData({...formData, staff_id: e.target.value})} required />
      <input type="text" placeholder="First Name" onChange={(e) => setFormData({...formData, first_name: e.target.value})} required />
      <input type="text" placeholder="Last Name" onChange={(e) => setFormData({...formData, last_name: e.target.value})} required />
      <input type="text" placeholder="Role" onChange={(e) => setFormData({...formData, role: e.target.value})} required />
      <input type="date" placeholder="Hire Date" onChange={(e) => setFormData({...formData, hire_date: e.target.value})} required />
      <input type="number" placeholder="Salary" onChange={(e) => setFormData({...formData, salary: e.target.value})} required />
      <input type="text" placeholder="Username" onChange={(e) => setFormData({...formData, username: e.target.value})} required />
      <input type="password" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} required />
      
      <select onChange={(e) => setFormData({...formData, access_level: e.target.value})}>
        <option value="Admin">Admin</option>
        <option value="Receptionist">Receptionist</option>
        <option value="Housekeeping">Housekeeping</option>
        <option value="Kitchen Staff">Kitchen Staff</option>
      </select>
      
      <button type="submit">Create Account</button>
    </form>
  );
}