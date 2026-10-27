import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  FaFilm,
  FaBuilding,
  FaClock,
  FaTicketAlt,
  FaRupeeSign,
  FaUsers,
  FaPlus,
  FaCalendarAlt
} from 'react-icons/fa';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await api.get('/admin/stats');
        setStats(res.data?.data || null);
      } catch (err) {
        console.error('Failed to load admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading Cinema Management Analytics..." />;
  }

  return (
    <div className="container py-4 pb-5">
      {/* Admin Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
        <div>
          <span className="badge bg-danger mb-1">CINEMA CONTROL CENTER</span>
          <h2 className="text-white fw-bold mb-0">Administrator Dashboard</h2>
        </div>

        {/* Action Shortcuts */}
        <div className="d-flex flex-wrap gap-2">
          <Link to="/admin/movies" className="btn btn-cinema-outline btn-sm">
            <FaFilm /> Manage Movies
          </Link>
          <Link to="/admin/theatres" className="btn btn-cinema-outline btn-sm">
            <FaBuilding /> Theatres
          </Link>
          <Link to="/admin/shows" className="btn btn-cinema-outline btn-sm">
            <FaClock /> Shows
          </Link>
          <Link to="/admin/bookings" className="btn btn-cinema-outline btn-sm">
            <FaTicketAlt /> All Bookings
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="row g-3 mb-5">
        <div className="col-6 col-lg-2">
          <div className="cinema-card p-3 h-100 border-start border-4 border-success">
            <div className="text-secondary small fw-bold text-uppercase">Total Revenue</div>
            <div className="text-success fw-extrabold fs-4 mt-1">₹{stats?.totalRevenue || 0}</div>
          </div>
        </div>

        <div className="col-6 col-lg-2">
          <div className="cinema-card p-3 h-100 border-start border-4 border-danger">
            <div className="text-secondary small fw-bold text-uppercase">Bookings</div>
            <div className="text-white fw-extrabold fs-4 mt-1">{stats?.totalBookings || 0}</div>
          </div>
        </div>

        <div className="col-6 col-lg-2">
          <div className="cinema-card p-3 h-100 border-start border-4 border-warning">
            <div className="text-secondary small fw-bold text-uppercase">Movies</div>
            <div className="text-white fw-extrabold fs-4 mt-1">{stats?.totalMovies || 0}</div>
          </div>
        </div>

        <div className="col-6 col-lg-2">
          <div className="cinema-card p-3 h-100 border-start border-4 border-info">
            <div className="text-secondary small fw-bold text-uppercase">Theatres</div>
            <div className="text-white fw-extrabold fs-4 mt-1">{stats?.totalTheatres || 0}</div>
          </div>
        </div>

        <div className="col-6 col-lg-2">
          <div className="cinema-card p-3 h-100 border-start border-4 border-primary">
            <div className="text-secondary small fw-bold text-uppercase">Active Shows</div>
            <div className="text-white fw-extrabold fs-4 mt-1">{stats?.totalShows || 0}</div>
          </div>
        </div>

        <div className="col-6 col-lg-2">
          <div className="cinema-card p-3 h-100 border-start border-4 border-secondary">
            <div className="text-secondary small fw-bold text-uppercase">Guests</div>
            <div className="text-white fw-extrabold fs-4 mt-1">{stats?.totalUsers || 0}</div>
          </div>
        </div>
      </div>

      {/* Recent Activity: Latest Bookings Table */}
      <div className="cinema-card p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="text-white fw-bold mb-0">Recent Confirmed Bookings</h5>
          <Link to="/admin/bookings" className="text-danger small text-decoration-none fw-semibold">
            View All ({stats?.totalBookings}) →
          </Link>
        </div>

        {stats?.recentBookings?.length === 0 ? (
          <div className="text-center py-4 text-secondary small">
            No bookings recorded yet.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0" style={{ background: 'transparent' }}>
              <thead>
                <tr className="text-secondary small border-secondary">
                  <th>Reference</th>
                  <th>Movie</th>
                  <th>Theatre</th>
                  <th>Seats</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentBookings?.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <span className="text-warning fw-bold font-monospace">{b.bookingReference}</span>
                    </td>
                    <td className="text-white fw-semibold">{b.movie?.title || 'IMovies Feature'}</td>
                    <td className="text-secondary small">{b.theatre?.name || 'Multiplex'}</td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {b.seats?.map(s => (
                          <span key={s.seatId} className="badge bg-secondary" style={{ fontSize: '0.65rem' }}>
                            {s.seatId}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="text-success fw-bold">₹{b.pricingSummary?.totalAmount}</td>
                    <td>
                      <span className={`badge ${b.bookingStatus === 'confirmed' ? 'bg-success' : 'bg-danger'}`}>
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
