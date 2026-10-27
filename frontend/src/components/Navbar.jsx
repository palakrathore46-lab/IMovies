// src/components/Navbar.jsx - Main navigation bar component
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [navExpanded, setNavExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeNav = () => setNavExpanded(false);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm py-2">
      <div className="container">
        {/* Brand Logo */}
        <Link className="navbar-brand fw-bold d-flex align-items-center" to="/" onClick={closeNav}>
          <span className="me-2 fs-4">🎬</span>
          <span className="text-warning">I</span>Movies
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setNavExpanded(!navExpanded)}
          aria-controls="navbarNav"
          aria-expanded={navExpanded}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Links */}
        <div className={`collapse navbar-collapse ${navExpanded ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link" to="/" onClick={closeNav}>
                Browse Movies
              </Link>
            </li>
            {user && (
              <li className="nav-item">
                <Link className="nav-link" to="/my-bookings" onClick={closeNav}>
                  My Bookings
                </Link>
              </li>
            )}
            {isAdmin && (
              <li className="nav-item">
                <Link className="nav-link text-warning fw-semibold" to="/admin" onClick={closeNav}>
                  Admin Panel
                </Link>
              </li>
            )}
          </ul>

          {/* User Auth Section */}
          <div className="d-flex align-items-center gap-2">
            {user ? (
              <div className="d-flex align-items-center gap-3">
                <span className="text-light small">
                  Hello, <strong className="text-info">{user.name}</strong>
                  {isAdmin && <span className="badge bg-warning text-dark ms-2">Admin</span>}
                </span>
                <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-light btn-sm" onClick={closeNav}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-warning btn-sm fw-semibold" onClick={closeNav}>
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
