import { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ error, className = '', disabled, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="admin-password-wrapper">
        <input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          className={`admin-input ${error ? 'admin-input-error' : ''} ${className}`}
          disabled={disabled}
          {...props}
        />
        <button
          type="button"
          className="admin-password-toggle focus-ring"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          aria-pressed={showPassword}
          disabled={disabled}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = 'PasswordInput';
