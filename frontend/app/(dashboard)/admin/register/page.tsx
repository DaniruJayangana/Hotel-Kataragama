import RegisterForm from '@/components/RegisterForm';
import AuthGuard from '@/components/AuthGuard';

export default function RegisterStaffPage() {
  return (
    <AuthGuard>
      <div style={{ padding: '2rem' }}>
        <h1>Staff Management</h1>
        <RegisterForm />
      </div>
    </AuthGuard>
  );
}