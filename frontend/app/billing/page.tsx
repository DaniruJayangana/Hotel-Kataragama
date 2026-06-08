'use client';
import AuthGuard from '../../components/AuthGuard';

export default function BillingPage() {
  return (
    <AuthGuard>
      <div>
        <h2 className="text-2xl font-bold">Billing Dashboard</h2>
        {/* Your Billing content here */}
      </div>
    </AuthGuard>
  );
}