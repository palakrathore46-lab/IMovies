// src/pages/Login.jsx - User & Admin Login page
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to previously requested page if guarded by ProtectedRoute, otherwise home
  const redirectPath = location.state?.from?.pathname || location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for testing
  const fillCredentials = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card shadow border-0 p-4">
            <div className="text-center mb-4">
              <h3 className="fw-bold text-dark">
                Welcome to <span className="text-warning">I</span>Movies
              </h3>
              <p className="text-muted small">Sign in to book tickets and manage your reservations</p>
            </div>

            {/* Error banner */}
            {error && (
              <div className="alert alert-danger shadow-sm small" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold text-secondary">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-warning w-100 fw-bold py-2 mt-2 shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <span>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Quick Demo Helper Section */}
            <div className="mt-4 pt-3 border-top text-center">
              <p className="text-muted small mb-2 fw-semibold">Quick Demo Login (Click to Auto-fill):</p>
              <div className="d-flex justify-content-center gap-2">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => fillCredentials('user@imovies.com', 'user123')}
                >
                  👤 User Demo
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-dark"
                  onClick={() => fillCredentials('admin@imovies.com', 'admin123')}
                >
                  🛡️ Admin Demo
                </button>
              </div>
            </div>

            <div className="text-center mt-4">
              <p className="text-muted small mb-0">
                Don't have an account?{' '}
                <Link to="/register" className="fw-bold text-decoration-none text-primary">
                  Register here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
