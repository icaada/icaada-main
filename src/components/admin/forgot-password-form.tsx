'use client';

import { useState } from 'react';
import Link from 'next/link';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/password/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const body = await response.json().catch(() => null);
      if (response.ok) setSent(body?.data?.message ?? 'Check your email for a reset link.');
      else setError(body?.error?.message || 'Something went wrong. Please try again.');
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div>
        <p className="admin-success-message" role="status" data-testid="text-forgot-sent">{sent}</p>
        <p className="admin-auth-back"><Link href="/admin/login" className="admin-text-link focus-ring">Back to sign in</Link></p>
      </div>
    );
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit} noValidate>
      {error && <div className="admin-error-message" role="alert">{error}</div>}
      <div className="admin-form-group">
        <label htmlFor="email" className="admin-label">Email address</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(null); }}
          className={`admin-input ${error ? 'admin-input-error' : ''}`}
          placeholder="The address you sign in with"
          autoComplete="email"
          required
          disabled={isLoading}
          data-testid="input-forgot-email"
        />
      </div>
      <button type="submit" className="admin-button-primary focus-ring" disabled={isLoading} data-testid="button-forgot-submit">
        {isLoading ? 'Sending…' : 'Email me a reset link'}
      </button>
      <p className="admin-auth-back"><Link href="/admin/login" className="admin-text-link focus-ring">Back to sign in</Link></p>
    </form>
  );
}
