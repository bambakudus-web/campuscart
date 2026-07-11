import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, if a token is already stored, fetch the profile to
  // restore the session instead of forcing a fresh login every refresh.
  useEffect(() => {
    const token = localStorage.getItem('campuscart_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.getProfile()
      .then((res) => setUser(res.user))
      .catch(() => {
        localStorage.removeItem('campuscart_token');
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const res = await api.login({ email, password });
    localStorage.setItem('campuscart_token', res.token);
    setUser(res.user);
    return res.user;
  }

  async function register(name, email, password, phone) {
    const res = await api.register({ name, email, password, phone });
    localStorage.setItem('campuscart_token', res.token);
    setUser(res.user);
    return res.user;
  }

  function logout() {
    localStorage.removeItem('campuscart_token');
    setUser(null);
  }

  // Called after a successful profile update so the rest of the app
  // (navbar greeting, etc.) reflects the change immediately.
  async function updateProfile(payload) {
    const res = await api.updateProfile(payload);
    localStorage.setItem('campuscart_token', res.token); // token may have a new email claim
    setUser(res.user);
    return res.user;
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
