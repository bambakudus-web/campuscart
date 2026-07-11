import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          🛒 CampusCart
        </Link>

        <nav className="nav-links">
          <Link to="/">Browse</Link>
          {user ? (
            <>
              <Link to="/my-listings">My Listings</Link>
              <Link to="/post">Post a Listing</Link>
              <span className="nav-user">Hi, {user.name.split(' ')[0]}</span>
              <button className="nav-logout" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/register" className="nav-cta">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
