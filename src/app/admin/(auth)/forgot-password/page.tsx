import type { Metadata } from 'next';
import { AuthLayout } from '@/components/admin/auth-layout';
import { ForgotPasswordForm } from '@/components/admin/forgot-password-form';

export const metadata: Metadata = {
  title: 'Forgot password',
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <div className="admin-login-header">
        <span className="admin-login-kicker">ICAADA</span>
        <h1 className="admin-title">Forgot your password?</h1>
        <p className="admin-subtitle">Enter the email you sign in with and we&apos;ll send you a link to choose a new password.</p>
      </div>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
