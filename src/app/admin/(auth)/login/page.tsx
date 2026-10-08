import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthLayout } from '@/components/admin/auth-layout';
import { LoginForm } from '@/components/admin/login-form';
import { getCurrentActor } from '@/lib/auth/auth-guard';

export const metadata: Metadata = {
  title: 'Sign in · ICAADA Admin',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  // Already signed in: go straight to the dashboard.
  if (await getCurrentActor()) redirect('/admin');

  return (
    <AuthLayout>
      <div className="admin-login-header">
        <span className="admin-login-kicker">ICAADA</span>
        <h1 className="admin-title">Administration Portal</h1>
        <p className="admin-subtitle">Sign in to manage ICAADA&apos;s website and digital content.</p>
      </div>
      <LoginForm />
    </AuthLayout>
  );
}
