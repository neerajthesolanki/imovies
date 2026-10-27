import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaFilm, FaLock, FaEnvelope, FaUser, FaPhone } from 'react-icons/fa';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.warning('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, phone);
      toast.success('Registration successful! Welcome to IMovies.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 my-auto d-flex justify-content-center align-items-center">
      <div className="cinema-card p-4 p-md-5 w-100" style={{ maxWidth: '460px' }}>
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-3 mb-2"
            style={{ width: '44px', height: '44px', background: 'linear-gradient(135deg, #e50914, #8b0000)', color: '#fff' }}
          >
            <FaFilm size={22} />
          </div>
          <h3 className="text-white fw-bold mb-1">Create Account</h3>
          <p className="text-secondary small">Join IMovies to book seats & earn rewards</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="text-secondary small fw-bold mb-1">Full Name</label>
            <div className="position-relative">
              <input
                type="text"
                className="form-control cinema-input ps-5"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <FaUser
                className="position-absolute text-muted"
                style={{ top: '50%', left: '1rem', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

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

          <div className="mb-3">
            <label className="text-secondary small fw-bold mb-1">Phone Number (Optional)</label>
            <div className="position-relative">
              <input
                type="tel"
                className="form-control cinema-input ps-5"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <FaPhone
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
                placeholder="At least 6 characters"
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
            {loading ? 'Registering...' : 'Complete Registration'}
          </button>
        </form>

        <div className="text-center text-secondary small">
          Already have an account?{' '}
          <Link to="/login" className="text-danger text-decoration-none fw-semibold">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
