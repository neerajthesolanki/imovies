import React from 'react';
import { Link } from 'react-router-dom';
import { FaFilm, FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="mt-auto py-5" style={{ background: '#05080f', borderTop: '1px solid var(--border-color)' }}>
      <div className="container">
        <div className="row g-4 justify-content-between">
          <div className="col-12 col-md-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                className="d-flex align-items-center justify-content-center rounded-3"
                style={{
                  width: '32px',
                  height: '32px',
                  background: 'linear-gradient(135deg, #e50914, #8b0000)',
                  color: '#fff'
                }}
              >
                <FaFilm size={16} />
              </div>
              <span className="brand-font fs-4 fw-bold text-white">
                <span style={{ color: 'var(--primary-red)' }}>I</span>MOVIES
              </span>
            </div>
            <p className="text-secondary small mb-3">
              Experience movie magic with real-time seat reservation, seamless instant booking, and premium cinema audio-visuals.
            </p>
            <div className="text-muted small">
              © {new Date().getFullYear()} IMovies Cinema System. All rights reserved.
            </div>
          </div>

          <div className="col-6 col-md-2">
            <h6 className="text-white fw-bold mb-3">Explore</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><Link to="/movies" className="text-secondary text-decoration-none hover-white">Now Showing</Link></li>
              <li><Link to="/movies?status=coming_soon" className="text-secondary text-decoration-none hover-white">Coming Soon</Link></li>
              <li><Link to="/movies" className="text-secondary text-decoration-none hover-white">Top Rated</Link></li>
            </ul>
          </div>

          <div className="col-6 col-md-2">
            <h6 className="text-white fw-bold mb-3">Account</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 small">
              <li><Link to="/profile" className="text-secondary text-decoration-none hover-white">My Bookings</Link></li>
              <li><Link to="/login" className="text-secondary text-decoration-none hover-white">Sign In</Link></li>
              <li><Link to="/register" className="text-secondary text-decoration-none hover-white">Register</Link></li>
            </ul>
          </div>

          <div className="col-12 col-md-3">
            <h6 className="text-white fw-bold mb-3">Cinema Experience</h6>
            <p className="text-secondary small mb-2">
              Dolby Atmos 128-channel sound, IMAX 4K Laser Projection, and VIP Recliner Lounges.
            </p>
            <div className="d-flex align-items-center gap-2 small text-muted">
              <span>Crafted with</span>
              <FaHeart className="text-danger" size={14} />
              <span>for cinema enthusiasts</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
