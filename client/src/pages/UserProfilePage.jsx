import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { FaUserCircle, FaTicketAlt, FaHistory, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTimesCircle, FaCheckCircle, FaBan } from 'react-icons/fa';

const UserProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/bookings/my');
        setBookings(res.data?.data || []);
      } catch (err) {
        console.error('Failed to load user bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', { name, phone });
      updateUser(res.data?.data?.user);
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? An 85% refund will be processed.')) {
      return;
    }

    setCancellingId(bookingId);
    try {
      const res = await api.post(`/bookings/${bookingId}/cancel`, {
        reason: 'Customer initiated cancellation'
      });
      toast.success(res.data?.message || 'Booking cancelled successfully.');

      // Update state
      setBookings(bookings.map(b => b._id === bookingId ? {
        ...b,
        bookingStatus: 'cancelled',
        paymentStatus: 'refunded',
        cancellation: { isCancelled: true, refundAmount: res.data?.data?.refundAmount }
      } : b));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const now = new Date();
  const upcomingBookings = bookings.filter(b => {
    const isPast = new Date(b.showDate) < now;
    return !isPast && b.bookingStatus !== 'cancelled';
  });

  const pastBookings = bookings.filter(b => {
    const isPast = new Date(b.showDate) < now;
    return isPast || b.bookingStatus === 'cancelled';
  });

  if (loading) {
    return <LoadingSpinner message="Loading your cinema bookings and profile..." />;
  }

  return (
    <div className="container py-4 pb-5">
      <div className="row g-4">
        {/* Left Column: User Profile Card */}
        <div className="col-12 col-md-4">
          <div className="cinema-card p-4">
            <div className="text-center mb-4">
              <div className="d-inline-flex p-3 rounded-circle bg-danger bg-opacity-20 text-danger mb-2">
                <FaUserCircle size={54} />
              </div>
              <h5 className="text-white fw-bold mb-0">{user?.name}</h5>
              <div className="text-secondary small">{user?.email}</div>
              <span className="badge bg-secondary mt-2 text-uppercase" style={{ fontSize: '0.65rem' }}>
                {user?.role === 'admin' ? 'System Administrator' : 'Verified Cinema Guest'}
              </span>
            </div>

            <form onSubmit={handleUpdateProfile}>
              <div className="mb-3">
                <label className="text-secondary small fw-bold mb-1">Full Name</label>
                <input
                  type="text"
                  className="form-control cinema-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="text-secondary small fw-bold mb-1">Phone Number</label>
                <input
                  type="text"
                  className="form-control cinema-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>

              <button
                type="submit"
                className="btn btn-cinema-outline w-100 btn-sm"
                disabled={savingProfile}
              >
                {savingProfile ? 'Saving...' : 'Update Profile Details'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Bookings Tabs */}
        <div className="col-12 col-md-8">
          <div className="cinema-card p-4">
            {/* Tabs */}
            <div className="d-flex gap-2 mb-4 border-bottom border-secondary border-opacity-25 pb-3">
              <button
                type="button"
                className={`btn btn-sm ${
                  activeTab === 'upcoming' ? 'btn-cinema' : 'btn-cinema-outline'
                }`}
                onClick={() => setActiveTab('upcoming')}
              >
                <FaTicketAlt className="me-1" /> Upcoming Shows ({upcomingBookings.length})
              </button>
              <button
                type="button"
                className={`btn btn-sm ${
                  activeTab === 'past' ? 'btn-cinema' : 'btn-cinema-outline'
                }`}
                onClick={() => setActiveTab('past')}
              >
                <FaHistory className="me-1" /> Booking History & Cancelled ({pastBookings.length})
              </button>
            </div>

            {/* Content List */}
            {activeTab === 'upcoming' ? (
              upcomingBookings.length === 0 ? (
                <div className="text-center py-5">
                  <FaTicketAlt size={40} className="text-secondary mb-3" />
                  <h6 className="text-white">No Upcoming Movie Bookings</h6>
                  <p className="text-secondary small">You haven't reserved any upcoming cinema shows.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {upcomingBookings.map((b) => (
                    <div key={b._id} className="p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25">
                      <div className="d-flex flex-column flex-sm-row justify-content-between gap-3">
                        <div className="d-flex gap-3">
                          <img
                            src={b.movie?.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=300&q=80'}
                            alt={b.movie?.title}
                            className="rounded-3"
                            style={{ width: '70px', height: '95px', objectFit: 'cover' }}
                          />
                          <div>
                            <span className="badge bg-success mb-1">CONFIRMED</span>
                            <h6 className="text-white fw-bold mb-1">{b.movie?.title}</h6>
                            <div className="text-secondary small d-flex align-items-center gap-2 mb-1">
                              <FaMapMarkerAlt className="text-danger" size={11} /> {b.theatre?.name}
                            </div>
                            <div className="text-light small d-flex align-items-center gap-3">
                              <span><FaCalendarAlt size={11} /> {new Date(b.showDate).toLocaleDateString()}</span>
                              <span><FaClock size={11} /> {b.showTime}</span>
                            </div>
                            <div className="text-secondary small mt-1">
                              Seats: <strong className="text-white">{b.seats?.map(s => s.seatId).join(', ')}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="d-flex flex-column align-items-sm-end justify-content-between">
                          <div className="text-sm-end">
                            <span className="text-secondary small">Ref:</span>
                            <div className="text-warning fw-bold font-monospace">{b.bookingReference}</div>
                            <div className="text-success fw-bold">₹{b.pricingSummary?.totalAmount}</div>
                          </div>

                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm mt-2"
                            disabled={cancellingId === b._id}
                            onClick={() => handleCancelBooking(b._id)}
                          >
                            <FaBan size={12} /> Cancel Booking
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              pastBookings.length === 0 ? (
                <div className="text-center py-5">
                  <FaHistory size={40} className="text-secondary mb-3" />
                  <h6 className="text-white">No Past or Cancelled Bookings</h6>
                  <p className="text-secondary small">Your past tickets will appear here.</p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {pastBookings.map((b) => (
                    <div key={b._id} className="p-3 rounded-3 bg-dark bg-opacity-40 border border-secondary border-opacity-10 opacity-75">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className={`badge ${b.bookingStatus === 'cancelled' ? 'bg-danger' : 'bg-secondary'}`}>
                              {b.bookingStatus === 'cancelled' ? 'CANCELLED' : 'COMPLETED'}
                            </span>
                            <span className="text-secondary small">{b.bookingReference}</span>
                          </div>
                          <h6 className="text-white fw-bold mb-1">{b.movie?.title}</h6>
                          <div className="text-secondary small">
                            {b.theatre?.name} • {new Date(b.showDate).toLocaleDateString()} • {b.seats?.map(s => s.seatId).join(', ')}
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="text-secondary small">Paid: ₹{b.pricingSummary?.totalAmount}</div>
                          {b.cancellation?.isCancelled && (
                            <div className="text-info small">Refunded: ₹{b.cancellation.refundAmount}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
