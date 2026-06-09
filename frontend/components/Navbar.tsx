'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [role, setRole] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Decode the payload part of the JWT
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log("Decoded Token Payload:", payload);
      setRole(payload.role); // 'role' matches the key from jwt.sign in authRoutes.js
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <nav style={{ padding: '1rem', display: 'flex', gap: '15px', borderBottom: '1px solid #ccc' }}>
      <Link href="/dashboard">Dashboard</Link>
      
      {/* Show link ONLY if the role is Admin */}
      {role && role.toLowerCase() === 'admin' && (
        <Link href="/admin/register">
          Register New Staff
        </Link>
      )}

      <button onClick={handleLogout} style={{ marginLeft: 'auto' }}>Logout</button>
    </nav>
  );
}