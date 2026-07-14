const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Requires: 8+ characters, at least one uppercase, one lowercase, one
// number, and one special character. This is checked server-side because
// client-side validation alone can always be bypassed by calling the API
// directly.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function validateEmailFormat(email) {
  if (!email || !EMAIL_REGEX.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
}

function validatePasswordStrength(password) {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!PASSWORD_REGEX.test(password)) {
    return 'Password must include an uppercase letter, a lowercase letter, a number, and a special character';
  }
  return null;
}

module.exports = { validateEmailFormat, validatePasswordStrength };
