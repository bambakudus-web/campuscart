const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email) {
  return EMAIL_REGEX.test(email || '');
}

// Returns a human-readable list of which password requirements are still
// unmet, so the UI can show a live checklist as the person types.
export function getPasswordRequirements(password = '') {
  return [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /\d/.test(password) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(password) }
  ];
}

export function isPasswordStrong(password = '') {
  return getPasswordRequirements(password).every((req) => req.met);
}
