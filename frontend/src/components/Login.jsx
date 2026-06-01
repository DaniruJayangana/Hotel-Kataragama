import React, { useState } from 'react';
import axios from 'axios';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Adjust the URL if your auth route is different
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                username,
                password
            });
            
            // Save the token returned by the server
            localStorage.setItem('token', response.data.token);
            alert('Login successful!');
            window.location.reload(); // Refresh to update the UI
        } catch (err) {
            alert('Login failed. Check your credentials.');
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <h2>Login</h2>
            <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Login</button>
        </form>
    );
}

export default Login;