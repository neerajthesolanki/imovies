import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { FaArrowLeft, FaSearch, FaFilter } from 'react-icons/fa';

const AdminBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/bookings', {
        params: {
          ...(status !== 'All' && { status }),
          ...(search && { search })
        }
      });
      setBookings(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [status]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  return (
    <div className="container py-4 pb-5">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <Link to="/admin" className="text-secondary small text-decoration-none d-flex align-items-center gap-1 mb-1">
            <FaArrowLeft /> Back to Dashboard
          </Link>
          <h2 className="text-white fw-bold mb-0">Master Bookings Ledger</h2>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="cinema-card p-3 mb-4">
        <form onSubmit={handleSearch} className="row g-2 align-items-center">
          <div className="col-12 col-md-6 position-relative">
            <input
              type="text"
              className="form-control cinema-input ps-5"
              placeholder="Search by Booking Reference (e.g. IMV-123456)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FaSearch
              className="position-absolute text-muted"
              style={{ top: '50%', left: '1.25rem', transform: 'translateY(-50%)' }}
            />
          </div>

          <div className="col-8 col-md-4">
            <select
              className="form-select cinema-input"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="All">All Booking Statuses</option>
              <option value="confirmed">Confirmed Only</option>
              <option value="cancelled">Cancelled Only</option>
            </select>
          </div>

          <div className="col-4 col-md-2">
            <button type="submit" className="btn btn-cinema w-100">
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="cinema-card p-4">
        {loading ? (
          <LoadingSpinner message="Searching master ledger..." />
        ) : bookings.length === 0 ? (
          <div className="text-center py-5 text-secondary">
            No bookings found matching criteria.
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover align-middle mb-0">
              <thead>
                <tr className="text-secondary small border-secondary">
                  <th>Ref #</th>
                  <th>Guest</th>
                  <th>Movie</th>
                  <th>Theatre</th>
                  <th>Date & Time</th>
                  <th>Seats</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b._id}>
                    <td>
                      <span className="text-warning fw-bold font-monospace">{b.bookingReference}</span>
                    </td>
                    <td>
                      <div className="text-white small fw-bold">{b.user?.name || 'Guest'}</div>
                      <div className="text-secondary" style={{ fontSize: '0.72rem' }}>{b.user?.email}</div>
                    </td>
                    <td className="text-white fw-semibold">{b.movie?.title}</td>
                    <td className="text-secondary small">{b.theatre?.name}</td>
                    <td className="text-light small">
                      {new Date(b.showDate).toLocaleDateString()} {b.showTime}
                    </td>
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

export default AdminBookingsPage;
