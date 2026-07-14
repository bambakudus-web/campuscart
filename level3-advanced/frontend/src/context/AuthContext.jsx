import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

const AuthContext = createContext(null);

// Logs the user out after this much time with no mouse/keyboard/touch
// activity anywhere in the app, regardless of which page they're on.
const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const idleTimerRef = useRef(null);

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

  function logout() {
    localStorage.removeItem('campuscart_token');
    setUser(null);
  }

  const handleIdleTimeout = useCallback(() => {
    logout();
    navigate('/login?reason=idle');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Reset (or start) the idle timer on any user activity, but only while
  // someone is actually logged in — there's nothing to protect otherwise.
  useEffect(() => {
    if (!user) {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      return;
    }

    function resetTimer() {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(handleIdleTimeout, IDLE_TIMEOUT_MS);
    }

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer(); // start the timer as soon as we know someone's logged in

    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, resetTimer));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [user, handleIdleTimeout]);

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
