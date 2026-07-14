import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const idleLogout = searchParams.get('reason') === 'idle';

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email, form.password);
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
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Log in to buy, sell, and chat on CampusCart</p>

        {idleLogout && (
          <p className="idle-banner">You were logged out after 5 minutes of inactivity. Please log in again.</p>
        )}

        <form onSubmit={handleSubmit}>
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
          </div>
          <div className="form-row">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" disabled={submitting}>{submitting ? 'Logging in...' : 'Log In'}</button>
          {error && <p className="form-message error">{error}</p>}
        </form>
        <p className="auth-switch">No account yet? <Link to="/register">Sign up</Link></p>
      </div>
    </section>
  );
}
