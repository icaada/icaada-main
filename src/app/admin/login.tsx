import { AuthLayout } from '@/components/admin/auth-layout';
import { LoginForm } from '@/components/admin/login-form';

export default function AdminLoginPage() {
  return (
    <AuthLayout>
      <div className="admin-login-header">
        <span className="admin-login-kicker">ICAADA</span>
        <h1 className="admin-title">Administration Portal</h1>
        <p className="admin-subtitle">Sign in to manage ICAADA's website and digital content.</p>
      </div>
      <LoginForm />
    </AuthLayout>
  );
}
