import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaPlus, FaTrash, FaClock, FaCalendarAlt } from 'react-icons/fa';

const AdminShowsPage = () => {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [movieId, setMovieId] = useState('');
  const [theatreId, setTheatreId] = useState('');
  const [showDate, setShowDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('06:30 PM');
  const [vipPrice, setVipPrice] = useState(450);
  const [premiumPrice, setPremiumPrice] = useState(350);
  const [regularPrice, setRegularPrice] = useState(180);

  const fetchShowsAndDependencies = async () => {
    try {
      const [showsRes, moviesRes, theatresRes] = await Promise.all([
        api.get('/shows'),
        api.get('/movies?limit=50'),
        api.get('/theatres')
      ]);

      const loadedShows = showsRes.data?.data || [];
      const loadedMovies = moviesRes.data?.data || [];
      const loadedTheatres = theatresRes.data?.data || [];

      setShows(loadedShows);
      setMovies(loadedMovies);
      setTheatres(loadedTheatres);

      if (loadedMovies.length > 0 && !movieId) setMovieId(loadedMovies[0]._id);
      if (loadedTheatres.length > 0 && !theatreId) setTheatreId(loadedTheatres[0]._id);
    } catch (err) {
      toast.error('Failed to load shows inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShowsAndDependencies();
  }, []);

  const handleCreateShow = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Find screens for this theatre
      const theatreData = await api.get(`/theatres/${theatreId}`);
      const screens = theatreData.data?.data?.screens || [];
      const screenId = screens.length > 0 ? screens[0]._id : '65e000000000000000000041';

      const payload = {
        movie: movieId,
        theatre: theatreId,
        screen: screenId,
        showDate: new Date(showDate),
        startTime,
        format: '2D',
        pricing: {
          vip: Number(vipPrice),
          premium: Number(premiumPrice),
          executive: Math.round((Number(premiumPrice) + Number(regularPrice)) / 2),
          regular: Number(regularPrice)
        },
        status: 'open'
      };

      await api.post('/shows', payload);
      toast.success('Showtime scheduled successfully.');
      setShowModal(false);
      fetchShowsAndDependencies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create show.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteShow = async (id) => {
    if (!window.confirm('Delete this show schedule?')) return;
    try {
      await api.delete(`/shows/${id}`);
      toast.success('Show deleted.');
      setShows(shows.filter(s => s._id !== id));
    } catch (err) {
      toast.error('Failed to delete show.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading showtime schedules..." />;
  }

  return (
    <div className="container py-4 pb-5">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <Link to="/admin" className="text-secondary small text-decoration-none d-flex align-items-center gap-1 mb-1">
            <FaArrowLeft /> Back to Dashboard
          </Link>
          <h2 className="text-white fw-bold mb-0">Showtime Schedule Management</h2>
        </div>

        <button className="btn btn-cinema" onClick={() => setShowModal(true)}>
          <FaPlus /> Schedule New Show
        </button>
      </div>

      <div className="cinema-card p-4">
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr className="text-secondary small border-secondary">
                <th>Movie</th>
                <th>Theatre</th>
                <th>Date</th>
                <th>Time</th>
                <th>Screen</th>
                <th>Pricing (Reg / Prem / VIP)</th>
                <th>Booked</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shows.map((s) => (
                <tr key={s._id}>
                  <td className="text-white fw-bold">{s.movie?.title || 'Unknown Movie'}</td>
                  <td className="text-secondary small">{s.theatre?.name || 'Multiplex'}</td>
                  <td className="text-light small">{new Date(s.showDate).toLocaleDateString()}</td>
                  <td>
                    <span className="badge bg-danger">{s.startTime}</span>
                  </td>
                  <td className="text-secondary small">{s.screen?.name || 'Screen 1'}</td>
                  <td className="text-info small fw-bold">
                    ₹{s.pricing?.regular} / ₹{s.pricing?.premium} / ₹{s.pricing?.vip}
                  </td>
                  <td>
                    <span className="badge bg-secondary">
                      {s.bookedSeats?.length || 0} seats
                    </span>
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteShow(s._id)}
                      title="Cancel/Delete Show"
                    >
                      <FaTrash size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Modal */}
      {showModal && (
        <div className="modal d-block bg-dark bg-opacity-75" tabIndex="-1" style={{ backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content cinema-card p-2">
              <div className="modal-header border-secondary">
                <h5 className="modal-title text-white fw-bold">Schedule Movie Showtime</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleCreateShow}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="text-secondary small fw-bold mb-1">Select Movie</label>
                    <select
                      className="form-select cinema-input"
                      value={movieId}
                      onChange={(e) => setMovieId(e.target.value)}
                      required
                    >
                      {movies.map(m => (
                        <option key={m._id} value={m._id}>{m.title} ({m.language})</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="text-secondary small fw-bold mb-1">Select Theatre</label>
                    <select
                      className="form-select cinema-input"
                      value={theatreId}
                      onChange={(e) => setTheatreId(e.target.value)}
                      required
                    >
                      {theatres.map(t => (
                        <option key={t._id} value={t._id}>{t.name} ({t.city})</option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="text-secondary small fw-bold mb-1">Show Date</label>
                      <input
                        type="date"
                        className="form-control cinema-input"
                        value={showDate}
                        onChange={(e) => setShowDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="text-secondary small fw-bold mb-1">Start Time</label>
                      <input
                        type="text"
                        className="form-control cinema-input"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        placeholder="e.g. 07:15 PM"
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-4">
                      <label className="text-secondary small fw-bold mb-1">Regular (₹)</label>
                      <input
                        type="number"
                        className="form-control cinema-input"
                        value={regularPrice}
                        onChange={(e) => setRegularPrice(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-4">
                      <label className="text-secondary small fw-bold mb-1">Premium (₹)</label>
                      <input
                        type="number"
                        className="form-control cinema-input"
                        value={premiumPrice}
                        onChange={(e) => setPremiumPrice(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-4">
                      <label className="text-secondary small fw-bold mb-1">VIP (₹)</label>
                      <input
                        type="number"
                        className="form-control cinema-input"
                        value={vipPrice}
                        onChange={(e) => setVipPrice(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-secondary">
                  <button type="button" className="btn btn-cinema-outline" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-cinema" disabled={saving}>
                    {saving ? 'Scheduling...' : 'Save & Publish Show'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShowsPage;
