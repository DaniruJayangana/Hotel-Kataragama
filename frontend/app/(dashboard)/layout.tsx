import AuthGuard from '../../components/AuthGuard';
import Navbar from '../../components/Navbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
    <Navbar /> {/* This will now appear on all dashboard pages */}
    <div className="flex min-h-screen">
      <nav className="w-64 bg-slate-900 text-white p-6">
        <h1 className="text-xl font-bold mb-8">Hotel Kataragama</h1>
        <ul className="space-y-4">
          <li><a href="/">Dashboard</a></li>
          <li><a href="/bookings">Bookings</a></li>
          <li><a href="/billing">Billing</a></li>
          <li><a href="/restaurant">Restaurant</a></li>
        </ul>
      </nav>
      <main className="flex-1 p-8 bg-gray-50">{children}</main>
    </div>
    </AuthGuard>
  );
}