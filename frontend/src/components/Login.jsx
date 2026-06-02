import React, { useState } from 'react';
import axios from 'axios';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // FIX: Use relative path to avoid CSP errors and work in production
            const response = await axios.post('/api/auth/login', {
                username,
                password
            });
            
            // Save the token returned by the server
            localStorage.setItem('token', response.data.token);
            alert('Login successful!');
            window.location.reload(); // Refresh to update the UI
        } catch (err) {
            // FIX: Access the specific error message from the backend
            const errorMessage = err.response?.data?.message || 'Login failed. Check your credentials.';
            alert(errorMessage);
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <h2>Login</h2>
            <input 
                type="text" 
                placeholder="Username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)} 
                required
            />
            <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required
            />
            <button type="submit">Login</button>
        </form>
    );
}

export default Login;