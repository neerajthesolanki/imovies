import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaPlus, FaTrash, FaBuilding, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';

const AdminTheatresPage = () => {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('+91 22 1234 5678');
  const [facilities, setFacilities] = useState('Dolby Atmos, 4K Laser Projection, Food Court');

  const fetchTheatres = async () => {
    try {
      const res = await api.get('/theatres');
      setTheatres(res.data?.data || []);
    } catch (err) {
      toast.error('Failed to load theatres.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheatres();
  }, []);

  const handleSaveTheatre = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name,
        city,
        address,
        phone,
        facilities: facilities.split(',').map(f => f.trim()),
        isActive: true
      };

      await api.post('/theatres', payload);
      toast.success('Theatre added successfully.');
      setShowModal(false);
      fetchTheatres();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create theatre.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTheatre = async (id, theatreName) => {
    if (!window.confirm(`Are you sure you want to delete "${theatreName}"?`)) return;

    try {
      await api.delete(`/theatres/${id}`);
      toast.success('Theatre deleted.');
      setTheatres(theatres.filter(t => t._id !== id));
    } catch (err) {
      toast.error('Failed to delete theatre.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading partner theatres..." />;
  }

  return (
    <div className="container py-4 pb-5">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <Link to="/admin" className="text-secondary small text-decoration-none d-flex align-items-center gap-1 mb-1">
            <FaArrowLeft /> Back to Dashboard
          </Link>
          <h2 className="text-white fw-bold mb-0">Theatre Management</h2>
        </div>

        <button className="btn btn-cinema" onClick={() => setShowModal(true)}>
          <FaPlus /> Add New Theatre
        </button>
      </div>

      <div className="row g-4">
        {theatres.map((t) => (
          <div key={t._id} className="col-12 col-md-6 col-lg-4">
            <div className="cinema-card p-4 h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="badge bg-danger small">{t.city}</span>
                  <button
                    className="btn btn-sm btn-outline-danger p-1"
                    onClick={() => handleDeleteTheatre(t._id, t.name)}
                    title="Delete Theatre"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>

                <h5 className="text-white fw-bold mb-2">{t.name}</h5>
                <p className="text-secondary small mb-3">
                  <FaMapMarkerAlt className="text-danger me-1" />
                  {t.address}
                </p>

                {t.phone && (
                  <div className="text-light small mb-3">
                    <FaPhone className="text-secondary me-1" size={11} /> {t.phone}
                  </div>
                )}

                <div className="d-flex flex-wrap gap-1 mb-3">
                  {t.facilities?.map((f, i) => (
                    <span key={i} className="badge bg-dark border border-secondary text-secondary" style={{ fontSize: '0.65rem' }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border-top border-secondary border-opacity-25 pt-3">
                <span className="text-success small fw-semibold">● Active in Booking Network</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Theatre Modal */}
      {showModal && (
        <div className="modal d-block bg-dark bg-opacity-75" tabIndex="-1" style={{ backdropFilter: 'blur(4px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content cinema-card p-2">
              <div className="modal-header border-secondary">
                <h5 className="modal-title text-white fw-bold">Register New Theatre</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>

              <form onSubmit={handleSaveTheatre}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="text-secondary small fw-bold mb-1">Theatre Name</label>
                    <input
                      type="text"
                      className="form-control cinema-input"
                      placeholder="PVR ICON / INOX Multiplex"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="text-secondary small fw-bold mb-1">City</label>
                    <input
                      type="text"
                      className="form-control cinema-input"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="text-secondary small fw-bold mb-1">Full Street Address</label>
                    <textarea
                      className="form-control cinema-input"
                      rows="2"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="text-secondary small fw-bold mb-1">Contact Phone</label>
                    <input
                      type="text"
                      className="form-control cinema-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="text-secondary small fw-bold mb-1">Facilities (Comma separated)</label>
                    <input
                      type="text"
                      className="form-control cinema-input"
                      value={facilities}
                      onChange={(e) => setFacilities(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer border-secondary">
                  <button type="button" className="btn btn-cinema-outline" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-cinema" disabled={saving}>
                    {saving ? 'Saving...' : 'Register Theatre'}
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

export default AdminTheatresPage;
