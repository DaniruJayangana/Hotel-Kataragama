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
    <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'flex-end' }}>
      <button 
        onClick={handleLogout} 
        style={{ padding: '8px 16px', cursor: 'pointer' }}
      >
        Logout
      </button>
    </nav>
  );
}