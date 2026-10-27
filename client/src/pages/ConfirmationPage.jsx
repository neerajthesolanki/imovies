import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import confetti from 'canvas-confetti';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaCheckCircle, FaPrint, FaTicketAlt, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaQrcode } from 'react-icons/fa';

const ConfirmationPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const res = await api.get(`/bookings/${bookingId}`);
        setBooking(res.data?.data || null);

        // Confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore confetti if unsupported
        }
      } catch (err) {
        console.error('Failed to load booking details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving your confirmed tickets and security QR code..." />;
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <h3 className="text-white">Booking details not found</h3>
        <Link to="/" className="btn btn-cinema mt-3">Go to Home</Link>
      </div>
    );
  }

  return (
    <div className="container py-4 pb-5">
      {/* Success Banner */}
      <div className="text-center mb-4">
        <div className="d-inline-flex p-3 rounded-circle bg-success bg-opacity-20 text-success mb-2">
          <FaCheckCircle size={48} />
        </div>
        <h2 className="text-white fw-bold mb-1">Booking Confirmed!</h2>
        <p className="text-secondary small">
          Your cinema seats have been reserved. Show the M-Ticket QR code at the cinema gate.
        </p>
      </div>

      {/* Main Ticket Card (Printable) */}
      <div className="cinema-card p-4 p-md-5 mx-auto mb-4" style={{ maxWidth: '680px', border: '2px solid rgba(229, 9, 20, 0.4)' }}>
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 pb-3 mb-4 border-bottom border-secondary border-opacity-25">
          <div>
            <span className="badge bg-danger mb-2">E-TICKET CONFIRMED</span>
            <h4 className="text-white fw-bold mb-0">{booking.movie?.title}</h4>
          </div>
          <div className="text-sm-end">
            <span className="text-secondary small">Booking Ref:</span>
            <div className="text-warning fw-extrabold fs-5 font-monospace">{booking.bookingReference}</div>
          </div>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-12 col-sm-7">
            <div className="mb-3">
              <span className="text-secondary small d-block">Theatre & Location:</span>
              <strong className="text-white fs-6 d-flex align-items-center gap-1">
                <FaMapMarkerAlt className="text-danger" size={13} /> {booking.theatre?.name}
              </strong>
              <span className="text-muted small">{booking.theatre?.address}</span>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <span className="text-secondary small d-block">Date:</span>
                <strong className="text-light d-flex align-items-center gap-1">
                  <FaCalendarAlt size={12} className="text-danger" /> {new Date(booking.showDate).toLocaleDateString()}
                </strong>
              </div>
              <div className="col-6">
                <span className="text-secondary small d-block">Time:</span>
                <strong className="text-light d-flex align-items-center gap-1">
                  <FaClock size={12} className="text-danger" /> {booking.showTime}
                </strong>
              </div>
            </div>

            <div className="mb-3">
              <span className="text-secondary small d-block">Seats Reserved:</span>
              <div className="d-flex flex-wrap gap-1 mt-1">
                {booking.seats?.map(s => (
                  <span key={s.seatId} className="badge bg-secondary px-2 py-1">
                    {s.seatId} ({s.category})
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-secondary small d-block">Total Paid:</span>
              <span className="text-success fw-bold fs-5">
                ₹{booking.pricingSummary?.totalAmount}
              </span>
              <span className="badge bg-dark border border-secondary text-secondary ms-2 small">
                {booking.paymentStatus === 'paid' ? 'PAID ONLINE' : 'PENDING'}
              </span>
            </div>
          </div>

          {/* QR Code Column */}
          <div className="col-12 col-sm-5 d-flex flex-column align-items-center justify-content-center text-center p-3 rounded-3 bg-dark bg-opacity-50 border border-secondary border-opacity-25">
            {booking.qrCodeUrl ? (
              <img
                src={booking.qrCodeUrl}
                alt="Ticket QR Code"
                className="img-fluid rounded-3 mb-2 bg-white p-2"
                style={{ width: '160px', height: '160px' }}
              />
            ) : (
              <div className="p-4 text-secondary">
                <FaQrcode size={64} className="mb-2" />
                <div className="small">Gate QR Code</div>
              </div>
            )}
            <span className="text-secondary small" style={{ fontSize: '0.72rem' }}>
              Scan at cinema turnstile for entry
            </span>
          </div>
        </div>

        {/* Actions inside card */}
        <div className="d-flex flex-wrap justify-content-between align-items-center pt-3 border-top border-secondary border-opacity-25 gap-2">
          <Link to="/profile" className="btn btn-cinema-outline btn-sm">
            <FaTicketAlt /> View Booking in Dashboard
          </Link>
          <button type="button" className="btn btn-cinema btn-sm" onClick={handlePrint}>
            <FaPrint /> Print / Download Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
