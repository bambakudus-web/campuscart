import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps a page and redirects to /login if the user isn't authenticated.
// This is the frontend half of "protect routes based on user roles" -
// the backend still enforces this independently via the requireAuth
// middleware, since a client-side check alone can always be bypassed.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="loading">Checking your session...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
