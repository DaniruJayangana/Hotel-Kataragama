import React, { useState } from 'react';
import axios from 'axios';

const RevenueReport = () => {
  const [data, setData] = useState(null);
  const [dates, setDates] = useState({ start: '', end: '' });

  const fetchReport = async () => {
    if (!dates.start || !dates.end) {
      alert("Please select both a start and end date.");
      return;
    }

    try {
      const token = localStorage.getItem('token'); 
      const response = await axios.get(
        `http://localhost:5000/api/billing/reports/revenue`,
        { 
          params: { startDate: dates.start, endDate: dates.end },
          headers: { Authorization: `Bearer ${token}` } 
        }
      );
      setData(response.data);
    } catch (err) {
      console.error("Error fetching report:", err);
      if (err.response && err.response.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem('token');
        window.location.reload();
      } else {
        alert("Failed to fetch report. Check console for details.");
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Revenue Report</h2>
      <input type="date" onChange={(e) => setDates({...dates, start: e.target.value})} />
      <input type="date" onChange={(e) => setDates({...dates, end: e.target.value})} />
      <button onClick={fetchReport}>Generate Report</button>
      
      {data && data.length > 0 ? (
        <table border="1" style={{ marginTop: '20px', width: '100%', textAlign: 'left' }}>
          <thead>
            <tr><th>Payment Method</th><th>Revenue</th><th>Count</th></tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx}>
                <td>{item.method}</td>
                <td>{item.totalRevenue}</td>
                <td>{item.transactionCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        data && <p>No data found for the selected date range.</p>
      )}
    </div>
  );
};

export default RevenueReport;