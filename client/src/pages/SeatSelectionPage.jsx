import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import SeatGrid from '../components/SeatGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaTicketAlt, FaClock, FaMapMarkerAlt, FaLock } from 'react-icons/fa';

const SeatSelectionPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [heldSeats, setHeldSeats] = useState([]);
  const [holding, setHolding] = useState(false);

  // Load show details
  useEffect(() => {
    const fetchShowDetails = async () => {
      try {
        const res = await api.get(`/shows/${showId}`);
        const showData = res.data?.data?.show;
        const activeHolds = res.data?.data?.activeHolds || [];

        setShow(showData);
        setBookedSeats(showData.bookedSeats || []);
        setHeldSeats(activeHolds);
      } catch (err) {
        toast.error('Failed to load show seating layout.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchShowDetails();
  }, [showId]);

  // Real-time socket events
  useEffect(() => {
    if (!socket || !showId) return;

    socket.emit('join_show', showId);

    // When other users hold seats
    socket.on('seats_held', (data) => {
      if (data.showId === showId) {
        setHeldSeats((prev) => [
          ...prev.filter(h => !data.seats.includes(typeof h === 'string' ? h : h.seatId)),
          ...data.seats.map(s => ({ seatId: s, userId: data.heldBy }))
        ]);
      }
    });

    // When seats are released
    socket.on('seat_released', (data) => {
      if (data.showId === showId) {
        setHeldSeats((prev) => prev.filter(h => !data.seats.includes(typeof h === 'string' ? h : h.seatId)));
      }
    });

    // When seats are permanently booked
    socket.on('seats_booked', (data) => {
      if (data.showId === showId) {
        setBookedSeats((prev) => [...new Set([...prev, ...data.seats])]);
        // Also remove from held seats
        setHeldSeats((prev) => prev.filter(h => !data.seats.includes(typeof h === 'string' ? h : h.seatId)));
        // If current user had selected one of these, remove it
        setSelectedSeats((prev) => prev.filter(s => !data.seats.includes(s.seatId)));
      }
    });

    return () => {
      socket.emit('leave_show', showId);
      socket.off('seats_held');
      socket.off('seat_released');
      socket.off('seats_booked');
    };
  }, [socket, showId]);

  const handleSeatClick = (seatObj) => {
    const isSelected = selectedSeats.some(s => s.seatId === seatObj.seatId);

    if (isSelected) {
      setSelectedSeats(selectedSeats.filter(s => s.seatId !== seatObj.seatId));
    } else {
      if (selectedSeats.length >= 8) {
        toast.warning('Maximum 8 seats allowed per transaction.');
        return;
      }
      setSelectedSeats([...selectedSeats, seatObj]);
    }
  };

  const calculateSubtotal = () => {
    return selectedSeats.reduce((sum, s) => sum + s.price, 0);
  };

  const handleProceedToCheckout = async () => {
    if (!user) {
      toast.info('Please sign in to proceed with booking.');
      navigate('/login', { state: { from: { pathname: `/seat-selection/${showId}` } } });
      return;
    }

    if (selectedSeats.length === 0) {
      toast.warning('Please pick at least one seat to continue.');
      return;
    }

    setHolding(true);
    try {
      // Create temporary hold on backend
      const seatIds = selectedSeats.map(s => s.seatId);
      const res = await api.post('/bookings/hold', {
        showId,
        seats: seatIds
      });

      // Save holdToken in sessionStorage
      sessionStorage.setItem('imovies_booking_flow', JSON.stringify({
        showId,
        show,
        seats: selectedSeats,
        holdToken: res.data?.data?.holdToken,
        expiresAt: res.data?.data?.expiresAt
      }));

      navigate('/checkout');
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not reserve seats. Please re-select.';
      toast.error(msg);
      // Reload show to refresh availability
      const refreshRes = await api.get(`/shows/${showId}`);
      if (refreshRes.data?.data?.show) {
        setBookedSeats(refreshRes.data.data.show.bookedSeats || []);
      }
    } finally {
      setHolding(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Generating cinema seating layout..." />;
  }

  if (!show) {
    return (
      <div className="container py-5 text-center">
        <h3 className="text-white">Show not found or unavailable.</h3>
        <Link to="/movies" className="btn btn-cinema mt-3">Back to Movies</Link>
      </div>
    );
  }

  const subtotal = calculateSubtotal();

  return (
    <div className="container py-4 pb-5">
      {/* Top Header Summary */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4 cinema-card p-3 p-md-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="btn btn-link text-secondary p-0 mb-2 d-flex align-items-center gap-1 text-decoration-none small"
          >
            <FaArrowLeft /> Change Showtime
          </button>
          <h4 className="text-white fw-bold mb-1">{show.movie?.title}</h4>
          <div className="d-flex flex-wrap align-items-center gap-3 text-secondary small">
            <span className="d-flex align-items-center gap-1">
              <FaMapMarkerAlt className="text-danger" /> {show.theatre?.name}
            </span>
            <span>•</span>
            <span className="d-flex align-items-center gap-1">
              <FaClock /> {new Date(show.showDate).toLocaleDateString()} at {show.startTime}
            </span>
            <span>•</span>
            <span className="badge bg-secondary">{show.screen?.name || 'Screen 1'}</span>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="d-flex flex-wrap gap-3">
          <div className="border border-secondary border-opacity-25 rounded-3 px-3 py-1 text-center">
            <div className="text-muted" style={{ fontSize: '0.65rem' }}>VIP</div>
            <div className="text-warning fw-bold small">₹{show.pricing?.vip || 450}</div>
          </div>
          <div className="border border-secondary border-opacity-25 rounded-3 px-3 py-1 text-center">
            <div className="text-muted" style={{ fontSize: '0.65rem' }}>PREMIUM</div>
            <div className="text-info fw-bold small">₹{show.pricing?.premium || 350}</div>
          </div>
          <div className="border border-secondary border-opacity-25 rounded-3 px-3 py-1 text-center">
            <div className="text-muted" style={{ fontSize: '0.65rem' }}>REGULAR</div>
            <div className="text-light fw-bold small">₹{show.pricing?.regular || 180}</div>
          </div>
        </div>
      </div>

      {/* Main Interactive Seat Layout */}
      <div className="cinema-card p-4 mb-4">
        <SeatGrid
          seatingLayout={show.screen?.seatingLayout || []}
          pricing={show.pricing || {}}
          bookedSeats={bookedSeats}
          heldSeats={heldSeats}
          selectedSeats={selectedSeats}
          onSeatClick={handleSeatClick}
        />
      </div>

      {/* Floating Bottom Booking Action Bar */}
      <div className="fixed-bottom p-3" style={{ background: 'rgba(15, 23, 42, 0.95)', borderTop: '1px solid var(--border-color)', backdropFilter: 'blur(10px)', zIndex: 999 }}>
        <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
          {/* Selected Seats Counter */}
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex flex-column">
              <span className="text-secondary small">Selected Seats ({selectedSeats.length}):</span>
              <span className="text-white fw-bold fs-6">
                {selectedSeats.length > 0 ? selectedSeats.map(s => s.seatId).join(', ') : 'None selected yet'}
              </span>
            </div>
            {selectedSeats.length > 0 && (
              <div className="vr bg-secondary mx-2 d-none d-md-block"></div>
            )}
            {selectedSeats.length > 0 && (
              <div className="d-flex flex-column">
                <span className="text-secondary small">Total Price:</span>
                <span className="text-success fw-bold fs-5">₹{subtotal}</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            type="button"
            className="btn btn-cinema btn-lg px-5 w-100 w-md-auto"
            disabled={selectedSeats.length === 0 || holding}
            onClick={handleProceedToCheckout}
          >
            {holding ? (
              <span>Reserving Seats...</span>
            ) : (
              <span className="d-flex align-items-center gap-2">
                <FaLock size={14} /> Proceed to Checkout
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;
