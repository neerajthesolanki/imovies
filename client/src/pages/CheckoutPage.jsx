import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaShieldAlt, FaTicketAlt, FaCreditCard, FaMobileAlt, FaBuilding, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookingFlow, setBookingFlow] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Credit/Debit Card (Simulated)');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('imovies_booking_flow');
    if (!raw) {
      toast.warning('No active booking in progress. Please choose a show.');
      navigate('/movies');
      return;
    }
    setBookingFlow(JSON.parse(raw));
  }, [navigate]);

  if (!bookingFlow) return null;

  const { show, seats } = bookingFlow;
  const subtotal = seats.reduce((sum, s) => sum + (s.price || 200), 0);
  const convenienceFee = Math.round(subtotal * 0.08);
  const taxAmount = Math.round((subtotal + convenienceFee) * 0.05);
  const totalAmount = subtotal + convenienceFee + taxAmount;

  const handlePayNow = async () => {
    setProcessing(true);
    try {
      const payload = {
        showId: show._id,
        seats,
        paymentMethod,
        simulateFailure
      };

      const res = await api.post('/bookings/checkout', payload);
      const confirmedBooking = res.data?.data?.booking;

      // Clean session storage
      sessionStorage.removeItem('imovies_booking_flow');
      toast.success('Payment verified! Booking confirmed.');

      navigate(`/confirmation/${confirmedBooking._id || confirmedBooking.bookingReference}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Payment processing failed.';
      toast.error(msg);
      if (simulateFailure) {
        toast.info('Simulated payment failure triggered per test toggle. Held seats released.');
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="container py-4 pb-5">
      <div className="mb-4">
        <h2 className="text-white fw-bold mb-1">Confirm Booking & Checkout</h2>
        <p className="text-secondary small">Review ticket details and complete verified payment</p>
      </div>

      <div className="row g-4">
        {/* Left Column: Order Summary */}
        <div className="col-12 col-lg-7">
          <div className="cinema-card p-4 mb-4">
            <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
              <FaTicketAlt className="text-danger" /> Movie & Showtime Details
            </h5>

            <div className="d-flex flex-column flex-sm-row gap-3 pb-3 mb-3 border-bottom border-secondary border-opacity-25">
              <img
                src={show.movie?.posterUrl}
                alt={show.movie?.title}
                className="rounded-3"
                style={{ width: '90px', height: '130px', objectFit: 'cover' }}
              />
              <div>
                <h4 className="text-white fw-bold mb-1">{show.movie?.title}</h4>
                <div className="text-secondary small mb-2">
                  {show.movie?.language} • {show.screen?.name || 'Screen 1'} • {show.format || '2D'}
                </div>
                <div className="text-light small">
                  <strong>Theatre:</strong> {show.theatre?.name}
                </div>
                <div className="text-light small">
                  <strong>Date & Time:</strong> {new Date(show.showDate).toLocaleDateString()} at {show.startTime}
                </div>
              </div>
            </div>

            {/* Selected Seats Details */}
            <div className="mb-2">
              <span className="text-secondary small">Seats Reserved:</span>
              <div className="d-flex flex-wrap gap-2 mt-1">
                {seats.map((s) => (
                  <span key={s.seatId} className="badge bg-dark border border-secondary text-light px-2 py-1">
                    Seat {s.seatId} ({s.category} - ₹{s.price})
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="cinema-card p-4">
            <h5 className="text-white fw-bold mb-3 d-flex align-items-center gap-2">
              <FaShieldAlt className="text-success" /> Select Payment Method
            </h5>

            <div className="d-flex flex-column gap-2 mb-3">
              <label
                className={`d-flex align-items-center justify-content-between p-3 rounded-3 cursor-pointer border ${
                  paymentMethod === 'Credit/Debit Card (Simulated)'
                    ? 'border-danger bg-dark bg-opacity-50'
                    : 'border-secondary border-opacity-25'
                }`}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-center gap-3">
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === 'Credit/Debit Card (Simulated)'}
                    onChange={() => setPaymentMethod('Credit/Debit Card (Simulated)')}
                  />
                  <div className="d-flex align-items-center gap-2 text-white">
                    <FaCreditCard className="text-danger" />
                    <span>Instant Credit / Debit Card (Simulated Gateway)</span>
                  </div>
                </div>
                <span className="badge bg-secondary">Demo Mode</span>
              </label>

              <label
                className={`d-flex align-items-center justify-content-between p-3 rounded-3 cursor-pointer border ${
                  paymentMethod === 'UPI Instant Payment (Simulated)'
                    ? 'border-danger bg-dark bg-opacity-50'
                    : 'border-secondary border-opacity-25'
                }`}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-center gap-3">
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === 'UPI Instant Payment (Simulated)'}
                    onChange={() => setPaymentMethod('UPI Instant Payment (Simulated)')}
                  />
                  <div className="d-flex align-items-center gap-2 text-white">
                    <FaMobileAlt className="text-success" />
                    <span>UPI / QR / GPay (Simulated)</span>
                  </div>
                </div>
                <span className="badge bg-secondary">Demo Mode</span>
              </label>

              <label
                className={`d-flex align-items-center justify-content-between p-3 rounded-3 cursor-pointer border ${
                  paymentMethod === 'Net Banking (Simulated)'
                    ? 'border-danger bg-dark bg-opacity-50'
                    : 'border-secondary border-opacity-25'
                }`}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-center gap-3">
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === 'Net Banking (Simulated)'}
                    onChange={() => setPaymentMethod('Net Banking (Simulated)')}
                  />
                  <div className="d-flex align-items-center gap-2 text-white">
                    <FaBuilding className="text-info" />
                    <span>Net Banking (Simulated)</span>
                  </div>
                </div>
                <span className="badge bg-secondary">Demo Mode</span>
              </label>
            </div>

            {/* Test Toggle for Testing Failures */}
            <div className="p-3 rounded-3 bg-dark bg-opacity-75 border border-secondary border-opacity-25">
              <div className="form-check form-switch d-flex align-items-center justify-content-between ps-0">
                <label className="form-check-label text-warning small fw-bold d-flex align-items-center gap-1" htmlFor="testFailSwitch">
                  <FaExclamationTriangle /> QA Testing Mode: Simulate Card Decline / Failure Path
                </label>
                <input
                  className="form-check-input ms-auto"
                  type="checkbox"
                  id="testFailSwitch"
                  checked={simulateFailure}
                  onChange={(e) => setSimulateFailure(e.target.checked)}
                />
              </div>
              <div className="text-muted small mt-1" style={{ fontSize: '0.72rem' }}>
                Toggle this to verify that failed payments release temporary holds and inform the user cleanly without creating phantom tickets.
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing Breakdown */}
        <div className="col-12 col-lg-5">
          <div className="cinema-card p-4">
            <h5 className="text-white fw-bold mb-3">Itemized Price Breakdown</h5>

            <div className="d-flex flex-column gap-2 pb-3 mb-3 border-bottom border-secondary border-opacity-25">
              <div className="d-flex justify-content-between text-secondary small">
                <span>Tickets Subtotal ({seats.length} seats)</span>
                <span className="text-white">₹{subtotal}</span>
              </div>
              <div className="d-flex justify-content-between text-secondary small">
                <span>Convenience Fee (8%)</span>
                <span className="text-white">₹{convenienceFee}</span>
              </div>
              <div className="d-flex justify-content-between text-secondary small">
                <span>Integrated GST (5%)</span>
                <span className="text-white">₹{taxAmount}</span>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="text-white fw-bold fs-5">Total Amount Payable</span>
              <span className="text-success fw-extrabold fs-4">₹{totalAmount}</span>
            </div>

            <button
              type="button"
              className="btn btn-cinema w-100 py-3 fs-6 d-flex align-items-center justify-content-center gap-2"
              disabled={processing}
              onClick={handlePayNow}
            >
              {processing ? (
                <span>Verifying Payment...</span>
              ) : (
                <>
                  <FaCheckCircle /> Pay ₹{totalAmount} & Confirm Booking
                </>
              )}
            </button>

            <div className="text-center text-secondary small mt-3" style={{ fontSize: '0.75rem' }}>
              🔒 256-bit SSL encrypted. Non-real simulated financial transaction for demonstration.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
