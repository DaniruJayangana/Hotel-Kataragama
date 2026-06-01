// A central function to handle all API calls securely
async function secureFetch(url, options = {}) {
    const token = localStorage.getItem('userToken');

    // Add Authorization header to every request
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    const response = await fetch(url, { ...options, headers });

    // Global check: If token is invalid or expired
    if (response.status === 401 || response.status === 403) {
        alert("Session expired. Please log in again.");
        window.location.href = 'login.html';
        return;
    }

    return response;
}

// Security Guard: Run this on every page load
function checkAuth() {
    const token = localStorage.getItem('userToken');
    if (!token) {
        window.location.href = 'login.html';
    }
}

// Function to handle secure logout
function logout() {
    // 1. Remove the token from storage
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole'); // If you are storing role as well
    
    // 2. Clear any other session-specific data
    sessionStorage.clear();
    
    // 3. Redirect to login
    window.location.href = 'login.html';
}