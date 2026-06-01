🏨 Hotel Management System API

A secure, transaction-safe backend for managing hotel operations, including bookings, billing, inventory, and restaurant orders.

🚀 Key Security Features
Atomic Transactions: Prevents double-bookings using MongoDB sessions.
JWT Authentication: Role-based access control (RBAC) via authMiddleware.Standardized Responses: Global error handling ensures consistent success/error payloads.
Security Headers: Protected via helmet and cors.

🔑 Core API Endpoints

Method,     Endpoint,                           Access,             Description
POST,       /api/auth/register,                 Public,             Register new staff
POST,       /api/auth/login,                    Public,             Get JWT token
POST,       /api/bookings/create,               Staff/Manager,      Atomic room reservation
GET,        /api/bookings/rooms,                Staff/Manager,      Fetch room matrix status
POST,       /api/billing/invoice/generate,      Manager,            Generate master invoice
POST,       /api/billing/checkout,              Manager,            Finalize payment & release room
GET,        /api/restaurant/inventory/all,      Staff/Manager,      View stock levels


🛠 Project Structure
/routes: API endpoints grouped by business logic.
/models: Mongoose schemas.
/middleware: asyncHandler (error catching), authMiddleware (RBAC), and errorHandler (global output).
/server.js: Centralized security and route entry point.


⚙️ Environment Requirements
MONGODB_URI: Must point to a Replica Set (required for transactions).
JWT_SECRET: Secret key for signing tokens.
PORT: Server port (default 5000).