import React, { useState, useEffect } from 'react';
import RevenueReport from './components/RevenueReport';
import Login from './components/Login'; // Ensure this file exists in components/

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if token exists in localStorage when the app starts
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <div className="App">
      {isAuthenticated ? (
        <RevenueReport />
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;