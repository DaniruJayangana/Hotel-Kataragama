'use client'; 
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear the token from storage
    localStorage.removeItem('token');
    
    // Redirect to login page
    router.push('/login');
  };

  return (
    <nav style={{ padding: '1rem', background: '#f4f4f4', display: 'flex', justifyContent: 'flex-end' }}>
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
}