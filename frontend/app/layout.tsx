import "./globals.css";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex">
          <div className="p-6">
            <h1 className="text-xl font-bold tracking-tight">Hotel Kataragama</h1>
          </div>
          <nav className="flex-1 px-4 space-y-2">
            <a href="/" className="block py-2.5 px-4 rounded transition hover:bg-slate-800">Dashboard</a>
            <a href="/bookings" className="block py-2.5 px-4 rounded transition hover:bg-slate-800">Bookings</a>
            <a href="/billing" className="block py-2.5 px-4 rounded transition hover:bg-slate-800">Billing</a>
            <a href="/restaurant" className="block py-2.5 px-4 rounded transition hover:bg-slate-800">Restaurant</a>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <header className="bg-white shadow-sm p-4 md:hidden">
            <span className="font-bold">Hotel Kataragama</span>
          </header>
          <div className="p-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}