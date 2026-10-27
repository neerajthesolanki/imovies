import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaPlus, FaTrash, FaEdit, FaStar, FaClock } from 'react-icons/fa';

const AdminMoviesPage = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [genre, setGenre] = useState('Action, Sci-Fi');
  const [language, setLanguage] = useState('English');
  const [duration, setDuration] = useState(120);
  const [rating, setRating] = useState(8.5);
  const [certificate, setCertificate] = useState('UA');
  const [status, setStatus] = useState('now_showing');

  const fetchMovies = async () => {
    try {
      const res = await api.get('/movies?limit=50');
      setMovies(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load movies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const openAddModal = () => {
    setEditingMovie(null);
    setTitle('');
    setDescription('');
    setPosterUrl('');
    setBackdropUrl('');
    setTrailerUrl('');
    setGenre('Action, Sci-Fi');
    setLanguage('English');
    setDuration(120);
    setRating(8.5);
    setCertificate('UA');
    setStatus('now_showing');
    setShowModal(true);
  };

  const openEditModal = (m) => {
    setEditingMovie(m);
    setTitle(m.title);
    setDescription(m.description);
    setPosterUrl(m.posterUrl);
    setBackdropUrl(m.backdropUrl || '');
    setTrailerUrl(m.trailerUrl || '');
    setGenre(Array.isArray(m.genre) ? m.genre.join(', ') : m.genre);
    setLanguage(m.language);
    setDuration(m.duration);
    setRating(m.rating);
    setCertificate(m.certificate || 'UA');
    setStatus(m.status);
    setShowModal(true);
  };

  const handleSaveMovie = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title,
        description,
        posterUrl,
        backdropUrl,
        trailerUrl,
        genre: genre.split(',').map(g => g.trim()),
        language,
        duration: Number(duration),
        rating: Number(rating),
        certificate,
        status,
        releaseDate: new Date()
      };

      if (editingMovie) {
        await api.put(`/movies/${editingMovie._id}`, payload);
        toast.success('Movie updated successfully.');
      } else {
        await api.post('/movies', payload);
        toast.success('New movie created successfully.');
      }

      setShowModal(false);
      fetchMovies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save movie.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMovie = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await api.delete(`/movies/${id}`);
      toast.success('Movie deleted successfully.');
      setMovies(movies.filter(m => m._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete movie.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading movies inventory..." />;
  }

  return (
    <div className="container py-4 pb-5">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <Link to="/admin" className="text-secondary small text-decoration-none d-flex align-items-center gap-1 mb-1">
            <FaArrowLeft /> Back to Dashboard
          </Link>
          <h2 className="text-white fw-bold mb-0">Movie Management</h2>
        </div>

        <button className="btn btn-cinema" onClick={openAddModal}>
          <FaPlus /> Add New Movie
        </button>
      </div>

      <div className="cinema-card p-4">
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0">
            <thead>
              <tr className="text-secondary small border-secondary">
                <th>Poster</th>
                <th>Title</th>
                <th>Genre</th>
                <th>Language</th>
                <th>Duration</th>
                <th>Rating</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((m) => (
                <tr key={m._id}>
                  <td>
                    <img
                      src={m.posterUrl}
                      alt={m.title}
                      className="rounded-2"
                      style={{ width: '45px', height: '60px', objectFit: 'cover' }}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=100&q=80'; }}
                    />
                  </td>
                  <td className="text-white fw-bold">{m.title}</td>
                  <td className="text-secondary small">
                    {Array.isArray(m.genre) ? m.genre.slice(0, 2).join(', ') : m.genre}
                  </td>
                  <td className="text-light small">{m.language}</td>
                  <td className="text-secondary small">{m.duration}m</td>
                  <td>
                    <span className="badge bg-dark border border-secondary text-warning d-inline-flex align-items-center gap-1">
                      <FaStar size={10} /> {m.rating}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${m.status === 'now_showing' ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-info me-2"
                      onClick={() => openEditModal(m)}
                      title="Edit Movie"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeleteMovie(m._id, m.title)}
                      title="Delete Movie"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          className="modal d-block bg-dark bg-opacity-75"
          tabIndex="-1"
          style={{ backdropFilter: 'blur(4px)' }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content cinema-card p-2">
              <div className="modal-header border-secondary">
                <h5 className="modal-title text-white fw-bold">
                  {editingMovie ? 'Edit Movie Details' : 'Add New Movie to Catalogue'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSaveMovie}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12 col-md-8">
                      <label className="text-secondary small fw-bold mb-1">Movie Title</label>
                      <input
                        type="text"
                        className="form-control cinema-input"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-4">
                      <label className="text-secondary small fw-bold mb-1">Certificate</label>
                      <select
                        className="form-select cinema-input"
                        value={certificate}
                        onChange={(e) => setCertificate(e.target.value)}
                      >
                        <option value="U">U (Universal)</option>
                        <option value="UA">UA (Parental Guidance)</option>
                        <option value="A">A (Adult 18+)</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="text-secondary small fw-bold mb-1">Description</label>
                      <textarea
                        className="form-control cinema-input"
                        rows="3"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      ></textarea>
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="text-secondary small fw-bold mb-1">Poster Image URL</label>
                      <input
                        type="url"
                        className="form-control cinema-input"
                        placeholder="https://images.unsplash.com/..."
                        value={posterUrl}
                        onChange={(e) => setPosterUrl(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="text-secondary small fw-bold mb-1">Backdrop Image URL</label>
                      <input
                        type="url"
                        className="form-control cinema-input"
                        value={backdropUrl}
                        onChange={(e) => setBackdropUrl(e.target.value)}
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="text-secondary small fw-bold mb-1">Genres (Comma separated)</label>
                      <input
                        type="text"
                        className="form-control cinema-input"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        placeholder="Action, Sci-Fi, Thriller"
                        required
                      />
                    </div>

                    <div className="col-12 col-md-6">
                      <label className="text-secondary small fw-bold mb-1">Trailer Video URL (YouTube)</label>
                      <input
                        type="url"
                        className="form-control cinema-input"
                        value={trailerUrl}
                        onChange={(e) => setTrailerUrl(e.target.value)}
                      />
                    </div>

                    <div className="col-6 col-md-3">
                      <label className="text-secondary small fw-bold mb-1">Language</label>
                      <input
                        type="text"
                        className="form-control cinema-input"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-6 col-md-3">
                      <label className="text-secondary small fw-bold mb-1">Duration (Mins)</label>
                      <input
                        type="number"
                        className="form-control cinema-input"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-6 col-md-3">
                      <label className="text-secondary small fw-bold mb-1">Rating (0-10)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control cinema-input"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-6 col-md-3">
                      <label className="text-secondary small fw-bold mb-1">Status</label>
                      <select
                        className="form-select cinema-input"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="now_showing">Now Showing</option>
                        <option value="coming_soon">Coming Soon</option>
                        <option value="ended">Ended</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-secondary">
                  <button
                    type="button"
                    className="btn btn-cinema-outline"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-cinema"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Movie'}
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

export default AdminMoviesPage;
