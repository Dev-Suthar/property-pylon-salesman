/**
 * Validation utilities
 */

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const getUsernameError = (username: string): string | undefined => {
  if (!username || username.trim().length === 0) {
    return 'Username or email is required';
  }
  return undefined;
};

export const getPasswordError = (password: string): string | undefined => {
  if (!password || password.length === 0) {
    return 'Password is required';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters';
  }
  return undefined;
};

export const getAdminPasswordError = (password: string): string | undefined => {
  const trimmedPassword = password.trim();
  if (!trimmedPassword || trimmedPassword.length === 0) {
    return 'Password is required';
  }
  if (trimmedPassword.length < 8) {
    return 'Password must be at least 8 characters';
  }
  // Check for common weak passwords
  if (trimmedPassword.length > 128) {
    return 'Password must be less than 128 characters';
  }
  return undefined;
};

export const getEmailError = (email: string): string | undefined => {
  if (!email || email.trim().length === 0) {
    return 'Email is required';
  }
  if (!isValidEmail(email)) {
    return 'Invalid email format';
  }
  return undefined;
};

export const getNameError = (name: string): string | undefined => {
  if (!name || name.trim().length === 0) {
    return 'Name is required';
  }
  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters';
  }
  return undefined;
};

