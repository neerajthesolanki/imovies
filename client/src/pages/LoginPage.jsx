import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaFilm, FaLock, FaEnvelope } from 'react-icons/fa';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warning('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.name}!`);

      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(redirectPath);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type) => {
    if (type === 'admin') {
      setEmail('admin@imovies.com');
      setPassword('Admin@123456');
    } else {
      setEmail('user@imovies.com');
      setPassword('User@123456');
    }
  };

  return (
    <div className="container py-5 my-auto d-flex justify-content-center align-items-center">
      <div className="cinema-card p-4 p-md-5 w-100" style={{ maxWidth: '440px' }}>
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-3 mb-2"
            style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #e50914, #8b0000)', color: '#fff' }}
          >
            <FaFilm size={22} />
          </div>
          <h3 className="text-white fw-bold mb-1">Sign In to IMovies</h3>
          <p className="text-secondary small">Access tickets, movie reservations, and rewards</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="text-secondary small fw-bold mb-1">Email Address</label>
            <div className="position-relative">
              <input
                type="email"
                className="form-control cinema-input ps-5"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <FaEnvelope
                className="position-absolute text-muted"
                style={{ top: '50%', left: '1rem', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="text-secondary small fw-bold mb-1">Password</label>
            <div className="position-relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control cinema-input ps-5 pe-5"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FaLock
                className="position-absolute text-muted"
                style={{ top: '50%', left: '1rem', transform: 'translateY(-50%)' }}
              />
              <button
                type="button"
                className="btn position-absolute text-secondary p-0 border-0"
                style={{ top: '50%', right: '1rem', transform: 'translateY(-50%)' }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-cinema w-100 py-3 mb-3 fw-bold"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Fast Autofills */}
        <div className="p-3 rounded-3 bg-dark bg-opacity-60 border border-secondary border-opacity-25 mb-3 text-center">
          <span className="text-secondary small fw-bold d-block mb-2">Instant Demo Accounts</span>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-danger btn-sm flex-grow-1"
              onClick={() => handleFillDemo('admin')}
            >
              Demo Admin
            </button>
            <button
              type="button"
              className="btn btn-outline-light btn-sm flex-grow-1"
              onClick={() => handleFillDemo('user')}
            >
              Demo User
            </button>
          </div>
        </div>

        <div className="text-center text-secondary small">
          Don't have an account?{' '}
          <Link to="/register" className="text-danger text-decoration-none fw-semibold">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
