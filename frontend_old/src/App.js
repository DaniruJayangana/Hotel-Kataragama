// At the very top of frontend/src/App.js
import React from 'react';
import RevenueReport from './components/RevenueReport'; // This matches the path to your file

function App() {
  return (
    <div className="App">
      <h1>Hotel Management Dashboard</h1>
      
      {/* 3. Use the component here */}
      <RevenueReport />
      
    </div>
  );
}

export default App;