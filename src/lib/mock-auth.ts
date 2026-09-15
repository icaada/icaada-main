const DEVELOPMENT_ONLY_REJECTION_DOMAIN = '@invalid.test';

export async function mockAdminLogin(email: string, password: string): Promise<{ success: boolean; message?: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Development-only sentinel for previewing the generic authentication error.
      if (email.toLowerCase().endsWith(DEVELOPMENT_ONLY_REJECTION_DOMAIN)) {
        return resolve({ success: false, message: 'Invalid email or password.' });
      }

      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const isPasswordValid = password.length >= 8;

      if (isValidEmail && isPasswordValid) {
        resolve({ success: true });
      } else {
        resolve({ success: false, message: 'Invalid email or password.' });
      }
    }, 1200); // simulate network delay
  });
}
