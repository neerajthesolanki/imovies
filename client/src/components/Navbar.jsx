import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaFilm, FaUserCircle, FaSignOutAlt, FaShieldAlt, FaTicketAlt, FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`navbar navbar-expand-lg fixed-top transition-all duration-300 ${
        scrolled ? 'bg-dark bg-opacity-95 shadow-lg backdrop-blur' : 'bg-transparent'
      }`}
      style={{
        backgroundColor: scrolled ? 'rgba(8, 12, 20, 0.95)' : 'rgba(8, 12, 20, 0.7)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-color)',
        zIndex: 1000
      }}
    >
      <div className="container py-2">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 text-white text-decoration-none">
          <div
            className="d-flex align-items-center justify-content-center rounded-3"
            style={{
              width: '38px',
              height: '38px',
              background: 'linear-gradient(135deg, #e50914, #8b0000)',
              color: '#fff'
            }}
          >
            <FaFilm size={20} />
          </div>
          <span className="brand-font fs-4 fw-bold">
            <span style={{ color: 'var(--primary-red)' }}>I</span>MOVIES
          </span>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0 text-white"
          type="button"
          onClick={() => setNavOpen(!navOpen)}
          aria-label="Toggle navigation"
        >
          {navOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
        </button>

        {/* Nav Links */}
        <div className={`collapse navbar-collapse ${navOpen ? 'show' : ''}`} id="mainNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4 gap-lg-2">
            <li className="nav-item">
              <Link
                to="/"
                className={`nav-link px-3 ${isActive('/') ? 'text-danger fw-semibold' : 'text-light'}`}
                onClick={() => setNavOpen(false)}
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to="/movies"
                className={`nav-link px-3 ${isActive('/movies') ? 'text-danger fw-semibold' : 'text-light'}`}
                onClick={() => setNavOpen(false)}
              >
                Movies
              </Link>
            </li>
          </ul>

          {/* User / Auth Navigation */}
          <div className="d-flex align-items-center gap-3 mt-3 mt-lg-0">
            {user ? (
              <div className="dropdown">
                <button
                  className="btn btn-cinema-outline dropdown-toggle d-flex align-items-center gap-2"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <FaUserCircle size={18} className="text-danger" />
                  <span>{user.name.split(' ')[0]}</span>
                  {user.role === 'admin' && (
                    <span className="badge bg-danger ms-1" style={{ fontSize: '0.65rem' }}>
                      Admin
                    </span>
                  )}
                </button>
                <ul className="dropdown-menu dropdown-menu-dark dropdown-menu-end shadow-lg" style={{ background: '#162032', borderColor: 'var(--border-color)' }}>
                  <li>
                    <Link className="dropdown-item d-flex align-items-center gap-2 py-2" to="/profile">
                      <FaTicketAlt className="text-muted" /> My Bookings
                    </Link>
                  </li>
                  {user.role === 'admin' && (
                    <li>
                      <Link className="dropdown-item d-flex align-items-center gap-2 py-2 text-warning" to="/admin">
                        <FaShieldAlt /> Admin Dashboard
                      </Link>
                    </li>
                  )}
                  <li><hr className="dropdown-divider border-secondary" /></li>
                  <li>
                    <button className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger" onClick={handleLogout}>
                      <FaSignOutAlt /> Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-cinema-outline btn-sm px-3" onClick={() => setNavOpen(false)}>
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-cinema btn-sm px-3" onClick={() => setNavOpen(false)}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
