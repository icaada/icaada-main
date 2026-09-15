import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { mockAdminLogin } from '@/lib/mock-auth';
import { PasswordInput } from './password-input';

type FieldErrors = {
  email?: string;
  password?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [authError, setAuthError] = useState<string | null>(null);

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = 'Enter your email address.';
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      errors.email = 'Enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Enter your password.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const errors = validate();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);

    try {
      const result = await mockAdminLogin(email.trim(), password);

      if (result.success) {
        router.replace('/admin');
      } else {
        setAuthError(result.message || 'Invalid email or password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit} noValidate>
      {authError && (
        <div className="admin-error-message" role="alert">
          {authError}
        </div>
      )}

      <div className="admin-form-group">
        <label htmlFor="email" className="admin-label">Email address</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setFieldErrors((current) => ({ ...current, email: undefined }));
            setAuthError(null);
          }}
          className={`admin-input ${fieldErrors.email ? 'admin-input-error' : ''}`}
          placeholder="Enter your email address"
          autoComplete="email"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? 'admin-email-error' : undefined}
          required
          disabled={isLoading}
        />
        {fieldErrors.email && <p id="admin-email-error" className="admin-field-error">{fieldErrors.email}</p>}
      </div>

      <div className="admin-form-group">
        <label htmlFor="password" className="admin-label">Password</label>
        <PasswordInput
          id="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setFieldErrors((current) => ({ ...current, password: undefined }));
            setAuthError(null);
          }}
          placeholder="Enter your password"
          autoComplete="current-password"
          minLength={8}
          required
          error={Boolean(fieldErrors.password)}
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? 'admin-password-error' : undefined}
          disabled={isLoading}
        />
        {fieldErrors.password && <p id="admin-password-error" className="admin-field-error">{fieldErrors.password}</p>}
      </div>

      <div className="admin-form-row">
        <label className="admin-checkbox-label focus-ring">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="admin-checkbox"
            disabled={isLoading}
          />
          Remember me
        </label>
        <button type="button" className="admin-text-link focus-ring" disabled={isLoading}>
          Forgot password?
        </button>
      </div>

      <button
        type="submit"
        className="admin-button-primary focus-ring"
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
