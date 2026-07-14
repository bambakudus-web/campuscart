import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isValidEmail, getPasswordRequirements, isPasswordStrong } from '../utils/validators';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const emailTouched = form.email.length > 0;
  const emailValid = isValidEmail(form.email);
  const passwordRequirements = getPasswordRequirements(form.password);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!isValidEmail(form.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!isPasswordStrong(form.password)) {
      setError('Password does not meet all the requirements below');
      return;
    }

    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-form">
        <div className="auth-brand">🛒</div>
        <h2>Create an Account</h2>
        <p className="auth-subtitle">Join CampusCart and start buying or selling today</p>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              placeholder="e.g. Ama Serwaa"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@kstu.edu.gh"
              value={form.email}
              onChange={handleChange}
              required
            />
            {emailTouched && !emailValid && (
              <span className="field-hint field-hint-error">Enter a valid email address</span>
            )}
          </div>

          <div className="form-row">
            <label htmlFor="phone">Phone (WhatsApp)</label>
            <input
              id="phone"
              name="phone"
              placeholder="024xxxxxxx"
              value={form.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-row">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Create a strong password"
              value={form.password}
              onChange={handleChange}
              onFocus={() => setPasswordFocused(true)}
              required
            />
            {(passwordFocused || form.password.length > 0) && (
              <ul className="password-checklist">
                {passwordRequirements.map((req) => (
                  <li key={req.label} className={req.met ? 'met' : ''}>
                    {req.met ? '✓' : '○'} {req.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button type="submit" disabled={submitting}>{submitting ? 'Creating account...' : 'Sign Up'}</button>
          {error && <p className="form-message error">{error}</p>}
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </section>
  );
}
