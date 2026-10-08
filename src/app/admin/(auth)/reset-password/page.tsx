import type { Metadata } from 'next';
import { AuthLayout } from '@/components/admin/auth-layout';
import { ResetPasswordForm } from '@/components/admin/reset-password-form';

export const metadata: Metadata = {
  title: 'Set password',
  robots: { index: false, follow: false },
  // Keep the token out of Referer headers sent to other sites.
  referrer: 'no-referrer',
};

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = '' } = await searchParams;
  return (
    <AuthLayout>
      <div className="admin-login-header">
        <span className="admin-login-kicker">ICAADA</span>
        <h1 className="admin-title">Set your password</h1>
      </div>
      <ResetPasswordForm token={token} />
    </AuthLayout>
  );
}
