import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
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
    <section className="auth-form container">
      <h2>Create an Account</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label htmlFor="name">Full Name</label>
          <input id="name" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="form-row">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="form-row">
          <label htmlFor="phone">Phone (WhatsApp)</label>
          <input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="024xxxxxxx" />
        </div>
        <div className="form-row">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" minLength={6} value={form.password} onChange={handleChange} required />
        </div>
        <button type="submit" disabled={submitting}>{submitting ? 'Creating account...' : 'Sign Up'}</button>
        {error && <p className="form-message error">{error}</p>}
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
    </section>
  );
}
