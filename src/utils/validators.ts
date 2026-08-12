/**
 * Shared validation utilities for form inputs across the RVSK portal.
 */

// ─── Email ───────────────────────────────────────────────────────────────────
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Email is required';
  if (!EMAIL_REGEX.test(email)) return 'Please enter a valid email address';
  if (email.length > 255) return 'Email must be less than 255 characters';
  return null;
}

// ─── Phone ───────────────────────────────────────────────────────────────────
const PHONE_REGEX = /^[6-9]\d{9}$/;

export function validatePhone(phone: string): string | null {
  if (!phone.trim()) return 'Phone number is required';
  const cleaned = phone.replace(/[\s\-+()]/g, '');
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    // Indian number with country code
    if (!PHONE_REGEX.test(cleaned.substring(2))) return 'Enter a valid 10-digit Indian mobile number';
  } else if (cleaned.length === 10) {
    if (!PHONE_REGEX.test(cleaned)) return 'Phone must start with 6-9 and be 10 digits';
  } else {
    return 'Phone must be a valid 10-digit Indian mobile number';
  }
  return null;
}

// ─── Password ────────────────────────────────────────────────────────────────
export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  strength: number; // 0-100
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];
  let strength = 0;

  if (!password) {
    return { isValid: false, errors: ['Password is required'], strength: 0 };
  }

  if (password.length < 8) errors.push('Minimum 8 characters');
  else strength += 20;

  if (password.length > 64) errors.push('Maximum 64 characters');

  if (!/[A-Z]/.test(password)) errors.push('At least 1 uppercase letter (A-Z)');
  else strength += 20;

  if (!/[a-z]/.test(password)) errors.push('At least 1 lowercase letter (a-z)');
  else strength += 20;

  if (!/\d/.test(password)) errors.push('At least 1 digit (0-9)');
  else strength += 20;

  if (!/[!@#$%^&*()_+\-=]/.test(password)) errors.push('At least 1 special character (!@#$%^&*()_+-=)');
  else strength += 20;

  return { isValid: errors.length === 0, errors, strength };
}

// ─── Display Name ────────────────────────────────────────────────────────────
export function validateDisplayName(name: string): string | null {
  if (!name.trim()) return 'Display name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  if (name.length > 100) return 'Name must be less than 100 characters';
  if (!/^[a-zA-Z\s.'-]+$/.test(name.trim())) return 'Name can only contain letters, spaces, dots, hyphens';
  return null;
}

// ─── Designation ─────────────────────────────────────────────────────────────
export function validateDesignation(value: string): string | null {
  if (!value.trim()) return 'Designation is required';
  if (value.trim().length < 2) return 'Designation must be at least 2 characters';
  if (value.length > 100) return 'Designation must be less than 100 characters';
  return null;
}

// ─── Department ──────────────────────────────────────────────────────────────
export function validateDepartment(value: string): string | null {
  if (!value.trim()) return 'Department is required';
  if (value.trim().length < 2) return 'Department must be at least 2 characters';
  if (value.length > 100) return 'Department must be less than 100 characters';
  return null;
}
