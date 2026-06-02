export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Hotel Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quick Stats Cards */}
        <div className="p-6 bg-white rounded-lg shadow border">
          <h2 className="text-gray-500">Active Bookings</h2>
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow border">
          <h2 className="text-gray-500">Pending Billing</h2>
          <p className="text-2xl font-bold">$450</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow border">
          <h2 className="text-gray-500">Restaurant Orders</h2>
          <p className="text-2xl font-bold">5</p>
        </div>
      </div>
    </div>
  );
}