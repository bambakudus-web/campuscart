import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { isValidEmail, getPasswordRequirements, isPasswordStrong } from '../utils/validators';

export default function Account() {
  const { user, updateProfile } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const emailTouched = profileForm.email.length > 0;
  const emailValid = isValidEmail(profileForm.email);
  const passwordRequirements = getPasswordRequirements(passwordForm.newPassword);

  function handleProfileChange(e) {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  }

  function handlePasswordChange(e) {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!isValidEmail(profileForm.email)) {
      setProfileError('Please enter a valid email address');
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile(profileForm);
      setProfileSuccess('Profile updated successfully!');
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }
    if (!isPasswordStrong(passwordForm.newPassword)) {
      setPasswordError('Password does not meet all the requirements below');
      return;
    }

    setSavingPassword(true);
    try {
      await api.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordSuccess('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setSavingPassword(false);
    }
  }

  if (!user) return null;

  return (
    <section className="account-page container">
      <h2>My Account</h2>

      <div className="account-grid">
        <form className="account-card" onSubmit={handleProfileSubmit}>
          <h3>Profile Information</h3>

          <div className="form-row">
            <label htmlFor="name">Full Name</label>
            <input id="name" name="name" value={profileForm.name} onChange={handleProfileChange} required />
          </div>

          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={profileForm.email} onChange={handleProfileChange} required />
            {emailTouched && !emailValid && (
              <span className="field-hint field-hint-error">Enter a valid email address</span>
            )}
          </div>

          <div className="form-row">
            <label htmlFor="phone">Phone (WhatsApp)</label>
            <input id="phone" name="phone" value={profileForm.phone} onChange={handleProfileChange} placeholder="024xxxxxxx" />
          </div>

          <button type="submit" disabled={savingProfile}>{savingProfile ? 'Saving...' : 'Save Changes'}</button>
          {profileSuccess && <p className="form-message success">{profileSuccess}</p>}
          {profileError && <p className="form-message error">{profileError}</p>}
        </form>

        <form className="account-card" onSubmit={handlePasswordSubmit}>
          <h3>Change Password</h3>

          <div className="form-row">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              onFocus={() => setPasswordFocused(true)}
              required
            />
            {(passwordFocused || passwordForm.newPassword.length > 0) && (
              <ul className="password-checklist">
                {passwordRequirements.map((req) => (
                  <li key={req.label} className={req.met ? 'met' : ''}>
                    {req.met ? '✓' : '○'} {req.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="form-row">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              minLength={8}
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              required
            />
          </div>

          <button type="submit" disabled={savingPassword}>{savingPassword ? 'Updating...' : 'Update Password'}</button>
          {passwordSuccess && <p className="form-message success">{passwordSuccess}</p>}
          {passwordError && <p className="form-message error">{passwordError}</p>}
        </form>
      </div>
    </section>
  );
}
