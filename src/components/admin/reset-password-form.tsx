'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PasswordInput } from './password-input';

type LinkState =
  | { kind: 'checking' }
  | { kind: 'invalid'; message: string }
  | { kind: 'ready'; purpose: 'RESET' | 'INVITE'; email: string; name: string }
  | { kind: 'done'; purpose: 'RESET' | 'INVITE' };

/** Sets a password from an emailed reset or invite link (?token=…). */
export function ResetPasswordForm({ token }: { token: string }) {
  const [state, setState] = useState<LinkState>(token ? { kind: 'checking' } : { kind: 'invalid', message: 'This link is incomplete. Open the link from your email again.' });
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch('/api/auth/password/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (response.ok) setState({ kind: 'ready', ...body.data });
        else setState({ kind: 'invalid', message: body?.error?.message ?? 'This link is invalid or has expired.' });
      })
      .catch(() => setState({ kind: 'invalid', message: 'Could not reach the server. Reload the page to try again.' }));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 12) { setError('Use at least 12 characters.'); return; }
    if (password !== confirm) { setError('The two passwords do not match.'); return; }
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const body = await response.json().catch(() => null);
      if (response.ok) {
        setState({ kind: 'done', purpose: body.data.purpose });
      } else {
        const details: Record<string, string[]> | undefined = body?.error?.details;
        if (details?.token) setState({ kind: 'invalid', message: details.token[0] });
        else setError(details?.password?.join(' ') || body?.error?.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Could not reach the server. Check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (state.kind === 'checking') return <p className="admin-subtitle" role="status">Checking your link…</p>;

  if (state.kind === 'invalid') {
    return (
      <div>
        <div className="admin-error-message" role="alert" data-testid="text-reset-invalid">{state.message}</div>
        <p className="admin-auth-back"><Link href="/admin/forgot-password" className="admin-text-link focus-ring">Request a new link</Link></p>
      </div>
    );
  }

  if (state.kind === 'done') {
    return (
      <div>
        <p className="admin-success-message" role="status" data-testid="text-reset-done">
          {state.purpose === 'INVITE' ? 'Your password is set. Welcome to the ICAADA workspace.' : 'Your password has been changed. Any other signed-in devices have been signed out.'}
        </p>
        <p className="admin-auth-back"><Link href="/admin/login" className="admin-text-link focus-ring" data-testid="link-reset-signin">Sign in</Link></p>
      </div>
    );
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit} noValidate>
      <p className="admin-subtitle" data-testid="text-reset-account">
        {state.purpose === 'INVITE' ? `Welcome, ${state.name}. Choose a password for ${state.email}.` : `Choose a new password for ${state.email}.`}
      </p>
      {error && <div className="admin-error-message" role="alert">{error}</div>}
      <div className="admin-form-group">
        <label htmlFor="password" className="admin-label">New password</label>
        <PasswordInput id="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(null); }} autoComplete="new-password" required minLength={12} disabled={isLoading} data-testid="input-reset-password" />
        <p className="admin-field-hint">At least 12 characters, with a letter and a number.</p>
      </div>
      <div className="admin-form-group">
        <label htmlFor="confirm" className="admin-label">Confirm password</label>
        <PasswordInput id="confirm" value={confirm} onChange={(e) => { setConfirm(e.target.value); setError(null); }} autoComplete="new-password" required disabled={isLoading} data-testid="input-reset-confirm" />
      </div>
      <button type="submit" className="admin-button-primary focus-ring" disabled={isLoading} data-testid="button-reset-submit">
        {isLoading ? 'Saving…' : state.purpose === 'INVITE' ? 'Set password' : 'Change password'}
      </button>
    </form>
  );
}
