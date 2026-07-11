import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Store, ListChecks, PlusCircle, UserCircle, LogOut, LogIn, UserPlus, Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate('/');
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  const loggedInLinks = [
    { to: '/', label: 'Browse', icon: Store },
    { to: '/my-listings', label: 'My Listings', icon: ListChecks },
    { to: '/post', label: 'Post a Listing', icon: PlusCircle },
    { to: '/account', label: 'My Account', icon: UserCircle }
  ];

  const loggedOutLinks = [
    { to: '/', label: 'Browse', icon: Store },
    { to: '/login', label: 'Log in', icon: LogIn },
    { to: '/register', label: 'Sign up', icon: UserPlus }
  ];

  const links = user ? loggedInLinks : loggedOutLinks;

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand" onClick={closeMenu}>
          🛒 CampusCart
        </Link>

        {/* Desktop: icon-only nav with hover tooltips */}
        <nav className="desktop-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="icon-link">
              <Icon size={20} />
              <span className="icon-tooltip">{label}</span>
            </Link>
          ))}
          {user && (
            <button className="icon-link icon-link-btn" onClick={handleLogout}>
              <LogOut size={20} />
              <span className="icon-tooltip">Log out</span>
            </button>
          )}
        </nav>

        <button
          className="hamburger-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile: slide-in drawer from the left */}
      <div
        className={`drawer-backdrop ${menuOpen ? 'drawer-backdrop-open' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />
      <aside className={`mobile-drawer ${menuOpen ? 'mobile-drawer-open' : ''}`}>
        <div className="drawer-header">
          <span>{user ? `Hi, ${user.name.split(' ')[0]}` : 'Welcome to CampusCart'}</span>
          <button className="drawer-close" onClick={closeMenu} aria-label="Close menu">
            <X size={22} />
          </button>
        </div>

        <nav className="drawer-links">
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={closeMenu} className="drawer-link">
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {user && (
          <button className="drawer-logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Log out</span>
          </button>
        )}
      </aside>
    </header>
  );
}
